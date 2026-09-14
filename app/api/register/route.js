import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/brevo";
import { getTrialCredentialsTemplate, getPaymentLinkTemplate, getTrialAlreadyUsedTemplate } from "@/lib/email-templates";
import { createPaymentLink } from "@/lib/razorpay";

function getStandardPrice(plan, isGo) {
  if (isGo) {
    const p = (plan || "").toLowerCase();
    if (p.includes("trial") || p === "0") return 0;
    if (p.includes("pro-2d") || p.includes("2d")) return 199;
    if (p.includes("pro-1w") || p.includes("1w")) return 399;
    if (p.includes("pro-1m") || p.includes("1m")) return 665;
    return 199;
  } else {
    const p = (plan || "").toLowerCase();
    if (p.includes("free") || p.includes("trial")) return 0;
    if (p.includes("1 day") || p.includes("1_day")) return 249;
    if (p.includes("2 day") || p.includes("2_days")) return 449;
    if (p.includes("1 week") || p.includes("1_week")) return 1299;
    if (p.includes("1 month") || p.includes("1_month")) return 4999;
    return 449;
  }
}

/**
 * POST /api/register
 * Register a new user for MetaPilot Pro or MetaPilot Go
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
    const rawPlan = (body.planType || body.plan || body.subType || "1-Day Free").trim();
    const deviceUUID = (body.deviceUUID || body.deviceId || body.device_uuid || "").trim();
    const rawCoupon = (body.coupon || body.couponCode || "").trim().toUpperCase();

    // Determine whether this is MetaPilot Go or MetaPilot Pro
    const rawApp = (body.app_type || body.appType || body.app || "").toLowerCase();
    const isGo =
      rawApp === "go" ||
      rawApp.includes("go") ||
      rawPlan === "trial" ||
      rawPlan.startsWith("pro-2d") ||
      rawPlan.startsWith("pro-1w") ||
      rawPlan.startsWith("pro-1m") ||
      rawPlan.toLowerCase().includes("go");

    const appType = isGo ? "go" : "pro";
    const appDisplayName = isGo ? "MetaPilot Go" : "MetaPilot Pro";

    const isTrial =
      rawPlan === "trial" ||
      rawPlan.toLowerCase().includes("free") ||
      rawPlan.toLowerCase().includes("trial");

    const planType = isTrial ? "1-Day Free" : (rawPlan || appDisplayName);

    if (!name || !email || !deviceUUID) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: name, email, deviceUUID" },
        { status: 400 }
      );
    }

    // Generate trial credentials
    const cleanPrefix = name.replace(/[^a-zA-Z]/g, "").substring(0, 4).toUpperCase() || "USER";
    const userId = cleanPrefix.padEnd(4, "X");
    const password = deviceUUID.replace(/[^a-zA-Z0-9]/g, "").substring(0, 4) || "1234";

    // Table names based on app and tier
    const targetTrialTable = isGo ? "go_trials" : "pro_trials";
    const targetSubTable = isGo ? "go_subscriptions" : "pro_subscriptions";

    if (isTrial) {
      // 1. Check if HWID already claimed trial
      let existing = null;
      try {
        const { data } = await supabase
          .from(targetTrialTable)
          .select("id, status")
          .eq("device_uuid", deviceUUID)
          .limit(1);
        existing = data;
      } catch (_) {
        const { data } = await supabase
          .from("trials")
          .select("id, status")
          .eq("device_uuid", deviceUUID)
          .limit(1);
        existing = data;
      }

      if (existing && existing.length > 0) {
        // Send Trial Already Claimed email with upgrade options and WELCOME25 coupon
        try {
          const usedTemplate = getTrialAlreadyUsedTemplate({
            fullName: name,
            appName: appDisplayName,
            isGo: isGo,
          });
          await sendEmail(email, usedTemplate.subject, usedTemplate.htmlBody, name);
          console.log(`[Email] Trial already used email sent to ${email}`);
        } catch (e) {
          console.error("Failed to send trial already used email:", e);
        }

        return NextResponse.json({
          success: false,
          error: "Trial already claimed on this device. We have sent you an email with upgrade options!",
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

      let insertError = null;
      let insertedTo = targetTrialTable;

      const { error: dedicatedErr } = await supabase.from(targetTrialTable).insert(trialRow);
      if (dedicatedErr) {
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
      // 2. Paid Subscription Flow (B1: Generate Razorpay Link & Send Email)
      const basePrice = getStandardPrice(rawPlan, isGo);
      let sellingPrice = Number(body.sellingPrice || body.amountPaid || body.finalPrice) || basePrice;

      // Generate Razorpay Payment Link
      let paymentLink = null;
      try {
        paymentLink = await createPaymentLink({
          name: name,
          email: email,
          mobile: mobile,
          amount: sellingPrice,
          planType: planType,
          appType: appType,
        });
      } catch (rzpErr) {
        console.error("[Razorpay Error] Link creation failed:", rzpErr);
      }

      const subRow = {
        full_name: name,
        email: email,
        mobile: mobile || "",
        job_role: jobRole || "",
        plan_type: planType,
        amount_paid: sellingPrice,
        device_uuid: deviceUUID,
        user_id: "",
        password: "",
        status: "Pending",
      };

      // Try inserting into dedicated table
      let insertedTo = targetSubTable;
      let { error: dedicatedErr } = await supabase.from(targetSubTable).insert(subRow);
      if (dedicatedErr) {
        console.warn(`Insert to ${targetSubTable} failed, trying fallback:`, dedicatedErr.message);
        insertedTo = "subscriptions";
        await supabase.from("subscriptions").insert(subRow);
      }

      // Send Brevo Email B1 with Razorpay Payment Link
      try {
        const emailTemplate = getPaymentLinkTemplate({
          fullName: name,
          appName: appDisplayName,
          planType: planType,
          actualPrice: basePrice,
          finalPrice: sellingPrice,
          coupon: rawCoupon,
          paymentLink: paymentLink,
        });

        await sendEmail(
          email,
          emailTemplate.subject,
          emailTemplate.htmlBody,
          name,
          [{ email: "support.metapilot@gmail.com", name: "MetaPilot Admin" }]
        );
        console.log(`[Email] Payment link sent to ${email} (CC: support.metapilot@gmail.com) for ${appDisplayName}`);
      } catch (mailErr) {
        console.error(`[Email Error] Failed to send payment link email:`, mailErr.message);
      }

      return NextResponse.json({
        success: true,
        message: "Registration successful. Please check your email for the Razorpay payment link.",
        app: appDisplayName,
        table: insertedTo,
        paymentLink: paymentLink,
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
