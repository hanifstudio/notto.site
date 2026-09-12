import { randomUUID } from "node:crypto";

import { z } from "zod";

import {
  createPendingPurchase,
  getPurchaseByProviderReference,
  setPurchaseStatus,
} from "@/lib/db/purchases";
import { createCheckoutUrl, verifyWebhookSignature } from "@/lib/integrations/contra";
import { ConflictError, UnauthorizedError, ValidationError } from "@/lib/shared/errors";

// Provisional shape — adjust once Contra's actual webhook payload is confirmed.
const webhookEventSchema = z.object({
  reference: z.string().min(1),
  status: z.enum(["completed", "refunded"]),
});

export class CheckoutService {
  /** Creates a pending purchase row and returns the Contra checkout URL to redirect the user to. */
  static async createCheckoutSession(userId: string, customerEmail: string): Promise<string> {
    const reference = randomUUID();
    await createPendingPurchase({ userId, providerReference: reference });
    return createCheckoutUrl({ reference, customerEmail });
  }

  /**
   * Verifies the inbound Contra webhook's signature, then applies the event.
   * The route only extracts the raw body and header — signature verification
   * and payload parsing stay behind the service boundary like every other
   * integration call.
   */
  static async verifyAndApplyWebhook(rawBody: string, signatureHeader: string | null): Promise<void> {
    if (!verifyWebhookSignature(rawBody, signatureHeader)) {
      throw new UnauthorizedError("Invalid webhook signature");
    }

    let json: unknown;
    try {
      json = JSON.parse(rawBody);
    } catch {
      throw new ValidationError("Invalid webhook payload");
    }

    const parsed = webhookEventSchema.safeParse(json);
    if (!parsed.success) throw new ValidationError("Invalid webhook payload");

    const purchase = await getPurchaseByProviderReference(parsed.data.reference);
    if (!purchase) throw new ConflictError(`No pending purchase found for reference ${parsed.data.reference}.`);

    await setPurchaseStatus(purchase.id, parsed.data.status);
  }
}
