"use client";

import Link from "next/link";
import { Check, CircleAlert, Clock3, LoaderCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { MinimalShell } from "@/components/layout/minimal-shell";
import { buttonClass } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-provider";
import { useAccount } from "@/lib/hooks/use-account";
import { LIFETIME_PRICE } from "@/lib/catalog";

export type CheckoutState = "verified" | "verifying" | "failed" | "cancelled";

const copy = {
  verified: {
    title: "All Access is active",
    intro: "Every plus template is unlocked on your account.",
  },
  verifying: {
    title: "Confirming your payment",
    intro: "Gumroad has taken the payment. We're waiting for their confirmation before unlocking plus templates.",
  },
  failed: {
    title: "We couldn't confirm your payment",
    intro: "If you were charged, your access will be activated as soon as we can confirm it — usually within an hour.",
  },
  cancelled: {
    title: "Checkout cancelled",
    intro: "Nothing was charged and your account is unchanged.",
  },
} satisfies Record<CheckoutState, { title: string; intro: string }>;

export function CheckoutPage({ initialState }: { initialState: CheckoutState }) {
  const [state, setState] = useState(initialState);
  const auth = useAuth();
  const { data: account, refetch } = useAccount();

  // Poll /api/account while waiting for the Gumroad webhook to land — no client-side timer fakes activation.
  useEffect(() => {
    if (state !== "verifying") return;
    const interval = window.setInterval(() => {
      void refetch();
    }, 4000);
    return () => window.clearInterval(interval);
  }, [state, refetch]);

  // Derived, not stored: once the account query confirms access, render as
  // "verified" without a second effect writing state back.
  const displayState = state === "verifying" && account?.entitlement === "active" ? "verified" : state;

  const purchasedLabel = account?.purchasedAt
    ? new Date(account.purchasedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : "your purchase date";

  const Icon = displayState === "verified" ? Check : displayState === "verifying" ? Clock3 : displayState === "cancelled" ? X : CircleAlert;
  const rows = displayState === "verified"
    ? [["Payment", `Verified with Gumroad · ${purchasedLabel}`], ["Access", "Lifetime All Access · all plus templates"], ["Receipt", `Sent to ${auth.session?.email ?? "your email"}`]]
    : displayState === "verifying"
      ? [["Payment", "Received · awaiting confirmation"], ["Access", "Activates automatically once confirmed"]]
      : displayState === "failed"
        ? [["Payment", "Not confirmed yet"], ["Access", "Unchanged — free templates only"]]
        : [];

  return (
    <MinimalShell className="checkout-only-shell">
      <section className={`checkout-page checkout-page--${displayState}`}>
        <span className="checkout-icon"><Icon className={displayState === "verifying" ? "spin-slow" : undefined} aria-hidden="true" /></span>
        <div className="checkout-heading"><h1>{copy[displayState].title}</h1><p>{copy[displayState].intro}</p></div>
        {rows.length ? (
          <dl className="checkout-details">
            {rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
          </dl>
        ) : null}
        <div className="checkout-actions">
          {displayState === "verified" ? (
            <><Link className={buttonClass("primary")} href="/templates/northline-studio">Copy Northline Studio</Link><Link className={buttonClass("secondary")} href="/?access=plus">Browse plus templates</Link></>
          ) : displayState === "verifying" ? (
            <><button className={buttonClass("subtle")} type="button" disabled><LoaderCircle className="spin" aria-hidden="true" />Checking…</button><Link className={buttonClass("secondary")} href="/?access=free">Browse free templates</Link></>
          ) : displayState === "failed" ? (
            <><a className={buttonClass("primary")} href="mailto:support@notto.site">Email support@notto.site</a><button className={buttonClass("secondary")} type="button" onClick={() => setState("verifying")}>Check again</button></>
          ) : (
            <><Link className={buttonClass("secondary")} href="/templates/northline-studio">Back to Northline Studio</Link><Link className={buttonClass("primary")} href="/checkout/success?state=verifying">{`Try again — $${LIFETIME_PRICE}`}</Link></>
          )}
        </div>
        <p className="checkout-note">
          {displayState === "verified" ? "Nothing recurring was set up. You will not be charged again."
            : displayState === "verifying" ? "This usually takes a few seconds. You can leave this page — access activates on its own and we'll email your receipt."
              : displayState === "failed" ? "You will not be charged twice. Do not start a second checkout — contact support and we'll resolve it."
                : "Free templates are still copyable without an account."}
        </p>
      </section>
    </MinimalShell>
  );
}
