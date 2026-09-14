import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/brevo";
import { getMailTemplate } from "@/lib/email-templates";

/**
 * GET /api/cron/followup
 * Automated followup email sender (Vercel Cron Job)
 *
 * Logic (mirrors GAS processFollowups):
 * - Mail 1 sent 3+ days ago & Mail 2 not sent → Send Mail 2
 * - Mail 2 sent 7+ days ago & Mail 3 not sent → Send Mail 3
 * - Template rotation: A→B→C→A
 */
export async function GET(request) {
  // Verify cron secret (Vercel sends this header)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const results = { mail2Sent: 0, mail3Sent: 0, errors: 0 };

    // === FOLLOWUP 1: Mail 2 (3 days after Mail 1) ===
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    const { data: mail2Pending } = await supabase
      .from("leads")
      .select("*")
      .not("mail_1_status", "is", null)
      .like("mail_1_status", "SENT_%")
      .is("mail_2_status", null)
      .lt("mail_1_sent_at", threeDaysAgo.toISOString())
      .limit(50);

    if (mail2Pending) {
      for (const lead of mail2Pending) {
        try {
          const m1Template = lead.mail_1_template || "A";
          const m2Template = m1Template === "A" ? "B" : m1Template === "B" ? "C" : "A";

          const template = getMailTemplate(m2Template, {
            fullName: lead.full_name,
            jobRole: lead.job_role,
          });

          await sendEmail(lead.email, template.subject, template.htmlBody, lead.full_name);

          await supabase.from("leads").update({
            mail_2_template: m2Template,
            mail_2_status: `SENT_${m2Template}`,
            mail_2_sent_at: now.toISOString(),
          }).eq("id", lead.id);

          results.mail2Sent++;
          await new Promise((r) => setTimeout(r, 2000));
        } catch (err) {
          results.errors++;
          await supabase.from("leads").update({
            error_log: `[${now.toISOString()}] Mail-2 error: ${err.message}`,
          }).eq("id", lead.id);
        }
      }
    }

    // === FOLLOWUP 2: Mail 3 (7 days after Mail 1) ===
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const { data: mail3Pending } = await supabase
      .from("leads")
      .select("*")
      .not("mail_2_status", "is", null)
      .like("mail_2_status", "SENT_%")
      .is("mail_3_status", null)
      .lt("mail_1_sent_at", sevenDaysAgo.toISOString())
      .limit(50);

    if (mail3Pending) {
      for (const lead of mail3Pending) {
        try {
          const m2Template = lead.mail_2_template || "B";
          const m3Template = m2Template === "B" ? "C" : m2Template === "C" ? "A" : "B";

          const template = getMailTemplate(m3Template, {
            fullName: lead.full_name,
            jobRole: lead.job_role,
          });

          await sendEmail(lead.email, template.subject, template.htmlBody, lead.full_name);

          await supabase.from("leads").update({
            mail_3_template: m3Template,
            mail_3_status: `SENT_${m3Template}`,
            mail_3_sent_at: now.toISOString(),
          }).eq("id", lead.id);

          results.mail3Sent++;
          await new Promise((r) => setTimeout(r, 2000));
        } catch (err) {
          results.errors++;
          await supabase.from("leads").update({
            error_log: `[${now.toISOString()}] Mail-3 error: ${err.message}`,
          }).eq("id", lead.id);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Followup cron completed",
      results,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Cron followup error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
