import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/brevo";
import { getMailTemplate } from "@/lib/email-templates";

export const dynamic = "force-dynamic";

/**
 * GET /api/send-mail
 * Admin query for stats or quick GET trigger
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "stats";
    const key = searchParams.get("key");

    if (action === "stats") {
      const stats = await getLeadStats();
      return NextResponse.json({ success: true, stats });
    }

    if (action === "campaign") {
      if (key !== "metapilot2026" && key !== process.env.CRON_SECRET) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }

      const limit = parseInt(searchParams.get("limit") || "50", 10);
      const startId = searchParams.get("startId") ? parseInt(searchParams.get("startId"), 10) : null;
      const endId = searchParams.get("endId") ? parseInt(searchParams.get("endId"), 10) : null;
      const delaySec = parseFloat(searchParams.get("delaySec") || "2");

      const result = await runCampaignBatch({ limit, startId, endId, delaySec });
      return NextResponse.json(result);
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("GET send-mail error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/send-mail
 * Main email sender supporting auto-shuffling campaign batches, single leads, and test emails
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      action,
      leadId,
      templateCode = "A",
      limit = 50,
      startId,
      endId,
      delaySec = 2,
      email,
      fullName,
      jobRole,
      key,
    } = body;

    // Optional PIN verification for admin actions
    if (key && key !== "metapilot2026" && key !== process.env.CRON_SECRET) {
      return NextResponse.json({ success: false, error: "Invalid Admin PIN" }, { status: 401 });
    }

    // 1. STATS
    if (action === "stats") {
      const stats = await getLeadStats();
      return NextResponse.json({ success: true, stats });
    }

    // 2. TEST EMAIL
    if (action === "test") {
      const targetEmail = email || "support@metapilot.in";
      const targetName = fullName || "Test User";
      const targetRole = jobRole || "Software Engineer";

      const template = getMailTemplate(templateCode, {
        fullName: targetName,
        jobRole: targetRole,
      });

      await sendEmail(targetEmail, template.subject, template.htmlBody, targetName);

      return NextResponse.json({
        success: true,
        message: `Test email (${templateCode}) successfully sent to ${targetEmail}`,
        subject: template.subject,
      });
    }

    // 3. SINGLE LEAD
    if (action === "single") {
      if (!leadId) {
        return NextResponse.json({ success: false, error: "Missing leadId" }, { status: 400 });
      }

      const { data: lead, error } = await supabase
        .from("leads")
        .select("*")
        .eq("id", leadId)
        .single();

      if (error || !lead) {
        return NextResponse.json({ success: false, error: "Lead not found" }, { status: 404 });
      }

      const result = await sendMailToLead(lead, templateCode, 1);
      return NextResponse.json({ success: true, result });
    }

    // 4. CAMPAIGN BATCH (Auto-round-robin A->B->C and auto-followup rotation)
    if (action === "campaign") {
      const result = await runCampaignBatch({
        limit: parseInt(limit, 10) || 50,
        startId: startId ? parseInt(startId, 10) : null,
        endId: endId ? parseInt(endId, 10) : null,
        delaySec: parseFloat(delaySec) || 2,
      });
      return NextResponse.json(result);
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Send mail error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * Fetch database lead stats for the Admin Dashboard
 */
async function getLeadStats() {
  const { count: totalLeads } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true });

  const { count: mail1Sent } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .not("mail_1_status", "is", null);

  const { count: mail1Pending } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .is("mail_1_status", null)
    .not("email", "is", null);

  const { count: mail2Sent } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .not("mail_2_status", "is", null);

  const { count: mail2Pending } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .not("mail_1_status", "is", null)
    .is("mail_2_status", null);

  const { count: mail3Sent } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .not("mail_3_status", "is", null);

  const { count: mail3Pending } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .not("mail_2_status", "is", null)
    .is("mail_3_status", null);

  // Get lowest and highest ID for range display
  const { data: firstLead } = await supabase
    .from("leads")
    .select("id")
    .order("id", { ascending: true })
    .limit(1);

  const { data: lastLead } = await supabase
    .from("leads")
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  return {
    totalLeads: totalLeads || 0,
    mail1Sent: mail1Sent || 0,
    mail1Pending: mail1Pending || 0,
    mail2Sent: mail2Sent || 0,
    mail2Pending: mail2Pending || 0,
    mail3Sent: mail3Sent || 0,
    mail3Pending: mail3Pending || 0,
    minLeadId: firstLead?.[0]?.id || 1,
    maxLeadId: lastLead?.[0]?.id || (totalLeads || 1),
  };
}

