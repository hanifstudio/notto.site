import { AuthPage } from "@/features/auth/auth-page";
import { safeReturnPath } from "@/lib/navigation";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  const params = await searchParams;
  return <AuthPage mode="register" returnTo={safeReturnPath(params.next)} />;
}
