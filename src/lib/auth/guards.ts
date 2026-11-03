import "server-only";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { routes } from "@/config/routes";
import { getSessionUser, type SessionUser } from "./session";

/** True when this user is NCPC staff (profiles.platform_role = 'ncpc_admin'). */
const isNcpcAdmin = cache(async (userId: string): Promise<boolean> => {
  if (!process.env.DATABASE_URL) return false;
  const { db } = await import("@/db");
  const { profiles } = await import("@/db/schema");
  const [row] = await db
    .select({ role: profiles.platformRole })
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);
  return row?.role === "ncpc_admin";
});

/**
 * Use at the top of every admin page AND every admin Server Action.
 * Signed out → sign in; signed in but not NCPC staff → 404 (we don't reveal the admin area).
 */
export async function requireAdmin(next: string = routes.admin.root): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect(`${routes.auth.signIn}?next=${encodeURIComponent(next)}`);
  if (!(await isNcpcAdmin(user.id))) notFound();
  return user;
}
