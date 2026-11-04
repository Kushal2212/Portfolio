import "server-only";

type ContactEmail = {
  name: string;
  email: string;
  subject?: string | null;
  message: string;
};

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/**
 * Sends the admin notification with Resend's REST API. When RESEND_API_KEY is
 * absent (local dev), the message is simply stored in the database.
 */
export async function sendContactEmail(data: ContactEmail) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL || process.env.ADMIN_EMAIL;
  const from = process.env.RESEND_FROM_EMAIL || "Portfolio <onboarding@resend.dev>";
  if (!apiKey || !to) return { sent: false, reason: "not-configured" as const };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: data.email,
        subject: `New enquiry: ${data.subject || data.name}`,
        html: `
          <div style="font-family:ui-sans-serif,system-ui,sans-serif;line-height:1.6;color:#111">
            <h2 style="margin:0 0 4px">New message from your portfolio</h2>
            <p style="margin:0 0 20px;color:#666">${escapeHtml(data.name)} &lt;${escapeHtml(data.email)}&gt;</p>
            <p><strong>Subject:</strong> ${escapeHtml(data.subject || "—")}</p>
            <div style="padding:16px;border-radius:12px;background:#f4f4f2;white-space:pre-wrap">${escapeHtml(data.message)}</div>
            <p style="margin-top:20px"><a href="mailto:${escapeHtml(data.email)}">Reply to ${escapeHtml(data.name)}</a></p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      console.error("Resend error", await res.text());
      return { sent: false, reason: "provider-error" as const };
    }
    return { sent: true as const };
  } catch (error) {
    console.error("Email send failed", error);
    return { sent: false, reason: "network-error" as const };
  }
}
