import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/brevo";
import { getTrialCredentialsTemplate, getProPendingTemplate } from "@/lib/email-templates";

/**
 * POST /api/register
 * Register a new user for MetaPilot Pro or MetaPilot Go
 * 
 * Supports dedicated tables:
 * - pro_trials & pro_subscriptions (if tables exist)
 * - go_trials & go_subscriptions (if tables exist)
 * - Fallback to trials & subscriptions (with app_type column support)
 */
export async function POST(request) {
  try {
    let body;
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const text = await request.text();
      const params = new URLSearchParams(text);
      body = Object.fromEntries(params.entries());
    } else {
      body = await request.json();
    }

    const name = (body.name || body.fullName || body.full_name || "").trim();
    const email = (body.email || "").trim();
    const mobile = (body.mobile || body.phone || "").trim();
    const jobRole = (body.jobRole || body.job_role || body.role || "").trim();
    const rawPlan = body.planType || body.plan || body.subType || "1-Day Free";
    const deviceUUID = (body.deviceUUID || body.deviceId || body.device_uuid || "").trim();
    const finalPrice = body.finalPrice || body.amountPaid || body.sellingPrice || "";

    // Determine whether this is MetaPilot Go or MetaPilot Pro
    const rawApp = (body.app_type || body.appType || body.app || "").toLowerCase();
    const isGo = rawApp.includes("go") || rawPlan.toLowerCase().includes("go");
    const appType = isGo ? "go" : "pro";
    const appDisplayName = isGo ? "MetaPilot Go" : "MetaPilot Pro";

    const isTrial = rawPlan.toLowerCase().includes("trial") || rawPlan.toLowerCase().includes("free");
    const planType = isTrial ? "1-Day Free" : (rawPlan || appDisplayName);

    if (!name || !email || !deviceUUID) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: name, email, deviceUUID" },
        { status: 400 }
      );
    }

    // Generate credentials
    const cleanPrefix = name.replace(/[^a-zA-Z]/g, "").substring(0, 4).toUpperCase() || "USER";
    const userId = cleanPrefix.padEnd(4, "X");
    const password = deviceUUID.replace(/[^a-zA-Z0-9]/g, "").substring(0, 4) || "1234";

    // Table names based on app and tier
    const targetTrialTable = isGo ? "go_trials" : "pro_trials";
    const targetSubTable = isGo ? "go_subscriptions" : "pro_subscriptions";

    if (isTrial) {
      // 1. Check if HWID already claimed trial (Check dedicated table first, then fallback)
      let existing = null;
      try {
        const { data } = await supabase
          .from(targetTrialTable)
          .select("id, status")
          .eq("device_uuid", deviceUUID)
          .limit(1);
        existing = data;
      } catch (_) {
        // Fallback to unified trials table
        const { data } = await supabase
          .from("trials")
          .select("id, status")
          .eq("device_uuid", deviceUUID)
          .limit(1);
        existing = data;
      }

      if (existing && existing.length > 0) {
        return NextResponse.json({
          success: false,
          error: "Trial already claimed on this device",
          code: "TRIAL_CLAIMED",
        });
      }

      const now = new Date();
      const endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +24 hours

      const trialRow = {
        full_name: name,
        email: email,
        mobile: mobile || "",
        job_role: jobRole || "",
        plan_type: "1-Day Free",
        device_uuid: deviceUUID,
        user_id: userId,
        password: password,
        start_date: now.toISOString(),
        end_date: endDate.toISOString(),
        status: "Trial",
      };

      // Try inserting into dedicated table (go_trials or pro_trials)
      let insertError = null;
      let insertedTo = targetTrialTable;

      const { error: dedicatedErr } = await supabase.from(targetTrialTable).insert(trialRow);
      if (dedicatedErr) {
        // Fallback: insert into legacy trials table
        insertedTo = "trials";
        const { error: legacyErr } = await supabase.from("trials").insert(trialRow);
        insertError = legacyErr;
      }

      if (insertError) throw insertError;

      // Send Brevo Email with Login Credentials
      try {
        const emailTemplate = getTrialCredentialsTemplate({
          fullName: name,
          appName: appDisplayName,
          userId: userId,
          password: password,
          endDate: endDate.toISOString(),
        });
        await sendEmail(email, emailTemplate.subject, emailTemplate.htmlBody, name);
        console.log(`[Email] Trial credentials sent to ${email} for ${appDisplayName}`);
      } catch (mailErr) {
        console.error(`[Email Error] Failed to send trial credentials email:`, mailErr.message);
      }

      return NextResponse.json({
        success: true,
        message: "Trial activated! Check your email for login credentials.",
        app: appDisplayName,
        table: insertedTo,
        userId: userId,
        password: password,
        startDate: now.toISOString(),
        endDate: endDate.toISOString(),
      });

    } else {
      // 2. Paid Subscription
      const subRow = {
        full_name: name,
        email: email,
        mobile: mobile || "",
        job_role: jobRole || "",
        plan_type: planType,
        device_uuid: deviceUUID,
        user_id: userId,
        password: password,
        status: "Pending",
      };

      let insertError = null;
      let insertedTo = targetSubTable;

      const { error: dedicatedErr } = await supabase.from(targetSubTable).insert(subRow);
      if (dedicatedErr) {
        insertedTo = "subscriptions";
        const { error: legacyErr } = await supabase.from("subscriptions").insert(subRow);
        insertError = legacyErr;
      }

      if (insertError) throw insertError;

      // Send Brevo Email for Paid Request
      try {
        const emailTemplate = getProPendingTemplate({
          fullName: name,
          appName: appDisplayName,
          planType: planType,
          finalPrice: finalPrice,
        });
        await sendEmail(email, emailTemplate.subject, emailTemplate.htmlBody, name);
        console.log(`[Email] Subscription received email sent to ${email} for ${appDisplayName}`);
      } catch (mailErr) {
        console.error(`[Email Error] Failed to send subscription email:`, mailErr.message);
      }

      return NextResponse.json({
        success: true,
        message: "Registration received. Details have been sent to your email.",
        app: appDisplayName,
        table: insertedTo,
        code: "PAYMENT_PENDING",
      });
    }
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
