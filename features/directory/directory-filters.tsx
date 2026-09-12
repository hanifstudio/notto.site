import { Check, Search, X } from "lucide-react";
import { categoryOptions } from "@/lib/catalog";
import type { AccessFilter } from "@/features/directory/use-directory-filters";

export function DirectoryFilters({
  query,
  onQueryChange,
  access,
  onAccessChange,
  category,
  onCategoryChange,
  resultCount,
  filtersActive,
  onClear,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  access: AccessFilter;
  onAccessChange: (value: AccessFilter) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  resultCount: number;
  filtersActive: boolean;
  onClear: () => void;
}) {
  return (
    <section className="directory-controls" aria-label="Filter templates">
      <div className="toolbar">
        <label className="search-field">
          <span className="sr-only">Search templates</span>
          <Search aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search templates…"
          />
          {query ? (
            <button type="button" onClick={() => onQueryChange("")} aria-label="Clear search"><X aria-hidden="true" /></button>
          ) : null}
        </label>
        <div className="access-filter" role="group" aria-label="Filter by access">
          {(["all", "free", "premium"] as const).map((item) => {
            const selected = access === item;
            return (
              <button key={item} type="button" className={selected ? "selected" : undefined} aria-pressed={selected} onClick={() => onAccessChange(item)}>
                {selected ? <Check aria-hidden="true" /> : null}
                {item[0].toUpperCase() + item.slice(1)}
              </button>
            );
          })}
        </div>
      </div>
      <div className="category-fade">
        <div className="category-list" role="group" aria-label="Filter by category">
          <button type="button" className={category === "all" ? "selected" : undefined} aria-pressed={category === "all"} onClick={() => onCategoryChange("all")}>
            {category === "all" ? <Check aria-hidden="true" /> : null}All work
          </button>
          {categoryOptions.map((item) => {
            const selected = category === item.value;
            return (
              <button key={item.value} type="button" className={selected ? "selected" : undefined} aria-pressed={selected} onClick={() => onCategoryChange(item.value)}>
                {selected ? <Check aria-hidden="true" /> : null}{item.label}
              </button>
            );
          })}
        </div>
      </div>
      {filtersActive ? (
        <div className="result-summary" aria-live="polite">
          <span>{resultCount} {resultCount === 1 ? "template" : "templates"}</span>
          <button type="button" onClick={onClear}>Clear filters</button>
        </div>
      ) : null}
    </section>
  );
}
