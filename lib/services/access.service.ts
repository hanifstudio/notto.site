import { ACCESS_REFRESH_COOLDOWN_SECONDS } from "@/lib/catalog";
import { getCompletedPurchaseByUserId, getRefundedPurchaseByUserId, hasCompletedPurchase } from "@/lib/db/purchases";
import { getUserById } from "@/lib/db/users";

export type Entitlement = {
  status: "free" | "active" | "revoked";
  purchasedAt: Date | null;
  /** When POST /api/account/refresh will next be allowed, or null if it's allowed now. */
  nextAccessRefreshAt: Date | null;
};

export class AccessService {
  static async hasAllAccess(userId: string): Promise<boolean> {
    return hasCompletedPurchase(userId);
  }

  static async getEntitlement(userId: string): Promise<Entitlement> {
    const nextAccessRefreshAt = await AccessService.getNextAccessRefreshAt(userId);

    const completed = await getCompletedPurchaseByUserId(userId);
    if (completed) return { status: "active", purchasedAt: completed.createdAt, nextAccessRefreshAt };

    const refunded = await getRefundedPurchaseByUserId(userId);
    if (refunded) return { status: "revoked", purchasedAt: null, nextAccessRefreshAt };

    return { status: "free", purchasedAt: null, nextAccessRefreshAt };
  }

  private static async getNextAccessRefreshAt(userId: string): Promise<Date | null> {
    const user = await getUserById(userId);
    if (!user?.lastAccessRefreshAt) return null;

    const nextAllowed = new Date(user.lastAccessRefreshAt.getTime() + ACCESS_REFRESH_COOLDOWN_SECONDS * 1000);
    return nextAllowed > new Date() ? nextAllowed : null;
  }
}
