import type * as React from "react";
import { Container } from "@/components/layout/container";
import { WorkspaceTabs } from "@/components/layout/workspace-tabs";

/** Member workspace: same site header, plus a title and tabs. Protected by middleware. */
export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <section className="border-b bg-background">
        <Container className="flex flex-col gap-4 pt-7">
          <h1 className="text-2xl font-bold tracking-tight">My workspace</h1>
          <WorkspaceTabs />
        </Container>
      </section>
      {children}
    </>
  );
}
