import { NextRequest } from "next/server";
import { z } from "zod";

import { AuthService } from "@/lib/services/auth.service";
import { fail, handleApiError, ok } from "@/lib/shared/api-response";

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(10),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return fail("Enter a new password of at least 10 characters.", "VALIDATION_ERROR", 400);
    }

    const user = await AuthService.resetPassword(parsed.data.token, parsed.data.password);
    return ok({ email: user.email });
  } catch (error) {
    return handleApiError(error, "POST /api/auth/reset-password");
  }
}
