"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, Flame, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AgentStack } from "@/components/ui/agent-stack";
import { buttonClass } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-provider";
import { ApiClientError, apiPost } from "@/lib/client/api-fetch";
import { LIFETIME_PRICE, LIFETIME_PRICE_NEXT, LIFETIME_SLOTS_LEFT } from "@/lib/catalog";
import { usePlusCount } from "@/lib/hooks/use-plus-count";

export function AccessOffer({
  open,
  templateTitle,
  returnTo = "/",
  onDismiss,
}: {
  open: boolean;
  templateTitle?: string;
  returnTo?: string;
  onDismiss: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const { session } = useAuth();
  const [rendered, setRendered] = useState(open);
  const [closing, setClosing] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);
  const [starting, setStarting] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const plusCount = usePlusCount(open);

  async function startCheckout() {
    setCheckoutError("");
    setStarting(true);
    try {
      const { checkoutUrl } = await apiPost<{ checkoutUrl: string }>("/api/checkout/session", {});
      window.location.href = checkoutUrl;
    } catch (error) {
      setCheckoutError(
        error instanceof ApiClientError
          ? error.message
          : "Checkout isn't available yet. Try again shortly.",
      );
      setStarting(false);
    }
  }

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setRendered(true);
      setClosing(false);
    } else if (rendered) {
      setClosing(true);
    }
  }

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (rendered && !closing && !dialog.open) dialog.showModal();
  }, [rendered, closing]);

  if (!rendered) return null;
  const encodedReturn = encodeURIComponent(returnTo);

  return (
    <dialog
      ref={ref}
      className="access-dialog"
      data-state={closing ? "closing" : undefined}
      aria-labelledby="offer-title"
      onClose={onDismiss}
      onCancel={(event) => {
        event.preventDefault();
        onDismiss();
      }}
      onAnimationEnd={(event) => {
        if (event.target !== ref.current || !closing) return;
        ref.current?.close();
        setRendered(false);
        setClosing(false);
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onDismiss();
      }}
    >
      <div className="offer-glow" aria-hidden="true" />
      <div className="dialog-handle" aria-hidden="true" />
      <button className="dialog-close" type="button" onClick={onDismiss} aria-label="Close offer">
        <X aria-hidden="true" />
      </button>

      <div className="offer-mark" aria-hidden="true">
        <Image src="/notto-logo-negative.png" alt="" width={96} height={24} />
      </div>

      <div className="dialog-copy">
        <p className="eyebrow">Lifetime All Access</p>
        <h2 id="offer-title">
          {templateTitle ? `Unlock ${templateTitle}` : "Unlock every Plus template"}
        </h2>
      </div>

      <ul className="offer-benefits">
        <li><Check aria-hidden="true" />{plusCount.data ? `${plusCount.data} Plus templates` : "Every Plus template"}, including every one we ship next</li>
        <li><Check aria-hidden="true" />Copy any template&rsquo;s HTML instantly, any time</li>
        <li><Check aria-hidden="true" />One payment. No subscription, ever.</li>
      </ul>

      <div className="agent-stack-row">
        <span>Works with</span>
        <AgentStack />
      </div>

      <div className="price-hero">
        <div>
          <span className="price-hero-current">${LIFETIME_PRICE}</span>
          <span className="price-hero-was">${LIFETIME_PRICE_NEXT}</span>
        </div>
        <span className="price-hero-caption">USD · one time, not a subscription</span>
      </div>

      <p className="offer-urgency">
        <Flame aria-hidden="true" />
        <span><strong>{LIFETIME_SLOTS_LEFT} lifetime spots</strong> left at this price</span>
      </p>

      {session ? (
        <div className="dialog-actions dialog-actions--single">
          <button
            className={buttonClass("primary", true)}
            type="button"
            disabled={starting}
            onClick={startCheckout}
          >
            {starting ? "Starting checkout…" : `Get lifetime access — $${LIFETIME_PRICE}`}
          </button>
        </div>
      ) : (
        <div className="dialog-actions">
          <Link className={buttonClass("primary")} href={`/register?next=${encodedReturn}`}>Create free account</Link>
          <Link className={buttonClass("secondary")} href={`/login?next=${encodedReturn}`}>Log in</Link>
        </div>
      )}
      {checkoutError ? <p className="dialog-note" role="alert">{checkoutError}</p> : null}
      <p className="dialog-note">
        {session
          ? `Access will be added to ${session.email} after payment is verified.`
          : "An account is required before checkout so your access stays with you."}
      </p>
    </dialog>
  );
}
