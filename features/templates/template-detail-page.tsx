"use client";

import Image from "next/image";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { AccessBadge } from "@/components/ui/access-badge";
import { CopyButton } from "@/components/ui/copy-button";
import { Toast } from "@/components/ui/toast";
import { AccessOffer } from "@/features/access/access-offer";
import { useAuth } from "@/features/auth/auth-provider";
import { RelatedCard } from "@/features/templates/related-card";
import { useTemplateCopy } from "@/hooks/use-template-copy";
import type { TemplateSummary } from "@/lib/catalog";

export function TemplateDetailPage({
  template,
  related,
}: {
  template: TemplateSummary;
  related: TemplateSummary[];
}) {
  const { session } = useAuth();
  const [offerOpen, setOfferOpen] = useState(false);
  const copy = useTemplateCopy({ onAccessRequired: () => setOfferOpen(true) });
  const entitled = template.access === "premium" && session?.entitlement === "active";
  const locked = template.access === "premium" && !entitled;
  const status = copy.statusFor(template.slug);

  return (
    <PageShell back={{ label: "All templates", href: "/" }}>
      <section className="template-detail">
        <div className="detail-preview">
          <Image
            src={template.thumbnail}
            alt={`${template.title} — ${template.category} template preview`}
            fill
            priority
            sizes="(min-width: 900px) 66vw, 100vw"
          />
        </div>
        <div className="detail-copy">
          <div className="detail-meta"><AccessBadge access={template.access} entitled={entitled} /><span>{template.category}</span></div>
          <h1>{template.title}</h1>
          <p className="detail-description">{template.description}</p>
          <div className="tag-list" aria-label="Template tags">
            {template.tags.map((tag) => <span key={tag}>{tag}</span>)}
          </div>
          <div className="detail-action">
            <CopyButton status={status} locked={locked} detailed onClick={() => copy.copy(template)} />
            <p><Sparkles aria-hidden="true" />Paste the HTML into your coding agent and describe what you want to change.</p>
          </div>
          {locked ? (
            <div className="access-note"><strong>Premium template</strong><p>Included in Lifetime All Access — $12 once, not a subscription. Free templates stay copyable without an account.</p></div>
          ) : entitled ? (
            <div className="access-note access-note--success">Unlocked with your Lifetime All Access.</div>
          ) : null}
          {status === "error" ? (
            <p className="copy-error" role="alert">Your browser blocked clipboard access. Try again, or allow clipboard permissions for this site.</p>
          ) : null}
        </div>
      </section>
      <section className="related-section" aria-labelledby="related-heading">
        <h2 id="related-heading">Related templates</h2>
        <div className="related-grid">{related.map((item) => <RelatedCard key={item.slug} template={item} />)}</div>
      </section>
      <AccessOffer
        open={offerOpen}
        templateTitle={template.title}
        returnTo={`/templates/${template.slug}`}
        onDismiss={() => setOfferOpen(false)}
      />
      <Toast toast={copy.toast} onDismiss={copy.dismissToast} />
    </PageShell>
  );
}
