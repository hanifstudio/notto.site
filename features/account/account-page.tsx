"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, CircleAlert, CircleUserRound } from "lucide-react";
import { useState } from "react";
import { MinimalShell } from "@/components/layout/minimal-shell";
import { Button, buttonClass } from "@/components/ui/button";
import { AccessOffer } from "@/features/access/access-offer";
import { type EntitlementStatus, useAuth } from "@/features/auth/auth-provider";
import { ApiClientError, apiPost } from "@/lib/client/api-fetch";
import { useAccount } from "@/lib/hooks/use-account";
import { LIFETIME_PRICE } from "@/lib/catalog";

const accountCopy = {
  active: {
    title: "Lifetime All Access",
    summary: "Every plus template is unlocked on this account.",
    badge: "Active",
  },
  free: {
    title: "Free account",
    summary: "You can copy any free template. Plus pages need All Access.",
    badge: "Free",
  },
  revoked: {
    title: "All Access ended",
    summary: "This purchase was refunded on 20 September 2026, so plus templates are locked again. Free templates are unaffected.",
    badge: "Revoked",
  },
} satisfies Record<EntitlementStatus, { title: string; summary: string; badge: string }>;

export function AccountPage({ previewStatus }: { previewStatus?: EntitlementStatus }) {
  const router = useRouter();
  const auth = useAuth();
  const { refetch: refetchAccount } = useAccount();
  const [offerOpen, setOfferOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState("");

  async function refreshAccess() {
    setRefreshMessage("");
    setRefreshing(true);
    try {
      const { result } = await apiPost<{ result: "granted" | "already_active" | "not_found" }>(
        "/api/account/refresh",
        {},
      );
      if (result === "granted") {
        await refetchAccount();
        setRefreshMessage("Access updated — you're all set.");
      } else if (result === "already_active") {
        setRefreshMessage("Your access is already active.");
      } else {
        setRefreshMessage("We couldn't find a completed purchase yet. If you already paid, this can take a minute — try again shortly.");
      }
    } catch (error) {
      setRefreshMessage(error instanceof ApiClientError ? error.message : "Couldn't check right now. Try again shortly.");
    } finally {
      setRefreshing(false);
    }
  }

  if (!auth.session) {
    return (
      <MinimalShell className="account-only-shell">
        <section className="account-page account-page--signed-out">
          <span className="account-empty-icon"><CircleUserRound aria-hidden="true" /></span>
          <h1>Sign in to view your account</h1>
          <p>Your access and purchase record will appear here.</p>
          <Link className={buttonClass("primary")} href="/login?next=%2Faccount">Log in</Link>
        </section>
      </MinimalShell>
    );
  }

  const status = previewStatus ?? auth.session.entitlement;
  const copy = accountCopy[status];
  const purchased = status === "active"
    ? `${auth.session.purchasedAt ?? "12 September 2026"} · Gumroad`
    : status === "revoked"
      ? "12 September 2026 · Gumroad · refunded"
      : "—";

  return (
    <MinimalShell className="account-only-shell">
      <section className="account-page">
        <div className="page-heading"><h1>Account</h1><p>Your access, your purchase record, and how to reach us.</p></div>
        <div className={`account-panel account-panel--${status}`}>
          <div className="account-panel-head">
            <div><h2>{copy.title}</h2><p>{copy.summary}</p></div>
            <span className="status-badge">
              {status === "active" ? <Check aria-hidden="true" /> : status === "revoked" ? <CircleAlert aria-hidden="true" /> : null}
              {copy.badge}
            </span>
          </div>
          <dl className="account-details">
            <div><dt>Email</dt><dd>{auth.session.email}</dd></div>
            <div><dt>Access</dt><dd>{status === "active" ? "Lifetime All Access · all plus templates" : "Free — 10 templates"}</dd></div>
            <div><dt>Purchased</dt><dd>{purchased}</dd></div>
            <div><dt>Receipt</dt><dd>{status === "active" ? <a href="https://gumroad.com/library" target="_blank" rel="noreferrer">View receipt</a> : status === "revoked" ? <a href="mailto:support@notto.site">Contact support</a> : "—"}</dd></div>
          </dl>
        </div>
        {status !== "active" ? (
          <div className="account-offer">
            <div><strong>Lifetime All Access</strong><p>{status === "revoked" ? "Plus templates are locked again. You can purchase All Access at any time." : `$${LIFETIME_PRICE} one time unlocks all plus templates, including the ones added later.`}</p></div>
            <Button variant="primary" onClick={() => setOfferOpen(true)}>{`Get all access — $${LIFETIME_PRICE}`}</Button>
          </div>
        ) : null}
        {status === "free" ? (
          <div className="account-actions">
            <p>Already paid but access hasn&rsquo;t shown up?</p>
            <Button onClick={refreshAccess} disabled={refreshing}>{refreshing ? "Checking…" : "Refresh access"}</Button>
          </div>
        ) : null}
        {refreshMessage ? <p className="dialog-note" role="status">{refreshMessage}</p> : null}
        <div className="account-actions">
          <p>{status === "revoked" ? "Think this is wrong?" : "Questions about your purchase?"} <a href="mailto:support@notto.site">support@notto.site</a></p>
          <Button onClick={() => { auth.signOut(); router.push("/"); }}>Log out</Button>
        </div>
      </section>
      <AccessOffer open={offerOpen} returnTo="/account" onDismiss={() => setOfferOpen(false)} />
    </MinimalShell>
  );
}
