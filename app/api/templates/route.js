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
* Live Coding OCR: Press Ctrl+Z to take a silent snapshot of any coding problem or SQL query on screen and get instant solution hints.
* 100% Invisible: Designed to remain completely undetectable during screen sharing on Google Meet, Zoom, and MS Teams.

We offer a completely free 1-day full access pass so you can test it on your laptop before any real interview:
👉 https://metapilot.in/

If you'd like me to set up your free trial access directly, just reply "YES" to this email and I'll send your login details right away.

Best regards,
Hrushikesh More
MetaPilot Team | Pune
https://metapilot.in/`,

  email_b_subject: "Following up regarding your {{jobRole}} interviews, {{fullName}}",
  email_b_body: `Hi {{fullName}},

Following up on my previous note. With technical interviews getting harder and more competitive this year, many {{jobRole}} professionals find it challenging to handle rapid theoretical questions or tricky scenario-based rounds.

A lot of candidates from {{jobRole}} backgrounds are now using MetaPilot during their preparation to maintain confidence and structure their answers seamlessly.

You can test the 1-day free trial on your computer here:
👉 https://metapilot.in/

Do you have any interviews scheduled this week? If you run into any questions or need help setting it up on your laptop, feel free to reply directly to this email.

Warm regards,
Hrushikesh More
MetaPilot Team | Pune
https://metapilot.in/`,

  email_c_subject: "Final note on your {{jobRole}} interview preparation, {{fullName}}",
  email_c_body: `Hi {{fullName}},

I just wanted to drop a quick final note in case you have upcoming interview rounds.

Facing high-pressure interviews alone without real-time assistance is unnecessary when you can have a silent AI co-pilot right in front of you. MetaPilot helps you handle both live coding and technical theory without showing up on any screen share.

If you'd like to test it before your next round, you can grab your 1-day free access here:
👉 https://metapilot.in/

(Tip: Apply promo code WELCOME25 at checkout for Flat 25% OFF if you decide to upgrade.)

Or simply reply to this email with "FREE TRIAL" and I'll help you get started right away.

Wishing you all the best for your interviews!

Best,
Hrushikesh More
Founder, MetaPilot | https://metapilot.in/`,

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
