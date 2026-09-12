import { Check } from "lucide-react";
import type { AccessLevel } from "@/lib/catalog";
import { cn } from "@/lib/cn";

export function AccessBadge({
  access,
  entitled = false,
}: {
  access: AccessLevel;
  entitled?: boolean;
}) {
  if (access === "premium" && entitled) {
    return (
      <span className="access-badge access-badge--entitled">
        <Check aria-hidden="true" />
        Included in your access
      </span>
    );
  }

  return (
    <span className={cn("access-badge", `access-badge--${access}`)}>
      <span className="badge-marker" aria-hidden="true" />
      {access === "free" ? "Free" : "Premium"}
    </span>
  );
}
