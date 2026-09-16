import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * POST /api/leads/import
 * Smart Lead Parser & Duplicate Remover
 *
 * Body: {
 *   action: "preview" | "save",
 *   rawText: string,
 *   defaultRole?: string
 * }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { action = "preview", rawText = "", defaultRole = "Software Engineer" } = body;

    if (!rawText || !rawText.trim()) {
      return NextResponse.json({ success: false, error: "No text provided" }, { status: 400 });
    }

    // Parse lines or comma-separated emails
    const lines = rawText.split(/[\r\n]+/);
    const parsedEntries = [];
    const seenEmails = new Set();
    const internalDuplicates = [];

    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      const emailMatch = line.match(emailRegex);
      if (emailMatch) {
        const email = emailMatch[1].toLowerCase().trim();

        if (seenEmails.has(email)) {
          internalDuplicates.push(email);
          continue;
        }
        seenEmails.add(email);

        // Try extracting name and role if line is CSV / structured
        let fullName = "Candidate";
        let jobRole = defaultRole;
        let mobile = null;

        // Check if line contains commas or tabs
        const parts = line.split(/[,;\t]+/).map((p) => p.trim());
        if (parts.length > 1) {
          // Find which part is email
          const emailIdx = parts.findIndex((p) => emailRegex.test(p));
          if (emailIdx > 0 && parts[0] && !emailRegex.test(parts[0])) {
            fullName = parts[0].replace(/["'<>\\]/g, "").trim();
          }
          if (parts.length >= 3) {
            // Check if 2nd or 3rd part is role or phone
            for (let k = 1; k < parts.length; k++) {
              if (k === emailIdx) continue;
              if (/^\+?\d{10,13}$/.test(parts[k].replace(/\D/g, ""))) {
                mobile = parts[k];
              } else if (parts[k].length > 2) {
                jobRole = parts[k];
              }
            }
          }
        } else {
          // Check if format is "Name <email@domain.com>"
          const nameMatch = line.match(/^([^<]+)<[^>]+>$/);
          if (nameMatch) {
            fullName = nameMatch[1].trim();
          }
        }

        parsedEntries.push({
          full_name: fullName,
          email: email,
          job_role: jobRole,
          mobile: mobile,
        });
      }
    }

    if (parsedEntries.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No valid email addresses found in pasted text.",
      });
    }

    // Check against existing emails in Supabase database
    const allUniqueEmails = parsedEntries.map((e) => e.email);
    const chunkSize = 200;
    const existingEmailsSet = new Set();

    for (let i = 0; i < allUniqueEmails.length; i += chunkSize) {
      const chunk = allUniqueEmails.slice(i, i + chunkSize);
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

    for (const entry of parsedEntries) {
      if (existingEmailsSet.has(entry.email)) {
        alreadyInDb.push(entry.email);
      } else {
        newCleanEntries.push(entry);
      }
    }

    // If action is preview, just return the audit summary
    if (action === "preview") {
      return NextResponse.json({
        success: true,
        action: "preview",
        totalExtracted: parsedEntries.length + internalDuplicates.length,
        uniqueInPaste: parsedEntries.length,
        internalDuplicatesCount: internalDuplicates.length,
        alreadyInDbCount: alreadyInDb.length,
        newCleanCount: newCleanEntries.length,
        sampleNew: newCleanEntries.slice(0, 10),
      });
    }

    // If action is save, insert all clean new entries in chunks
    if (action === "save") {
      if (newCleanEntries.length === 0) {
        return NextResponse.json({
          success: true,
          message: "All emails already exist in the database. No new leads to add.",
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
        message: `Successfully imported ${totalInserted} clean unique leads into database!`,
        inserted: totalInserted,
        skippedDuplicates: internalDuplicates.length + alreadyInDb.length,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Import leads error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
