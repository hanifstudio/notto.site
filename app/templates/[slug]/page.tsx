import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TemplateDetailPage } from "@/features/templates/template-detail-page";
import { TemplateService } from "@/lib/services/template.service";
import { NotFoundError } from "@/lib/shared/errors";

export const revalidate = 300;

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

  return <TemplateDetailPage template={data.template} related={data.related} />;
}
