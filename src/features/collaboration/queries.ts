import "server-only";
import { SHOW_DEMO_DATA } from "@/lib/demo";
import { routes } from "@/config/routes";
import type { Viewer } from "@/types";
import { MOCK_CONVERSATIONS, MOCK_REQUESTS } from "./data/mock-conversations";
import type { ConversationView, EnquiryRequest } from "./types";
import { getSessionUser } from "@/lib/auth/session";
import { getDbConversations } from "./conversations-db";
import { getReceivedEnquiries } from "./enquiries-db";
import { toView } from "./views";

/**
 * Data access for conversations and enquiries (demo data).
 * TODO(Module 9): Drizzle queries + Supabase Realtime; RLS so members only read their own.
 */
export async function getConversations(viewer: Viewer): Promise<ConversationView[]> {
  const slug = viewer.org?.slug;
  if (!slug) return [];
  const user = await getSessionUser();
  const live = await getDbConversations(slug, user?.id ?? null);
  return (live ?? (SHOW_DEMO_DATA ? MOCK_CONVERSATIONS : []))
    .map((c) => toView(c, slug))
    .filter((c): c is ConversationView => c !== null);
}

/**
 * Pending enquiries the viewer's organisation received (newest first).
 * Real organisations read the database; demo organisations keep their mock requests.
 */
export async function getEnquiryRequests(viewer: Viewer): Promise<EnquiryRequest[]> {
  if (!viewer.org) return [];
  const live = await getReceivedEnquiries(viewer.org.slug);
  return live ?? (SHOW_DEMO_DATA ? MOCK_REQUESTS[viewer.org.slug] : undefined) ?? [];
}

/** Link to the existing chat with an organisation, if the viewer is already connected to it. */
export async function getConnectionHref(
  viewer: Viewer,
  orgSlug: string,
): Promise<string | undefined> {
  const mine = viewer.org?.slug;
  if (!mine || mine === orgSlug) return undefined;
  const user = await getSessionUser();
  const live = await getDbConversations(mine, user?.id ?? null);
  if (live) {
    const hit = live.find((x) => x.parties.some((p) => p.slug === orgSlug));
    return hit ? routes.workspace.chat(hit.id) : undefined;
  }
  if (!SHOW_DEMO_DATA) return undefined;
  const c = MOCK_CONVERSATIONS.find(
    (x) => x.parties.some((p) => p.slug === mine) && x.parties.some((p) => p.slug === orgSlug),
  );
  return c ? routes.workspace.chat(c.id) : undefined;
}

export async function getUnreadCount(viewer: Viewer): Promise<number> {
  const list = await getConversations(viewer);
  return list.reduce((sum, c) => sum + c.unread, 0);
}
