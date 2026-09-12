import Image from "next/image";
import Link from "next/link";
import { AccessBadge } from "@/components/ui/access-badge";
import { CopyButton, type CopyStatus } from "@/components/ui/copy-button";
import type { TemplateSummary } from "@/lib/catalog";

export function TemplateCard({
  template,
  entitled,
  copyStatus,
  onCopy,
}: {
  template: TemplateSummary;
  entitled: boolean;
  copyStatus: CopyStatus;
  onCopy: (template: TemplateSummary) => void;
}) {
  return (
    <article className="template-card">
      <div className="thumbnail-wrap">
        <Image
          src={template.thumbnail}
          alt={`${template.title} — ${template.category} template preview`}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
        />
        <CopyButton
          locked={template.access === "premium" && !entitled}
          status={copyStatus}
          onClick={() => onCopy(template)}
        />
      </div>
      <div className="card-body">
        <div className="card-title-row">
          <h2>{template.title}</h2>
          <AccessBadge access={template.access} entitled={template.access === "premium" && entitled} />
        </div>
        <p>{template.category}</p>
      </div>
      <Link className="card-link" href={`/templates/${template.slug}`} aria-label={`View ${template.title} template`} />
    </article>
  );
}
