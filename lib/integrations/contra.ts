/**
 * Contra hosted-checkout client — Lifetime All Access ($12 one-time).
 *
 * SCAFFOLD ONLY. Contra's API/webhook docs have not been reviewed yet, so the
 * two functions below are typed interfaces with a clear contract but no real
 * HTTP calls. Fill in once CONTRA_API_KEY / CONTRA_PRODUCT_ID / CONTRA_WEBHOOK_SECRET
 * are known:
 *
 * 1. `createCheckoutUrl` — should call Contra's API (or build their hosted
 *    checkout link for CONTRA_PRODUCT_ID) and return a URL to redirect the
 *    user to, carrying `reference` so the webhook can be matched back to the
 *    pending purchase row created by CheckoutService.
 * 2. `verifyWebhookSignature` — should verify the inbound webhook's signature
 *    against CONTRA_WEBHOOK_SECRET before CheckoutService trusts the payload.
 */

export class ContraNotConfiguredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContraNotConfiguredError";
  }
}

export async function createCheckoutUrl(_input: {
  reference: string;
  customerEmail: string;
}): Promise<string> {
  const productId = process.env.CONTRA_PRODUCT_ID;
  const apiKey = process.env.CONTRA_API_KEY;
  if (!productId || !apiKey) {
    throw new ContraNotConfiguredError(
      "Contra is not configured yet — set CONTRA_API_KEY and CONTRA_PRODUCT_ID once the product is created and the API docs are reviewed.",
    );
  }

  throw new ContraNotConfiguredError(
    "createCheckoutUrl is a scaffold — implement the real Contra API call once the docs are reviewed.",
  );
}

export function verifyWebhookSignature(_rawBody: string, _signatureHeader: string | null): boolean {
  const secret = process.env.CONTRA_WEBHOOK_SECRET;
  if (!secret) {
    throw new ContraNotConfiguredError(
      "CONTRA_WEBHOOK_SECRET is not set — cannot verify webhook authenticity yet.",
    );
  }

  throw new ContraNotConfiguredError(
    "verifyWebhookSignature is a scaffold — implement the real signature check once Contra's webhook docs are reviewed.",
  );
}
