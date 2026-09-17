import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const DEFAULT_TEMPLATES = {
  email_a_subject: "Quick question regarding your {{jobRole}} interviews, {{fullName}}",
  email_a_body: `Hi {{fullName}},

I came across your profile and noticed you are actively preparing for opportunities in the {{jobRole}} domain.

In technical rounds, most candidates struggle not because they lack knowledge, but because of sudden pressure, difficult surprise questions, or tricky live coding tasks where thinking on your feet gets overwhelming.

We recently built a silent AI co-pilot called MetaPilot specifically to help {{jobRole}} professionals overcome this:
* Real-Time Voice Assistant: Listens to the interviewer's questions and provides structured technical points in 2 seconds.
* Live Coding & Problem Solving: Press Ctrl+Z to take a silent snapshot of any coding problem, SQL query, or error on screen for instant hints.
* 100% Invisible: Designed to remain completely undetectable during screen sharing on Google Meet, Zoom, and MS Teams.

Career Guidance & Mentor Support:
Facing challenges like low interview call frequency, career gaps/transitions, or prep confusion? Pro Plan members get direct email-based 1-on-1 mentorship — you can simply reply to this email with your current situation or resume, and our senior mentors will review and share a clear, actionable roadmap directly over email.

We offer a completely free 1-day full access pass so you can test it on your laptop before any real interview:
👉 www.MetaPilot.in

(Note: If you decide to upgrade to any plan, you can use code "welcome25" for 25% off on www.MetaPilot.in)

📺 Want to see it in action? Search @MetaPilotApps on YouTube (watch demo videos) or find us on Instagram at @metapilot_go_pro and drop your questions in the comments!

If you'd like us to set up your free trial access directly, just reply "YES" to this email and we'll send your login details right away.

Best regards,
Team MetaPilot
MetaPilot | India
www.MetaPilot.in`,

  email_b_subject: "Regarding your {{jobRole}} interview preparation, {{fullName}}",
  email_b_body: `Hi {{fullName}},

I noticed you are actively preparing for opportunities in the {{jobRole}} domain.

Technical screening rounds have become significantly more competitive this year, especially with tricky problem-solving rounds, unexpected scenario questions, and live coding exercises under strict time limits.

To help {{jobRole}} professionals clear these rounds with confidence, we built MetaPilot — a silent desktop AI co-pilot that assists you in real time:
* Instant Solution Hints: Silently capture coding questions, SQL queries, or technical errors on screen (Ctrl+Z) and get instant walkthroughs.
* Spoken Answer Prompts: Generates crisp, structured technical points as the interviewer speaks so you answer fluently without hesitation.
* Completely Screen-Safe: Runs privately on your desktop without showing up on Google Meet, Zoom, or Teams screen sharing.

Career Guidance & Mentor Support:
Struggling with interview shortlists, career transitions, or interview anxiety? As an exclusive perk for Pro Plan members, our mentors provide written profile & interview audits over email. Just reply with your queries here, and get personalized written feedback without the hassle of scheduling calls.

You can test the 1-day free trial directly on your computer before your next interview:
👉 www.MetaPilot.in

(Note: You can use coupon code "welcome25" for 25% off on www.MetaPilot.in).

📺 Want to see real demos? Search @MetaPilotApps on YouTube (watch walkthrough videos) or check our Instagram @metapilot_go_pro and drop any questions in the comments!

Do you have any interviews scheduled this week? If you'd like direct help setting up your access, feel free to reply directly to this email.

Best regards,
Team MetaPilot
MetaPilot | India
www.MetaPilot.in`,

  email_c_subject: "Connecting regarding your {{jobRole}} interviews, {{fullName}}",
  email_c_body: `Hi {{fullName}},

Reaching out as I saw you are preparing for {{jobRole}} roles.

One of the biggest hurdles candidates face in technical interviews is structuring answers properly when put on the spot, even when they know the core concepts well.

We designed MetaPilot as an invisible co-pilot to give you that edge — listening silently to the interviewer and displaying real-time structured talking points and code solutions directly on your screen:
* Crisp Answer Cues: Get real-time technical bullet points so your explanations sound clear, confident, and senior-level.
* Live Coding & Syntax Support: Immediate hints and code explanations for live whiteboard or coding challenges.
* 100% Invisible: Undetectable during screen sharing on all major meeting platforms.

Career Guidance & Mentor Support:
Facing challenges like low interview call frequency, career gaps/transitions, or prep confusion? As an exclusive perk for Pro Plan members, our mentors provide written profile & interview audits over email. You can simply reply to this email with your current situation or resume, and our senior mentors will review and share a clear, actionable roadmap directly over email.

You can try out our 1-day free trial to test it before any upcoming rounds:
👉 www.MetaPilot.in

(Note: You can apply code "welcome25" for 25% off on www.MetaPilot.in if you decide to upgrade).

📺 Want to see it in action? Check out our YouTube channel @MetaPilotApps (watch video demos) or follow on Instagram @metapilot_go_pro and drop a comment!

Or simply reply "FREE TRIAL" to this email and our team will get your test account ready for you.

Best regards,
Team MetaPilot
MetaPilot | India
www.MetaPilot.in`,

  wa_draft_1: `Hi {{fullName}} 👋

I noticed you are actively exploring opportunities in the {{jobRole}} domain 💼

🚀 Many candidates are already using MetaPilot to crack interviews smarter with real-time AI assistance.

⚡ Helps with:
* SQL
* Python
* Java
* Testing
* HR Rounds
* Coding & Technical rounds

🎯 Invisible during screen sharing, so nobody will doubt how you are answering questions so fluently during interviews 🤫

🎁 1-Day Free Trial Available

🌐 Download:
https://metapilot.in/

🎥 Watch Real Demo & Tutorials:
https://www.youtube.com/@MetaPilotApps
Complete Demo: https://www.youtube.com/watch?v=jSiHe4qW31Q

💡 Follow us on Instagram:
https://www.instagram.com/metapilot_go_pro/

🎉 Use Code: WELCOME25
Get Flat 25% OFF 🔥`,

  wa_draft_2: `Hi {{fullName}} 👋

Still giving interviews the hard way? 😓

🚀 Many candidates from the {{jobRole}} domain have already used MetaPilot to clear difficult interviews and move ahead of their competition.

Now it's your turn to crack interviews smarter 💡

⚡ Real-time AI assistance
⚡ Coding + HR + theoretical support
⚡ Helps you keep speaking confidently during interviews

🎯 Invisible during screen sharing, so interviews feel smoother and more natural 🤫

🎁 1-Day Free Trial Available

🌐 Download:
https://metapilot.in/

🎥 Complete Demo Video:
https://www.youtube.com/watch?v=jSiHe4qW31Q

🎉 Use WELCOME25 for Flat 25% OFF 🔥`,

  wa_draft_3: `Hi {{fullName}} 👋

Quick check regarding your {{jobRole}} interview preparation!

Facing high-pressure interviews alone without real-time assistance is unnecessary when you can have a silent AI co-pilot right in front of you.

⚡ Real-time speech transcription & answers
⚡ Instant live coding analysis (Ctrl+Z)
⚡ 100% undetectable on Google Meet, Zoom, Teams

🎁 Claim your 1-Day Free Pass:
https://metapilot.in/

🎉 Use coupon WELCOME25 for 25% OFF!`,
};

/**
 * GET /api/templates
 */
export async function GET() {
  try {
    const { data: configs } = await supabase
      .from("app_config")
      .select("key, value")
      .like("key", "tpl_%");

    const templates = { ...DEFAULT_TEMPLATES };

    if (configs && configs.length > 0) {
      configs.forEach((c) => {
        const fieldKey = c.key.replace("tpl_", "");
        if (fieldKey in templates) {
          templates[fieldKey] = c.value;
        }
      });
    }

    return NextResponse.json({ success: true, templates });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/templates
 * Save edited templates
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { templates, key } = body;

    if (key !== "metapilot2026") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!templates) {
      return NextResponse.json({ success: false, error: "No templates provided" }, { status: 400 });
    }

    const updates = Object.entries(templates).map(([fieldKey, value]) => ({
      key: `tpl_${fieldKey}`,
      value: String(value),
      description: "Custom outreach template",
    }));

    for (const item of updates) {
      await supabase.from("app_config").upsert(item, { onConflict: "key" });
    }

    return NextResponse.json({ success: true, message: "Templates saved successfully!" });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
