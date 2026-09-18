import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/brevo";
import { getMailTemplate } from "@/lib/email-templates";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Allow sufficient serverless execution time

const REGISTRY_CONFIG_KEY = "campaigns_registry";
const MAX_EXECUTION_MS = 50000; // 50s safety margin (Vercel limit = 60s)
const MAX_LEADS_PER_RUN = 10; // Process up to 10 leads per invocation

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
 * Log dispatch activity for debugging
 */
async function logDispatch(action, details) {
  try {
    const { data: existing } = await supabase
      .from("app_config")
      .select("value")
      .eq("key", "queue_worker_log")
      .maybeSingle();

    const logs = existing?.value ? (Array.isArray(existing.value) ? existing.value : JSON.parse(existing.value)) : [];
    logs.unshift({
      timestamp: new Date().toISOString(),
      action,
      ...details,
    });

    // Keep only last 50 log entries
    await supabase.from("app_config").upsert({
      key: "queue_worker_log",
      value: logs.slice(0, 50),
      updated_at: new Date().toISOString(),
    });
  } catch (_) {}
}

/**
 * Core Worker Function — Processes MULTIPLE leads per run
 * Dispatches due leads in active campaigns, and checks due follow-ups.
 * Runs within a 50s time budget, processing up to MAX_LEADS_PER_RUN.
 */
async function processQueue() {
  const startTime = Date.now();
  const now = new Date();
  const report = {
    timestamp: now.toISOString(),
    mail1Dispatched: [],
    mail2Dispatched: null,
    mail3Dispatched: null,
    activeCampaignsCount: 0,
    waitingNextLead: null,
    totalProcessed: 0,
    executionMs: 0,
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
  let totalDispatched = 0;

  // 1. Process Mail 1 Queue for active campaigns — MULTI-LEAD LOOP
  for (const camp of activeCampaigns) {
    // Safety: stop if we're running out of time
    if (Date.now() - startTime > MAX_EXECUTION_MS) break;
    if (totalDispatched >= MAX_LEADS_PER_RUN) break;

    // Helper to safely parse date in IST (+05:30) if timezone is missing
    const parseISTDate = (dateInput) => {
      if (!dateInput) return null;
      if (dateInput instanceof Date) return dateInput;
      const str = String(dateInput).trim();
      if (str.includes("Z") || /[+-]\d{2}:?\d{2}$/.test(str)) {
        return new Date(str);
      }
      const normalized = str.replace(" ", "T");
      const [d, t] = normalized.split("T");
      if (d && t) {
        const tSec = t.length === 5 ? `${t}:00` : t;
        return new Date(`${d}T${tSec}+05:30`);
      }
      return new Date(str);
    };

    // If campaign is scheduled for a future time, check if scheduled time has arrived
    if (camp.scheduledStartTime) {
      const scheduledDate = parseISTDate(camp.scheduledStartTime);
      const scheduledMs = scheduledDate ? scheduledDate.getTime() : NaN;
      if (!isNaN(scheduledMs) && scheduledMs > now.getTime()) {
        const remainingSec = Math.ceil((scheduledMs - now.getTime()) / 1000);
        report.waitingNextLead = {
          campaign: camp.name || camp.id,
          status: "scheduled",
          scheduledStart: scheduledDate.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
          remainingSec,
        };
        continue; // Scheduled in the future, wait
      } else if (camp.status === "scheduled") {
        camp.status = "in_progress";
        registryUpdated = true;
      }
    }

    const delaySec = parseFloat(camp.delaySec || camp.gap_seconds || 120);

    // Inner loop: dispatch multiple leads for this campaign
    while (totalDispatched < MAX_LEADS_PER_RUN) {
      // Safety: stop if we're running out of time
      if (Date.now() - startTime > MAX_EXECUTION_MS) break;

      const currentNow = new Date();
      const lastSent = camp.lastDispatchedAt ? new Date(camp.lastDispatchedAt).getTime() : 0;
      const elapsedSec = (currentNow.getTime() - lastSent) / 1000;

      // Check if the required delay has elapsed
      if (lastSent > 0 && elapsedSec < delaySec) {
        const remainingSec = Math.ceil(delaySec - elapsedSec);
        report.waitingNextLead = {
          campaign: camp.name || camp.id,
          remainingSec,
          delaySec,
        };
        break; // Not yet due, move to next campaign
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
        break;
      }

      if (!pendingLeads || pendingLeads.length === 0) {
        // All Mail 1 leads completed for this campaign
        camp.status = "completed_m1";
        registryUpdated = true;
        break;
      }

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
        totalDispatched++;

        report.mail1Dispatched.push({
          campaign: camp.name || camp.id,
          leadId: lead.id,
          name: lead.full_name,
          email: lead.email,
          template: templateCode,
        });

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

        // Wait for the campaign's configured delay before processing the next lead
        // But only wait if we have more leads to process and time budget remaining
        if (delaySec > 0 && delaySec <= 10) {
          // Only wait for short delays (≤10s) — longer delays we skip and process next cron cycle
          await new Promise((r) => setTimeout(r, delaySec * 1000));
        } else if (delaySec > 10) {
          // For longer delays, we stop and let the next cron invocation handle it
          break;
        }
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
    }
  }

  // 2. Check due follow-ups (Mail 2 & Mail 3) for active campaigns
  for (const camp of registry) {
    if (Date.now() - startTime > MAX_EXECUTION_MS) break;
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

  report.totalProcessed = totalDispatched;
  report.executionMs = Date.now() - startTime;

  // Log dispatch activity
  await logDispatch("queue_run", {
    leadsDispatched: totalDispatched,
    activeCampaigns: report.activeCampaignsCount,
    executionMs: report.executionMs,
    mail2: report.mail2Dispatched ? true : false,
    mail3: report.mail3Dispatched ? true : false,
  });

  return report;
}

/**
 * Auth helper — supports Vercel Cron Bearer token, query key, and body key
 */
function isAuthorized(request, key) {
  const authHeader = request.headers.get("authorization");
  // Vercel Cron sends: Authorization: Bearer <CRON_SECRET>
  if (authHeader === `Bearer ${process.env.CRON_SECRET}`) return true;
  // Query param or body key
  if (key === "metapilot2026") return true;
  if (key === process.env.CRON_SECRET) return true;
  return false;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (!isAuthorized(request, key)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const report = await processQueue();
    return NextResponse.json({ success: true, report });
  } catch (err) {
    console.error("Queue worker GET error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryKey = searchParams.get("key");
    const body = await request.json().catch(() => ({}));
    const key = body.key || queryKey;

    if (!isAuthorized(request, key)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const report = await processQueue();
    return NextResponse.json({ success: true, report });
  } catch (err) {
    console.error("Queue worker POST error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
