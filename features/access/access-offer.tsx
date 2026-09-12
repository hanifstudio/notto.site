"use client";

import Link from "next/link";
import { LockKeyhole, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { buttonClass } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-provider";
import { ApiClientError, apiPost } from "@/lib/client/api-fetch";

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
      <div className="dialog-handle" aria-hidden="true" />
      <button className="dialog-close" type="button" onClick={onDismiss} aria-label="Close offer">
        <X aria-hidden="true" />
      </button>
      <div className="offer-mark" aria-hidden="true"><LockKeyhole /></div>
      <div className="dialog-copy">
        <p className="eyebrow">Lifetime All Access</p>
        <h2 id="offer-title">
          {templateTitle ? `Copy ${templateTitle}` : "Unlock every premium template"}
        </h2>
        <p>Get every premium page now and every template we add in the future. Pay once and keep access for life.</p>
      </div>
      <div className="price-row">
        <strong>$12 USD</strong>
        <span>one time · not a subscription</span>
      </div>
      {session ? (
        <div className="dialog-actions dialog-actions--single">
          <button
            className={buttonClass("primary", true)}
            type="button"
            disabled={starting}
            onClick={startCheckout}
          >
            {starting ? "Starting checkout…" : "Continue to Contra"}
          </button>
        </div>
      ) : (
        <div className="dialog-actions">
          <Link className={buttonClass("primary")} href={`/register?next=${encodedReturn}`}>Create account</Link>
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
