"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Wordmark } from "@/components/layout/wordmark";
import { useAuth } from "@/features/auth/auth-provider";

export function SiteHeader({ back }: { back?: { label: string; href: string } }) {
  const { session } = useAuth();
  return (
    <header className="site-header">
      <div className="header-left">
        {back ? (
          <Link className="back-link" href={back.href}>
            <ArrowLeft aria-hidden="true" />
            {back.label}
          </Link>
        ) : null}
        <Wordmark />
      </div>
      <Link className="auth-link" href={session ? "/account" : "/login"}>
        {session ? "Account" : "Log in"}
      </Link>
    </header>
  );
}
