const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.SENDER_EMAIL || "support@metapilot.in";
const SENDER_NAME = process.env.SENDER_NAME || "MetaPilot Team";

/**
 * Send email via Brevo (Sendinblue) API
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} htmlBody - HTML email body
 * @param {string} [toName] - Recipient name
 * @param {Array<{email: string, name?: string}>} [cc] - Optional CC recipients
 */
export async function sendEmail(to, subject, htmlBody, toName = "", cc = null) {
  if (!BREVO_API_KEY) {
    throw new Error("Missing BREVO_API_KEY environment variable");
  }

  const payload = {
    sender: { name: SENDER_NAME, email: SENDER_EMAIL },
    to: [{ email: to, name: toName }],
    replyTo: { email: "support@metapilot.in", name: "MetaPilot Support" },
    subject: subject,
    htmlContent: htmlBody,
    headers: {
      "List-Unsubscribe": `<mailto:${SENDER_EMAIL}?subject=Unsubscribe>, <https://metapilot.in?unsubscribe=true>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  };

  if (cc && Array.isArray(cc) && cc.length > 0) {
    payload.cc = cc;
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "content-type": "application/json",
      "api-key": BREVO_API_KEY,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Brevo API error: ${JSON.stringify(error)}`);
  }

  return await response.json();
}

/**
 * Send bulk emails with delay between each send
 * @param {Array} recipients - Array of { email, name, subject, htmlBody }
 * @param {number} delayMs - Delay between sends (default 2 seconds)
 */
export async function sendBulkEmails(recipients, delayMs = 2000) {
  const results = [];

  for (const recipient of recipients) {
    try {
      const result = await sendEmail(
        recipient.email,
        recipient.subject,
        recipient.htmlBody,
        recipient.name
      );
      results.push({ email: recipient.email, status: "sent", result });
    } catch (error) {
      results.push({ email: recipient.email, status: "error", error: error.message });
    }

    // Delay between sends to avoid rate limiting
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return results;
}
