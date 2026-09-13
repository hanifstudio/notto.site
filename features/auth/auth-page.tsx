"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Check, LoaderCircle, Mail } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button, buttonClass } from "@/components/ui/button";
import { AuthShell } from "@/features/auth/auth-shell";
import { FormField } from "@/components/ui/form-field";
import { ApiClientError, apiPost } from "@/lib/client/api-fetch";

export type AuthMode = "login" | "register" | "forgot" | "reset";

const content = {
  login: {
    title: "Log in",
    intro: "Copy plus templates with your Lifetime All Access.",
    submit: "Log in",
  },
  register: {
    title: "Create your account",
    intro: "An account is only needed for plus templates. Free pages stay copyable without one.",
    submit: "Create account",
  },
  forgot: {
    title: "Reset your password",
    intro: "Enter the address you signed up with and we'll send a reset link.",
    submit: "Send reset link",
  },
  reset: {
    title: "Set a new password",
    intro: "Choose a new password for your account.",
    submit: "Set new password",
  },
} satisfies Record<AuthMode, { title: string; intro: string; submit: string }>;

export function AuthPage({
  mode,
  returnTo = "/",
  resetToken = "",
}: {
  mode: AuthMode;
  returnTo?: string;
  resetToken?: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmationError, setConfirmationError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setEmailError("");
    setPasswordError("");
    setConfirmationError("");

    if (mode !== "reset" && (!email.trim() || !/^\S+@\S+\.\S+$/.test(email))) {
      setEmailError("Enter a valid email address.");
      return;
    }
    if (mode !== "forgot" && !password) {
      setPasswordError("Enter your password.");
      return;
    }
    if ((mode === "register" || mode === "reset") && password.length < 10) {
      setPasswordError("Use at least 10 characters.");
      return;
    }
    if (mode === "reset" && password !== confirmation) {
      setConfirmationError("The passwords do not match.");
      return;
    }
    if (mode === "reset" && !resetToken) {
      setFormError("This reset link is invalid or has expired. Request a new one.");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "forgot") {
        await apiPost("/api/auth/forgot-password", { email });
        setSubmitted(true);
        return;
      }

      if (mode === "register") {
        await apiPost("/api/auth/register", { email, password });
        const result = await signIn("credentials", { email, password, redirect: false });
        if (result?.error) {
          setFormError("Account created, but automatic sign-in failed. Try logging in.");
          router.push(`/login?next=${encodeURIComponent(returnTo)}`);
          return;
        }
        await queryClient.invalidateQueries({ queryKey: ["account"] });
        router.push(returnTo);
        return;
      }

      if (mode === "reset") {
        const result = await apiPost<{ email: string }>("/api/auth/reset-password", {
          token: resetToken,
          password,
        });
        await signIn("credentials", { email: result.email, password, redirect: false });
        await queryClient.invalidateQueries({ queryKey: ["account"] });
        setSubmitted(true);
        return;
      }

      // mode === "login"
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setFormError("That email and password combination doesn't match an account. Check both and try again.");
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ["account"] });
      router.push(returnTo);
    } catch (error) {
      const message =
        error instanceof ApiClientError ? error.message : "Something went wrong. Try again.";
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (mode === "forgot" && submitted) {
    return (
      <AuthShell>
        <section className="auth-section"><div className="auth-card auth-card--message">
          <span className="auth-icon"><Mail aria-hidden="true" /></span>
          <h1>Check your email</h1>
          <p>If an account exists for that address, a reset link is on its way.</p>
          <div className="auth-notice">The link expires in 60 minutes and can only be used once. If it doesn&apos;t arrive, check your spam folder.</div>
          <Link className={buttonClass("secondary", true)} href="/login">Back to log in</Link>
          <small>Still nothing after a few minutes? Email <a href="mailto:support@notto.site">support@notto.site</a> and we&apos;ll help.</small>
        </div></section>
      </AuthShell>
    );
  }

  if (mode === "reset" && submitted) {
    return (
      <AuthShell>
        <section className="auth-section"><div className="auth-card auth-card--message">
          <span className="auth-icon auth-icon--success"><Check aria-hidden="true" /></span>
          <h1>Password updated</h1>
          <p>You&apos;re signed in on this device.</p>
          <div className="auth-notice">Your password has been changed. Any reset links sent earlier no longer work.</div>
          <Link className={buttonClass("primary", true)} href={returnTo}>Continue</Link>
          <Link className={buttonClass("secondary", true)} href="/">Browse all templates</Link>
        </div></section>
      </AuthShell>
    );
  }

  const details = content[mode];
  return (
    <AuthShell>
      <section className="auth-section">
        <form className="auth-card" onSubmit={handleSubmit} noValidate>
          {returnTo.startsWith("/templates/") ? <div className="continue-pill"><ArrowRight aria-hidden="true" />Continue to your template</div> : null}
          <div className="auth-heading"><h1>{details.title}</h1><p>{details.intro}</p></div>
          {formError ? <div className="form-alert" role="alert"><strong>We couldn&apos;t sign you in</strong><span>{formError}</span></div> : null}
          <div className="auth-fields">
            {mode !== "reset" ? (
              <FormField id={`${mode}-email`} label="Email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@studio.com" error={emailError} />
            ) : null}
            {mode !== "forgot" ? (
              <FormField
                id={`${mode}-password`}
                label={mode === "reset" ? "New password" : "Password"}
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={mode === "reset" ? "Your new password" : "Your password"}
                help={mode === "register" || mode === "reset" ? "At least 10 characters." : undefined}
                error={passwordError}
              />
            ) : null}
            {mode === "reset" ? (
              <FormField id="reset-confirmation" label="Confirm new password" type="password" autoComplete="new-password" required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="Repeat your new password" error={confirmationError} />
            ) : null}
          </div>
          {mode === "login" ? <Link className="forgot-link" href="/forgot-password">Forgot password?</Link> : null}
          <Button variant="primary" fullWidth type="submit" disabled={submitting}>
            {submitting ? <LoaderCircle className="spin" aria-hidden="true" /> : null}{submitting ? "Please wait…" : details.submit}
          </Button>
          {mode === "login" ? <Link className={buttonClass("secondary", true)} href={`/register?next=${encodeURIComponent(returnTo)}`}>Create an account</Link> : null}
          {mode === "register" ? <Link className={buttonClass("secondary", true)} href={`/login?next=${encodeURIComponent(returnTo)}`}>I already have an account</Link> : null}
          {mode === "forgot" ? <Link className="auth-text-link" href="/login">Back to log in</Link> : null}
          {mode === "register" ? <small>By creating an account you agree to the <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy Policy</Link>. We never email you anything you didn&apos;t ask for.</small> : null}
        </form>
      </section>
    </AuthShell>
  );
}
