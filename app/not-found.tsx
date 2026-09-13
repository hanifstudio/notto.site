import Link from "next/link";
import { SearchX } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { buttonClass } from "@/components/ui/button";

export default function NotFound() {
  return (
    <PageShell back={{ label: "Back to Notto", href: "/" }}>
      <section className="route-message">
        <span><SearchX aria-hidden="true" /></span>
        <h1>That page isn&apos;t in the directory.</h1>
        <p>It may have moved, or the address may be incomplete.</p>
        <Link className={buttonClass("primary")} href="/">Browse all templates</Link>
      </section>
    </PageShell>
  );
}
