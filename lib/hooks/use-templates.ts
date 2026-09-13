"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/client/api-fetch";
import type { AccessFilter, TemplateSummary } from "@/lib/catalog";

export type TemplatesPage = {
  templates: TemplateSummary[];
  nextCursor: string | null;
  total: number;
};

export type TemplatesFilters = { query: string; access: AccessFilter; category: string };

function buildPath({ query, access, category }: TemplatesFilters, cursor: string | null) {
  const params = new URLSearchParams();
  if (query.trim()) params.set("q", query.trim());
  if (access !== "all") params.set("access", access);
  if (category !== "all") params.set("category", category);
  if (cursor) params.set("cursor", cursor);
  const qs = params.toString();
  return qs ? `/api/templates?${qs}` : "/api/templates";
}

function sameFilters(a: TemplatesFilters, b: TemplatesFilters) {
  return a.query === b.query && a.access === b.access && a.category === b.category;
}

/**
 * Keyset-paginated directory listing — the DB filters/sorts/limits, the
 * client just asks for the next page. React Query dedupes and caches pages
 * per filter combination, so flipping between filters (or "Load more")
 * never refetches data already in hand.
 *
 * `initialPage`/`initialFilters` seed the query with the server-rendered
 * first page so the very first paint doesn't re-fetch what SSR already has;
 * it only applies while the visitor hasn't changed filters away from the
 * ones the page was rendered with.
 */
export function useTemplates(
  filters: TemplatesFilters,
  seed?: { initialPage: TemplatesPage; initialFilters: TemplatesFilters },
) {
  const canUseSeed = Boolean(seed && sameFilters(filters, seed.initialFilters));

  return useInfiniteQuery({
    queryKey: ["templates", filters],
    queryFn: ({ pageParam }) => apiFetch<TemplatesPage>(buildPath(filters, pageParam)),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialData: canUseSeed ? { pages: [seed!.initialPage], pageParams: [null] } : undefined,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}
