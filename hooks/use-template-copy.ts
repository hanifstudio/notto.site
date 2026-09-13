"use client";

import { useEffect, useRef, useState } from "react";
import type { CopyStatus } from "@/components/ui/copy-button";
import type { ToastState } from "@/components/ui/toast";
import { useAuth } from "@/features/auth/auth-provider";
import type { TemplateSummary } from "@/lib/catalog";
import {
  getTemplateSource,
  PlusAccessRequiredError,
  writeToClipboard,
} from "@/lib/client/template-copy";

export function useTemplateCopy({
  onAccessRequired,
}: {
  onAccessRequired: (template: TemplateSummary) => void;
}) {
  const { session } = useAuth();
  const [statuses, setStatuses] = useState<Record<string, CopyStatus>>({});
  const [toast, setToast] = useState<ToastState>(null);
  const resetTimers = useRef<number[]>([]);
  const sourceCache = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    const timers = resetTimers.current;
    return () => timers.forEach(window.clearTimeout);
  }, []);

  useEffect(() => {
    if (!toast || toast.tone === "error") return;
    const timer = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function isLocked(template: TemplateSummary) {
    return template.access === "plus" && session?.entitlement !== "active";
  }

  /**
   * Warms the source cache ahead of a click (on hover/mount) so the click handler can call
   * writeToClipboard synchronously — without an intervening network await, browsers keep
   * treating it as a direct user gesture and skip the clipboard permission prompt.
   * The server still enforces the plus gate on this same request; skipping it here for
   * locked templates only avoids a request we already know will be rejected.
   */
  async function prefetch(template: TemplateSummary) {
    if (isLocked(template) || sourceCache.current.has(template.slug)) return;
    try {
      const source = await getTemplateSource(template.slug);
      sourceCache.current.set(template.slug, source);
    } catch {
      // Swallowed — the click-time flow below retries and surfaces any real error.
    }
  }

  async function copy(template: TemplateSummary) {
    if (isLocked(template)) {
      onAccessRequired(template);
      return;
    }

    setStatuses((current) => ({ ...current, [template.slug]: "copying" }));
    try {
      const source = sourceCache.current.get(template.slug) ?? (await getTemplateSource(template.slug));
      await writeToClipboard(source);
      setStatuses((current) => ({ ...current, [template.slug]: "copied" }));
      setToast({ tone: "success", title: "HTML copied", body: "Paste it into your coding agent." });
      resetTimers.current.push(
        window.setTimeout(() => {
          setStatuses((current) => ({ ...current, [template.slug]: "idle" }));
        }, 2500),
      );
    } catch (error) {
      if (error instanceof PlusAccessRequiredError) {
        setStatuses((current) => ({ ...current, [template.slug]: "idle" }));
        onAccessRequired(template);
        return;
      }
      setStatuses((current) => ({ ...current, [template.slug]: "error" }));
      setToast({
        tone: "error",
        title: "Couldn't copy the HTML",
        body: "Check clipboard permission, then try again.",
      });
    }
  }

  return {
    copy,
    prefetch,
    statusFor: (slug: string) => statuses[slug] ?? "idle",
    toast,
    dismissToast: () => setToast(null),
  };
}
