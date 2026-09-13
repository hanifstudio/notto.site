"use client";

import { useEffect, useRef, useState } from "react";
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
import { useDirectoryFilters } from "@/features/directory/use-directory-filters";
import { useTemplateCopy } from "@/hooks/use-template-copy";
import { track } from "@/lib/client/analytics";
import { useTemplates, type TemplatesPage } from "@/lib/hooks/use-templates";
import { LIFETIME_PRICE } from "@/lib/catalog";
import type { AccessFilter, TemplateSummary } from "@/lib/catalog";

export function DirectoryPage({
  initialPage,
  initialQuery = "",
  initialAccess = "all",
  initialCategory = "all",
  initialView = "ready",
}: {
  initialPage: TemplatesPage;
  initialQuery?: string;
  initialAccess?: AccessFilter;
  initialCategory?: string;
  initialView?: "ready" | "loading" | "error";
}) {
  const { session } = useAuth();
  const [view, setView] = useState(initialView);
  const [offerTemplate, setOfferTemplate] = useState<TemplateSummary | null>(null);
  const [offerOpen, setOfferOpen] = useState(false);
  const filters = useDirectoryFilters({
    query: initialQuery,
    access: initialAccess,
    category: initialCategory,
  });
  const templatesQuery = useTemplates(
    { query: filters.debouncedQuery, access: filters.access, category: filters.category },
    { initialPage, initialFilters: { query: initialQuery, access: initialAccess, category: initialCategory } },
  );
  const copy = useTemplateCopy({
    onAccessRequired(template) {
      setOfferTemplate(template);
      setOfferOpen(true);
    },
  });
  const entitled = session?.entitlement === "active";

  const loadedTemplates = templatesQuery.data?.pages.flatMap((page) => page.templates) ?? [];
  const total = templatesQuery.data?.pages[0]?.total ?? 0;
  const effectiveView =
    view !== "ready" ? view : templatesQuery.isPending ? "loading" : templatesQuery.isError ? "error" : "ready";

  // Fires once per distinct filter combo that comes back empty, not on every
  // re-render while that combo stays active.
  const trackedEmptyFilters = useRef<string | null>(null);
  useEffect(() => {
    if (effectiveView !== "ready" || total !== 0 || !filters.filtersActive) {
      trackedEmptyFilters.current = null;
      return;
    }
    const key = `${filters.debouncedQuery}|${filters.access}|${filters.category}`;
    if (trackedEmptyFilters.current === key) return;
    trackedEmptyFilters.current = key;
    track("filter_no_results", { query: filters.debouncedQuery, access: filters.access, category: filters.category });
  }, [effectiveView, total, filters.filtersActive, filters.debouncedQuery, filters.access, filters.category]);

  return (
    <div className="app-shell">
      <SiteHeader />
      <main>
        <section className="masthead" aria-labelledby="directory-intro">
          <div className="masthead-copy">
            <h1 id="directory-intro">Distinctive, complete HTML pages for your next build. Copy one and make it yours with any coding agent.</h1>
            <div className="stats" aria-label="Catalogue summary">
              <span>{total} curated {total === 1 ? "page" : "pages"}</span>
            </div>
          </div>
          {!entitled ? (
            <div className="offer-card">
              <div><strong>Lifetime All Access</strong><span>{`$${LIFETIME_PRICE} one time · not a subscription`}</span></div>
              <button
                className={buttonClass("primary")}
                type="button"
                onClick={() => {
                  setOfferTemplate(null);
                  setOfferOpen(true);
                }}
              >
                <span className="desktop-offer-label">Get all access</span>
                <span className="mobile-offer-label">{`Get all access — $${LIFETIME_PRICE}`}</span>
              </button>
              <p>One payment, not a subscription. Free pages copy without an account.</p>
            </div>
          ) : (
            <div className="entitled-summary"><strong>Lifetime All Access</strong><span>Every plus template is unlocked.</span></div>
          )}
        </section>

        <DirectoryFilters
          query={filters.query}
          onQueryChange={filters.setQuery}
          access={filters.access}
          onAccessChange={filters.setAccess}
          category={filters.category}
          onCategoryChange={filters.setCategory}
          resultCount={total}
          filtersActive={filters.filtersActive}
          onClear={filters.clear}
        />

        <section className="results" aria-label="Template results">
          {effectiveView === "loading" ? <DirectorySkeleton />
            : effectiveView === "error" ? (
              <DirectoryLoadFailure
                onRetry={() => {
                  setView("ready");
                  void templatesQuery.refetch();
                }}
              />
            )
              : total === 0 ? <DirectoryEmptyState onClear={filters.clear} />
                : (
                  <>
                    <div className="template-grid">
                      {loadedTemplates.map((template) => (
                        <TemplateCard
                          key={template.slug}
                          template={template}
                          entitled={entitled}
                          copyStatus={copy.statusFor(template.slug)}
                          onCopy={(t) => copy.copy(t, "card")}
                          onPrefetchCopy={copy.prefetch}
                        />
                      ))}
                    </div>
                    {templatesQuery.hasNextPage ? (
                      <div className="load-more">
                        <button
                          className={buttonClass("secondary")}
                          type="button"
                          onClick={() => templatesQuery.fetchNextPage()}
                          disabled={templatesQuery.isFetchingNextPage}
                        >
                          {templatesQuery.isFetchingNextPage ? "Loading…" : "Load more"}
                        </button>
                      </div>
                    ) : null}
                  </>
                )}
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
