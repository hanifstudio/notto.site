import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DirectoryEmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="empty-state">
      <span className="empty-mark" aria-hidden="true"><Search /><X /></span>
      <h2>No templates match these filters.</h2>
      <p>Try a different category, or widen the access filter to include plus pages.</p>
      <Button type="button" onClick={onClear}>Clear search and filters</Button>
    </div>
  );
}
