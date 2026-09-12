import { and, eq, isNull } from "drizzle-orm";

import { db } from "./index";
import { passwordResetTokens } from "./schema";

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;

export async function createPasswordResetToken(input: {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}): Promise<PasswordResetToken> {
  const [token] = await db.insert(passwordResetTokens).values(input).returning();
  return token;
}

export async function getUnusedTokenByHash(tokenHash: string): Promise<PasswordResetToken | undefined> {
  const [token] = await db
    .select()
    .from(passwordResetTokens)
    .where(and(eq(passwordResetTokens.tokenHash, tokenHash), isNull(passwordResetTokens.usedAt)))
    .limit(1);
  return token;
}

export async function markTokenUsed(id: string): Promise<void> {
  await db.update(passwordResetTokens).set({ usedAt: new Date() }).where(eq(passwordResetTokens.id, id));
}
