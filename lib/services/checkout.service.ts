import { randomUUID } from "node:crypto";

import {
  createPendingPurchase,
  getPurchaseByProviderReference,
  setPurchaseStatus,
} from "@/lib/db/purchases";
import {
  createCheckoutUrl,
  extractReference,
  fetchSale,
  isGumroadWebhookEvent,
  isValidWebhookToken,
} from "@/lib/integrations/gumroad";
import { ConflictError, UnauthorizedError, ValidationError } from "@/lib/shared/errors";

export class CheckoutService {
  /** Creates a pending purchase row and returns the Gumroad checkout URL to redirect the user to. */
  static async createCheckoutSession(userId: string, customerEmail: string, offerCode?: string): Promise<string> {
    const reference = randomUUID();
    await createPendingPurchase({ userId, providerReference: reference });
    return createCheckoutUrl({ reference, customerEmail, offerCode });
  }

  /**
   * Gumroad's resource_subscription callbacks are unsigned and form-encoded
   * (not JSON). Authenticity comes from the shared `token` on the registered
   * callback URL, then a mandatory server-to-server re-fetch confirming the
   * `sale_id` is real before any purchase status is trusted. Which
   * resource_name fired (`sale`/`refund`/`dispute`) comes from the `event`
   * query param we chose when registering each subscription — not inferred
   * from the payload. `reference` is read from the raw body itself: Gumroad's
   * `GET /v2/sales` never returns `url_params`, only the ping body carries it.
   * The route only extracts the raw body, token, and event; everything else
   * stays behind the service boundary like every other integration call.
   */
  static async verifyAndApplyWebhook(rawBody: string, webhookToken: string | null, event: string | null): Promise<void> {
    if (!isValidWebhookToken(webhookToken)) {
      throw new UnauthorizedError("Invalid webhook token");
    }
    if (!isGumroadWebhookEvent(event)) {
      throw new ValidationError("Invalid or missing event query param");
    }

    const params = new URLSearchParams(rawBody);
    const saleId = params.get("sale_id");
    if (!saleId) throw new ValidationError("Invalid webhook payload — missing sale_id");

    // Gumroad's "Send test ping" button — acknowledge, nothing to apply.
    if (params.get("test") === "true") return;

    const reference = extractReference(params);
    if (!reference) {
      throw new ValidationError(`Gumroad sale ${saleId} has no reference in url_params — cannot match a pending purchase.`);
    }

    const purchase = await getPurchaseByProviderReference(reference);
    if (!purchase) throw new ConflictError(`No pending purchase found for reference ${reference}.`);

    // Confirms the sale is real (and gets its authoritative refunded state)
    // before trusting the reference pulled from the unsigned body above.
    const sale = await fetchSale(saleId);

    // `purchases.status` has no separate "disputed" state — a dispute revokes
    // access the same way a refund does, conservatively, until it's resolved.
    const status = event === "sale" && !sale.refunded ? "completed" : "refunded";
    await setPurchaseStatus(purchase.id, status);
  }
}
