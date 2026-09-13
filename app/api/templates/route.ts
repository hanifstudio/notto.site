import { NextRequest } from "next/server";

import { TemplateService } from "@/lib/services/template.service";
import { handleApiError, ok } from "@/lib/shared/api-response";

function parseAccess(value: string | null): "free" | "plus" | undefined {
  return value === "free" || value === "plus" ? value : undefined;
}

// Public by design: the catalog is browsable by anyone. TemplateService's
// getCopySource enforces the plus gate at copy time, not at listing time.
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const page = await TemplateService.listDirectoryPage({
      query: searchParams.get("q") ?? undefined,
      access: parseAccess(searchParams.get("access")),
      category: category && category !== "all" ? category : undefined,
      cursor: searchParams.get("cursor"),
    });

    return ok(page);
  } catch (error) {
    return handleApiError(error, "GET /api/templates");
  }
}
