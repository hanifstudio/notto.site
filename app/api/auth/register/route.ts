import { NextRequest } from "next/server";
import { z } from "zod";

import { AuthService } from "@/lib/services/auth.service";
import { fail, handleApiError, ok } from "@/lib/shared/api-response";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(10),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return fail("Enter a valid email and a password of at least 10 characters.", "VALIDATION_ERROR", 400);
    }

    const user = await AuthService.register(parsed.data.email, parsed.data.password);
    return ok({ id: user.id, email: user.email }, 201);
  } catch (error) {
    return handleApiError(error, "POST /api/auth/register");
  }
}
