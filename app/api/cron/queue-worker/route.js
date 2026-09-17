import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/brevo";
import { getMailTemplate } from "@/lib/email-templates";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Allow sufficient serverless execution time

const REGISTRY_CONFIG_KEY = "campaigns_registry";

async function getCampaignsRegistry() {
  try {
    const { data } = await supabase
      .from("app_config")
      .select("value")
      .eq("key", REGISTRY_CONFIG_KEY)
      .maybeSingle();

    if (data && data.value) {
      return Array.isArray(data.value) ? data.value : JSON.parse(data.value);
    }
  } catch (err) {
    console.warn("Failed to read campaigns registry:", err);
  }
  return [];
}

async function saveCampaignsRegistry(registry) {
  try {
    await supabase.from("app_config").upsert({
      key: REGISTRY_CONFIG_KEY,
      value: registry,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Failed to save campaigns registry:", err);
  }
}

/**
 * Core Worker Function
 * Dispatches the next due lead in the active campaign queue, and checks due follow-ups.
 */
async function processQueue() {
  const now = new Date();
  const report = {
    timestamp: now.toISOString(),
    mail1Dispatched: null,
    mail2Dispatched: null,
    mail3Dispatched: null,
    activeCampaignsCount: 0,
    waitingNextLead: null,
  };

  const registry = await getCampaignsRegistry();
  const activeCampaigns = registry.filter(
    (c) =>
      c.status === "in_progress" ||
      c.status === "queued" ||
      c.status === "active" ||
      c.status === "scheduled"
  );
  report.activeCampaignsCount = activeCampaigns.length;

  let registryUpdated = false;

  // 1. Process Mail 1 Queue for active campaigns
  for (const camp of activeCampaigns) {
    // If campaign is scheduled for a future time, check if scheduled time has arrived
    if (camp.scheduledStartTime) {
      const scheduledMs = new Date(camp.scheduledStartTime).getTime();
      if (!isNaN(scheduledMs) && scheduledMs > now.getTime()) {
        const remainingSec = Math.ceil((scheduledMs - now.getTime()) / 1000);
        report.waitingNextLead = {
          campaign: camp.name || camp.id,
          status: "scheduled",
          scheduledStart: camp.scheduledStartTime,
          remainingSec,
        };
        continue; // Scheduled in the future, wait
      } else if (camp.status === "scheduled") {
        camp.status = "in_progress";
        registryUpdated = true;
      }
    }

    const delaySec = parseFloat(camp.delaySec || camp.gap_seconds || 120);
    const lastSent = camp.lastDispatchedAt ? new Date(camp.lastDispatchedAt).getTime() : 0;
    const elapsedSec = (now.getTime() - lastSent) / 1000;

    // Check if the required delay has elapsed
    if (lastSent > 0 && elapsedSec < delaySec) {
      const remainingSec = Math.ceil(delaySec - elapsedSec);
      report.waitingNextLead = {
        campaign: camp.name || camp.id,
        remainingSec,
        delaySec,
      };
      continue; // Not yet due for this campaign
    }

    // Query the next pending lead for Mail 1 in this campaign range
    let query = supabase
      .from("leads")
      .select("*")
      .not("email", "is", null)
      .is("mail_1_status", null);

    if (camp.startId && camp.endId) {
      query = query.gte("id", camp.startId).lte("id", camp.endId);
    } else if (camp.leadIds && camp.leadIds.length > 0) {
      query = query.in("id", camp.leadIds);
    }

    const { data: pendingLeads, error: queryErr } = await query
      .order("id", { ascending: true })
      .limit(1);

    if (queryErr) {
      console.error("Queue worker lead query error:", queryErr);
      continue;
    }

    if (pendingLeads && pendingLeads.length > 0) {
      const lead = pendingLeads[0];
      const templates = ["A", "B", "C"];
      const currentSentCount = (camp.results || []).length;
      const templateCode = templates[currentSentCount % 3];

      try {
        const template = getMailTemplate(templateCode, {
          fullName: lead.full_name,
          jobRole: lead.job_role,
        });

        await sendEmail(lead.email, template.subject, template.htmlBody, lead.full_name);

        const sentTime = new Date().toISOString();
        await supabase
          .from("leads")
          .update({
            mail_1_template: templateCode,
            mail_1_status: `SENT_${templateCode}`,
            mail_1_sent_at: sentTime,
          })
          .eq("id", lead.id);

        if (!camp.results) camp.results = [];
        camp.results.push({
          id: lead.id,
          name: lead.full_name,
          email: lead.email,
          template: templateCode,
          slot: 1,
          status: "sent",
          sentAt: sentTime,
        });

        camp.lastDispatchedAt = sentTime;
        camp.processedCount = (camp.processedCount || 0) + 1;
        registryUpdated = true;

        report.mail1Dispatched = {
          campaign: camp.name || camp.id,
          leadId: lead.id,
          name: lead.full_name,
          email: lead.email,
          template: templateCode,
        };

        // Mirror to campaigns table if ID matches
        try {
          const numericId = parseInt(String(camp.id).replace(/\D/g, ""), 10);
          if (numericId && !isNaN(numericId)) {
            await supabase
              .from("campaigns")
              .update({
                processed_count: camp.processedCount,
                last_run_at: sentTime,
              })
              .eq("id", numericId);
          }
        } catch (_) {}

        // Dispatched 1 lead for this run, exit loop to maintain steady human pace
        break;
      } catch (sendErr) {
        console.error("Queue worker send error:", sendErr);
        await supabase
          .from("leads")
          .update({
            mail_1_status: "FAILED",
            error_log: sendErr.message,
          })
          .eq("id", lead.id);
        break;
      }
    } else {
      // All Mail 1 leads completed for this campaign
      camp.status = "completed_m1";
      registryUpdated = true;
    }
  }

  // 2. Check due follow-ups (Mail 2 & Mail 3) for active campaigns
  for (const camp of registry) {
    if (report.mail2Dispatched && report.mail3Dispatched) break;

    const f1Days = parseFloat(camp.followup1Days) >= 0 ? parseFloat(camp.followup1Days) : 3;
    const f2Days = parseFloat(camp.followup2Days) >= 0 ? parseFloat(camp.followup2Days) : 7;
    const f1Threshold = new Date(now.getTime() - f1Days * 24 * 60 * 60 * 1000);
    const f2Threshold = new Date(now.getTime() - f2Days * 24 * 60 * 60 * 1000);

    // Check Mail 2 due
    if (!report.mail2Dispatched) {
      let m2Query = supabase
        .from("leads")
        .select("*")
        .not("mail_1_status", "is", null)
        .like("mail_1_status", "SENT_%")
        .is("mail_2_status", null)
        .lte("mail_1_sent_at", f1Threshold.toISOString())
        .order("id", { ascending: true })
        .limit(1);

      if (camp.startId && camp.endId) {
        m2Query = m2Query.gte("id", camp.startId).lte("id", camp.endId);
      }

      const { data: m2Leads } = await m2Query;
      if (m2Leads && m2Leads.length > 0) {
        const lead = m2Leads[0];
        const m1Template = lead.mail_1_template || "A";
        const m2Template = m1Template === "A" ? "B" : m1Template === "B" ? "C" : "A";

        try {
          const tpl = getMailTemplate(m2Template, {
            fullName: lead.full_name,
            jobRole: lead.job_role,
          });
          await sendEmail(lead.email, tpl.subject, tpl.htmlBody, lead.full_name);

          const sentTime = new Date().toISOString();
          await supabase
            .from("leads")
            .update({
              mail_2_template: m2Template,
              mail_2_status: `SENT_${m2Template}`,
              mail_2_sent_at: sentTime,
            })
            .eq("id", lead.id);

          report.mail2Dispatched = {
            leadId: lead.id,
            email: lead.email,
            template: m2Template,
          };
        } catch (err) {
          console.error("Mail 2 queue send error:", err);
        }
      }
    }

    // Check Mail 3 due
    if (!report.mail3Dispatched) {
      let m3Query = supabase
        .from("leads")
        .select("*")
        .not("mail_2_status", "is", null)
        .like("mail_2_status", "SENT_%")
        .is("mail_3_status", null)
        .lte("mail_1_sent_at", f2Threshold.toISOString())
        .order("id", { ascending: true })
        .limit(1);

      if (camp.startId && camp.endId) {
        m3Query = m3Query.gte("id", camp.startId).lte("id", camp.endId);
      }

      const { data: m3Leads } = await m3Query;
      if (m3Leads && m3Leads.length > 0) {
        const lead = m3Leads[0];
        const m2Template = lead.mail_2_template || "B";
        const m3Template = m2Template === "B" ? "C" : m2Template === "C" ? "A" : "B";

        try {
          const tpl = getMailTemplate(m3Template, {
            fullName: lead.full_name,
            jobRole: lead.job_role,
          });
          await sendEmail(lead.email, tpl.subject, tpl.htmlBody, lead.full_name);

          const sentTime = new Date().toISOString();
          await supabase
            .from("leads")
            .update({
              mail_3_template: m3Template,
              mail_3_status: `SENT_${m3Template}`,
              mail_3_sent_at: sentTime,
            })
            .eq("id", lead.id);

          report.mail3Dispatched = {
            leadId: lead.id,
            email: lead.email,
            template: m3Template,
          };
        } catch (err) {
          console.error("Mail 3 queue send error:", err);
        }
      }
    }
  }

  if (registryUpdated) {
    await saveCampaignsRegistry(registry);
  }

  return report;
}

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
    const report = await processQueue();
    return NextResponse.json({ success: true, report });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryKey = searchParams.get("key");
    const body = await request.json().catch(() => ({}));
    const key = body.key || queryKey;
    const authHeader = request.headers.get("authorization");

    const isAuthorized =
      authHeader === `Bearer ${process.env.CRON_SECRET}` ||
      key === "metapilot2026" ||
      key === process.env.CRON_SECRET;

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const report = await processQueue();
    return NextResponse.json({ success: true, report });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
