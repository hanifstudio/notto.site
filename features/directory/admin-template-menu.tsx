import { useEffect, useRef, useState } from "react";
import { MenuDotsBold, RefreshCircleBold, StarBold, TagPriceBold } from "solar-icon-set";
import { cn } from "@/lib/cn";
import type { TemplateSummary } from "@/lib/catalog";

export function AdminTemplateMenu({
  template,
  pending,
  onSetAccess,
  onPinToTop,
}: {
  template: TemplateSummary;
  pending: boolean;
  onSetAccess: (access: "free" | "plus") => void;
  onPinToTop: () => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const otherAccess = template.access === "plus" ? "free" : "plus";

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className={cn("admin-menu", open && "admin-menu--open")} ref={rootRef}>
      <button
        className="admin-menu-trigger"
        type="button"
        disabled={pending}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Admin actions for ${template.title}`}
        onClick={() => setOpen((current) => !current)}
      >
        {pending ? <RefreshCircleBold className="spin" aria-hidden="true" /> : <MenuDotsBold aria-hidden="true" />}
      </button>
      {open ? (
        <div className="admin-menu-list" role="menu">
          <button
            className="admin-menu-item"
            role="menuitem"
            type="button"
            onClick={() => {
              setOpen(false);
              onSetAccess(otherAccess);
            }}
          >
            <TagPriceBold aria-hidden="true" />
            <span>Mark as {otherAccess === "plus" ? "Plus" : "Free"}</span>
          </button>
          <button
            className="admin-menu-item"
            role="menuitem"
            type="button"
            onClick={() => {
              setOpen(false);
              onPinToTop();
            }}
          >
            <StarBold aria-hidden="true" />
            <span>Push to front</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
