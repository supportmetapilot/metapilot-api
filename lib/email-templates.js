/**
 * Email Templates for MetaPilot Marketing
 * Same A/B/C templates from GAS script, adapted for Brevo
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

const H = {
  ROCKET: "&#x1F680;",
  WAVE: "&#x1F44B;",
  BRIEFCASE: "&#x1F4BC;",
  SWEAT: "&#x1F613;",
  EXPLODING: "&#x1F92F;",
  SPEAKING: "&#x1F5E3;&#xFE0F;",
  LAPTOP: "&#x1F4BB;",
  ZAP: "&#x26A1;",
  MIC: "&#x1F3A4;",
  ROBOT: "&#x1F916;",
  BULB: "&#x1F4A1;",
  BRAIN: "&#x1F9E0;",
  FIRE: "&#x1F525;",
  EYES: "&#x1F440;",
  MUSCLE: "&#x1F4AA;",
  TROPHY: "&#x1F3C6;",
  SWORDS: "&#x2694;&#xFE0F;",
  GIFT: "&#x1F381;",
  GLOBE: "&#x1F310;",
  CAMERA: "&#x1F3A5;",
  PIN: "&#x1F4CC;",
  MAIL: "&#x1F4E9;",
  CARD: "&#x1F4B3;",
  MAILBOX: "&#x1F4EC;",
  TADA: "&#x1F389;",
  TARGET: "&#x1F3AF;",
  CHECK: "&#x2705;",
  SWEATSMILE: "&#x1F605;",
  CHAT: "&#x1F4AC;",
  NUM1: "1&#xFE0F;&#x20E3;",
  NUM2: "2&#xFE0F;&#x20E3;",
  NUM3: "3&#xFE0F;&#x20E3;",
  NUM4: "4&#xFE0F;&#x20E3;",
  NUM5: "5&#xFE0F;&#x20E3;",
  NUM6: "6&#xFE0F;&#x20E3;",
};

const WEBSITE_URL = "https://metapilot.in";
const YOUTUBE_URL = "https://www.youtube.com/@metapilotapps";
const DEMO_VIDEO_URL = "https://www.youtube.com/watch?v=jSiHe4qW31Q";
const INSTAGRAM_URL = "https://www.instagram.com/metapilot_go_pro";

const htmlOpen =
  '<html><head><meta charset="utf-8"></head><body>' +
  '<div style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.8; color: #222222;">';

const htmlClose =
  '<br><p style="font-size: 11px; color: #999999; border-top: 1px solid #eeeeee; padding-top: 12px; margin-top: 24px;">' +
  "You are receiving this email because you are actively exploring career opportunities. " +
  'If you wish to stop receiving these emails, please reply with "Unsubscribe" in the subject line or ' +
  `<a href="mailto:support@metapilot.in?subject=Unsubscribe" style="color: #999999;">click here to unsubscribe</a>.` +
  "</p></div></body></html>";

/**
 * Get email template by code (A, B, or C)
 * @param {string} templateCode - "A", "B", or "C"
 * @param {{ fullName: string, jobRole: string }} data - Lead data
 * @returns {{ subject: string, htmlBody: string }}
 */
