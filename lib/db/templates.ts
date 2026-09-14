import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "./index";
import { templates } from "./schema";

export type Template = typeof templates.$inferSelect;
export type TemplateSummaryRow = Omit<Template, "sourceHtml">;

export type TemplateListFilters = {
  access?: "free" | "plus";
  category?: string;
  query?: string;
};

export type TemplateListCursor = { publishedAt: Date; slug: string };

const summaryColumns = {
  slug: templates.slug,
  title: templates.title,
  description: templates.description,
  category: templates.category,
  tags: templates.tags,
  access: templates.access,
  status: templates.status,
  thumbnail: templates.thumbnail,
  previewVideo: templates.previewVideo,
  previewVideoGrid: templates.previewVideoGrid,
  publishedAt: templates.publishedAt,
  createdAt: templates.createdAt,
  updatedAt: templates.updatedAt,
} as const;

function escapeLikePattern(value: string) {
  return value.replace(/[%_\\]/g, (char) => `\\${char}`);
}

function buildFilterConditions(filters: TemplateListFilters) {
  const conditions = [eq(templates.status, "published")];

  if (filters.access) conditions.push(eq(templates.access, filters.access));
  if (filters.category) conditions.push(eq(templates.category, filters.category));

  const needle = filters.query?.trim();
  if (needle) {
    const pattern = `%${escapeLikePattern(needle)}%`;
    conditions.push(
      sql`(${templates.title} ILIKE ${pattern} OR ${templates.description} ILIKE ${pattern} OR ${templates.category} ILIKE ${pattern} OR ${templates.tags}::text ILIKE ${pattern})`,
    );
  }

  return conditions;
}

export async function listTemplateSummaries(): Promise<TemplateSummaryRow[]> {
  return db
    .select(summaryColumns)
    .from(templates)
    .where(eq(templates.status, "published"))
    .orderBy(desc(templates.publishedAt));
}

/** Keyset pagination ordered by (published_at, slug) desc — stable across concurrent inserts, cheap at any catalog size. */
export async function listTemplateSummariesPage(
  filters: TemplateListFilters,
  cursor: TemplateListCursor | null,
  limit: number,
): Promise<TemplateSummaryRow[]> {
  const conditions = buildFilterConditions(filters);
  if (cursor) {
    conditions.push(
      sql`(${templates.publishedAt}, ${templates.slug}) < (${cursor.publishedAt.toISOString()}::timestamptz, ${cursor.slug})`,
    );
  }

  return db
    .select(summaryColumns)
    .from(templates)
    .where(and(...conditions))
    .orderBy(desc(templates.publishedAt), desc(templates.slug))
    .limit(limit);
}

export async function countTemplateSummaries(filters: TemplateListFilters): Promise<number> {
  const [row] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(templates)
    .where(and(...buildFilterConditions(filters)));
  return row?.total ?? 0;
}

export async function getTemplateBySlug(slug: string): Promise<Template | undefined> {
  const [template] = await db
    .select()
    .from(templates)
    .where(and(eq(templates.slug, slug), eq(templates.status, "published")))
    .limit(1);
  return template;
}

export async function updateTemplateAccess(slug: string, access: "free" | "plus"): Promise<Template | undefined> {
  const [template] = await db
    .update(templates)
    .set({ access, updatedAt: new Date() })
    .where(eq(templates.slug, slug))
    .returning();
  return template;
}

/** Bumps published_at to now — the directory's sort key — so the template sorts first without a dedicated "pinned" column/index. */
export async function bumpTemplateToFront(slug: string): Promise<Template | undefined> {
  const now = new Date();
  const [template] = await db
    .update(templates)
    .set({ publishedAt: now, updatedAt: now })
    .where(eq(templates.slug, slug))
    .returning();
  return template;
}
