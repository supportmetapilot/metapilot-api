import crypto from "crypto";

const RZP_KEY_ID = process.env.RAZORPAY_KEY_ID || "rzp_live_SUf1ZBoktwXxvr";
const RZP_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "K7iZ9Wf3mZ0ziQjQwTM9dOLj";
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "metapilot2026";

/**
 * Generate a Razorpay Payment Link (24-hour expiry)
 */
export async function createPaymentLink({ name, email, mobile, amount, planType, appType }) {
  try {
    const amountInPaise = Math.round(Number(amount) * 100);
    if (!amountInPaise || amountInPaise <= 0) {
      console.warn("Skipping Razorpay link: amount is 0 or invalid", amount);
      return null;
    }

    const appName = (appType || "").toLowerCase().includes("go") ? "MetaPilot Go" : "MetaPilot Pro";
    const auth = Buffer.from(`${RZP_KEY_ID}:${RZP_KEY_SECRET}`).toString("base64");

    const payload = {
      amount: amountInPaise,
      currency: "INR",
      accept_partial: false,
      expire_by: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
      reference_id: `MP_${Date.now()}`,
      description: `${appName} - ${planType || "Subscription"}`,
      customer: {
        name: name || "Customer",
        email: email,
        contact: mobile || "",
      },
      notes: {
        user_email: email,
        app_type: appType || "pro",
        plan_type: planType || "Standard",
      },
      notify: {
        sms: false,
        email: false, // We send custom branded emails via Brevo
      },
      reminder_enable: false,
    };

    const res = await fetch("https://api.razorpay.com/v1/payment_links", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (data.error) {
      console.error("Razorpay link error:", data.error);
      return null;
    }

    return data.short_url || data.payment_link;
  } catch (error) {
    console.error("Failed to create Razorpay link:", error);
    return null;
  }
}

/**
 * Verify Razorpay Webhook HMAC SHA256 signature
 */
export function verifyRazorpaySignature(rawBody, signature) {
  try {
    if (!signature) return false;
    const expected = crypto
      .createHmac("sha256", WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");
    return expected === signature;
  } catch (err) {
    console.error("Signature verification failed:", err);
    return false;
  }
}