export function getMailTemplate(templateCode, data) {
  const name = esc(data.fullName);
  const role = esc(data.jobRole);

  switch (templateCode) {
    case "A":
      return {
        subject: `🚀 Your Secret AI Weapon for High-Pressure Interviews`,
        htmlBody:
          htmlOpen +
          "<p>Hi " + name + " " + H.WAVE + "</p>" +
          "<p>I noticed that you are actively exploring opportunities in the <strong>" + role + "</strong> domain " + H.BRIEFCASE + "</p>" +
          "<p>Most candidates struggle in interviews not because they lack knowledge, but because of pressure " + H.SWEAT + ", unexpected questions " + H.EXPLODING + ", communication gaps " + H.SPEAKING + ", or difficult coding rounds " + H.LAPTOP + "</p>" +
          "<p>That's exactly why we built <strong>MetaPilot</strong> — your AI Interview Co-Pilot " + H.ROCKET + "</p>" +
          "<p><strong>" + H.ZAP + " MetaPilot Can:</strong></p>" +
          "<ul>" +
          "<li>" + H.MIC + " Listen to interviewer questions in real time</li>" +
          "<li>" + H.ROBOT + " Generate smart AI answers instantly</li>" +
          "<li>" + H.BULB + " Help with " + role + ", SQL, Python, Java, Testing, Data Engineering, HR rounds &amp; more</li>" +
          "<li>" + H.BRAIN + " Assist in coding + theoretical interview rounds</li>" +
          "</ul>" +
          "<p><strong>" + H.FIRE + " Invisible During Screen Sharing</strong><br>" +
          "MetaPilot works silently during live interview sessions without appearing in normal screen sharing applications " + H.EYES + "<br>" +
          "This helps candidates stay confident " + H.MUSCLE + " and perform smarter during high-pressure interviews " + H.ROCKET + "</p>" +
          "<p>" + H.TROPHY + " Many candidates from the <strong>" + role + "</strong> domain have already cracked their interviews using MetaPilot.</p>" +
          "<p>Now it's your turn to stay ahead of the competition " + H.SWORDS + " and keep speaking confidently during interviews — because each answer will always be right in front of you " + H.BULB + "</p>" +
          "<p><strong>" + H.GIFT + " 1-Day Free Trial Available</strong></p>" +
          '<p>' + H.GLOBE + ' <strong>Download &amp; Install MetaPilot:</strong><br><a href="' + WEBSITE_URL + '" style="color: #1a73e8;">' + WEBSITE_URL + "</a></p>" +
          '<p>' + H.CAMERA + ' <strong>Watch How MetaPilot Works:</strong><br><a href="' + YOUTUBE_URL + '" style="color: #1a73e8;">' + YOUTUBE_URL + "</a></p>" +
          '<p>' + H.FIRE + ' <strong>Must-Watch Demo Video:</strong><br><a href="' + DEMO_VIDEO_URL + '" style="color: #1a73e8;">' + DEMO_VIDEO_URL + "</a></p>" +
          '<p>' + H.GLOBE + ' <strong>Follow us on Instagram:</strong><br><a href="' + INSTAGRAM_URL + '" style="color: #1a73e8;">' + INSTAGRAM_URL + "</a></p>" +
          "<p><strong>" + H.PIN + " Steps to Start:</strong></p>" +
          "<ol>" +
          "<li>" + H.NUM1 + " Open the website " + H.GLOBE + "</li>" +
          "<li>" + H.NUM2 + " Choose MetaPilot Go or MetaPilot Pro " + H.ZAP + "</li>" +
          "<li>" + H.NUM3 + ' Click "Purchase Subscription" ' + H.CARD + "</li>" +
          "<li>" + H.NUM4 + " Enter your Name &amp; Email ID " + H.MAIL + "</li>" +
          "<li>" + H.NUM5 + ' Select "1-Day Free Trial" ' + H.GIFT + "</li>" +
          "<li>" + H.NUM6 + " Access will be sent directly to your email " + H.MAILBOX + "</li>" +
          "</ol>" +
          "<p><strong>" + H.TADA + " Use Coupon Code: WELCOME25</strong><br>Get Flat 25% OFF " + H.FIRE + "</p>" +
          "<br><p>Regards,<br><strong>MetaPilot Team " + H.ROCKET + "</strong><br>Your Interview Co-Pilot</p>" +
          htmlClose,
      };

    case "B":
      return {
        subject: `🚀 Ace High-Pressure Interviews Smarter with MetaPilot — Your Interview Co-Pilot`,
        htmlBody:
          htmlOpen +
          "<p>Hi " + name + " " + H.WAVE + "</p>" +
          "<p>I noticed that you are actively exploring opportunities in the <strong>" + role + "</strong> domain " + H.BRIEFCASE + "</p>" +
          "<p>Interviews today are becoming harder than ever " + H.SWEAT + "<br>" +
          "Even experienced candidates struggle because of pressure, tricky coding rounds, fast theoretical questions, or communication gaps.</p>" +
          "<p>That's why smart candidates are switching to <strong>MetaPilot</strong> " + H.ROCKET + "</p>" +
          "<p><strong>" + H.ZAP + " Your AI Interview Co-Pilot that helps you:</strong></p>" +
          "<ul>" +
          "<li>" + H.MIC + " Listen to interviewer questions in real time</li>" +
          "<li>" + H.ROBOT + " Generate smart AI-generated answers instantly</li>" +
          "<li>" + H.LAPTOP + " Handle coding + theoretical rounds smarter</li>" +
          "<li>" + H.BULB + " Get support for SQL, Python, Java, Testing, HR &amp; more</li>" +
          "</ul>" +
          "<p><strong>" + H.FIRE + " Designed for High-Pressure Interviews</strong><br>" +
          "MetaPilot stays invisible during normal screen sharing applications " + H.EYES + " and helps you keep the interview conversation flowing smoothly " + H.TARGET + "</p>" +
          "<p>" + H.TROPHY + " Many candidates in the <strong>" + role + "</strong> domain are already using MetaPilot to crack interviews smarter and faster.</p>" +
          "<p><strong>" + H.GIFT + " 1-Day Free Trial Available</strong></p>" +
          '<p>' + H.GLOBE + ' <strong>Download &amp; Install MetaPilot:</strong><br><a href="' + WEBSITE_URL + '" style="color: #1a73e8;">' + WEBSITE_URL + "</a></p>" +
          '<p>' + H.CAMERA + ' <strong>Demo &amp; Tutorials:</strong><br><a href="' + YOUTUBE_URL + '" style="color: #1a73e8;">' + YOUTUBE_URL + "</a></p>" +
          '<p>' + H.FIRE + ' <strong>Must-Watch Demo Video:</strong><br><a href="' + DEMO_VIDEO_URL + '" style="color: #1a73e8;">' + DEMO_VIDEO_URL + "</a></p>" +
          '<p>' + H.GLOBE + ' <strong>Follow us on Instagram:</strong><br><a href="' + INSTAGRAM_URL + '" style="color: #1a73e8;">' + INSTAGRAM_URL + "</a></p>" +
          "<p><strong>" + H.PIN + " Quick Start:</strong></p>" +
          "<ol>" +
          "<li>" + H.NUM1 + " Open Website</li>" +
          "<li>" + H.NUM2 + " Choose Go or Pro</li>" +
          "<li>" + H.NUM3 + " Click Purchase Subscription</li>" +
          "<li>" + H.NUM4 + " Select 1-Day Free Trial</li>" +
          "<li>" + H.NUM5 + " Access arrives directly on your email " + H.MAIL + "</li>" +
          "</ol>" +
          "<p><strong>" + H.TADA + " Use Coupon Code: WELCOME25</strong><br>Get Flat 25% OFF " + H.FIRE + "</p>" +
          "<br><p>Regards,<br><strong>MetaPilot Team " + H.ROCKET + "</strong><br>Your Interview Co-Pilot</p>" +
          htmlClose,
      };

    case "C":
      return {
        subject: `💡 MetaPilot — Your Secret AI Weapon for Cracking Interviews Smarter`,
        htmlBody:
          htmlOpen +
          "<p>Hi " + name + " " + H.WAVE + "</p>" +
          "<p>I noticed that you are actively exploring opportunities in the <strong>" + role + "</strong> domain " + H.BRIEFCASE + "</p>" +
          "<p>" + H.ROCKET + " Many candidates from the <strong>" + role + "</strong> domain have already cracked their interviews using MetaPilot.</p>" +
          "<p>MetaPilot is your silent AI Interview Co-Pilot that helps you:</p>" +
          "<ul>" +
          "<li>" + H.ZAP + " Answer faster during interviews</li>" +
          "<li>" + H.ZAP + " Handle coding + theoretical rounds smarter</li>" +
          "<li>" + H.ZAP + " Stay confident during pressure interviews</li>" +
          "<li>" + H.ZAP + " Keep speaking smoothly with real-time AI assistance</li>" +
          "</ul>" +
          "<p><strong>" + H.LAPTOP + " Supports:</strong><br>" + role + ", SQL, Python, Java, Testing, Data Engineering, HR rounds &amp; more.</p>" +
          "<p><strong>" + H.FIRE + " Best Part?</strong><br>" +
          "MetaPilot works silently during interviews and stays invisible during normal screen sharing applications " + H.EYES + "</p>" +
          "<p><strong>" + H.GIFT + " 1-Day Free Trial Available</strong></p>" +
          '<p>' + H.GLOBE + ' <strong>Download &amp; Install MetaPilot:</strong><br><a href="' + WEBSITE_URL + '" style="color: #1a73e8;">' + WEBSITE_URL + "</a></p>" +
          '<p>' + H.CAMERA + ' <strong>Watch Demo:</strong><br><a href="' + YOUTUBE_URL + '" style="color: #1a73e8;">' + YOUTUBE_URL + "</a></p>" +
          '<p>' + H.FIRE + ' <strong>Must-Watch Demo Video:</strong><br><a href="' + DEMO_VIDEO_URL + '" style="color: #1a73e8;">' + DEMO_VIDEO_URL + "</a></p>" +
          '<p>' + H.GLOBE + ' <strong>Follow us on Instagram:</strong><br><a href="' + INSTAGRAM_URL + '" style="color: #1a73e8;">' + INSTAGRAM_URL + "</a></p>" +
          "<p><strong>" + H.PIN + " Start in Minutes:</strong></p>" +
          "<ol>" +
          "<li>" + H.NUM1 + " Open website</li>" +
          "<li>" + H.NUM2 + " Choose MetaPilot Go or Pro</li>" +
          "<li>" + H.NUM3 + " Select 1-Day Free Trial</li>" +
          "<li>" + H.NUM4 + " Access arrives directly on your email " + H.MAIL + "</li>" +
          "</ol>" +
          "<p><strong>" + H.TADA + " Use Coupon Code: WELCOME25</strong><br>Get Flat 25% OFF " + H.FIRE + "</p>" +
          "<p>Try both editions and choose based on your interview toughness " + H.ROCKET + "</p>" +
          "<br><p>Regards,<br><strong>MetaPilot Team " + H.ROCKET + "</strong><br>Your Interview Co-Pilot</p>" +
          htmlClose,
      };

    default:
      throw new Error("Unknown template code: " + templateCode);
  }
}

