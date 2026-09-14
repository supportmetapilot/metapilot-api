import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/brevo";
import { getMailTemplate } from "@/lib/email-templates";

/**
 * POST /api/send-mail
 * Send marketing emails to leads from Supabase
 * Replaces GAS sendMail + campaign automation
 *
 * Body: {
 *   action: "campaign" | "single",
 *   leadId: number (for single),
 *   templateCode: "A" | "B" | "C",
 *   limit: number (for campaign, default 50),
 *   mailSlot: 1 | 2 | 3 (which mail slot to use)
 * }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { action, leadId, templateCode, limit = 50, mailSlot = 1 } = body;

    if (action === "single") {
      // Send to a single lead
      if (!leadId || !templateCode) {
        return NextResponse.json(
          { success: false, error: "Missing leadId or templateCode" },
          { status: 400 }
        );
      }

      const { data: lead, error } = await supabase
        .from("leads")
        .select("*")
        .eq("id", leadId)
        .single();

      if (error || !lead) {
        return NextResponse.json(
          { success: false, error: "Lead not found" },
          { status: 404 }
        );
      }

      const result = await sendMailToLead(lead, templateCode, mailSlot);
      return NextResponse.json({ success: true, result });

    } else if (action === "campaign") {
      // Batch send to unsent leads
      const statusField = `mail_${mailSlot}_status`;

      const { data: leads, error } = await supabase
        .from("leads")
        .select("*")
        .is(statusField, null)
        .not("email", "is", null)
        .order("id", { ascending: true })
        .limit(limit);

      if (error) throw error;
      if (!leads || leads.length === 0) {
        return NextResponse.json({ success: true, message: "No pending leads", sent: 0 });
      }

      const templates = ["A", "B", "C"];
      const results = [];

      for (let i = 0; i < leads.length; i++) {
        const lead = leads[i];
        const template = templates[i % 3]; // Round-robin A→B→C

        try {
          await sendMailToLead(lead, template, mailSlot);
          results.push({ id: lead.id, email: lead.email, status: "sent" });
        } catch (err) {
          results.push({ id: lead.id, email: lead.email, status: "error", error: err.message });
        }

        // 2-second delay between sends
        if (i < leads.length - 1) {
          await new Promise((r) => setTimeout(r, 2000));
        }
      }

      return NextResponse.json({ success: true, sent: results.filter(r => r.status === "sent").length, total: leads.length, results });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Send mail error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

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
