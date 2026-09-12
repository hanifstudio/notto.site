"use client";

import { CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="app-shell">
      <main className="route-message">
        <span><CircleAlert aria-hidden="true" /></span>
        <h1>Something went wrong.</h1>
        <p>Your account and filters have not been changed. Try loading this view again.</p>
        <Button variant="primary" onClick={reset}>Try again</Button>
      </main>
    </div>
  );
}
