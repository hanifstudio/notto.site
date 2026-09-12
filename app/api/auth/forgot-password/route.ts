import { NextRequest } from "next/server";
import { z } from "zod";

import { AuthService } from "@/lib/services/auth.service";
import { fail, handleApiError, ok } from "@/lib/shared/api-response";

const forgotPasswordSchema = z.object({ email: z.string().email() });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return fail("Enter a valid email address.", "VALIDATION_ERROR", 400);
    }

    await AuthService.requestPasswordReset(parsed.data.email);
    // Always the same response, whether or not the email is registered.
    return ok({ requested: true });
  } catch (error) {
    return handleApiError(error, "POST /api/auth/forgot-password");
  }
}