/**
 * Template for 1-Day Free Trial Credentials
 */
export function getTrialCredentialsTemplate({ fullName, appName, userId, password, endDate }) {
  const name = esc(fullName);
  const app = esc(appName);
  const formattedEndDate = new Date(endDate).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  return {
    subject: `🎉 Your ${app} 1-Day Free Trial Access Details`,
    htmlBody:
      htmlOpen +
      `<p>Hi ${name} ${H.WAVE}</p>` +
      `<p>Welcome to <strong>${app}</strong>! Your 1-Day Free Trial has been successfully activated ${H.ROCKET}</p>` +
      `<div style="background: #f4f6fa; border-left: 4px solid #007aff; padding: 16px; margin: 20px 0; border-radius: 6px;">` +
      `<p style="margin: 0 0 8px 0; font-size: 15px;"><strong>${H.PIN} Your Login Credentials:</strong></p>` +
      `<p style="margin: 4px 0;"><strong>User ID:</strong> <span style="font-family: monospace; font-size: 16px; color: #007aff;">${esc(userId)}</span></p>` +
      `<p style="margin: 4px 0;"><strong>Password:</strong> <span style="font-family: monospace; font-size: 16px; color: #007aff;">${esc(password)}</span></p>` +
      `<p style="margin: 8px 0 0 0; font-size: 13px; color: #666;"><strong>Valid Until:</strong> ${formattedEndDate} (IST)</p>` +
      `</div>` +
      `<p><strong>${H.LAPTOP} How to Use:</strong></p>` +
      `<ol>` +
      `<li>Open the <strong>${app}</strong> desktop application.</li>` +
      `<li>Enter the User ID and Password given above.</li>` +
      `<li>Click <strong>Sign In</strong> to start your interview practice!</li>` +
      `</ol>` +
      `<p><strong>${H.TARGET} Important Note:</strong> Your login is locked to this machine for safety.</p>` +
      `<br><p>Best regards,<br><strong>MetaPilot Team ${H.ROCKET}</strong><br>Your AI Interview Co-Pilot</p>` +
      htmlClose,
  };
}

