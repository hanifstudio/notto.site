"use client";

import { useEffect, useState } from "react";
import type { AccessFilter } from "@/lib/catalog";

const SEARCH_DEBOUNCE_MS = 300;

/**
 * Filter state + URL sync only — filtering itself happens server-side (see
 * useTemplates). `query` updates instantly for a responsive input; the
 * debounced value is what drives the URL and the API request, so fast typing
 * doesn't fire a request per keystroke.
 */
export function useDirectoryFilters(initial: { query: string; access: AccessFilter; category: string }) {
  const [query, setQuery] = useState(initial.query);
  const [debouncedQuery, setDebouncedQuery] = useState(initial.query);
  const [access, setAccess] = useState<AccessFilter>(initial.access);
  const [category, setCategory] = useState(initial.category);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery.trim()) params.set("q", debouncedQuery.trim());
    if (access !== "all") params.set("access", access);
    if (category !== "all") params.set("category", category);
    window.history.replaceState(null, "", params.size ? `?${params}` : window.location.pathname);
  }, [access, category, debouncedQuery]);

  function clear() {
    setQuery("");
    setDebouncedQuery("");
    setAccess("all");
    setCategory("all");
  }

  return {
    query,
    setQuery,
    debouncedQuery,
    access,
    setAccess,
    category,
    setCategory,
    filtersActive: Boolean(query.trim() || access !== "all" || category !== "all"),
    clear,
  };
}
