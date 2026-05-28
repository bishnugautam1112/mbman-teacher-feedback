import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// ---- Role predicates ----

/** Returns true if the role is ADMIN or SUPER_ADMIN */
export function isAdminOrAbove(role: string): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

/** Returns true only for SUPER_ADMIN */
export function isSuperAdmin(role: string): boolean {
  return role === "SUPER_ADMIN";
}

// ---- Server-side session helpers ----

/** Returns the session user's role, or null if not authenticated */
export async function getSessionRole(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return (session.user as any).role || null;
}

/** Checks if the current session user is ADMIN or SUPER_ADMIN */
export async function requireAdminOrAbove(): Promise<boolean> {
  const role = await getSessionRole();
  return role !== null && isAdminOrAbove(role);
}

/** Checks if the current session user is SUPER_ADMIN */
export async function requireSuperAdmin(): Promise<boolean> {
  const role = await getSessionRole();
  return role !== null && isSuperAdmin(role);
}
