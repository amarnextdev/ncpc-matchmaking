import "server-only";
import { cache } from "react";
import { and, asc, eq, ne } from "drizzle-orm";
import { initials } from "@/lib/utils";
import type { AccountOrgStatus, ViewerOrg } from "@/types";
import { homeForStatus } from "./home";
import { tintFor } from "./org-display";

export type Account = {
  userId: string;
  name: string;
  email: string;
  /** The person's organisation (first membership), if any */
  org: (ViewerOrg & { id: string; status: AccountOrgStatus | "approved" }) | null;
  /** NCPC staff (profiles.platform_role = 'ncpc_admin') */
  isAdmin: boolean;
};

/**
 * Profile + organisation of a signed-in user (one query per request thanks to cache()).
 * The database client is imported lazily so pages still render before DATABASE_URL is set.
 */
export const getAccount = cache(async (userId: string, email: string): Promise<Account | null> => {
  if (!process.env.DATABASE_URL) return null;
  try {
    return await loadAccount(userId, email);
  } catch (error) {
    // Keep pages working when the database is unreachable; the reason is in the server log.
    const cause =
      error instanceof Error && error.cause instanceof Error ? error.cause.message : String(error);
    console.error("[auth] could not load account:", cause);
    return null;
  }
});

async function loadAccount(userId: string, email: string): Promise<Account | null> {
  const { db } = await import("@/db");
  const { organisationMembers, organisations, profiles, projects } = await import("@/db/schema");

  const [profile] = await db
    .select({ fullName: profiles.fullName, platformRole: profiles.platformRole })
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);

  const [membership] = await db
    .select({
      id: organisations.id,
      slug: organisations.slug,
      name: organisations.name,
      category: organisations.category,
      status: organisations.status,
    })
    .from(organisationMembers)
    .innerJoin(organisations, eq(organisations.id, organisationMembers.orgId))
    .where(eq(organisationMembers.userId, userId))
    .orderBy(asc(organisationMembers.createdAt))
    .limit(1);

  let org: Account["org"] = null;
  if (membership) {
    const own = await db
      .select({ slug: projects.slug, title: projects.title, status: projects.status })
      .from(projects)
      .where(and(eq(projects.orgId, membership.id), ne(projects.status, "hidden")))
      .orderBy(asc(projects.createdAt));
    org = {
      id: membership.id,
      slug: membership.slug,
      name: membership.name,
      initials: initials(membership.name),
      tint: tintFor(membership.category),
      category: membership.category,
      status: membership.status,
      projects: own.map((p) => ({ slug: p.status === "live" ? p.slug : null, title: p.title })),
    };
  }

  return {
    userId,
    name: profile?.fullName ?? email,
    email,
    org,
    isAdmin: profile?.platformRole === "ncpc_admin",
  };
}

/** Where a signed-in person belongs right now. */
export function homeFor(account: Account | null, next?: string | null): string {
  return homeForStatus(account?.org?.status, next, account?.isAdmin ?? false);
}
