import type { ReactNode } from "react";
import { MinimalShell } from "@/components/layout/minimal-shell";

export function AuthShell({ children }: { children: ReactNode }) {
  return <MinimalShell className="auth-only-shell">{children}</MinimalShell>;
}
