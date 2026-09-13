// Ingest sanitized template HTML + curation metadata into the templates table.
// Unlike seed.ts (small hardcoded dev fixtures), this reads sourceHtml from disk
// per entry, so real curated HTML never gets inlined into a committed TS file —
// this is what scales to the phase-two batch of 194 templates.
//
// Usage: npm run db:ingest -- <manifest.json>
// manifest.json: array of ManifestEntry (see below). sourceHtmlPath is resolved
// relative to the manifest file's own directory.
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { db } from "../lib/db";
import { templates } from "../lib/db/schema";

type ManifestEntry = {
  slug: string;
  sourceHtmlPath: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  access: "free" | "plus";
  thumbnail: string;
  previewVideo?: string;
  previewVideoGrid?: string;
  status?: "draft" | "published";
  publishedAt?: string;
};

const manifestPath = process.argv[2];
if (!manifestPath) {
  console.error("Usage: npm run db:ingest -- <manifest.json>");
  process.exit(1);
}

const manifestDir = dirname(resolve(manifestPath));
const manifest: ManifestEntry[] = JSON.parse(readFileSync(manifestPath, "utf8"));

async function main() {
  for (const entry of manifest) {
    const sourceHtml = readFileSync(resolve(manifestDir, entry.sourceHtmlPath), "utf8");
    const status = entry.status ?? "draft";
    const values = {
      slug: entry.slug,
      title: entry.title,
      description: entry.description,
      category: entry.category,
      tags: entry.tags,
      access: entry.access,
      status,
      thumbnail: entry.thumbnail,
      previewVideo: entry.previewVideo ?? null,
      previewVideoGrid: entry.previewVideoGrid ?? null,
      sourceHtml,
      publishedAt: entry.publishedAt ? new Date(entry.publishedAt) : new Date(),
    };

    await db
      .insert(templates)
      .values(values)
      .onConflictDoUpdate({
        target: templates.slug,
        set: { ...values, updatedAt: new Date() },
      });

    console.log(`Ingested ${entry.slug} (status: ${status})`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
