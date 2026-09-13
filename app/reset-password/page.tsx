import type { Metadata } from "next";
import { AuthPage } from "@/features/auth/auth-page";
import { safeReturnPath } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "Reset password",
  robots: { index: false, follow: true },
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[]; token?: string | string[] }>;
}) {
  const params = await searchParams;
  const token = Array.isArray(params.token) ? params.token[0] : params.token;
  return <AuthPage mode="reset" returnTo={safeReturnPath(params.next)} resetToken={token ?? ""} />;
}
