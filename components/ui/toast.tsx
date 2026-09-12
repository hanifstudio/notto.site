import { Check, CircleAlert, LoaderCircle, X } from "lucide-react";

export type ToastState = {
  tone: "success" | "error" | "processing";
  title: string;
  body: string;
} | null;

export function Toast({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }) {
  if (!toast) return null;
  const Icon = toast.tone === "success" ? Check : toast.tone === "error" ? CircleAlert : LoaderCircle;
  return (
    <aside
      className={`toast toast--${toast.tone}`}
      role={toast.tone === "error" ? "alert" : "status"}
      aria-live={toast.tone === "error" ? "assertive" : "polite"}
    >
      <Icon className={toast.tone === "processing" ? "spin" : undefined} aria-hidden="true" />
      <span>
        <strong>{toast.title}</strong>
        <small>{toast.body}</small>
      </span>
      <button type="button" onClick={onDismiss} aria-label="Dismiss notification">
        <X aria-hidden="true" />
      </button>
    </aside>
  );
}