/**
 * Execute smart campaign batch
 * Auto round-robin: Lead 1 -> A, Lead 2 -> B, Lead 3 -> C, Lead 4 -> A...
 * Auto follow-up rotation: A -> B -> C -> A
 */
async function runCampaignBatch({ limit = 50, startId = null, endId = null, delaySec = 2 }) {
  let query = supabase
    .from("leads")
    .select("*")
    .not("email", "is", null);

  if (startId && endId) {
    query = query.gte("id", startId).lte("id", endId).order("id", { ascending: true });
  } else if (startId) {
    query = query.gte("id", startId).order("id", { ascending: true }).limit(limit);
  } else {
    // Process next leads who haven't completed Mail 3
    query = query.is("mail_3_status", null).order("id", { ascending: true }).limit(limit);
  }

  const { data: leads, error } = await query;

  if (error) throw error;
  if (!leads || leads.length === 0) {
    return {
      success: true,
      message: "No eligible leads found in this range.",
      sent: 0,
      total: 0,
      results: [],
    };
  }

  const templates = ["A", "B", "C"];
  const results = [];

  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i];
    let mailSlot = null;
    let template = null;

    if (!lead.mail_1_status) {
      // 1. Initial Mail: Deterministic Round-Robin A -> B -> C -> A
      mailSlot = 1;
      template = templates[i % 3];
    } else if (!lead.mail_2_status) {
      // 2. Followup 1: Rotate from Mail 1 (A->B, B->C, C->A)
      mailSlot = 2;
      const prev = lead.mail_1_template || "A";
      template = prev === "A" ? "B" : prev === "B" ? "C" : "A";
    } else if (!lead.mail_3_status) {
      // 3. Followup 2: Rotate from Mail 2 (B->C, C->A, A->B)
      mailSlot = 3;
      const prev = lead.mail_2_template || "B";
      template = prev === "B" ? "C" : prev === "C" ? "A" : "B";
    } else {
      // Already received all 3 emails
      results.push({
        id: lead.id,
        email: lead.email,
        name: lead.full_name,
        status: "already_completed",
      });
      continue;
    }

    try {
      await sendMailToLead(lead, template, mailSlot);
      results.push({
        id: lead.id,
        email: lead.email,
        name: lead.full_name,
        slot: mailSlot,
        template,
        status: "sent",
      });
    } catch (err) {
      results.push({
        id: lead.id,
        email: lead.email,
        name: lead.full_name,
        slot: mailSlot,
        template,
        status: "error",
        error: err.message,
      });
      await supabase.from("leads").update({
        error_log: `[${new Date().toISOString()}] Slot ${mailSlot} error: ${err.message}`,
      }).eq("id", lead.id);
    }

    // Rate limiting delay between emails
    if (i < leads.length - 1 && delaySec > 0) {
      await new Promise((r) => setTimeout(r, delaySec * 1000));
    }
  }

  return {
    success: true,
    sent: results.filter((r) => r.status === "sent").length,
    total: leads.length,
    startId: leads[0]?.id,
    endId: leads[leads.length - 1]?.id,
    results,
  };
}

/**
 * Send email to single lead and update Supabase
 */
async function sendMailToLead(lead, templateCode, mailSlot) {
  const template = getMailTemplate(templateCode, {
    fullName: lead.full_name,
    jobRole: lead.job_role,
  });

  await sendEmail(lead.email, template.subject, template.htmlBody, lead.full_name);

  // Update lead status in Supabase
  const now = new Date().toISOString();
  const update = {};
  update[`mail_${mailSlot}_template`] = templateCode;
  update[`mail_${mailSlot}_status`] = `SENT_${templateCode}`;
  update[`mail_${mailSlot}_sent_at`] = now;

  await supabase.from("leads").update(update).eq("id", lead.id);

  return { template: templateCode, sentAt: now };
}
