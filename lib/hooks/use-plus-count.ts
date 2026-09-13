"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/client/api-fetch";

type TemplatesPage = { total: number };

async function fetchPlusCount(): Promise<number> {
  const page = await apiFetch<TemplatesPage>("/api/templates?access=plus");
  return page.total;
}

/**
 * Wraps /api/templates in React Query for the "N templates, all yours" count
 * in the access-offer dialog — that dialog mounts from three different pages
 * (directory, account, template detail), so caching this genuinely saves
 * requests instead of each instance re-fetching the same number.
 */
export function usePlusCount(enabled: boolean) {
  return useQuery({
    queryKey: ["templates", "plus-count"],
    queryFn: fetchPlusCount,
    enabled,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}
