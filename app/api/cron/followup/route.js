import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/brevo";
import { getMailTemplate } from "@/lib/email-templates";

export const dynamic = "force-dynamic";

/**
 * Helper to fetch active campaigns from app_config registry
 */
async function getActiveCampaigns() {
  const { data } = await supabase
    .from("app_config")
    .select("value")
    .eq("key", "campaigns_registry")
    .maybeSingle();

  if (!data?.value) return [];
  try {
    const list = JSON.parse(data.value);
    return Array.isArray(list) ? list.filter((c) => c.status === "Active") : [];
  } catch (e) {
    return [];
  }
}

/**
 * Handles automated or manual followup dispatch
 */
async function processFollowups() {
  const now = new Date();
  const results = { mail2Sent: 0, mail3Sent: 0, errors: 0, processedLeads: [] };

  const campaigns = await getActiveCampaigns();
  const processedLeadIds = new Set();

  // 1. Process leads per active campaign using its custom followup_1_days & followup_2_days
  for (const camp of campaigns) {
    const f1Days = parseFloat(camp.followup1Days) >= 0 ? parseFloat(camp.followup1Days) : 3;
    const f2Days = parseFloat(camp.followup2Days) >= 0 ? parseFloat(camp.followup2Days) : 7;

    const f1Threshold = new Date(now.getTime() - f1Days * 24 * 60 * 60 * 1000);
    const f2Threshold = new Date(now.getTime() - f2Days * 24 * 60 * 60 * 1000);

    // Follow-up 1: Mail 2
    let m2Query = supabase
      .from("leads")
      .select("*")
      .not("mail_1_status", "is", null)
      .like("mail_1_status", "SENT_%")
      .is("mail_2_status", null)
      .lte("mail_1_sent_at", f1Threshold.toISOString())
      .limit(50);

    if (camp.startId && camp.endId) {
      m2Query = m2Query.gte("id", camp.startId).lte("id", camp.endId);
    } else if (camp.leadIds && camp.leadIds.length > 0) {
      m2Query = m2Query.in("id", camp.leadIds);
    }

    const { data: m2Leads } = await m2Query;

    if (m2Leads && m2Leads.length > 0) {
      for (const lead of m2Leads) {
        if (processedLeadIds.has(lead.id)) continue;
        processedLeadIds.add(lead.id);

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
          results.processedLeads.push({ id: lead.id, slot: 2, template: m2Template, campaign: camp.name });
          await new Promise((r) => setTimeout(r, (camp.delaySec || 2) * 1000));
        } catch (err) {
          results.errors++;
          await supabase.from("leads").update({
            error_log: `[${now.toISOString()}] Mail-2 error: ${err.message}`,
          }).eq("id", lead.id);
        }
      }
    }

    // Follow-up 2: Mail 3
    let m3Query = supabase
      .from("leads")
      .select("*")
      .not("mail_2_status", "is", null)
      .like("mail_2_status", "SENT_%")
      .is("mail_3_status", null)
      .lte("mail_1_sent_at", f2Threshold.toISOString())
      .limit(50);

    if (camp.startId && camp.endId) {
      m3Query = m3Query.gte("id", camp.startId).lte("id", camp.endId);
    } else if (camp.leadIds && camp.leadIds.length > 0) {
      m3Query = m3Query.in("id", camp.leadIds);
    }

    const { data: m3Leads } = await m3Query;

    if (m3Leads && m3Leads.length > 0) {
      for (const lead of m3Leads) {
        if (processedLeadIds.has(lead.id)) continue;
        processedLeadIds.add(lead.id);

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
          results.processedLeads.push({ id: lead.id, slot: 3, template: m3Template, campaign: camp.name });
          await new Promise((r) => setTimeout(r, (camp.delaySec || 2) * 1000));
        } catch (err) {
          results.errors++;
          await supabase.from("leads").update({
            error_log: `[${now.toISOString()}] Mail-3 error: ${err.message}`,
          }).eq("id", lead.id);
        }
      }
    }
  }

  // 2. Default fallback for any leads not covered by campaigns (3 days / 7 days)
  const default3DaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const default7DaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const { data: fallbackM2 } = await supabase
    .from("leads")
    .select("*")
    .not("mail_1_status", "is", null)
    .like("mail_1_status", "SENT_%")
    .is("mail_2_status", null)
    .lte("mail_1_sent_at", default3DaysAgo.toISOString())
    .limit(25);

  if (fallbackM2) {
    for (const lead of fallbackM2) {
      if (processedLeadIds.has(lead.id)) continue;
      processedLeadIds.add(lead.id);

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
      }
    }
  }

  const { data: fallbackM3 } = await supabase
    .from("leads")
    .select("*")
    .not("mail_2_status", "is", null)
    .like("mail_2_status", "SENT_%")
    .is("mail_3_status", null)
    .lte("mail_1_sent_at", default7DaysAgo.toISOString())
    .limit(25);

  if (fallbackM3) {
    for (const lead of fallbackM3) {
      if (processedLeadIds.has(lead.id)) continue;
      processedLeadIds.add(lead.id);

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
      }
    }
  }

  return results;
}

/**
 * GET /api/cron/followup
 * Handles cron triggered by Vercel or manual test with key
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  const authHeader = request.headers.get("authorization");

  const isAuthorized =
    authHeader === `Bearer ${process.env.CRON_SECRET}` ||
    key === "metapilot2026" ||
    key === process.env.CRON_SECRET;

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await processFollowups();
    return NextResponse.json({
      success: true,
      message: `Followup check completed. Mail 2 sent: ${results.mail2Sent}, Mail 3 sent: ${results.mail3Sent}`,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cron followup error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/cron/followup
 * Admin manual trigger button
 */
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { key } = body;

    if (key !== "metapilot2026" && key !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const results = await processFollowups();
    return NextResponse.json({
      success: true,
      message: `Follow-up check completed! Mail 2 sent: ${results.mail2Sent}, Mail 3 sent: ${results.mail3Sent}`,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
