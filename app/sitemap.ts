import type { MetadataRoute } from "next";

import { TemplateService } from "@/lib/services/template.service";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// Templates can be published between deploys, so re-check hourly instead of
// only at build time.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const templates = await TemplateService.listDirectory();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: appUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${appUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${appUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  const templateEntries: MetadataRoute.Sitemap = templates.map((template) => ({
    url: `${appUrl}/templates/${template.slug}`,
    lastModified: new Date(template.publishedAt),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticEntries, ...templateEntries];
}
