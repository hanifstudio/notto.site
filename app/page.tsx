import { DirectoryPage } from "@/features/directory/directory-page";
import { categoryOptions } from "@/lib/catalog";
import { TemplateService } from "@/lib/services/template.service";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function single(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export const revalidate = 300;

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const requestedAccess = single(params.access);
  const initialAccess =
    requestedAccess === "free" || requestedAccess === "premium" ? requestedAccess : "all";
  const requestedCategory = single(params.category);
  const initialCategory = categoryOptions.some((item) => item.value === requestedCategory)
    ? requestedCategory
    : "all";

  const requestedView = single(params.view);
  const initialView = requestedView === "loading" || requestedView === "error" ? requestedView : "ready";

  const templates = await TemplateService.listDirectory();

  return (
    <DirectoryPage
      templates={templates}
      initialView={initialView}
      initialQuery={single(params.q)}
      initialAccess={initialAccess}
      initialCategory={initialCategory}
    />
  );
}
