import { desc, eq } from "drizzle-orm";

import { db } from "./index";
import { templates } from "./schema";

export type Template = typeof templates.$inferSelect;
export type TemplateSummaryRow = Omit<Template, "sourceHtml">;

const summaryColumns = {
  slug: templates.slug,
  title: templates.title,
  description: templates.description,
  category: templates.category,
  tags: templates.tags,
  access: templates.access,
  thumbnail: templates.thumbnail,
  publishedAt: templates.publishedAt,
  createdAt: templates.createdAt,
  updatedAt: templates.updatedAt,
} as const;

export async function listTemplateSummaries(): Promise<TemplateSummaryRow[]> {
  return db.select(summaryColumns).from(templates).orderBy(desc(templates.publishedAt));
}

export async function getTemplateBySlug(slug: string): Promise<Template | undefined> {
  const [template] = await db.select().from(templates).where(eq(templates.slug, slug)).limit(1);
  return template;
}
