import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/brevo";
import { getMailTemplate } from "@/lib/email-templates";

export const dynamic = "force-dynamic";

/**
 * Helper to fetch campaign history stored in app_config registry
 */
async function getCampaignRegistry() {
  const { data } = await supabase
    .from("app_config")
    .select("value")
    .eq("key", "campaigns_registry")
    .maybeSingle();

  if (!data?.value) return [];
  try {
    return JSON.parse(data.value);
  } catch (e) {
    return [];
  }
}

/**
 * Helper to save campaign history to app_config registry
 */
async function saveCampaignRegistry(registry) {
  await supabase.from("app_config").upsert({
    key: "campaigns_registry",
    value: JSON.stringify(registry),
    description: "Multi-campaign metadata and history",
    updated_at: new Date().toISOString(),
  });
}

/**
 * GET /api/campaigns
 * List all campaigns with live lead counts
 */
export async function GET(request) {
  try {
    const registry = await getCampaignRegistry();

    // Enrich campaigns with live stats from leads table
    const enriched = await Promise.all(
      registry.map(async (camp) => {
        let query = supabase.from("leads").select("id, mail_1_status, mail_2_status, mail_3_status");

        if (camp.startId && camp.endId) {
          query = query.gte("id", camp.startId).lte("id", camp.endId);
        } else if (camp.leadIds && Array.isArray(camp.leadIds) && camp.leadIds.length > 0) {
          query = query.in("id", camp.leadIds);
        }

        const { data: leads } = await query;
        const total = leads?.length || camp.totalLeads || 0;
        const m1Sent = leads?.filter((l) => l.mail_1_status?.startsWith("SENT_")).length || 0;
        const m2Sent = leads?.filter((l) => l.mail_2_status?.startsWith("SENT_")).length || 0;
        const m3Sent = leads?.filter((l) => l.mail_3_status?.startsWith("SENT_")).length || 0;

        const isCompleted = total > 0 && m3Sent >= total;
        const status = isCompleted ? "Completed" : camp.status || "Active";

        return {
          ...camp,
          totalLeads: total,
          m1Sent,
          m2Sent,
          m3Sent,
          status,
        };
      })
    );

    return NextResponse.json({
      success: true,
      campaigns: enriched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    });
  } catch (error) {
    console.error("GET /api/campaigns error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/campaigns
 * Create and launch a new campaign with custom day gaps and rate limiting
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      limit = 50,
      startId = null,
      endId = null,
      delaySec = 2,
      followup1Days = 3,
      followup2Days = 7,
      scheduledStartTime = null,
      key,
    } = body;

    if (key !== "metapilot2026" && key !== process.env.CRON_SECRET) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const sId = startId ? parseInt(startId, 10) : null;
    const eId = endId ? parseInt(endId, 10) : null;
    const activeLimit = parseInt(limit, 10) || 50;
    const activeDelay = parseFloat(delaySec) || 2;
    const f1Days = parseFloat(followup1Days) >= 0 ? parseFloat(followup1Days) : 3;
    const f2Days = parseFloat(followup2Days) >= 0 ? parseFloat(followup2Days) : 7;

    // Check if campaign is scheduled for a future date/time
    const isScheduledFuture =
      Boolean(scheduledStartTime) &&
      !isNaN(new Date(scheduledStartTime).getTime()) &&
      new Date(scheduledStartTime).getTime() > Date.now();

    // 1. Query matching leads that need Mail 1 (or next in sequence)
    let query = supabase
      .from("leads")
      .select("*")
      .not("email", "is", null);

    if (sId && eId) {
      query = query.gte("id", sId).lte("id", eId).order("id", { ascending: true });
    } else if (sId) {
      query = query.gte("id", sId).order("id", { ascending: true }).limit(activeLimit);
    } else {
      query = query.is("mail_1_status", null).order("id", { ascending: true }).limit(activeLimit);
    }

    const { data: leads, error: fetchErr } = await query;
    if (fetchErr) throw fetchErr;

    if (!leads || leads.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No eligible leads found for this range/criteria.",
      });
    }

    const actualStartId = leads[0]?.id;
    const actualEndId = leads[leads.length - 1]?.id;
    const campaignId = `CAMP-${Date.now()}`;
    const campaignName =
      name?.trim() || `Campaign #${leads.length} Leads (IDs ${actualStartId} to ${actualEndId})`;

    const templates = ["A", "B", "C"];
    const results = [];
    let sentCount = 0;

    // Check if fast synchronous dispatch is safe (<= 2s delay and <= 15 leads)
    const isFastSync = !isScheduledFuture && activeDelay <= 2 && leads.length <= 15;
    const leadsToDispatchNow = isScheduledFuture ? [] : isFastSync ? leads : [leads[0]];

    // 2. Dispatch initial lead(s) immediately so staff gets instant feedback
    for (let i = 0; i < leadsToDispatchNow.length; i++) {
      const lead = leadsToDispatchNow[i];
      const templateCode = templates[i % 3];

      try {
        const template = getMailTemplate(templateCode, {
          fullName: lead.full_name,
          jobRole: lead.job_role,
        });

        await sendEmail(lead.email, template.subject, template.htmlBody, lead.full_name);

        const now = new Date().toISOString();
        await supabase
          .from("leads")
          .update({
            mail_1_template: templateCode,
            mail_1_status: `SENT_${templateCode}`,
            mail_1_sent_at: now,
          })
          .eq("id", lead.id);

        sentCount++;
        results.push({
          id: lead.id,
          name: lead.full_name,
          email: lead.email,
          template: templateCode,
          slot: 1,
          status: "sent",
          sentAt: now,
        });
      } catch (sendErr) {
        results.push({
          id: lead.id,
          name: lead.full_name,
          email: lead.email,
          template: templateCode,
          slot: 1,
          status: "error",
          error: sendErr.message,
        });
      }

      if (i < leadsToDispatchNow.length - 1 && activeDelay > 0) {
        await new Promise((r) => setTimeout(r, activeDelay * 1000));
      }
    }

    const isFullySent = !isScheduledFuture && sentCount === leads.length;
    const campaignStatus = isScheduledFuture ? "scheduled" : isFullySent ? "completed_m1" : "in_progress";
    const nowTime = new Date().toISOString();

    // 3. Record Campaign in campaigns table
    try {
      await supabase.from("campaigns").insert({
        campaign_date: new Date().toISOString().split("T")[0],
        leads_limit: leads.length,
        gap_minutes: activeDelay / 60,
        start_time: isScheduledFuture ? new Date(scheduledStartTime).toTimeString().split(" ")[0] : new Date().toTimeString().split(" ")[0],
        followup_1_days: f1Days,
        followup_2_days: f2Days,
        status: isScheduledFuture ? "Scheduled" : isFullySent ? "Active" : "Queued",
        processed_count: sentCount,
        next_lead_id: actualStartId,
      });
    } catch (dbErr) {
      console.warn("Could not insert directly into campaigns table, app_config registry will persist:", dbErr);
    }

    // 4. Save to persistent Campaign Registry in app_config
    const newCampaign = {
      id: campaignId,
      name: campaignName,
      startId: actualStartId,
      endId: actualEndId,
      leadIds: leads.map((l) => l.id),
      totalLeads: leads.length,
      processedCount: sentCount,
      delaySec: activeDelay,
      followup1Days: f1Days,
      followup2Days: f2Days,
      scheduledStartTime: isScheduledFuture ? new Date(scheduledStartTime).toISOString() : null,
      status: campaignStatus,
      lastDispatchedAt: isScheduledFuture ? null : nowTime,
      createdAt: nowTime,
      results,
    };

    const registry = await getCampaignRegistry();
    registry.unshift(newCampaign);
    await saveCampaignRegistry(registry);

    const isQueued = !isFullySent;
    const delayDesc = activeDelay >= 60 ? `${(activeDelay / 60).toFixed(0)} min` : `${activeDelay}s`;
    let message = "";
    if (isScheduledFuture) {
      message = `✔ Campaign Scheduled! Mail 1 will automatically start on ${new Date(scheduledStartTime).toLocaleString()} (delivery every ${delayDesc}).`;
    } else if (isQueued) {
      message = `✔ Campaign Launched! 1st lead dispatched immediately. Remaining ${leads.length - sentCount} leads are queued for 24/7 automated delivery every ${delayDesc}.`;
    } else {
      message = `✔ Campaign Completed! All ${sentCount} leads dispatched successfully.`;
    }

    return NextResponse.json({
      success: true,
      message,
      scheduled: isScheduledFuture,
      queued: isQueued,
      campaign: newCampaign,
      sent: sentCount,
      total: leads.length,
      results,
    });
  } catch (error) {
    console.error("POST /api/campaigns error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/campaigns?id=...
 * Delete a campaign from registry
 */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing campaign id" }, { status: 400 });
    }

    const registry = await getCampaignRegistry();
    const updated = registry.filter((c) => c.id !== id);
    await saveCampaignRegistry(updated);

    return NextResponse.json({ success: true, message: `Campaign ${id} removed from history.` });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
