import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/server-auth";
import { TemplateService } from "@/lib/services/template.service";
import { fail, handleApiError, ok } from "@/lib/shared/api-response";

const patchSchema = z
  .object({
    access: z.enum(["free", "plus"]).optional(),
    pinToTop: z.boolean().optional(),
  })
  .refine((data) => data.access !== undefined || data.pinToTop === true, {
    message: "Provide access or pinToTop.",
  });

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Unauthorized", "UNAUTHORIZED", 401);

    const parsed = patchSchema.safeParse(await request.json());
    if (!parsed.success) {
      return fail('Provide access ("free" or "plus") or pinToTop.', "VALIDATION_ERROR", 400);
    }

    const { slug } = await params;
    const template = await TemplateService.adminUpdate(user.id, slug, parsed.data);
    return ok(template);
  } catch (error) {
    return handleApiError(error, "PATCH /api/admin/templates/[slug]");
  }
}
