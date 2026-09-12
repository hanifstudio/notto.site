"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { signOut as nextAuthSignOut, useSession } from "next-auth/react";

import { useAccount } from "@/lib/hooks/use-account";

export type EntitlementStatus = "free" | "active" | "revoked";
export type AuthSession = {
  email: string;
  entitlement: EntitlementStatus;
  purchasedAt?: string;
};

type AuthContextValue = {
  session: AuthSession | null;
  loading: boolean;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: sessionData, status } = useSession();
  const { data: account, isLoading: accountLoading } = useAccount();

  const value = useMemo<AuthContextValue>(() => {
    const email = sessionData?.user?.email;
    const session: AuthSession | null = email
      ? {
          email,
          entitlement: account?.entitlement ?? "free",
          purchasedAt: account?.purchasedAt ?? undefined,
        }
      : null;

    return {
      session,
      loading: status === "loading" || (status === "authenticated" && accountLoading),
      signOut() {
        void nextAuthSignOut({ redirect: false });
      },
    };
  }, [sessionData, status, account, accountLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
