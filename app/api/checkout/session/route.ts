import { NextRequest } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/server-auth";
import { CheckoutService } from "@/lib/services/checkout.service";
import { fail, handleApiError, ok } from "@/lib/shared/api-response";

// offerCode is a trial-period testing aid (manual $0 discount-code purchases
// while Gumroad has no sandbox) — remove once real payment testing is done.
const bodySchema = z.object({ offerCode: z.string().trim().min(1).optional() });

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Unauthorized", "UNAUTHORIZED", 401);

    const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return fail("Invalid request body", "VALIDATION_ERROR", 400);

    const checkoutUrl = await CheckoutService.createCheckoutSession(user.id, user.email, parsed.data.offerCode);
    return ok({ checkoutUrl });
  } catch (error) {
    return handleApiError(error, "POST /api/checkout/session");
  }
}
