import Link from "next/link";
import { Wordmark } from "@/components/layout/wordmark";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <Wordmark />
        <p>If Notto ever shuts down, every template is released open source. No subscription, no lock-in.</p>
      </div>
      <nav aria-label="Legal and support">
        <Link href="/terms">Terms</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/refunds">Refunds</Link>
        <a href="mailto:support@notto.site">Support</a>
      </nav>
    </footer>
  );
}
