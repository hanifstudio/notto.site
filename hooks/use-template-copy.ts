"use client";

import { useEffect, useRef, useState } from "react";
import type { CopyStatus } from "@/components/ui/copy-button";
import type { ToastState } from "@/components/ui/toast";
import { useAuth } from "@/features/auth/auth-provider";
import type { TemplateSummary } from "@/lib/catalog";
import {
  getTemplateSource,
  PremiumAccessRequiredError,
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

  useEffect(() => {
    const timers = resetTimers.current;
    return () => timers.forEach(window.clearTimeout);
  }, []);

  useEffect(() => {
    if (!toast || toast.tone === "error") return;
    const timer = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function copy(template: TemplateSummary) {
    if (template.access === "premium" && session?.entitlement !== "active") {
      onAccessRequired(template);
      return;
    }

    setStatuses((current) => ({ ...current, [template.slug]: "copying" }));
    try {
      const source = await getTemplateSource(template.slug);
      await writeToClipboard(source);
      setStatuses((current) => ({ ...current, [template.slug]: "copied" }));
      setToast({ tone: "success", title: "HTML copied", body: "Paste it into your coding agent." });
      resetTimers.current.push(
        window.setTimeout(() => {
          setStatuses((current) => ({ ...current, [template.slug]: "idle" }));
        }, 2500),
      );
    } catch (error) {
      if (error instanceof PremiumAccessRequiredError) {
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
    statusFor: (slug: string) => statuses[slug] ?? "idle",
    toast,
    dismissToast: () => setToast(null),
  };
}
