import { DIRECTORY_PAGE_SIZE, type TemplateSummary } from "@/lib/catalog";
import { hasCompletedPurchase } from "@/lib/db/purchases";
import {
  countTemplateSummaries,
  getTemplateBySlug,
  listTemplateSummaries,
  listTemplateSummariesPage,
  type TemplateListCursor,
  type TemplateListFilters,
  type TemplateSummaryRow,
} from "@/lib/db/templates";
import { ApiError, NotFoundError } from "@/lib/shared/errors";

export type TemplateDirectoryPage = {
  templates: TemplateSummary[];
  nextCursor: string | null;
  total: number;
};

function encodeCursor(row: TemplateSummaryRow): string {
  return Buffer.from(JSON.stringify({ p: row.publishedAt.toISOString(), s: row.slug })).toString("base64url");
}

function decodeCursor(raw: string | null | undefined): TemplateListCursor | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
    if (typeof parsed.p !== "string" || typeof parsed.s !== "string") return null;
    return { publishedAt: new Date(parsed.p), slug: parsed.s };
  } catch {
    return null;
  }
}

export class PlusAccessRequiredError extends ApiError {
  constructor() {
    super("Lifetime All Access is required for this template.", 403, "PLUS_ACCESS_REQUIRED");
    this.name = "PlusAccessRequiredError";
    Object.setPrototypeOf(this, PlusAccessRequiredError.prototype);
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
    previewVideo: row.previewVideo ?? undefined,
    previewVideoGrid: row.previewVideoGrid ?? undefined,
    publishedAt: row.publishedAt.toISOString(),
  };
}

export class TemplateService {
  static async listDirectory(): Promise<TemplateSummary[]> {
    const rows = await listTemplateSummaries();
    return rows.map(toSummary);
  }

  /** Keyset-paginated, filtered listing for the interactive directory — the DB does the filtering/sorting/limiting, not the client. */
  static async listDirectoryPage(params: {
    query?: string;
    access?: "free" | "plus";
    category?: string;
    cursor?: string | null;
  }): Promise<TemplateDirectoryPage> {
    const filters: TemplateListFilters = {
      query: params.query,
      access: params.access,
      category: params.category,
    };
    const cursor = decodeCursor(params.cursor);

    const [rows, total] = await Promise.all([
      listTemplateSummariesPage(filters, cursor, DIRECTORY_PAGE_SIZE + 1),
      countTemplateSummaries(filters),
    ]);

    const hasMore = rows.length > DIRECTORY_PAGE_SIZE;
    const page = rows.slice(0, DIRECTORY_PAGE_SIZE);

    return {
      templates: page.map(toSummary),
      nextCursor: hasMore ? encodeCursor(page[page.length - 1]) : null,
      total,
    };
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

  /** Free templates are copyable by anyone. Plus templates require an authenticated user with All Access. */
  static async getCopySource(slug: string, userId: string | null): Promise<string> {
    const template = await getTemplateBySlug(slug);
    if (!template) throw new NotFoundError("Template not found.");

    if (template.access === "plus") {
      const hasAccess = userId ? await hasCompletedPurchase(userId) : false;
      if (!hasAccess) throw new PlusAccessRequiredError();
    }

    return template.sourceHtml;
  }
}
