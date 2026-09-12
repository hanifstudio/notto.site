import bcrypt from "bcryptjs";

import { getUserByEmail, type User } from "./users";

/**
 * Verifies email/password credentials for the NextAuth Credentials provider.
 * Lives in the DB layer (not a service) because the auth adapter
 * (lib/auth/config.ts) must not import @/lib/services.
 */
export async function verifyCredentials(email: string, password: string): Promise<User | null> {
  const user = await getUserByEmail(email.trim().toLowerCase());
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  return valid ? user : null;
}
