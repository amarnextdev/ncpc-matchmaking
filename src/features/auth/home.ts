import { routes } from "@/config/routes";
import type { AccountOrgStatus } from "@/types";

/**
 * Where a signed-in person belongs, based on their organisation's status.
 * NCPC staff without an approved organisation go to the admin panel, never to onboarding.
 */
export function homeForStatus(
  status: AccountOrgStatus | "approved" | undefined,
  next?: string | null,
  isAdmin = false,
): string {
  if (status === "approved") return next ?? routes.workspace.root;
  if (isAdmin) return next ?? routes.admin.root;
  if (!status || status === "none" || status === "draft" || status === "changes_requested") {
    return routes.onboarding.root;
  }
  return routes.onboarding.pending;
}
