import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TemplateDetailPage } from "@/features/templates/template-detail-page";
import { TemplateService } from "@/lib/services/template.service";
import { NotFoundError } from "@/lib/shared/errors";
import type { TemplateSummary } from "@/lib/catalog";

export const revalidate = 300;

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function templateJsonLd(template: TemplateSummary) {
  const templateUrl = `${appUrl}/templates/${template.slug}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        "@id": `${templateUrl}#template`,
        name: template.title,
        description: template.description,
        image: template.thumbnail,
        url: templateUrl,
        genre: template.category,
        keywords: template.tags.join(", "),
        isAccessibleForFree: template.access === "free",
        datePublished: template.publishedAt,
        creator: { "@id": `${appUrl}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Notto", item: appUrl },
          {
            "@type": "ListItem",
            position: 2,
            name: template.category,
            item: `${appUrl}/?category=${encodeURIComponent(template.category)}`,
          },
          { "@type": "ListItem", position: 3, name: template.title, item: templateUrl },
        ],
      },
    ],
  };
}

export async function generateStaticParams() {
  const templates = await TemplateService.listDirectory();
  return templates.map((template) => ({ slug: template.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const template = await TemplateService.getSummaryBySlug(slug);
    const title = `${template.title} — Copyable HTML template`;
    return {
      title,
      description: template.description,
      alternates: { canonical: `/templates/${template.slug}` },
      openGraph: {
        type: "article",
        title,
        description: template.description,
        images: [{ url: template.thumbnail }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description: template.description,
        images: [template.thumbnail],
      },
    };
  } catch {
    return {};
  }
}

async function loadTemplate(slug: string) {
  try {
    const template = await TemplateService.getSummaryBySlug(slug);
    const related = await TemplateService.getRelated(template);
    return { template, related };
  } catch (error) {
    if (error instanceof NotFoundError) return null;
    throw error;
  }
}

export default async function TemplatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await loadTemplate(slug);
  if (!data) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(templateJsonLd(data.template)).replace(/</g, "\\u003c"),
        }}
      />
      <TemplateDetailPage template={data.template} related={data.related} />
    </>
  );
}
