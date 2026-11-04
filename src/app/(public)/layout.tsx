import type * as React from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { MessagingDock } from "@/features/collaboration/components/dock/messaging-dock";
import { getConversations, getEnquiryRequests } from "@/features/collaboration/queries";
import { getBellData } from "@/features/notifications/queries";
import { getSessionUser } from "@/lib/auth/session";
import { getViewer } from "@/lib/viewer";

/** Website layout: header + page + footer. Members also get the messaging dock (desktop). */
export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [viewer, user] = await Promise.all([getViewer(), getSessionUser()]);
  const [conversations, requests, bell] = await Promise.all([
    getConversations(viewer),
    getEnquiryRequests(viewer),
    user && viewer.signedIn ? getBellData(user.id) : null,
  ]);
  const unread = conversations.reduce((sum, c) => sum + c.unread, 0);

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <SiteHeader
        viewer={viewer}
        unread={unread}
        requests={requests.length}
        bell={user && bell ? { userId: user.id, data: bell } : undefined}
      />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      {viewer.org ? (
        <MessagingDock viewerOrg={viewer.org} conversations={conversations} requests={requests} />
      ) : null}
    </div>
  );
}
