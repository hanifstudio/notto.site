import { ACCESS_REFRESH_COOLDOWN_SECONDS } from "@/lib/catalog";
import { getCompletedPurchaseByUserId, getRefundedPurchaseByUserId, hasCompletedPurchase } from "@/lib/db/purchases";
import { getUserById } from "@/lib/db/users";

export type Entitlement = {
  status: "free" | "active" | "revoked";
  purchasedAt: Date | null;
  /** When POST /api/account/refresh will next be allowed, or null if it's allowed now. */
  nextAccessRefreshAt: Date | null;
  isAdmin: boolean;
};

export class AccessService {
  static async hasAllAccess(userId: string): Promise<boolean> {
    const user = await getUserById(userId);
    if (user?.role === "admin") return true;
    return hasCompletedPurchase(userId);
  }

  static async getEntitlement(userId: string): Promise<Entitlement> {
    const user = await getUserById(userId);
    const nextAccessRefreshAt = AccessService.getNextAccessRefreshAt(user);
    const isAdmin = user?.role === "admin";

    if (isAdmin) {
      return { status: "active", purchasedAt: null, nextAccessRefreshAt, isAdmin };
    }

    const completed = await getCompletedPurchaseByUserId(userId);
    if (completed) return { status: "active", purchasedAt: completed.createdAt, nextAccessRefreshAt, isAdmin };

    const refunded = await getRefundedPurchaseByUserId(userId);
    if (refunded) return { status: "revoked", purchasedAt: null, nextAccessRefreshAt, isAdmin };

    return { status: "free", purchasedAt: null, nextAccessRefreshAt, isAdmin };
  }

  private static getNextAccessRefreshAt(user: { lastAccessRefreshAt: Date | null } | undefined): Date | null {
    if (!user?.lastAccessRefreshAt) return null;

    const nextAllowed = new Date(user.lastAccessRefreshAt.getTime() + ACCESS_REFRESH_COOLDOWN_SECONDS * 1000);
    return nextAllowed > new Date() ? nextAllowed : null;
  }
}
