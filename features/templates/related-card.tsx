import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AccessBadge } from "@/components/ui/access-badge";
import type { TemplateSummary } from "@/lib/catalog";

export function RelatedCard({ template }: { template: TemplateSummary }) {
  return (
    <Link className="related-card" href={`/templates/${template.slug}`}>
      <span className="related-thumb">
        <Image src={template.thumbnail} alt="" fill sizes="104px" />
      </span>
      <span className="related-copy">
        <strong>{template.title}</strong>
        <span>{template.category}<AccessBadge access={template.access} /></span>
      </span>
      <ArrowUpRight aria-hidden="true" />
    </Link>
  );
}
