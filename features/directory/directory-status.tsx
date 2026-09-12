import { CloudOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DirectorySkeleton() {
  return (
    <div className="template-grid" aria-label="Loading templates" aria-busy="true">
      {Array.from({ length: 8 }, (_, index) => (
        <div className="skeleton-card" key={index} aria-hidden="true">
          <div className="skeleton-thumb" />
          <div className="skeleton-body"><span /><span /><span /></div>
        </div>
      ))}
    </div>
  );
}

export function DirectoryLoadFailure({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="empty-state" role="alert">
      <span className="empty-mark" aria-hidden="true"><CloudOff /></span>
      <h2>Templates couldn&apos;t be loaded.</h2>
      <p>Your filters are safe. Check your connection and try loading the directory again.</p>
      <Button type="button" onClick={onRetry}>Try again</Button>
    </div>
  );
}
