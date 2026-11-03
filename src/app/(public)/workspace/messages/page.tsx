import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { MessageSquare } from "lucide-react";
import { Container } from "@/components/layout/container";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { MessagesView } from "@/features/collaboration/components/messages/messages-view";
import { getConversations } from "@/features/collaboration/queries";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage() {
  const viewer = await getViewer();

  if (!viewer.signedIn) {
    const next = encodeURIComponent(routes.workspace.messages);
    return (
      <Container className="py-10">
        <EmptyState
          icon={MessageSquare}
          title="Sign in to see your messages"
          description="Conversations open when an organisation accepts your enquiry, or you accept theirs."
          className="bg-card"
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button asChild>
                <Link href={`${routes.auth.signIn}?next=${next}`}>Sign in</Link>
              </Button>
              {process.env.NODE_ENV !== "production" ? (
                <>
                  <Button asChild variant="outline">
                    <Link href={`/api/demo?as=investor&next=${next}`}>
                      Demo: Sunridge (investor)
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href={`/api/demo?as=owner&next=${next}`}>Demo: GreenFuture (owner)</Link>
                  </Button>
                </>
              ) : null}
            </div>
          }
        />
      </Container>
    );
  }

  const conversations = await getConversations(viewer);
  return (
    <Container className="py-6">
      <Suspense>
        <MessagesView conversations={conversations} />
      </Suspense>
    </Container>
  );
}
