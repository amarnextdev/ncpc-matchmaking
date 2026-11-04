import "server-only";
import { redirect } from "next/navigation";
import { routes } from "@/config/routes";
import { getSessionUser } from "@/lib/auth/session";
import { getListingOrg } from "./queries";

/** Signed-in member of an approved organisation that lists projects, else send them away. */
export async function requireListingOrg(next: string) {
  const user = await getSessionUser();
  if (!user) redirect(`${routes.auth.signIn}?next=${encodeURIComponent(next)}`);
  const result = await getListingOrg(user.id);
  if (!result.org) redirect(`${routes.workspace.projects}?cannot=${result.reason}`);
  return { user, org: result.org };
}
