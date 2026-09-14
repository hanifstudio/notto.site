"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

import { apiFetch } from "@/lib/client/api-fetch";

export type Account = {
  id: string;
  email: string;
  entitlement: "free" | "active" | "revoked";
  purchasedAt: string | null;
  nextAccessRefreshAt: string | null;
  isAdmin: boolean;
};

async function fetchAccount(): Promise<Account> {
  return apiFetch<Account>("/api/account");
}

/**
 * Wraps /api/account in React Query — the entitlement badge (account page,
 * plus copy gate, navbar) is read in more than one place per session, so
 * client-side caching genuinely saves requests here.
 */
export function useAccount() {
  const { status } = useSession();
  return useQuery({
    queryKey: ["account"],
    queryFn: fetchAccount,
    enabled: status === "authenticated",
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });
}
