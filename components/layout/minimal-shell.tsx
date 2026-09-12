import type { ReactNode } from "react";
import { Wordmark } from "@/components/layout/wordmark";
import { cn } from "@/lib/cn";

export function MinimalShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <main className={cn("minimal-shell", className)}>
      <div className="minimal-brand"><Wordmark /></div>
      {children}
    </main>
  );
}
