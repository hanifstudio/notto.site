import { getCompletedPurchaseByUserId, getRefundedPurchaseByUserId, hasCompletedPurchase } from "@/lib/db/purchases";

export type Entitlement = {
  status: "free" | "active" | "revoked";
  purchasedAt: Date | null;
};

export class AccessService {
  static async hasAllAccess(userId: string): Promise<boolean> {
    return hasCompletedPurchase(userId);
  }

  static async getEntitlement(userId: string): Promise<Entitlement> {
    const completed = await getCompletedPurchaseByUserId(userId);
    if (completed) return { status: "active", purchasedAt: completed.createdAt };

    const refunded = await getRefundedPurchaseByUserId(userId);
    if (refunded) return { status: "revoked", purchasedAt: null };

    return { status: "free", purchasedAt: null };
  }
}
