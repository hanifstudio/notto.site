import type { Metadata } from "next";
import { AuthPage } from "@/features/auth/auth-page";
import { safeReturnPath } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "Log in",
  robots: { index: false, follow: true },
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  const params = await searchParams;
  return <AuthPage mode="login" returnTo={safeReturnPath(params.next)} />;
}
