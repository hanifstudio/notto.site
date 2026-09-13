import { getCurrentUser } from "@/lib/auth/server-auth";
import { AccessService } from "@/lib/services/access.service";
import { fail, handleApiError, ok } from "@/lib/shared/api-response";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Unauthorized", "UNAUTHORIZED", 401);

    const entitlement = await AccessService.getEntitlement(user.id);
    return ok({
      id: user.id,
      email: user.email,
      entitlement: entitlement.status,
      purchasedAt: entitlement.purchasedAt?.toISOString() ?? null,
      nextAccessRefreshAt: entitlement.nextAccessRefreshAt?.toISOString() ?? null,
    });
  } catch (error) {
    return handleApiError(error, "GET /api/account");
  }
}
