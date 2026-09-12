import { eq } from "drizzle-orm";

import { db } from "./index";
import { users } from "./schema";

export type User = typeof users.$inferSelect;

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return user;
}

export async function getUserById(id: string): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user;
}

export async function createUser(input: { email: string; passwordHash: string }): Promise<User> {
  const [user] = await db.insert(users).values(input).returning();
  return user;
}

export async function updateUserPassword(id: string, passwordHash: string): Promise<void> {
  await db.update(users).set({ passwordHash }).where(eq(users.id, id));
}
