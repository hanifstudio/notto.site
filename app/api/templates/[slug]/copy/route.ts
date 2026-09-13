import { getCurrentUser } from "@/lib/auth/server-auth";
import { TemplateService } from "@/lib/services/template.service";
import { handleApiError, ok } from "@/lib/shared/api-response";

export async function POST(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    // Public by design: free templates are copyable without an account.
    // TemplateService enforces the All Access requirement for plus ones.
    const { slug } = await params;
    const user = await getCurrentUser();

    const source = await TemplateService.getCopySource(slug, user?.id ?? null);
    return ok({ source });
  } catch (error) {
    return handleApiError(error, "POST /api/templates/[slug]/copy");
  }
}
