import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/brevo";
import { getMailTemplate } from "@/lib/email-templates";

export const dynamic = "force-dynamic";

/**
 * GET /api/send-mail
 * Admin query or quick 1-click trigger
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
      // Simple security check for GET trigger
      if (key !== "metapilot2026" && key !== process.env.CRON_SECRET) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }

      const mailSlot = parseInt(searchParams.get("slot") || "1", 10);
      const limit = parseInt(searchParams.get("limit") || "50", 10);

      const result = await runCampaignBatch(mailSlot, limit);
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
 * Main email sender supporting campaign batches, single leads, and test emails
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { action, leadId, templateCode = "D", limit = 50, mailSlot = 1, email, fullName, jobRole, key, templateFamily = "human" } = body;

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

      const result = await sendMailToLead(lead, templateCode, mailSlot);
      return NextResponse.json({ success: true, result });
    }

    // 4. CAMPAIGN BATCH
    if (action === "campaign") {
      const result = await runCampaignBatch(mailSlot, limit, templateFamily);
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

  return {
    totalLeads: totalLeads || 0,
    mail1Sent: mail1Sent || 0,
    mail1Pending: mail1Pending || 0,
    mail2Sent: mail2Sent || 0,
    mail2Pending: mail2Pending || 0,
    mail3Sent: mail3Sent || 0,
    mail3Pending: mail3Pending || 0,
  };
}

/**
 * Execute batch campaign send
 */
async function runCampaignBatch(mailSlot, limit, templateFamily = "human") {
  const statusField = `mail_${mailSlot}_status`;

  let query = supabase
    .from("leads")
    .select("*")
    .is(statusField, null)
    .not("email", "is", null)
    .order("id", { ascending: true })
    .limit(limit);

  // For slot 2, slot 1 must have been sent
  if (mailSlot === 2) {
    query = query.not("mail_1_status", "is", null);
  }
  // For slot 3, slot 2 must have been sent
  if (mailSlot === 3) {
    query = query.not("mail_2_status", "is", null);
  }

  const { data: leads, error } = await query;

  if (error) throw error;
  if (!leads || leads.length === 0) {
    return { success: true, message: `No pending leads for Mail ${mailSlot}`, sent: 0, total: 0, results: [] };
  }

  const results = [];

  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i];
    let template;

    if (templateFamily === "card") {
      // Smart PLM Card Family (A, B, C)
      if (mailSlot === 1) template = "A";
      else if (mailSlot === 2) template = "B";
      else template = "C";
    } else {
      // Human 1-on-1 Personal Family (D, E, F) - Lands in Primary Inbox
      if (mailSlot === 1) template = "D";
      else if (mailSlot === 2) template = "E";
      else template = "F";
    }

    try {
      await sendMailToLead(lead, template, mailSlot);
      results.push({ id: lead.id, email: lead.email, name: lead.full_name, template, status: "sent" });
    } catch (err) {
      results.push({ id: lead.id, email: lead.email, name: lead.full_name, template, status: "error", error: err.message });
      await supabase.from("leads").update({
        error_log: `[${new Date().toISOString()}] Slot ${mailSlot} error: ${err.message}`,
      }).eq("id", lead.id);
    }

    // 2-second rate limit between emails
    if (i < leads.length - 1) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  return {
    success: true,
    mailSlot,
    sent: results.filter((r) => r.status === "sent").length,
    total: leads.length,
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
