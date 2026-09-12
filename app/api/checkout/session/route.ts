import { getCurrentUser } from "@/lib/auth/server-auth";
import { CheckoutService } from "@/lib/services/checkout.service";
import { fail, handleApiError, ok } from "@/lib/shared/api-response";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Unauthorized", "UNAUTHORIZED", 401);

    const checkoutUrl = await CheckoutService.createCheckoutSession(user.id, user.email);
    return ok({ checkoutUrl });
  } catch (error) {
    return handleApiError(error, "POST /api/checkout/session");
  }
}
