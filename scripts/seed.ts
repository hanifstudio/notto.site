// Run via `npm run db:seed`, which loads .env.local before invoking this script.
import { db } from "../lib/db";
import { templates } from "../lib/db/schema";

type TemplateFixture = Omit<typeof templates.$inferInsert, "sourceHtml">;

// Same fixture set that used to live in lib/catalog.ts. sourceHtml is a
// placeholder — swap in the real curated HTML before launch.
const fixtures: TemplateFixture[] = [
  {
    slug: "signal-foundry",
    title: "Signal Foundry",
    description: "A technical product page for teams shipping practical AI infrastructure.",
    category: "AI & SaaS",
    tags: ["Product", "Technical", "Dark"],
    access: "free",
    thumbnail: "/thumbnails/signal-foundry.webp",
    publishedAt: new Date("2026-09-12"),
  },
  {
    slug: "northline-studio",
    title: "Northline Studio",
    description: "A warm editorial homepage for an independent creative studio.",
    category: "Agency & Studio",
    tags: ["Editorial", "Serif", "Minimal"],
    access: "premium",
    thumbnail: "/thumbnails/northline-studio.webp",
    publishedAt: new Date("2026-09-11"),
  },
  {
    slug: "index-01",
    title: "Index/01",
    description: "A typographic index for selected projects and independent work.",
    category: "Portfolio",
    tags: ["Monochrome", "Typography", "Editorial"],
    access: "free",
    thumbnail: "/thumbnails/index-01.webp",
    publishedAt: new Date("2026-09-10"),
  },
  {
    slug: "still-house",
    title: "Still House",
    description: "A quiet, image-led presentation for architectural work and interiors.",
    category: "Architecture & Interiors",
    tags: ["Minimal", "Neutral", "Gallery"],
    access: "premium",
    thumbnail: "/thumbnails/still-house.webp",
    publishedAt: new Date("2026-09-09"),
  },
  {
    slug: "mono-supply",
    title: "Mono Supply",
    description: "A precise storefront for considered objects and everyday essentials.",
    category: "E-commerce",
    tags: ["Shop", "Grid", "Minimal"],
    access: "premium",
    thumbnail: "/thumbnails/mono-supply.webp",
    publishedAt: new Date("2026-09-08"),
  },
  {
    slug: "ledger-field",
    title: "Ledger Field",
    description: "A calm finance homepage that puts useful numbers ahead of noise.",
    category: "Finance",
    tags: ["Data", "Product", "Dark"],
    access: "free",
    thumbnail: "/thumbnails/ledger-field.webp",
    publishedAt: new Date("2026-09-07"),
  },
  {
    slug: "dune-house",
    title: "Dune House",
    description: "A sun-washed booking page for an intimate coastal destination.",
    category: "Hospitality & Travel",
    tags: ["Travel", "Editorial", "Warm"],
    access: "premium",
    thumbnail: "/thumbnails/dune-house.webp",
    publishedAt: new Date("2026-09-06"),
  },
  {
    slug: "soft-practice",
    title: "Soft Practice",
    description: "A friendly wellness page with a composed, restorative visual rhythm.",
    category: "Wellness",
    tags: ["Health", "Soft", "Service"],
    access: "free",
    thumbnail: "/thumbnails/soft-practice.webp",
    publishedAt: new Date("2026-09-05"),
  },
];

const seedTemplates: (typeof templates.$inferInsert)[] = fixtures.map((template) => ({
  ...template,
  sourceHtml: `<!doctype html>\n<!-- ${template.title} placeholder source; replace with the curated HTML before launch. -->`,
}));

async function main() {
  for (const template of seedTemplates) {
    await db
      .insert(templates)
      .values(template)
      .onConflictDoUpdate({ target: templates.slug, set: template });
  }
  console.log(`Seeded ${seedTemplates.length} templates.`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
