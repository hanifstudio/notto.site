import { NextRequest } from "next/server";

import { CheckoutService } from "@/lib/services/checkout.service";
import { handleApiError, ok } from "@/lib/shared/api-response";

// Public by design — authenticated via the Contra signature header, not a user session.
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-contra-signature");

    await CheckoutService.verifyAndApplyWebhook(rawBody, signature);
    return ok({ received: true });
  } catch (error) {
    return handleApiError(error, "POST /api/webhooks/contra");
  }
}
