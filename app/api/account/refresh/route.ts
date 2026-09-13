import { getCurrentUser } from "@/lib/auth/server-auth";
import { CheckoutService } from "@/lib/services/checkout.service";
import { fail, handleApiError, ok } from "@/lib/shared/api-response";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Unauthorized", "UNAUTHORIZED", 401);

    const result = await CheckoutService.reconcileAccess(user.id, user.email);
    return ok({ result });
  } catch (error) {
    return handleApiError(error, "POST /api/account/refresh");
  }
}
