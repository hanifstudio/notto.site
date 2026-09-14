import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { AccessBadge } from "@/components/ui/access-badge";
import { CopyButton, type CopyStatus } from "@/components/ui/copy-button";
import { AdminTemplateMenu } from "@/features/directory/admin-template-menu";
import type { AdminActionStatus } from "@/hooks/use-template-admin";
import type { TemplateSummary } from "@/lib/catalog";

export function TemplateCard({
  template,
  entitled,
  copyStatus,
  onCopy,
  onPrefetchCopy,
  isAdmin = false,
  adminStatus = "idle",
  onSetAccess,
  onPinToTop,
}: {
  template: TemplateSummary;
  entitled: boolean;
  copyStatus: CopyStatus;
  onCopy: (template: TemplateSummary) => void;
  onPrefetchCopy: (template: TemplateSummary) => void;
  isAdmin?: boolean;
  adminStatus?: AdminActionStatus;
  onSetAccess?: (template: TemplateSummary, access: "free" | "plus") => void;
  onPinToTop?: (template: TemplateSummary) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <article
      className="template-card"
      onMouseEnter={() => {
        videoRef.current?.play().catch(() => {});
        onPrefetchCopy(template);
      }}
      onMouseLeave={() => {
        const video = videoRef.current;
        if (!video) return;
        video.pause();
        video.currentTime = 0;
      }}
    >
      <div className="thumbnail-wrap">
        <Image
          src={template.thumbnail}
          alt={`${template.title} — ${template.category} template preview`}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
        />
        {template.previewVideoGrid ?? template.previewVideo ? (
          <video
            ref={videoRef}
            src={template.previewVideoGrid ?? template.previewVideo}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
          />
        ) : null}
        <div className="thumbnail-actions">
          <CopyButton
            locked={template.access === "plus" && !entitled}
            status={copyStatus}
            onClick={() => onCopy(template)}
          />
          {isAdmin ? (
            <AdminTemplateMenu
              template={template}
              pending={adminStatus === "pending"}
              onSetAccess={(access) => onSetAccess?.(template, access)}
              onPinToTop={() => onPinToTop?.(template)}
            />
          ) : null}
        </div>
      </div>
      <div className="card-body">
        <div className="card-title-row">
          <h2>{template.title}</h2>
          <AccessBadge access={template.access} entitled={template.access === "plus" && entitled} />
        </div>
        <p>{template.category}</p>
      </div>
      <Link className="card-link" href={`/templates/${template.slug}`} aria-label={`View ${template.title} template`} />
    </article>
  );
}
