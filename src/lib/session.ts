import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { Role } from "@/lib/constants";

export type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: Role;
};

/** Returns the signed-in user, or null. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user) return null;
  return session.user as SessionUser;
}

/** Requires a signed-in user; redirects to /login otherwise. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * Requires the user to hold one of the given roles. Redirects to the dashboard
 * if they are signed in but unauthorised. This is server-side enforcement —
 * the navigation only *hides* links; this actually *blocks* access.
 */
export async function requireRole(roles: Role[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect("/");
  return user;
}
