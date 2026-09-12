import { auth } from "./index";

export type CurrentUser = { id: string; email: string };

/**
 * Returns the signed-in user for the current request, or null.
 * The single entry point API routes and server components use to check auth.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) return null;
  return { id: session.user.id, email: session.user.email };
}
