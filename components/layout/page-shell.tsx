import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export function PageShell({
  children,
  back,
}: {
  children: ReactNode;
  back?: { label: string; href: string };
}) {
  return (
    <div className="app-shell page-shell">
      <SiteHeader back={back} />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
