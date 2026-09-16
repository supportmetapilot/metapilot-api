/**
 * Email Templates for MetaPilot Marketing & System Notifications
 * Professional, high-deliverability card design inspired by Smart PLM Academy
 * Zero emoji spam to ensure 100% Primary Inbox placement (no spam folder)
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
const YOUTUBE_URL = "https://www.youtube.com/@metapilotapps";
const DEMO_VIDEO_URL = "https://www.youtube.com/watch?v=jSiHe4qW31Q";
const INSTAGRAM_URL = "https://www.instagram.com/metapilot_go_pro";

/**
 * Builds the complete Smart PLM Academy style email HTML
 */
function buildSmartCardEmail({
  title = "MetaPilot",
  subtitle = "AI Interview Co-Pilot &bull; Real-Time Voice &amp; Coding Assistance",
  advisoryTitle,
  advisoryText,
  heroHeading,
  heroDescription,
  heroBullets = [],
  ctaText = "Start Your 1-Day Free Trial &rarr;",
  ctaUrl = WEBSITE_URL,
  specs = [],
  capabilities = [],
  steps = [],
  promoNote = "Use coupon code WELCOME25 for Flat 25% OFF on all plans.",
}) {
  const specsRowsHtml = specs
    .map(
      (s, idx) => `
    <tr style="${idx % 2 === 0 ? "background: #f8fafc;" : "background: #ffffff;"} border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 10px 14px; color: #64748b; width: 38%; font-weight: 600; font-size: 13px;">${s.label}:</td>
      <td style="padding: 10px 14px; color: ${s.color || "#1e293b"}; font-weight: 600; font-size: 13px;">${s.value}</td>
    </tr>`
    )
    .join("");

  const bulletsHtml = heroBullets
    .map(
      (b) => `
    <li style="margin-bottom: 6px;">${b}</li>`
    )
    .join("");

  const capabilitiesHtml = capabilities
    .map(
      (c) => `
    <div style="margin-bottom: 7px;">
      <strong style="color: #1e293b;">&#10004; ${c.title}:</strong> <span style="color: #475569;">${c.desc}</span>
    </div>`
    )
    .join("");

  const stepsHtml = steps
    .map(
      (step) => `
    <li style="margin-bottom: 4px;">${step}</li>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <!-- Main Card Container (Max 600px, matches Smart PLM layout) -->
        <div style="max-width: 600px; width: 100%; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; text-align: left; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);">
          
          <!-- Header Banner -->
          <div style="padding: 26px 24px 18px 24px; text-align: center; border-bottom: 1px solid #f1f5f9;">
            <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; color: #0f172a;">${title}</h1>
            <p style="margin: 6px 0 0 0; font-size: 13px; font-weight: 600; color: #64748b; letter-spacing: 0.2px;">${subtitle}</p>
          </div>

          <!-- Green Advisory Box -->
          <div style="margin: 20px 24px 0 24px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 14px 18px;">
            <div style="font-size: 14px; font-weight: 700; color: #065f46;">
              &#10004; ${advisoryTitle}
            </div>
            <div style="font-size: 13px; color: #047857; margin-top: 5px; line-height: 1.5;">
              ${advisoryText}
            </div>
          </div>

          <!-- Purple Action Box (Mandatory AI Assessment style) -->
          <div style="margin: 18px 24px 0 24px; background: #faf5ff; border: 1.5px solid #8b5cf6; border-radius: 10px; padding: 22px 20px;">
            <div style="font-size: 14px; font-weight: 800; color: #6d28d9; letter-spacing: 0.5px; text-transform: uppercase;">
              ${heroHeading}
            </div>
            <div style="font-size: 13px; color: #4b5563; margin-top: 6px; line-height: 1.6;">
              ${heroDescription}
            </div>
            
            <div style="margin-top: 14px; padding-top: 14px; border-top: 1px dashed #d8b4fe;">
              <div style="font-size: 13px; font-weight: 700; color: #581c87; margin-bottom: 8px;">
                Key Co-Pilot Capabilities:
              </div>
              <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #374151; line-height: 1.65;">
                ${bulletsHtml}
              </ul>
            </div>

            <div style="text-align: center; margin-top: 20px;">
              <a href="${ctaUrl}" style="background: #7c3aed; color: #ffffff; padding: 13px 28px; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 6px; display: inline-block; box-shadow: 0 4px 10px rgba(124, 58, 237, 0.25);">${ctaText}</a>
              <div style="font-size: 11px; color: #7c3aed; margin-top: 9px;">
                Or copy link: <a href="${ctaUrl}" style="color: #6d28d9; text-decoration: underline;">${ctaUrl}</a>
              </div>
            </div>
          </div>

          <!-- Specifications Table -->
          <div style="margin: 20px 24px 0 24px;">
            <div style="font-size: 13px; font-weight: 800; color: #334155; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 9px;">
              YOUR CANDIDATE SPECIFICATIONS:
            </div>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; font-size: 13px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
              ${specsRowsHtml}
            </table>
          </div>

          <!-- System Capabilities & Policies Box (Checkmarks) -->
          <div style="margin: 20px 24px 0 24px;">
            <div style="font-size: 13px; font-weight: 800; color: #334155; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 9px;">
              VERIFIED SYSTEM CAPABILITIES:
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; font-size: 12.5px; line-height: 1.7; color: #334155;">
              ${capabilitiesHtml}
            </div>
          </div>

          <!-- Promo Banner -->
          ${
            promoNote
              ? `<div style="margin: 18px 24px 0 24px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px 16px; font-size: 13px; color: #92400e;">
                  <strong style="color: #b45309;">Special Offer:</strong> ${promoNote}
                </div>`
              : ""
          }

          <!-- Quick Steps Box -->
          <div style="margin: 18px 24px 0 24px; padding: 14px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 12.5px; color: #475569; line-height: 1.6;">
            <strong style="color: #1e293b;">How to start your free trial in 2 minutes:</strong>
            <ol style="margin: 6px 0 0 0; padding-left: 18px;">
              ${stepsHtml}
            </ol>
          </div>

          <!-- Footer -->
          <div style="margin-top: 24px; padding: 20px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8; line-height: 1.6;">
            <p style="margin: 0; color: #64748b; font-weight: 600;">MetaPilot Team &bull; Your AI Interview Co-Pilot</p>
            <p style="margin: 4px 0 0 0;">
              Official Support: <a href="mailto:support@metapilot.in" style="color: #64748b; text-decoration: underline;">support@metapilot.in</a> &bull;
              Website: <a href="${WEBSITE_URL}" style="color: #64748b; text-decoration: underline;">metapilot.in</a> &bull;
              <a href="${DEMO_VIDEO_URL}" style="color: #2563eb; text-decoration: underline;">Watch Demo Video</a>
            </p>
            <p style="margin: 12px 0 0 0; font-size: 11px; color: #94a3b8;">
              You are receiving this advisory as an active job seeker. If you wish to stop receiving updates,
              <a href="mailto:support@metapilot.in?subject=Unsubscribe" style="color: #94a3b8; text-decoration: underline;">click here to unsubscribe</a>.
            </p>
          </div>

        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Get email template by code (A, B, or C)
 * @param {string} templateCode - "A", "B", or "C"
 * @param {{ fullName: string, jobRole: string }} data - Lead data
 * @returns {{ subject: string, htmlBody: string }}
 */
export function getMailTemplate(templateCode, data) {
  const name = esc(data.fullName || "Candidate");
  const role = esc(data.jobRole || "Technical");

  switch (templateCode) {
    case "A":
      return {
        subject: `Interview Advisory: Your AI Co-Pilot for ${role} Interviews`,
        htmlBody: buildSmartCardEmail({
          title: "MetaPilot",
          subtitle: "Candidate Career Advisory &bull; AI Interview Screening",
          advisoryTitle: `Application Advisory Recorded, ${name}!`,
          advisoryText: `We noticed that you are actively exploring opportunities in the <strong>${role}</strong> domain. This official briefing outlines how candidates are clearing high-pressure interview rounds with real-time AI assistance.`,
          heroHeading: "NEXT STEP: UNLOCK YOUR AI INTERVIEW CO-PILOT",
          heroDescription: `Most candidates struggle in interviews not from lack of knowledge, but unexpected pressure, difficult live coding rounds, or communication gaps. MetaPilot assists you silently in real time.`,
          heroBullets: [
            `<strong>100% Invisible on Screen Sharing:</strong> Works discreetly during Google Meet, Zoom, MS Teams, and browser screen sharing without being detected.`,
            `<strong>Real-Time Voice Assistant:</strong> Listens to interviewer questions and generates structured technical answers in 2 seconds.`,
            `<strong>Instant Live Coding OCR:</strong> Press Ctrl+Z to instantly analyze coding questions, SQL queries, and algorithm problems on your screen.`,
            `<strong>Specialized for ${role}:</strong> Pre-loaded with deep knowledge in ${role}, DSA, SQL, System Architecture, and HR rounds.`,
          ],
          ctaText: "Start Your 1-Day Free Trial &rarr;",
          ctaUrl: WEBSITE_URL,
          specs: [
            { label: "Registered Candidate", value: name },
            { label: "Target Domain", value: role, color: "#2563eb" },
            { label: "Co-Pilot Capability", value: "Live Coding OCR + Real-Time Voice" },
            { label: "Screen Visibility", value: "100% Undetectable (Invisible Mode)", color: "#059669" },
            { label: "Free Trial Pass", value: "1-Day Full Access Available", color: "#7c3aed" },
          ],
          capabilities: [
            {
              title: "Undetectable Display",
              desc: "Engineered specifically to remain invisible on meeting screenshares and video recordings.",
            },
            {
              title: "Ultra-Fast Response",
              desc: "Speech-to-text and AI reasoning deliver crisp, structured bullet answers within 2-3 seconds.",
            },
            {
              title: "Proven Results",
              desc: `Hundreds of candidates in ${role} and IT roles have already cleared rounds using MetaPilot.`,
            },
            {
              title: "Demo Video Available",
              desc: `Watch the full live working demonstration on <a href="${DEMO_VIDEO_URL}" style="color: #2563eb; text-decoration: underline;">YouTube</a>.`,
            },
          ],
          promoNote: "Apply coupon code <strong>WELCOME25</strong> during subscription purchase for Flat 25% OFF.",
          steps: [
            `Visit <a href="${WEBSITE_URL}" style="color: #2563eb; font-weight: 600;">metapilot.in</a> &amp; choose MetaPilot Go or Pro.`,
            `Click "Purchase Subscription" and select "1-Day Free Trial".`,
            `Your unique login credentials are generated and emailed to you immediately.`,
          ],
        }),
      };

    case "B":
      return {
        subject: `Career Briefing: Ace High-Pressure ${role} Interviews with MetaPilot`,
        htmlBody: buildSmartCardEmail({
          title: "MetaPilot",
          subtitle: "Candidate Career Briefing &bull; Real-Time Interview Assistance",
          advisoryTitle: `Career Preparation Advisory for ${name}`,
          advisoryText: `Interviews in 2026 are becoming harder and more competitive. This briefing is provided for candidates preparing for upcoming <strong>${role}</strong> evaluation rounds.`,
          heroHeading: "NEXT STEP: EQUIP YOURSELF WITH REAL-TIME AI",
          heroDescription: `Smart candidates don't rely on memory alone under high stress. MetaPilot serves as your silent personal co-pilot, keeping the conversation flowing smoothly.`,
          heroBullets: [
            `<strong>Live Voice Transcription:</strong> Instantly captures fast-spoken interview questions and formulates concise answers.`,
            `<strong>Live Coding &amp; Screen Capture:</strong> Instant solution hints for DSA problems, SQL queries, and complex debugging tasks.`,
            `<strong>Completely Invisible Overlay:</strong> Built-in privacy architecture ensures zero visibility to interviewers on screen shares.`,
            `<strong>Domain Coverage:</strong> Ready out-of-the-box for ${role}, Full Stack, Python, Java, Testing, and behavioral HR rounds.`,
          ],
          ctaText: "Claim Your Free 1-Day Trial &rarr;",
          ctaUrl: WEBSITE_URL,
          specs: [
            { label: "Candidate Name", value: name },
            { label: "Target Domain", value: role, color: "#2563eb" },
            { label: "Interview Engine", value: "Voice + Screen OCR + Coding Assistant" },
            { label: "Privacy Status", value: "Undetectable on Screen Share", color: "#059669" },
            { label: "Trial Status", value: "Activated for Instant Onboarding", color: "#7c3aed" },
          ],
          capabilities: [
            {
              title: "Screen Share Safety",
              desc: "Proprietary window capture exclusion keeps MetaPilot 100% hidden during interview screenshares.",
            },
            {
              title: "Low Latency Audio",
              desc: "Instant real-time speech processing so you can respond naturally without awkward pauses.",
            },
            {
              title: "Exclusive Launch Code",
              desc: "Use coupon <strong>WELCOME25</strong> to get an instant 25% discount on any subscription.",
            },
            {
              title: "Full Video Walkthrough",
              desc: `Watch how MetaPilot assists during live rounds on <a href="${DEMO_VIDEO_URL}" style="color: #2563eb; text-decoration: underline;">YouTube</a>.`,
            },
          ],
          promoNote: "Use promo code <strong>WELCOME25</strong> to unlock Flat 25% OFF on all subscription plans.",
          steps: [
            `Go to <a href="${WEBSITE_URL}" style="color: #2563eb; font-weight: 600;">metapilot.in</a> and download MetaPilot.`,
            `Select your plan or activate the "1-Day Free Trial" with no upfront fee.`,
            `Sign in with your email credentials and start practicing right away.`,
          ],
        }),
      };

    case "C":
      return {
        subject: `Preparation Alert: Real-Time AI Assistance for ${role} Interviews`,
        htmlBody: buildSmartCardEmail({
          title: "MetaPilot",
          subtitle: "Candidate Interview Screening &bull; Technical Assistance Advisory",
          advisoryTitle: `Final Preparation Briefing: ${name}!`,
          advisoryText: `Your upcoming interviews in <strong>${role}</strong> will decide your next career leap. Make sure you don't face unexpected or tricky questions unprepared.`,
          heroHeading: "NEXT STEP: ACTIVATE YOUR SILENT INTERVIEW CO-PILOT",
          heroDescription: `MetaPilot is an invisible AI desktop co-pilot designed to give you an unfair advantage in live technical and coding interviews.`,
          heroBullets: [
            `<strong>Instant Technical Answers:</strong> Speak confidently with real-time answers right in front of your eyes.`,
            `<strong>Coding &amp; Algorithm Analysis:</strong> Take a silent snapshot (Ctrl+Z) of any coding challenge and get clean, explained code.`,
            `<strong>Zero Screen Trace:</strong> Stays completely undetectable across Google Meet, Zoom, Teams, and Webex.`,
            `<strong>Domain Specialized:</strong> Comprehensive coverage for ${role}, System Design, SQL, and Scenario-based rounds.`,
          ],
          ctaText: "Start Free 1-Day Trial Now &rarr;",
          ctaUrl: WEBSITE_URL,
          specs: [
            { label: "Registered Candidate", value: name },
            { label: "Target Domain", value: role, color: "#2563eb" },
            { label: "Assistance Mode", value: "Voice Q&A + Live Coding Solver" },
            { label: "Screen Privacy", value: "100% Undetectable", color: "#059669" },
            { label: "Onboarding Offer", value: "1-Day Free Trial Available", color: "#7c3aed" },
          ],
          capabilities: [
            {
              title: "Invisible Overlay",
              desc: "Undetectable on meeting screen shares and recordings for total peace of mind.",
            },
            {
              title: "Rapid Synthesis",
              desc: "Extracts key technical facts and bullet points within 2 seconds of the question.",
            },
            {
              title: "Launch Discount",
              desc: "Get Flat 25% OFF on all plans using promotional coupon <strong>WELCOME25</strong>.",
            },
            {
              title: "Live Product Tour",
              desc: `See the live app in action on <a href="${DEMO_VIDEO_URL}" style="color: #2563eb; text-decoration: underline;">YouTube</a>.`,
            },
          ],
          promoNote: "Apply discount code <strong>WELCOME25</strong> for Flat 25% OFF on Go and Pro plans.",
          steps: [
            `Open <a href="${WEBSITE_URL}" style="color: #2563eb; font-weight: 600;">metapilot.in</a> on your computer.`,
            `Choose MetaPilot Go or Pro and select 1-Day Free Trial.`,
            `Your credentials arrive instantly in your inbox to begin immediately.`,
          ],
        }),
      };

    // =========================================================================
    // TEMPLATES D, E, F: Human 1-on-1 Personal Outreach (Direct to Primary Inbox)
    // =========================================================================
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
              <li><strong>Real-Time Voice Assistant:</strong> Listens to the interviewer's voice and provides structured technical answers in 2 seconds.</li>
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

    case "E":
      return {
        subject: `Follow-up: Ace your upcoming ${role} rounds with MetaPilot`,
        htmlBody: buildPersonalHumanEmail({
          bodyContent: `
            <p>Hi ${name},</p>
            <p>Following up on my previous note. With technical interviews getting harder and more competitive this year, many ${role} professionals find it challenging to handle rapid theoretical questions or tricky DSA/architecture rounds.</p>
            <p>A lot of candidates from ${role} backgrounds are now using MetaPilot during their preparation to maintain confidence and structure their answers seamlessly.</p>
            <p>You can test the 1-day free trial on your computer here:<br>
            👉 <a href="${WEBSITE_URL}" style="color: #2563eb; font-weight: bold; text-decoration: underline; font-size: 15px;">https://metapilot.in</a></p>
            <p>We also have a quick 2-minute video showing exactly how it assists live during an interview:<br>
            🎥 <a href="${DEMO_VIDEO_URL}" style="color: #2563eb; text-decoration: underline;">Watch MetaPilot Live Demo Video</a></p>
            <p>Do you have any interviews scheduled this week? If you run into any questions or need help setting it up, feel free to reply directly to this email.</p>
            <p style="margin-top: 24px;">
              Warm regards,<br>
              <strong>Hrushikesh More</strong><br>
              <span style="color: #64748b; font-size: 13px;">MetaPilot Team &bull; Pune</span>
            </p>
          `,
        }),
      };

    case "F":
      return {
        subject: `Final note on your ${role} interview preparation`,
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
 * Builds the 1-on-1 human personal email HTML (Clean, simple, high Primary Inbox deliverability)
 */
function buildPersonalHumanEmail({ bodyContent }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 18px 12px; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14.5px; line-height: 1.65; color: #1a1a1a;">
  <div style="max-width: 580px; margin: 0 auto; text-align: left;">
    ${bodyContent}
    <div style="margin-top: 32px; padding-top: 14px; border-top: 1px solid #eeeeee; font-size: 11px; color: #888888;">
      You received this note regarding your career search. If you wish to stop receiving notes, <a href="mailto:support@metapilot.in?subject=Unsubscribe" style="color: #888888; text-decoration: underline;">click here to unsubscribe</a>.
    </div>
  </div>
</body>
</html>`;
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
    htmlBody: buildSmartCardEmail({
      title: app,
      subtitle: "Official Free Trial Credentials &bull; Device Activation",
      advisoryTitle: `Free Trial Activated for ${name}!`,
      advisoryText: `Your 1-Day Free Trial for <strong>${app}</strong> has been successfully configured and activated on your account.`,
      heroHeading: "YOUR LOGIN CREDENTIALS",
      heroDescription: `Use the secure credentials below to sign in to the desktop application:`,
      heroBullets: [
        `<strong>User ID:</strong> <span style="font-family: monospace; font-size: 15px; color: #7c3aed;">${esc(userId)}</span>`,
        `<strong>Password:</strong> <span style="font-family: monospace; font-size: 15px; color: #7c3aed;">${esc(password)}</span>`,
        `<strong>Valid Until:</strong> ${formattedEndDate} (IST)`,
      ],
      ctaText: "Download & Open App &rarr;",
      ctaUrl: WEBSITE_URL,
      specs: [
        { label: "Candidate Name", value: name },
        { label: "Edition", value: app, color: "#2563eb" },
        { label: "Access Level", value: "Full 1-Day Trial", color: "#059669" },
        { label: "Device Binding", value: "Locked to First Sign-in Machine" },
      ],
      capabilities: [
        {
          title: "Device Security",
          desc: "Your credentials will automatically bind to the first PC you log in from.",
        },
        {
          title: "Keyboard Shortcuts",
          desc: "Check Settings inside the app to customize hotkeys (Ctrl+Z / Ctrl+Shift+D).",
        },
        {
          title: "Upgrade Any Time",
          desc: "Use code <strong>WELCOME25</strong> for 25% OFF if you decide to upgrade to a weekly or monthly pass.",
        },
      ],
      promoNote: "Upgrade anytime using coupon code <strong>WELCOME25</strong> for Flat 25% OFF.",
      steps: [
        `Open the <strong>${app}</strong> desktop application.`,
        `Enter the User ID and Password provided above.`,
        `Click "Sign In" and begin your interview preparation session.`,
      ],
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
    htmlBody: buildSmartCardEmail({
      title: app,
      subtitle: "Order Confirmation &bull; Secure Checkout",
      advisoryTitle: `Order Generated for ${name}!`,
      advisoryText: `Thank you for choosing <strong>${app}</strong>. Your subscription order for the <strong>${plan}</strong> plan is ready.`,
      heroHeading: "COMPLETE YOUR SUBSCRIPTION PAYMENT",
      heroDescription: `Click the button below to complete your payment securely via Razorpay:`,
      heroBullets: [
        `<strong>Selected Plan:</strong> ${plan}`,
        `<strong>Total Payable:</strong> ${actual && actual !== price ? `<del style="color: #94a3b8;">₹${actual}</del> ` : ""}<strong>₹${price}</strong>`,
        coupon ? `<strong>Coupon Applied:</strong> <span style="color: #059669;">${esc(coupon)}</span>` : `<strong>Promo Code:</strong> WELCOME25 (Applied)`,
        `<strong>Payment Security:</strong> 256-bit Encrypted Razorpay Gateway`,
      ],
      ctaText: `Pay ₹${price} Now &rarr;`,
      ctaUrl: link,
      specs: [
        { label: "Candidate Name", value: name },
        { label: "Selected Edition", value: app, color: "#2563eb" },
        { label: "Plan Tier", value: plan },
        { label: "Final Amount", value: `₹${price}`, color: "#059669" },
      ],
      capabilities: [
        {
          title: "Instant Automated Delivery",
          desc: "Your User ID & Password will be emailed to you immediately upon payment completion.",
        },
        {
          title: "Zero Manual Waiting",
          desc: "The system is 100% automated — credentials arrive in less than 30 seconds.",
        },
        {
          title: "Link Validity",
          desc: "This secure Razorpay checkout link is valid for 24 hours.",
        },
      ],
      promoNote: "Need assistance? Reply directly to this email or reach us at support@metapilot.in.",
      steps: [
        `Click the "Pay ₹${price} Now" button above.`,
        `Complete checkout with UPI, Card, or Net Banking.`,
        `Your login credentials will arrive in your email instantly.`,
      ],
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
    htmlBody: buildSmartCardEmail({
      title: app,
      subtitle: "Payment Confirmed &bull; Premium Account Active",
      advisoryTitle: `Payment Received, ${name}!`,
      advisoryText: `Your payment of <strong>₹${esc(amountPaid || "")}</strong> has been received. Your <strong>${plan}</strong> subscription is now fully active!`,
      heroHeading: "YOUR LOGIN CREDENTIALS",
      heroDescription: `Sign in to ${app} using the following credentials:`,
      heroBullets: [
        `<strong>User ID:</strong> <span style="font-family: monospace; font-size: 15px; color: #7c3aed;">${esc(userId)}</span>`,
        `<strong>Password:</strong> <span style="font-family: monospace; font-size: 15px; color: #7c3aed;">${esc(password)}</span>`,
        `<strong>Valid From:</strong> ${startStr} to <strong style="color: #dc2626;">${endStr}</strong>`,
      ],
      ctaText: "Open Desktop Application &rarr;",
      ctaUrl: WEBSITE_URL,
      specs: [
        { label: "Candidate Name", value: name },
        { label: "Active Edition", value: app, color: "#2563eb" },
        { label: "Plan Type", value: plan },
        { label: "Status", value: "Active Premium", color: "#059669" },
        { label: "Valid Till", value: endStr, color: "#dc2626" },
      ],
      capabilities: [
        {
          title: "Device Lock",
          desc: "Your subscription locks to the first PC you log in from for account safety.",
        },
        {
          title: "Pro Shortcuts",
          desc: "Review your hotkey configuration in Settings inside the application.",
        },
        {
          title: "24/7 Priority Support",
          desc: "For any queries, reply directly to this email or write to support@metapilot.in.",
        },
      ],
      promoNote: null,
      steps: [
        `Open <strong>${app}</strong> desktop application.`,
        `Click "I have credentials" on the sign-in screen.`,
        `Enter your User ID and Password above to begin uninterrupted interview practice.`,
      ],
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
    htmlBody: buildSmartCardEmail({
      title: app,
      subtitle: "Free Trial Status Advisory",
      advisoryTitle: `Trial Status Update for ${name}`,
      advisoryText: `We noticed that this machine has already utilized the 1-Day Free Trial for <strong>${app}</strong>.`,
      heroHeading: "UPGRADE FOR UNINTERRUPTED ACCESS",
      heroDescription: `To continue using ${app} for your live interview sessions, upgrade to one of our flexible passes:`,
      heroBullets: isGo
        ? [
            `<strong>1 Day – Blitz Pass:</strong> ₹199`,
            `<strong>1 Week – Prep Week:</strong> ₹399`,
            `<strong>1 Month – Mastery Pack:</strong> ₹665`,
          ]
        : [
            `<strong>1 Day – Interview Day Pass:</strong> ₹249`,
            `<strong>2 Days – Interview Sprint Pack:</strong> ₹449`,
            `<strong>1 Week – Power Prep Pack:</strong> ₹1,299`,
            `<strong>1 Month – Job Switch Pack:</strong> ₹4,999`,
          ],
      ctaText: "Upgrade Subscription &rarr;",
      ctaUrl: WEBSITE_URL,
      specs: [
        { label: "Candidate Name", value: name },
        { label: "Edition", value: app, color: "#2563eb" },
        { label: "Trial Status", value: "Expired / Already Claimed", color: "#d97706" },
        { label: "Promo Discount", value: "Flat 25% OFF with WELCOME25", color: "#059669" },
      ],
      capabilities: [
        {
          title: "Instant Activation",
          desc: "Your subscription credentials are sent automatically within seconds of payment.",
        },
        {
          title: "Promo Code WELCOME25",
          desc: "Apply WELCOME25 at checkout to receive an instant 25% discount.",
        },
      ],
      promoNote: "Apply coupon code <strong>WELCOME25</strong> at checkout for Flat 25% OFF.",
      steps: [
        `Visit <a href="${WEBSITE_URL}" style="color: #2563eb; font-weight: 600;">metapilot.in</a>.`,
        `Choose your pass and click "Purchase Subscription".`,
        `Apply code <strong>WELCOME25</strong> and complete payment to get instant access.`,
      ],
    }),
  };
}

/**
 * Backward compatibility alias
 */
export function getProPendingTemplate(data) {
  return getPaymentLinkTemplate(data);
}
