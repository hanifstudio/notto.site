"use client";

import { useState } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { buttonClass } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { AccessOffer } from "@/features/access/access-offer";
import { useAuth } from "@/features/auth/auth-provider";
import { DirectoryEmptyState } from "@/features/directory/directory-empty-state";
import { DirectoryFilters } from "@/features/directory/directory-filters";
import { DirectoryLoadFailure, DirectorySkeleton } from "@/features/directory/directory-status";
import { TemplateCard } from "@/features/directory/template-card";
import { type AccessFilter, useDirectoryFilters } from "@/features/directory/use-directory-filters";
import { useTemplateCopy } from "@/hooks/use-template-copy";
import type { TemplateSummary } from "@/lib/catalog";

export function DirectoryPage({
  templates,
  initialQuery = "",
  initialAccess = "all",
  initialCategory = "all",
  initialView = "ready",
}: {
  templates: TemplateSummary[];
  initialQuery?: string;
  initialAccess?: AccessFilter;
  initialCategory?: string;
  initialView?: "ready" | "loading" | "error";
}) {
  const { session } = useAuth();
  const [view, setView] = useState(initialView);
  const [offerTemplate, setOfferTemplate] = useState<TemplateSummary | null>(null);
  const [offerOpen, setOfferOpen] = useState(false);
  const filters = useDirectoryFilters(templates, {
    query: initialQuery,
    access: initialAccess,
    category: initialCategory,
  });
  const copy = useTemplateCopy({
    onAccessRequired(template) {
      setOfferTemplate(template);
      setOfferOpen(true);
    },
  });
  const entitled = session?.entitlement === "active";

  return (
    <div className="app-shell">
      <SiteHeader />
      <main>
        <section className="masthead" aria-labelledby="directory-intro">
          <div className="masthead-copy">
            <h1 id="directory-intro">Distinctive, complete HTML pages for your next build. Copy one and make it yours with any coding agent.</h1>
            <div className="stats" aria-label="Catalogue summary">
              <span>20 curated pages</span><i aria-hidden="true" /><span>10 free</span><i aria-hidden="true" /><span>Newest first</span>
            </div>
          </div>
          {!entitled ? (
            <div className="offer-card">
              <div><strong>Lifetime All Access</strong><span>$12 one time · not a subscription</span></div>
              <button
                className={buttonClass("primary")}
                type="button"
                onClick={() => {
                  setOfferTemplate(null);
                  setOfferOpen(true);
                }}
              >
                <span className="desktop-offer-label">Get all access</span>
                <span className="mobile-offer-label">Get all access — $12</span>
              </button>
              <p>One payment, not a subscription. Free pages copy without an account.</p>
            </div>
          ) : (
            <div className="entitled-summary"><strong>Lifetime All Access</strong><span>Every premium template is unlocked.</span></div>
          )}
        </section>

        <DirectoryFilters
          query={filters.query}
          onQueryChange={filters.setQuery}
          access={filters.access}
          onAccessChange={filters.setAccess}
          category={filters.category}
          onCategoryChange={filters.setCategory}
          resultCount={filters.filteredTemplates.length}
          filtersActive={filters.filtersActive}
          onClear={filters.clear}
        />

        <section className="results" aria-label="Template results">
          {view === "loading" ? <DirectorySkeleton />
            : view === "error" ? <DirectoryLoadFailure onRetry={() => setView("ready")} />
              : filters.filteredTemplates.length ? (
                <div className="template-grid">
                  {filters.filteredTemplates.map((template) => (
                    <TemplateCard
                      key={template.slug}
                      template={template}
                      entitled={entitled}
                      copyStatus={copy.statusFor(template.slug)}
                      onCopy={copy.copy}
                    />
                  ))}
                </div>
              ) : <DirectoryEmptyState onClear={filters.clear} />}
        </section>
      </main>
      <SiteFooter />
      <AccessOffer
        open={offerOpen}
        templateTitle={offerTemplate?.title}
        returnTo={offerTemplate ? `/templates/${offerTemplate.slug}` : "/"}
        onDismiss={() => setOfferOpen(false)}
      />
      <Toast toast={copy.toast} onDismiss={copy.dismissToast} />
    </div>
  );
}
