const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

export class BrevoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BrevoError";
  }
}

/**
 * Sends a transactional email through Brevo's REST API.
 * Pure vendor client — no DB access, no business logic. Callers (services)
 * decide who gets emailed and why.
 */
export async function sendTransactionalEmail(input: {
  to: { email: string; name?: string };
  subject: string;
  htmlContent: string;
}): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new BrevoError("BREVO_API_KEY is not set");

  const senderEmail = process.env.BREVO_SENDER_EMAIL ?? "support@orbie.dev";
  const senderName = process.env.BREVO_SENDER_NAME ?? "Orbie";

  const res = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: { email: senderEmail, name: senderName },
      to: [input.to],
      subject: input.subject,
      htmlContent: input.htmlContent,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new BrevoError(`Brevo request failed (${res.status}): ${body}`);
  }
}
