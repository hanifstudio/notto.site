"use client";

import { useEffect, useMemo, useState } from "react";
import type { AccessLevel, TemplateSummary } from "@/lib/catalog";

export type AccessFilter = "all" | AccessLevel;

export function useDirectoryFilters(
  templates: TemplateSummary[],
  initial: { query: string; access: AccessFilter; category: string },
) {
  const [query, setQuery] = useState(initial.query);
  const [access, setAccess] = useState<AccessFilter>(initial.access);
  const [category, setCategory] = useState(initial.category);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (access !== "all") params.set("access", access);
    if (category !== "all") params.set("category", category);
    window.history.replaceState(null, "", params.size ? `?${params}` : window.location.pathname);
  }, [access, category, query]);

  const filteredTemplates = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return templates.filter((template) => {
      const searchable = [template.title, template.description, template.category, ...template.tags]
        .join(" ")
        .toLocaleLowerCase();
      return (
        (access === "all" || template.access === access) &&
        (category === "all" || template.category === category) &&
        (!needle || searchable.includes(needle))
      );
    });
  }, [access, category, query, templates]);

  function clear() {
    setQuery("");
    setAccess("all");
    setCategory("all");
  }

  return {
    query,
    setQuery,
    access,
    setAccess,
    category,
    setCategory,
    filteredTemplates,
    filtersActive: Boolean(query.trim() || access !== "all" || category !== "all"),
    clear,
  };
}
