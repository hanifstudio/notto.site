"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import type { ToastState } from "@/components/ui/toast";
import { apiPatch } from "@/lib/client/api-fetch";
import type { TemplateSummary } from "@/lib/catalog";

export type AdminActionStatus = "idle" | "pending";

/** Admin-only template actions (access toggle, push-to-front) exposed on the directory grid. */
export function useTemplateAdmin() {
  const queryClient = useQueryClient();
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  async function apply(
    template: TemplateSummary,
    patch: { access?: "free" | "plus"; pinToTop?: boolean },
    successTitle: string,
  ) {
    setPendingSlug(template.slug);
    try {
      await apiPatch(`/api/admin/templates/${template.slug}`, patch);
      await queryClient.invalidateQueries({ queryKey: ["templates"] });
      setToast({ tone: "success", title: successTitle, body: template.title });
    } catch {
      setToast({ tone: "error", title: "Couldn't update the template", body: "Try again." });
    } finally {
      setPendingSlug(null);
    }
  }

  return {
    statusFor: (slug: string): AdminActionStatus => (pendingSlug === slug ? "pending" : "idle"),
    setAccess(template: TemplateSummary, access: "free" | "plus") {
      return apply(template, { access }, access === "plus" ? "Marked as plus" : "Marked as free");
    },
    pinToTop(template: TemplateSummary) {
      return apply(template, { pinToTop: true }, "Pushed to the front");
    },
    toast,
    dismissToast: () => setToast(null),
  };
}
