import type { AccessLevel } from "@/lib/catalog";
import { cn } from "@/lib/cn";

export function AccessBadge({
  access,
  entitled = false,
}: {
  access: AccessLevel;
  entitled?: boolean;
}) {
  if (access === "plus" && entitled) {
    return null;
  }

  return (
    <span className={cn("access-badge", `access-badge--${access}`)}>
      {access === "free" ? "Free" : "Plus"}
    </span>
  );
}