/**
 * Template for Paid Subscription Payment Link (B1 Flow)
 */
export function getPaymentLinkTemplate({ fullName, appName, planType, actualPrice, finalPrice, coupon, paymentLink }) {
  const name = esc(fullName);
  const app = esc(appName);
  const plan = esc(planType);
  const price = esc(finalPrice);
  const actual = esc(actualPrice);
  const link = paymentLink || "#";

  return {
    subject: `${app}: Complete Your Registration 🚀`,
    htmlBody: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #007BFF; padding: 22px; text-align: center; color: white;">
          <h2 style="margin: 0; font-size: 24px;">${app}</h2>
        </div>
        <div style="padding: 24px;">
          <p style="font-size: 16px;">Hi <b>${name}</b>,</p>
          <p>Thank you for choosing <b>${app}</b>! We're excited to have you on board.</p>
          <p>Here are your order details:</p>
          <table border="1" cellpadding="8" cellspacing="0" style="width: 100%; border-collapse: collapse; border: 1px solid #ddd; margin: 15px 0;">
            <tr style="background-color: #f9f9f9;"><td><b>Plan</b></td><td><b>${plan}</b></td></tr>
            <tr><td><b>Amount</b></td><td>${actual && actual !== price ? `<del>₹${actual}</del> &rarr; ` : ""}<b>₹${price}</b></td></tr>
            ${coupon ? `<tr style="background-color: #f9f9f9;"><td><b>Coupon Applied</b></td><td style="color: #28a745; font-weight: bold;">${esc(coupon)}</td></tr>` : ""}
          </table>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${link}" style="background-color: #007BFF; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 10px rgba(0,123,255,0.3);">👉 Pay ₹${price} Now</a>
          </div>

          <p style="font-size: 13px; color: #666; text-align: center;"><i>⏳ This secure Razorpay link is valid for 24 hours.</i></p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">

          <h4 style="margin: 0 0 10px 0; color: #222;">⚡ What happens after payment?</h4>
          <ul style="padding-left: 20px; line-height: 1.8;">
            <li>✅ <b>Instant Access:</b> Your login credentials (User ID &amp; Password) will be emailed to you immediately upon successful payment.</li>
            <li>✅ No manual verification needed — everything is 100% automated.</li>
            <li>✅ Unlimited access to AI Interview Co-Pilot + Real-time assistance for your domain.</li>
          </ul>

          <p style="margin-top: 20px; font-size: 13px; color: #555;">Need help? Reply to this email or reach us at <b>support@metapilot.in</b></p>
          <p style="margin: 0; font-weight: bold;">— Team MetaPilot 🎯</p>
        </div>
        <div style="background-color: #f7f7f7; padding: 15px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #eaeaea;">
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} MetaPilot. All rights reserved.</p>
        </div>
      </div>
    `,
  };
}

/**
 * Template for Paid Subscription Credentials After Successful Payment (B2 Flow)
 */
export function getPaidCredentialsTemplate({ fullName, appName, planType, amountPaid, userId, password, startDate, endDate }) {
  const name = esc(fullName);
  const app = esc(appName);
  const plan = esc(planType);
  const startStr = startDate ? new Date(startDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
  const endStr = endDate ? new Date(endDate).toISOString().split("T")[0] : "";

  return {
    subject: `${app}: Your Premium Credentials 🔐`,
    htmlBody: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #28a745; padding: 22px; text-align: center; color: white;">
          <h2 style="margin: 0; font-size: 24px;">Payment Confirmed! 🎉</h2>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Welcome to ${app} Premium</p>
        </div>
        <div style="padding: 24px;">
          <p style="font-size: 16px;">Hi <b>${name}</b>,</p>
          <p>Your payment of <b>₹${esc(amountPaid || "")}</b> has been received. Your <b>${plan}</b> subscription is now <b>fully active</b>!</p>

          <h3 style="border-bottom: 2px solid #28a745; padding-bottom: 6px; margin-top: 25px;">🔑 Your Login Credentials</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 12px; border: 1px solid #ddd;">
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9; width: 35%;"><b>User ID</b></td>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; font-family: monospace; font-size: 16px; color: #007aff;">${esc(userId)}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9;"><b>Password</b></td>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; font-family: monospace; font-size: 16px; color: #007aff;">${esc(password)}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9;"><b>Valid From</b></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${startStr}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9;"><b>Valid Till</b></td>
              <td style="padding: 10px; border: 1px solid #ddd; color: #d9534f; font-weight: bold;">${endStr}</td>
            </tr>
          </table>

          <p style="margin-top: 22px; font-size: 15px;">👉 Open <b>${app}</b>, click <b>"I have credentials"</b> and enter the above details to log in.</p>
          
          <div style="background-color: #fff3cd; border-left: 4px solid #ffeeba; padding: 12px; margin: 20px 0; border-radius: 4px; color: #856404; font-size: 13px;">
            ⚠️ <b>Important:</b> Your account will lock to the first device you log into. Ensure you log in from your primary interview machine.
          </div>

          <h3 style="border-bottom: 2px solid #007BFF; padding-bottom: 6px; margin-top: 25px;">💡 Pro Tips &amp; Instructions</h3>
          <ul style="padding-left: 20px; line-height: 1.8; font-size: 14px;">
            <li>Read all <b>Pro Tips</b> from the main page once you open the application.</li>
            <li>In the <b>Settings</b> tab (upper right corner), review all keyboard shortcuts and customize them for your comfort.</li>
            <li>For MetaPilot Pro, open the <b>User Manual</b> in Settings to learn optimal prompt phrasing.</li>
          </ul>

          <p style="margin-top: 25px; font-size: 14px;">Ace your interviews! 💪<br><b>— Team MetaPilot 🎯</b></p>
        </div>
        <div style="background-color: #f7f7f7; padding: 15px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #eaeaea;">
          <p style="margin: 0;">Need assistance? Reply directly to this email or contact support@metapilot.in</p>
        </div>
      </div>
    `,
  };
}

