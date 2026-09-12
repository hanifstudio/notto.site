import { and, eq } from "drizzle-orm";

import { db } from "./index";
import { purchases } from "./schema";

export type Purchase = typeof purchases.$inferSelect;

export async function getCompletedPurchaseByUserId(userId: string): Promise<Purchase | undefined> {
  const [purchase] = await db
    .select()
    .from(purchases)
    .where(and(eq(purchases.userId, userId), eq(purchases.status, "completed")))
    .limit(1);
  return purchase;
}

export async function hasCompletedPurchase(userId: string): Promise<boolean> {
  return Boolean(await getCompletedPurchaseByUserId(userId));
}

export async function getRefundedPurchaseByUserId(userId: string): Promise<Purchase | undefined> {
  const [purchase] = await db
    .select()
    .from(purchases)
    .where(and(eq(purchases.userId, userId), eq(purchases.status, "refunded")))
    .limit(1);
  return purchase;
}

export async function createPendingPurchase(input: { userId: string; providerReference: string }): Promise<Purchase> {
  const [purchase] = await db
    .insert(purchases)
    .values({ userId: input.userId, providerReference: input.providerReference, status: "pending" })
    .returning();
  return purchase;
}

export async function getPurchaseByProviderReference(providerReference: string): Promise<Purchase | undefined> {
  const [purchase] = await db
    .select()
    .from(purchases)
    .where(eq(purchases.providerReference, providerReference))
    .limit(1);
  return purchase;
}

export async function setPurchaseStatus(id: string, status: (typeof purchases.$inferInsert)["status"]): Promise<void> {
  await db.update(purchases).set({ status, updatedAt: new Date() }).where(eq(purchases.id, id));
}
