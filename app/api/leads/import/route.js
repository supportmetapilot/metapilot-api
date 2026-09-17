import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * Sanitize mobile numbers to standard format (e.g. 919876543210)
 */
function sanitizeMobile(raw) {
  if (!raw) return null;
  const digits = String(raw).replace(/\D/g, "");
  if (digits.length === 10) return "91" + digits;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  if (digits.length === 11 && digits.startsWith("0")) return "91" + digits.substring(1);
  if (digits.length >= 10 && digits.length <= 13) return digits;
  return digits || null;
}

/**
 * Parse raw input text (Excel copy-paste, TSV, CSV, or raw emails)
 */
function parseRawLeads(rawText, defaultRole = "Software Engineer") {
  const lines = rawText.split(/[\r\n]+/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return { parsed: [], internalDuplicates: [] };

  const firstLine = lines[0];
  let delimiter = "\t";
  if (firstLine.includes("\t")) delimiter = "\t";
  else if (firstLine.includes(",")) delimiter = ",";
  else if (firstLine.includes(";")) delimiter = ";";

  const headerCols = firstLine.split(delimiter).map((c) => c.trim().toLowerCase().replace(/[^a-z0-9_]/g, ""));
  const isHeader = headerCols.some((c) =>
    c.includes("email") || c.includes("name") || c.includes("role") || c.includes("lead") || c.includes("mobile") || c.includes("phone")
  );

  let nameIdx = -1;
  let emailIdx = -1;
  let mobileIdx = -1;
  let roleIdx = -1;
  let expIdx = -1;
  let noticeIdx = -1;

  let dataLines = lines;

  if (isHeader) {
    dataLines = lines.slice(1);
    headerCols.forEach((col, idx) => {
      if (col.includes("full_name") || col === "name" || col.includes("candidate")) nameIdx = idx;
      else if (col.includes("email") || col.includes("mail")) emailIdx = idx;
      else if (col.includes("mobile") || col.includes("phone") || col.includes("contact") || col.includes("whatsapp")) mobileIdx = idx;
      else if (col.includes("role") || col.includes("job") || col.includes("designation")) roleIdx = idx;
      else if (col.includes("experience") || col.includes("exp") || col.includes("years")) expIdx = idx;
      else if (col.includes("notice")) noticeIdx = idx;
    });
  }

  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
  const parsed = [];
  const seenEmails = new Set();
  const internalDuplicates = [];

  for (const line of dataLines) {
    const parts = line.split(delimiter).map((p) => p.trim());
    if (parts.length === 0) continue;

    let email = "";
    let fullName = "";
    let mobile = null;
    let jobRole = defaultRole;
    let yearsOfExperience = null;
    let noticePeriod = null;

    if (isHeader && emailIdx !== -1 && parts[emailIdx]) {
      const emMatch = parts[emailIdx].match(emailRegex);
      if (emMatch) email = emMatch[1].toLowerCase().trim();
      if (nameIdx !== -1 && parts[nameIdx]) fullName = parts[nameIdx];
      if (mobileIdx !== -1 && parts[mobileIdx]) mobile = sanitizeMobile(parts[mobileIdx]);
      if (roleIdx !== -1 && parts[roleIdx]) jobRole = parts[roleIdx];
      if (expIdx !== -1 && parts[expIdx]) yearsOfExperience = parts[expIdx];
      if (noticeIdx !== -1 && parts[noticeIdx]) noticePeriod = parts[noticeIdx];
    } else {
      // Heuristic fallback
      for (let i = 0; i < parts.length; i++) {
        const m = parts[i].match(emailRegex);
        if (m) {
          email = m[1].toLowerCase().trim();
          if (i > 0) {
            const candidate = parts[i - 1];
            if (!/^\d+$/.test(candidate) && candidate.length > 1) {
              fullName = candidate;
            } else if (i > 1 && !/^\d+$/.test(parts[i - 2])) {
              fullName = parts[i - 2];
            }
          }
          break;
        }
      }
      for (let i = 0; i < parts.length; i++) {
        const digits = parts[i].replace(/\D/g, "");
        if (digits.length >= 10 && digits.length <= 13) {
          mobile = sanitizeMobile(parts[i]);
          break;
        }
      }
      for (let i = 0; i < parts.length; i++) {
        const pLower = parts[i].toLowerCase();
        if (pLower.includes("test") || pLower.includes("develop") || pLower.includes("engineer") || pLower.includes("analyst") || pLower.includes("consultant") || pLower.includes("qa")) {
          jobRole = parts[i];
          break;
        }
      }
    }

    if (!fullName || /^\d+$/.test(fullName)) {
      fullName = email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    }

    if (email) {
      if (seenEmails.has(email)) {
        internalDuplicates.push(email);
      } else {
        seenEmails.add(email);
        parsed.push({
          full_name: fullName,
          email: email,
          mobile: mobile,
          job_role: jobRole || defaultRole,
          years_of_experience: yearsOfExperience,
          notice_period: noticePeriod,
        });
      }
    }
  }

  return { parsed, internalDuplicates };
}

/**
 * POST /api/leads/import
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { action = "preview", rawText = "", defaultRole = "Software Testing" } = body;

    // Action: Clear all leads (to reset corrupted test data)
    if (action === "clear_all") {
      const { error } = await supabase.from("leads").delete().neq("id", 0);
      if (error) throw error;
      return NextResponse.json({ success: true, message: "All leads cleared successfully." });
    }

    if (!rawText || !rawText.trim()) {
      return NextResponse.json({ success: false, error: "No text provided" }, { status: 400 });
    }

    const { parsed, internalDuplicates } = parseRawLeads(rawText, defaultRole);

    if (parsed.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No valid email addresses found in pasted text. Make sure data contains emails.",
      });
    }

    // Check against existing emails in Supabase
    const allEmails = parsed.map((e) => e.email);
    const chunkSize = 200;
    const existingEmailsSet = new Set();

    for (let i = 0; i < allEmails.length; i += chunkSize) {
      const chunk = allEmails.slice(i, i + chunkSize);
      const { data: existingRows } = await supabase
        .from("leads")
        .select("email")
        .in("email", chunk);

      if (existingRows) {
        existingRows.forEach((r) => existingEmailsSet.add(r.email.toLowerCase()));
      }
    }

    const alreadyInDb = [];
    const newCleanEntries = [];

    for (const entry of parsed) {
      if (existingEmailsSet.has(entry.email)) {
        alreadyInDb.push(entry.email);
      } else {
        newCleanEntries.push(entry);
      }
    }

    if (action === "preview") {
      return NextResponse.json({
        success: true,
        action: "preview",
        totalExtracted: parsed.length + internalDuplicates.length,
        uniqueInPaste: parsed.length,
        internalDuplicatesCount: internalDuplicates.length,
        alreadyInDbCount: alreadyInDb.length,
        newCleanCount: newCleanEntries.length,
        sampleNew: newCleanEntries.slice(0, 5),
      });
    }

    if (action === "save") {
      if (newCleanEntries.length === 0) {
        return NextResponse.json({
          success: true,
          message: "All emails already exist in the database.",
          inserted: 0,
        });
      }

      let totalInserted = 0;
      for (let i = 0; i < newCleanEntries.length; i += chunkSize) {
        const chunk = newCleanEntries.slice(i, i + chunkSize);
        const { data, error } = await supabase.from("leads").insert(chunk).select();
        if (error) throw error;
        totalInserted += data?.length || 0;
      }

      return NextResponse.json({
        success: true,
        message: `Successfully imported ${totalInserted} clean leads into database!`,
        inserted: totalInserted,
        skippedDuplicates: internalDuplicates.length + alreadyInDb.length,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Import error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
