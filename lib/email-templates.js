/**
 * Email Templates for MetaPilot Marketing & System Notifications
 * 100% Human 1-on-1 Personal Format (Starts from left margin, natural HR style)
 * Zero promotional fluff, zero emoji spam to guarantee 100% Primary Inbox placement
 */

function esc(text) {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const WEBSITE_URL = "https://metapilot.in";

/**
 * Builds the 1-on-1 human personal email HTML
 * Left-aligned, natural flow, exactly like an email typed by an HR / Founder in Gmail/Outlook
 */
function buildPersonalHumanEmail({ bodyContent }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 12px 14px; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14.5px; line-height: 1.65; color: #1a1a1a;">
  <div style="text-align: left; max-width: 100%;">
    ${bodyContent}
    <div style="margin-top: 32px; padding-top: 14px; border-top: 1px solid #eeeeee; font-size: 11px; color: #888888;">
      If you wish to stop receiving updates, <a href="mailto:support@metapilot.in?subject=Unsubscribe" style="color: #888888; text-decoration: underline;">click here to unsubscribe</a>.
    </div>
  </div>
</body>
</html>`;
}

/**
 * Get email template by code (A, B, or C)
 * Pure human 1-on-1 format designed specifically for Primary Inbox delivery
 * @param {string} templateCode - "A", "B", or "C" (or legacy "D", "E", "F")
 * @param {{ fullName: string, jobRole: string }} data - Lead data
 * @returns {{ subject: string, htmlBody: string }}
 */
export function getMailTemplate(templateCode, data) {
  const name = esc(data.fullName || "Candidate");
  const role = esc(data.jobRole || "Technical");
  const code = (templateCode || "A").toUpperCase();

  switch (code) {
    // -------------------------------------------------------------------------
    // TEMPLATE A: Initial Human Outreach (formerly D)
    // -------------------------------------------------------------------------
    case "A":
    case "D":
      return {
        subject: `Quick question regarding your ${role} interviews, ${name}`,
        htmlBody: buildPersonalHumanEmail({
          bodyContent: `
            <p>Hi ${name},</p>
            <p>I came across your profile and noticed you are actively preparing for opportunities in the <strong>${role}</strong> domain.</p>
            <p>In technical rounds, most candidates struggle not because they lack knowledge, but because of sudden pressure, difficult surprise questions, or tricky live coding tasks where thinking on your feet gets overwhelming.</p>
            <p>We recently built a silent AI co-pilot called <strong>MetaPilot</strong> specifically to help ${role} professionals overcome this:</p>
            <ul style="padding-left: 18px; line-height: 1.75; color: #2d3748;">
              <li><strong>Real-Time Voice Assistant:</strong> Listens to the interviewer's questions and suggests structured technical bullet points to speak within 2 seconds.</li>
              <li><strong>Live Coding &amp; OCR:</strong> Press Ctrl+Z to take a silent snapshot of any coding problem or SQL query on screen and get instant solution hints.</li>
              <li><strong>100% Invisible:</strong> Designed to remain completely undetectable during screen sharing on Google Meet, Zoom, and MS Teams.</li>
            </ul>
            <p>We offer a completely free <strong>1-day full access pass</strong> so you can test it on your laptop before any real interview:</p>
            <p style="margin: 18px 0;">
              👉 <a href="${WEBSITE_URL}" style="color: #2563eb; font-weight: bold; text-decoration: underline; font-size: 15px;">https://metapilot.in</a>
            </p>
            <p>If you'd like me to set up your free trial access directly, just <strong>reply "YES" to this email</strong> and I'll send your login details right away.</p>
            <p style="margin-top: 24px;">
              Best regards,<br>
              <strong>Hrushikesh More</strong><br>
              <span style="color: #64748b; font-size: 13px;">MetaPilot Team &bull; Pune</span><br>
              <a href="${WEBSITE_URL}" style="color: #2563eb; font-size: 13px;">metapilot.in</a>
            </p>
          `,
        }),
      };

    // -------------------------------------------------------------------------
    // TEMPLATE B: Human Follow-up (formerly E, stripped of promotional video links)
    // -------------------------------------------------------------------------
    case "B":
    case "E":
      return {
        subject: `Following up regarding your ${role} interviews, ${name}`,
        htmlBody: buildPersonalHumanEmail({
          bodyContent: `
            <p>Hi ${name},</p>
            <p>Following up on my previous note. With technical interviews getting harder and more competitive this year, many ${role} professionals find it challenging to handle rapid theoretical questions or tricky scenario-based rounds.</p>
            <p>A lot of candidates from ${role} backgrounds are now using MetaPilot during their preparation to maintain confidence and structure their answers seamlessly.</p>
            <p>You can test the 1-day free trial on your computer here:<br>
            👉 <a href="${WEBSITE_URL}" style="color: #2563eb; font-weight: bold; text-decoration: underline; font-size: 15px;">https://metapilot.in</a></p>
            <p>Do you have any interviews scheduled this week? If you run into any questions or need help setting it up on your laptop, feel free to reply directly to this email.</p>
            <p style="margin-top: 24px;">
              Warm regards,<br>
              <strong>Hrushikesh More</strong><br>
              <span style="color: #64748b; font-size: 13px;">MetaPilot Team &bull; Pune</span><br>
              <a href="${WEBSITE_URL}" style="color: #2563eb; font-size: 13px;">metapilot.in</a>
            </p>
          `,
        }),
      };

    // -------------------------------------------------------------------------
    // TEMPLATE C: Human Final Call (formerly F)
    // -------------------------------------------------------------------------
    case "C":
    case "F":
      return {
        subject: `Final note on your ${role} interview preparation, ${name}`,
        htmlBody: buildPersonalHumanEmail({
          bodyContent: `
            <p>Hi ${name},</p>
            <p>I just wanted to drop a quick final note in case you have upcoming interview rounds.</p>
            <p>Facing high-pressure interviews alone without real-time assistance is unnecessary when you can have a silent AI co-pilot right in front of you. MetaPilot helps you handle both live coding and technical theory without showing up on any screen share.</p>
            <p>If you'd like to test it before your next round, you can grab your 1-day free access here:<br>
            👉 <a href="${WEBSITE_URL}" style="color: #2563eb; font-weight: bold; text-decoration: underline; font-size: 15px;">https://metapilot.in</a></p>
            <p style="background: #f8fafc; border-left: 3px solid #2563eb; padding: 8px 12px; margin: 16px 0; font-size: 13px; color: #475569;">
              Tip: Apply promo code <strong>WELCOME25</strong> at checkout for Flat 25% OFF if you decide to upgrade.
            </p>
            <p>Or simply reply to this email with <strong>"FREE TRIAL"</strong> and I'll help you get started right away.</p>
            <p>Wishing you all the best for your interviews!</p>
            <p style="margin-top: 24px;">
              Best,<br>
              <strong>Hrushikesh More</strong><br>
              <span style="color: #64748b; font-size: 13px;">Founder, MetaPilot &bull; <a href="${WEBSITE_URL}" style="color: #2563eb;">metapilot.in</a></span>
            </p>
          `,
        }),
      };

    default:
      throw new Error("Unknown template code: " + templateCode);
  }
}

/**
 * Template for 1-Day Free Trial Credentials
 */
export function getTrialCredentialsTemplate({ fullName, appName, userId, password, endDate }) {
  const name = esc(fullName || "Candidate");
  const app = esc(appName || "MetaPilot");
  const formattedEndDate = new Date(endDate).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  return {
    subject: `Your ${app} 1-Day Free Trial Access Credentials`,
    htmlBody: buildPersonalHumanEmail({
      bodyContent: `
        <p>Hi ${name},</p>
        <p>Your 1-Day Free Trial for <strong>${app}</strong> has been successfully configured and activated.</p>
        <div style="background: #f8fafc; border-left: 4px solid #2563eb; padding: 12px 16px; margin: 18px 0;">
          <p style="margin: 0 0 6px 0; font-size: 14px;"><strong>Your Sign-in Credentials:</strong></p>
          <p style="margin: 3px 0;"><strong>User ID:</strong> <span style="font-family: monospace; font-size: 15px; color: #2563eb;">${esc(userId)}</span></p>
          <p style="margin: 3px 0;"><strong>Password:</strong> <span style="font-family: monospace; font-size: 15px; color: #2563eb;">${esc(password)}</span></p>
          <p style="margin: 6px 0 0 0; font-size: 12px; color: #64748b;"><strong>Valid Until:</strong> ${formattedEndDate} (IST)</p>
        </div>
        <p><strong>Next Steps:</strong></p>
        <ol style="padding-left: 18px; line-height: 1.7;">
          <li>Open the <strong>${app}</strong> desktop application.</li>
          <li>Enter the User ID and Password given above.</li>
          <li>Click Sign In to start your practice session.</li>
        </ol>
        <p>Best regards,<br><strong>MetaPilot Team</strong><br><a href="${WEBSITE_URL}">${WEBSITE_URL}</a></p>
      `,
    }),
  };
}

/**
 * Template for Paid Subscription Payment Link (B1 Flow)
 */
export function getPaymentLinkTemplate({ fullName, appName, planType, actualPrice, finalPrice, coupon, paymentLink }) {
  const name = esc(fullName || "Candidate");
  const app = esc(appName || "MetaPilot");
  const plan = esc(planType || "Subscription");
  const price = esc(finalPrice);
  const actual = esc(actualPrice);
  const link = paymentLink || WEBSITE_URL;

  return {
    subject: `${app}: Complete Your Registration for ${plan}`,
    htmlBody: buildPersonalHumanEmail({
      bodyContent: `
        <p>Hi ${name},</p>
        <p>Thank you for choosing <strong>${app}</strong>. Your subscription order for the <strong>${plan}</strong> plan is ready.</p>
        <p><strong>Order Summary:</strong><br>
        Plan: <strong>${plan}</strong><br>
        Payable Amount: ${actual && actual !== price ? `<del>₹${actual}</del> ` : ""}<strong>₹${price}</strong>
        ${coupon ? `<br>Coupon Applied: <strong>${esc(coupon)}</strong>` : ""}</p>
        <p style="margin: 20px 0;">
          👉 <a href="${link}" style="background: #2563eb; color: #ffffff; padding: 10px 20px; font-weight: bold; text-decoration: none; border-radius: 5px; display: inline-block;">Pay ₹${price} Securely via Razorpay &rarr;</a>
        </p>
        <p style="font-size: 13px; color: #64748b;">Your login credentials will be emailed immediately upon successful payment.</p>
        <p>Best regards,<br><strong>MetaPilot Team</strong></p>
      `,
    }),
  };
}

/**
 * Template for Paid Subscription Credentials After Successful Payment (B2 Flow)
 */
export function getPaidCredentialsTemplate({ fullName, appName, planType, amountPaid, userId, password, startDate, endDate }) {
  const name = esc(fullName || "Candidate");
  const app = esc(appName || "MetaPilot");
  const plan = esc(planType || "Premium");
  const startStr = startDate ? new Date(startDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
  const endStr = endDate ? new Date(endDate).toISOString().split("T")[0] : "";

  return {
    subject: `${app}: Your Premium Credentials & Access Details`,
    htmlBody: buildPersonalHumanEmail({
      bodyContent: `
        <p>Hi ${name},</p>
        <p>Your payment of <strong>₹${esc(amountPaid || "")}</strong> has been received. Your <strong>${plan}</strong> subscription is now active!</p>
        <div style="background: #f8fafc; border-left: 4px solid #16a34a; padding: 12px 16px; margin: 18px 0;">
          <p style="margin: 0 0 6px 0; font-size: 14px;"><strong>Your Premium Credentials:</strong></p>
          <p style="margin: 3px 0;"><strong>User ID:</strong> <span style="font-family: monospace; font-size: 15px; color: #2563eb;">${esc(userId)}</span></p>
          <p style="margin: 3px 0;"><strong>Password:</strong> <span style="font-family: monospace; font-size: 15px; color: #2563eb;">${esc(password)}</span></p>
          <p style="margin: 6px 0 0 0; font-size: 12px; color: #64748b;"><strong>Valid From:</strong> ${startStr} to <strong>${endStr}</strong></p>
        </div>
        <p>Open <strong>${app}</strong>, click "I have credentials", and enter the above details to sign in.</p>
        <p>Best regards,<br><strong>MetaPilot Team</strong></p>
      `,
    }),
  };
}

/**
 * Template for Trial Already Used (Sent on duplicate HWID attempt)
 */
export function getTrialAlreadyUsedTemplate({ fullName, appName, isGo }) {
  const name = esc(fullName || "Candidate");
  const app = esc(appName || "MetaPilot");

  return {
    subject: `${app} Free Trial Status & Upgrade Options`,
    htmlBody: buildPersonalHumanEmail({
      bodyContent: `
        <p>Hi ${name},</p>
        <p>We noticed that your machine has already utilized the 1-Day Free Trial for <strong>${app}</strong>.</p>
        <p>To continue using ${app} during your upcoming interviews, you can upgrade to any of our passes:</p>
        <p>👉 <a href="${WEBSITE_URL}" style="color: #2563eb; font-weight: bold; text-decoration: underline;">https://metapilot.in</a></p>
        <p>Apply promo code <strong>WELCOME25</strong> at checkout to get an instant 25% discount.</p>
        <p>Best regards,<br><strong>MetaPilot Team</strong></p>
      `,
    }),
  };
}

/**
 * Backward compatibility alias
 */
export function getProPendingTemplate(data) {
  return getPaymentLinkTemplate(data);
}
