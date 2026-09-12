import type { TemplateSummary } from "@/lib/catalog";
import { hasCompletedPurchase } from "@/lib/db/purchases";
import { getTemplateBySlug, listTemplateSummaries, type TemplateSummaryRow } from "@/lib/db/templates";
import { ApiError, NotFoundError } from "@/lib/shared/errors";

export class PremiumAccessRequiredError extends ApiError {
  constructor() {
    super("Lifetime All Access is required for this template.", 403, "PREMIUM_ACCESS_REQUIRED");
    this.name = "PremiumAccessRequiredError";
    Object.setPrototypeOf(this, PremiumAccessRequiredError.prototype);
  }
}

function toSummary(row: TemplateSummaryRow): TemplateSummary {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    category: row.category,
    tags: row.tags,
    access: row.access,
    thumbnail: row.thumbnail,
    publishedAt: row.publishedAt.toISOString(),
  };
}

export class TemplateService {
  static async listDirectory(): Promise<TemplateSummary[]> {
    const rows = await listTemplateSummaries();
    return rows.map(toSummary);
  }

  static async getSummaryBySlug(slug: string): Promise<TemplateSummary> {
    const template = await getTemplateBySlug(slug);
    if (!template) throw new NotFoundError("Template not found.");
    return toSummary(template);
  }

  static async getRelated(template: TemplateSummary, limit = 3): Promise<TemplateSummary[]> {
    const all = await this.listDirectory();
    const sameCategory = all.filter((candidate) => candidate.slug !== template.slug && candidate.category === template.category);
    const remaining = all.filter(
      (candidate) => candidate.slug !== template.slug && !sameCategory.some((item) => item.slug === candidate.slug),
    );
    return [...sameCategory, ...remaining].slice(0, limit);
  }

  /** Free templates are copyable by anyone. Premium templates require an authenticated user with All Access. */
  static async getCopySource(slug: string, userId: string | null): Promise<string> {
    const template = await getTemplateBySlug(slug);
    if (!template) throw new NotFoundError("Template not found.");

    if (template.access === "premium") {
      const hasAccess = userId ? await hasCompletedPurchase(userId) : false;
      if (!hasAccess) throw new PremiumAccessRequiredError();
    }

    return template.sourceHtml;
  }
}
