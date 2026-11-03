import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { DEMO_ORGS, DEMO_COOKIE, type DemoRole } from "@/features/collaboration/data/demo-orgs";
import { getAccount } from "@/features/auth/queries";
import { getSessionUser } from "@/lib/auth/session";
import type { Viewer } from "@/types";

/** Ready-made demo members (/api/demo?as=…) only in development, or when DEMO_MODE=1. */
const demoAllowed = process.env.NODE_ENV !== "production" || process.env.DEMO_MODE === "1";

/**
 * Who is looking at the page (one lookup per request).
 * - Signed in with an approved organisation → member (signedIn: true, org).
 * - Signed in without one yet → account (onboarding / waiting for NCPC).
 * - Otherwise a visitor, or a demo member while there is no real session.
 */
export const getViewer = cache(async (): Promise<Viewer> => {
  const user = await getSessionUser();
  if (user) {
    const account = await getAccount(user.id, user.email ?? "");
    const org = account?.org;
    if (org && org.status === "approved") {
      const { id: _id, status: _status, ...viewerOrg } = org;
      return { signedIn: true, org: viewerOrg };
    }
    return {
      signedIn: false,
      account: {
        name: account?.name ?? user.email ?? "",
        email: user.email ?? "",
        orgStatus: org ? (org.status as Exclude<typeof org.status, "approved">) : "none",
        isAdmin: account?.isAdmin ?? false,
      },
    };
  }

  if (demoAllowed) {
    const role = (await cookies()).get(DEMO_COOKIE)?.value as DemoRole | undefined;
    const org = role ? DEMO_ORGS[role] : undefined;
    if (org) return { signedIn: true, org };
  }
  return { signedIn: false };
});
