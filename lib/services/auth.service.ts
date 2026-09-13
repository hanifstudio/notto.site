import { createHash, randomBytes } from "node:crypto";

import bcrypt from "bcryptjs";

import { createPasswordResetToken, getUnusedTokenByHash, markTokenUsed } from "@/lib/db/password-reset";
import { createUser, getUserByEmail, getUserById, updateUserPassword, type User } from "@/lib/db/users";
import { sendTransactionalEmail } from "@/lib/integrations/brevo";
import { ConflictError, ValidationError } from "@/lib/shared/errors";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 60 minutes — matches the "expires in 60 minutes" copy on the reset page

export class AuthService {
  static async register(email: string, password: string): Promise<User> {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await getUserByEmail(normalizedEmail);
    if (existing) throw new ConflictError("An account with this email already exists.");

    const passwordHash = await bcrypt.hash(password, 12);
    return createUser({ email: normalizedEmail, passwordHash });
  }

  /** Always resolves, whether or not the email is registered — never leaks account existence. */
  static async requestPasswordReset(email: string): Promise<void> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await getUserByEmail(normalizedEmail);
    if (!user) return;

    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");
    await createPasswordResetToken({
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${rawToken}`;
    await sendTransactionalEmail({
      to: { email: user.email },
      subject: "Reset your Notto password",
      htmlContent: `<p>Reset your password by clicking the link below. It expires in 60 minutes and can only be used once.</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you didn't request this, you can ignore this email.</p>`,
    });
  }

  static async resetPassword(rawToken: string, newPassword: string): Promise<User> {
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");
    const token = await getUnusedTokenByHash(tokenHash);
    if (!token || token.expiresAt < new Date()) {
      throw new ValidationError("This reset link is invalid or has expired.");
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await updateUserPassword(token.userId, passwordHash);
    await markTokenUsed(token.id);

    const user = await getUserById(token.userId);
    if (!user) throw new ValidationError("This reset link is invalid or has expired.");
    return user;
  }
}
