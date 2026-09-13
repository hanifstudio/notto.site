"use client";

import Image from "next/image";
import { Flame } from "lucide-react";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { AccessBadge } from "@/components/ui/access-badge";
import { AgentStack } from "@/components/ui/agent-stack";
import { CopyButton } from "@/components/ui/copy-button";
import { Toast } from "@/components/ui/toast";
import { AccessOffer } from "@/features/access/access-offer";
import { useAuth } from "@/features/auth/auth-provider";
import { RelatedCard } from "@/features/templates/related-card";
import { useTemplateCopy } from "@/hooks/use-template-copy";
import { LIFETIME_PRICE, LIFETIME_PRICE_NEXT, LIFETIME_SLOTS_LEFT, type TemplateSummary } from "@/lib/catalog";

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
  const entitled = template.access === "plus" && session?.entitlement === "active";
  const locked = template.access === "plus" && !entitled;
  const status = copy.statusFor(template.slug);

  useEffect(() => {
    copy.prefetch(template);
    // Only re-run when the viewed template or the viewer's entitlement changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template.slug, session?.entitlement]);

  return (
    <PageShell back={{ label: "All templates", href: "/" }}>
      <section className="template-detail">
        <div className="detail-preview">
          {template.previewVideo ? (
            <video
              src={template.previewVideo}
              poster={template.thumbnail}
              aria-label={`${template.title} — ${template.category} template preview`}
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <Image
              src={template.thumbnail}
              alt={`${template.title} — ${template.category} template preview`}
              fill
              priority
              sizes="(min-width: 900px) 66vw, 100vw"
            />
          )}
        </div>
        <div className="detail-copy">
          <div className="detail-meta"><AccessBadge access={template.access} entitled={entitled} /><span>{template.category}</span></div>
          <h1>{template.title}</h1>
          <p className="detail-description">{template.description}</p>
          <div className="tag-list" aria-label="Template tags">
            {template.tags.map((tag) => <span key={tag}>{tag}</span>)}
          </div>
          <div className="detail-action">
            <div className="agent-stack-row">
              <span>Works with</span>
              <AgentStack />
            </div>
            <CopyButton status={status} locked={locked} detailed onClick={() => copy.copy(template, "detail")} />
            {locked ? (
              <p className="urgency-line">
                <Flame aria-hidden="true" />
                <span><strong>{LIFETIME_SLOTS_LEFT} lifetime spots</strong> left at <span className="price-highlight">${LIFETIME_PRICE}</span> — then <s>${LIFETIME_PRICE_NEXT}</s>.</span>
              </p>
            ) : null}
            {locked ? (
              <p className="detail-fineprint">Pay once. Yours for life — no subscription.</p>
            ) : entitled ? (
              <p className="detail-fineprint detail-fineprint--success">Unlocked with your Lifetime All Access.</p>
            ) : null}
            {status === "error" ? (
              <p className="copy-error" role="alert">Your browser blocked clipboard access. Try again, or allow clipboard permissions for this site.</p>
            ) : null}
          </div>
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
