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
 * Template for Paid Subscription Received (Pending Verification)
 */
export function getProPendingTemplate({ fullName, appName, planType, finalPrice }) {
  const name = esc(fullName);
  const app = esc(appName);
  const plan = esc(planType);

  return {
    subject: `📋 ${app} Subscription Received - ${plan}`,
    htmlBody:
      htmlOpen +
      `<p>Hi ${name} ${H.WAVE}</p>` +
      `<p>Thank you for subscribing to <strong>${app}</strong> (${plan}) ${H.ROCKET}</p>` +
      `<p>We have received your subscription request. Our team will verify and activate your full access within <strong>2 to 4 hours</strong>.</p>` +
      `<div style="background: #f4f6fa; border-left: 4px solid #37d67a; padding: 16px; margin: 20px 0; border-radius: 6px;">` +
      `<p style="margin: 0 0 8px 0;"><strong>Plan:</strong> ${plan}</p>` +
      (finalPrice ? `<p style="margin: 4px 0;"><strong>Amount:</strong> ₹${esc(finalPrice)}</p>` : "") +
      `<p style="margin: 4px 0;"><strong>Status:</strong> Activation in Progress</p>` +
      `</div>` +
      `<p>Once activated, you can login directly using your registered User ID and Password.</p>` +
      `<p>For instant support or queries, drop an email to <a href="mailto:support@metapilot.in">support@metapilot.in</a>.</p>` +
      `<br><p>Best regards,<br><strong>MetaPilot Team ${H.ROCKET}</strong><br>Your AI Interview Co-Pilot</p>` +
      htmlClose,
  };
}
