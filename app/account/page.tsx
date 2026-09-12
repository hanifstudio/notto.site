import { AccountPage } from "@/features/account/account-page";
import type { EntitlementStatus } from "@/features/auth/auth-provider";

export default async function AccountRoute({ searchParams }: { searchParams: Promise<{ status?: string | string[] }> }) {
  const params = await searchParams;
  const value = typeof params.status === "string" ? params.status : undefined;
  const previewStatus: EntitlementStatus | undefined =
    value === "free" || value === "active" || value === "revoked" ? value : undefined;
  return <AccountPage previewStatus={previewStatus} />;
}
