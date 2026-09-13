import { randomUUID } from "node:crypto";

import {
  createPendingPurchase,
  getPurchaseByProviderReference,
  setPurchaseStatus,
} from "@/lib/db/purchases";
import {
  createCheckoutUrl,
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
   * callback URL, then a mandatory server-to-server re-fetch of the sale from
   * Gumroad's API before any purchase status is trusted. Which resource_name
   * fired (`sale`/`refund`/`dispute`) comes from the `event` query param we
   * chose when registering each subscription — not inferred from the payload,
   * since Gumroad's real API clients show no reliable "disputed" field to key
   * off. The route only extracts the raw body, token, and event; everything
   * else stays behind the service boundary like every other integration call.
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

    const sale = await fetchSale(saleId);
    if (!sale.reference) {
      throw new ConflictError(`Gumroad sale ${saleId} has no reference — cannot match a pending purchase.`);
    }

    const purchase = await getPurchaseByProviderReference(sale.reference);
    if (!purchase) throw new ConflictError(`No pending purchase found for reference ${sale.reference}.`);

    // `purchases.status` has no separate "disputed" state — a dispute revokes
    // access the same way a refund does, conservatively, until it's resolved.
    const status = event === "sale" && !sale.refunded ? "completed" : "refunded";
    await setPurchaseStatus(purchase.id, status);
  }
}
