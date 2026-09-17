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
    // TEMPLATE A: Real-Time Answer Assistance & Pressure Management
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
              <li><strong>Live Coding &amp; Problem Solving:</strong> Press Ctrl+Z to take a silent snapshot of any coding problem, SQL query, or error on screen for instant hints.</li>
              <li><strong>100% Invisible:</strong> Designed to remain completely undetectable during screen sharing on Google Meet, Zoom, and MS Teams.</li>
            </ul>
            <p style="margin-top: 14px; margin-bottom: 6px; color: #334155;">
              <strong>Career Guidance &amp; Mentor Support:</strong><br>
              If you are facing challenges like low interview call frequency, career gaps/transitions, domain switching, or interview prep confusion — our senior mentors also offer 1-on-1 personalized guidance (included exclusively for members on our Pro Plan).
            </p>
            <p>We offer a completely free <strong>1-day full access pass</strong> so you can test it on your laptop before any real interview:</p>
            <p style="margin: 16px 0;">
              👉 <a href="${WEBSITE_URL}" style="color: #2563eb; font-weight: bold; text-decoration: underline; font-size: 15px;">https://metapilot.in</a>
            </p>
            <p style="font-size: 13.5px; color: #475569; margin: 10px 0;">
              <em>(Note: If you decide to upgrade to any plan, you can use code <strong>welcome25</strong> for 25% off.)</em>
            </p>
            <p>If you'd like us to set up your free trial access directly, just <strong>reply "YES" to this email</strong> and we'll send your login details right away.</p>
            <p style="margin-top: 24px;">
              Best regards,<br>
              <strong>Team MetaPilot</strong><br>
              <span style="color: #64748b; font-size: 13px;">MetaPilot &bull; Pune</span><br>
              <a href="${WEBSITE_URL}" style="color: #2563eb; font-size: 13px;">metapilot.in</a>
            </p>
          `,
        }),
      };

    // -------------------------------------------------------------------------
    // TEMPLATE B: Technical Screening & Live Problem Solving
    // -------------------------------------------------------------------------
    case "B":
    case "E":
      return {
        subject: `Regarding your ${role} interview preparation, ${name}`,
        htmlBody: buildPersonalHumanEmail({
          bodyContent: `
            <p>Hi ${name},</p>
            <p>I noticed you are actively preparing for opportunities in the <strong>${role}</strong> domain.</p>
            <p>Technical screening rounds have become significantly more competitive this year, especially with tricky problem-solving rounds, unexpected scenario questions, and live coding exercises under strict time limits.</p>
            <p>To help ${role} professionals clear these rounds with confidence, we built <strong>MetaPilot</strong> — a silent desktop AI co-pilot that assists you in real time:</p>
            <ul style="padding-left: 18px; line-height: 1.75; color: #2d3748;">
              <li><strong>Instant Solution Hints:</strong> Silently capture coding questions, SQL queries, or technical errors on screen (Ctrl+Z) and get instant walkthroughs.</li>
              <li><strong>Spoken Answer Prompts:</strong> Generates crisp, structured technical points as the interviewer speaks so you answer fluently without hesitation.</li>
              <li><strong>Completely Screen-Safe:</strong> Runs privately on your desktop without showing up on Google Meet, Zoom, or Teams screen sharing.</li>
            </ul>
            <p style="margin-top: 14px; margin-bottom: 6px; color: #334155;">
              <strong>Career Guidance &amp; Mentor Support:</strong><br>
              Along with the co-pilot, if you are navigating challenges like low call frequency, career gaps, domain transitions, or interview prep confusion, our senior mentors offer 1-on-1 strategic guidance (available exclusively for members on our Pro Plan).
            </p>
            <p>You can test the <strong>1-day free trial</strong> directly on your computer before your next interview:</p>
            <p style="margin: 16px 0;">
              👉 <a href="${WEBSITE_URL}" style="color: #2563eb; font-weight: bold; text-decoration: underline; font-size: 15px;">https://metapilot.in</a>
            </p>
            <p style="font-size: 13.5px; color: #475569; margin: 10px 0;">
              <em>(Note: You can use coupon code <strong>welcome25</strong> for 25% off on our plans).</em>
            </p>
            <p>Do you have any interviews scheduled this week? If you'd like direct help setting up your access, feel free to reply directly to this email.</p>
            <p style="margin-top: 24px;">
              Best regards,<br>
              <strong>Team MetaPilot</strong><br>
              <span style="color: #64748b; font-size: 13px;">MetaPilot &bull; Pune</span><br>
              <a href="${WEBSITE_URL}" style="color: #2563eb; font-size: 13px;">metapilot.in</a>
            </p>
          `,
        }),
      };

    // -------------------------------------------------------------------------
    // TEMPLATE C: Technical Confidence & Answer Structuring
    // -------------------------------------------------------------------------
    case "C":
    case "F":
      return {
        subject: `Connecting regarding your ${role} interviews, ${name}`,
        htmlBody: buildPersonalHumanEmail({
          bodyContent: `
            <p>Hi ${name},</p>
            <p>Reaching out as I saw you are preparing for <strong>${role}</strong> roles.</p>
            <p>One of the biggest hurdles candidates face in technical interviews is structuring answers properly when put on the spot, even when they know the core concepts well.</p>
            <p>We designed <strong>MetaPilot</strong> as an invisible co-pilot to give you that edge — listening silently to the interviewer and displaying real-time structured talking points and code solutions directly on your screen:</p>
            <ul style="padding-left: 18px; line-height: 1.75; color: #2d3748;">
              <li><strong>Crisp Answer Cues:</strong> Get real-time technical bullet points so your explanations sound clear, confident, and senior-level.</li>
              <li><strong>Live Coding &amp; Syntax Support:</strong> Immediate hints and code explanations for live whiteboard or coding challenges.</li>
              <li><strong>100% Invisible:</strong> Undetectable during screen sharing on all major meeting platforms.</li>
            </ul>
            <p style="margin-top: 14px; margin-bottom: 6px; color: #334155;">
              <strong>Career Guidance &amp; Mentor Support:</strong><br>
              If you are experiencing low interview call frequency, career gaps/transitions, or confusion regarding interview preparation — our senior mentors provide personalized 1-on-1 guidance (included as an exclusive benefit for Pro Plan members).
            </p>
            <p>You can try out our <strong>1-day free trial</strong> to test it before any upcoming rounds:</p>
            <p style="margin: 16px 0;">
              👉 <a href="${WEBSITE_URL}" style="color: #2563eb; font-weight: bold; text-decoration: underline; font-size: 15px;">https://metapilot.in</a>
            </p>
            <p style="font-size: 13.5px; color: #475569; margin: 10px 0;">
              <em>(Note: You can apply code <strong>welcome25</strong> for 25% off if you decide to upgrade).</em>
            </p>
            <p>Or simply reply <strong>"FREE TRIAL"</strong> to this email and our team will get your test account ready for you.</p>
            <p style="margin-top: 24px;">
              Best regards,<br>
              <strong>Team MetaPilot</strong><br>
              <span style="color: #64748b; font-size: 13px;">MetaPilot &bull; Pune</span><br>
              <a href="${WEBSITE_URL}" style="color: #2563eb; font-size: 13px;">metapilot.in</a>
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