/**
 * Template for Trial Already Used (Sent on duplicate HWID attempt)
 */
export function getTrialAlreadyUsedTemplate({ fullName, appName, isGo }) {
  const name = esc(fullName);
  const app = esc(appName);

  const plansHtml = isGo
    ? `
      <ul>
        <li><b>1 Day – Blitz Pass</b> – ₹199</li>
        <li><b>1 Week – Prep Week</b> – ₹399</li>
        <li><b>1 Month – Mastery Pack</b> – ₹665</li>
      </ul>
    `
    : `
      <ul>
        <li><b>1 Day – Interview Day Pass</b> – ₹249</li>
        <li><b>2 Days – Interview Sprint Pack</b> – ₹449</li>
        <li><b>1 Week – Power Prep Pack</b> – ₹1299</li>
        <li><b>1 Month – Job Switch Pack</b> – ₹4999</li>
      </ul>
    `;

  return {
    subject: `${app} Free Trial Status 💎`,
    htmlBody: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #1a73e8; padding: 20px; text-align: center; color: white;">
          <h2 style="margin: 0; font-size: 22px;">${app} Free Trial Status</h2>
        </div>
        <div style="padding: 24px; line-height: 1.6;">
          <p>Hi <b>${name}</b>,</p>
          <p>We hope you found the <b>${app} Free Trial</b> helpful!</p>
          <p>It looks like this device has already utilized the <b>1-Day Free Trial</b> access. To continue using ${app} during your interview preparation, you can upgrade to a suitable plan for uninterrupted access.</p>
          
          <p>💡 <i>Many candidates prefer upgrading just before important interviews to stay confident and structured while answering questions.</i></p>
          
          <h3 style="color: #1a73e8; margin-top: 20px;">🎯 Available Plans</h3>
          ${plansHtml}
          
          <div style="background-color: #e8f0fe; border-left: 4px solid #1a73e8; padding: 12px; margin: 20px 0; border-radius: 4px;">
            🎁 Use promocode <b>WELCOME25</b> during purchase to get an extra <b>25% OFF</b>!
          </div>

          <p>If you have any questions or need custom arrangements, reply directly to this email.</p>
          
          <p style="margin-top: 25px;">Best regards,<br><b>Team MetaPilot</b> 🎯</p>
        </div>
        <div style="background-color: #f7f7f7; padding: 15px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #eaeaea;">
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} MetaPilot. All rights reserved.</p>
        </div>
      </div>
    `,
  };
}

/**
 * Backward compatibility alias
 */
export function getProPendingTemplate(data) {
  return getPaymentLinkTemplate(data);
}
