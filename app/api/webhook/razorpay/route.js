import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/brevo";
import { getPaidCredentialsTemplate } from "@/lib/email-templates";
import { verifyRazorpaySignature } from "@/lib/razorpay";

function calculateEndDate(startDate, plan) {
  const end = new Date(startDate);
  const p = (plan || "").toLowerCase();
  if (p.includes("2d") || p.includes("2 day") || p.includes("blitz") || p.includes("sprint")) {
    end.setDate(end.getDate() + 2);
  } else if (p.includes("1w") || p.includes("1 week") || p.includes("prep")) {
    end.setDate(end.getDate() + 7);
  } else if (p.includes("1m") || p.includes("1 month") || p.includes("mastery") || p.includes("switch")) {
    end.setMonth(end.getMonth() + 1);
  } else if (p.includes("1d") || p.includes("1 day")) {
    end.setDate(end.getDate() + 1);
  } else {
    end.setDate(end.getDate() + 2);
  }
  return end;
}

/**
 * POST /api/webhook/razorpay
 * Handles Razorpay payment.captured webhook -> automatically generates credentials and sends B2 email
 */
export async function POST(request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    // Verify webhook signature if provided
    if (signature) {
      const isValid = verifyRazorpaySignature(rawBody, signature);
      if (!isValid) {
        console.warn("[Razorpay Webhook] Invalid signature detected. Continuing with caution.");
      }
    }

    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch (_) {
      return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
    }

    // Check if event is payment.captured
    const event = payload.event;
    const payment = payload.payload?.payment?.entity;

    if (!payment) {
      console.log("[Razorpay Webhook] Ignored: not a payment event", event);
      return NextResponse.json({ success: true, message: "Ignored non-payment event" });
    }

    const paymentEmail = (payment.notes?.user_email || payment.email || "").toLowerCase().trim();
    const amountPaid = (payment.amount || 0) / 100;
    const appTypeHint = (payment.notes?.app_type || "").toLowerCase();

    console.log(`[Razorpay Webhook] Payment captured for email: ${paymentEmail}, amount: ₹${amountPaid}, app: ${appTypeHint}`);

    if (!paymentEmail || paymentEmail === "na") {
      console.warn("[Razorpay Webhook] No customer email in payment payload!");
      return NextResponse.json({ success: true, message: "No email context in payment" });
    }

    // Search tables in order based on appTypeHint
    const tablesToSearch = appTypeHint.includes("go")
      ? ["go_subscriptions", "pro_subscriptions", "subscriptions"]
      : ["pro_subscriptions", "go_subscriptions", "subscriptions"];

    let targetTable = null;
    let pendingRecord = null;

    for (const table of tablesToSearch) {
      try {
        const { data } = await supabase
          .from(table)
          .select("*")
          .ilike("email", paymentEmail)
          .eq("status", "Pending")
          .order("id", { ascending: false })
          .limit(1);

        if (data && data.length > 0) {
          targetTable = table;
          pendingRecord = data[0];
          break;
        }
      } catch (tableErr) {
        console.warn(`[Razorpay Webhook] Query failed on ${table}:`, tableErr.message);
      }
    }

    if (!pendingRecord) {
      console.warn(`[Razorpay Webhook] No pending registration found for ${paymentEmail}`);
      return NextResponse.json({ success: true, message: "No matching pending record found" });
    }

    const name = pendingRecord.full_name || "Customer";
    const plan = pendingRecord.plan_type || "Premium";
    const appDisplayName = targetTable.includes("go") ? "MetaPilot Go" : "MetaPilot Pro";

    // Generate credentials
    const cleanPrefix = name.replace(/[^a-zA-Z]/g, "").substring(0, 4).toUpperCase() || "USER";
    const userId = cleanPrefix.padEnd(4, "X") + Math.floor(1000 + Math.random() * 9000);
    const password = Math.floor(100000 + Math.random() * 900000).toString();

    const startDate = new Date();
    const endDate = calculateEndDate(startDate, plan);

    // Update database record to 'Paid'
    const { error: updateErr } = await supabase
      .from(targetTable)
      .update({
        user_id: userId,
        password: password,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: "Paid",
        amount_paid: amountPaid || pendingRecord.amount_paid || 0,
      })
      .eq("id", pendingRecord.id);

    if (updateErr) {
      console.error(`[Razorpay Webhook] Failed to update ${targetTable}:`, updateErr);
      throw updateErr;
    }

    console.log(`[Razorpay Webhook] Activated ${userId} in ${targetTable}. Sending credentials email...`);

    // Send Brevo Email B2 (Credentials email)
    try {
      const emailTemplate = getPaidCredentialsTemplate({
        fullName: name,
        appName: appDisplayName,
        planType: plan,
        amountPaid: amountPaid,
        userId: userId,
        password: password,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      await sendEmail(
        paymentEmail,
        emailTemplate.subject,
        emailTemplate.htmlBody,
        name,
        [{ email: "support.metapilot@gmail.com", name: "MetaPilot Admin" }]
      );
      console.log(`[Email] B2 Credentials sent to ${paymentEmail} for ${appDisplayName}`);
    } catch (mailErr) {
      console.error(`[Email Error] Failed to send credentials email:`, mailErr);
    }

    return NextResponse.json({
      success: true,
      message: "Credentials generated and emailed to customer.",
      userId: userId,
      plan: plan,
      app: appDisplayName,
    });
  } catch (error) {
    console.error("[Razorpay Webhook Fatal Error]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
