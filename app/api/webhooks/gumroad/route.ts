import { NextRequest } from "next/server";

import { CheckoutService } from "@/lib/services/checkout.service";
import { handleApiError, ok } from "@/lib/shared/api-response";

// Public by design — Gumroad's callbacks carry no signature. Authenticity
// comes from the `token` query param on the registered callback URL, verified
// (along with the sale itself) inside CheckoutService.
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const token = request.nextUrl.searchParams.get("token");
    const event = request.nextUrl.searchParams.get("event");

    await CheckoutService.verifyAndApplyWebhook(rawBody, token, event);
    return ok({ received: true });
  } catch (error) {
    return handleApiError(error, "POST /api/webhooks/gumroad");
  }
}
