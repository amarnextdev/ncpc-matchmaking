"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MessageSquare, Search, Users } from "lucide-react";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { openDock } from "@/features/collaboration/dock-events";
import type { Connection } from "../queries";
import { OrgTile } from "./org-tile";

const dayFmt = new Intl.DateTimeFormat("en-ZA", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** Connections with search; "Message" opens the chat in the dock. */
export function ConnectionsList({ connections }: { connections: Connection[] }) {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t
      ? connections.filter((c) => `${c.org.name} ${c.org.meta}`.toLowerCase().includes(t))
      : connections;
  }, [connections, q]);

  return (
    <section aria-labelledby="cons-title" className="overflow-hidden rounded-2xl border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-6 py-3.5">
        <h2 id="cons-title" className="text-base font-bold">
          {connections.length} {connections.length === 1 ? "connection" : "connections"}
        </h2>
        {connections.length ? (
          <label className="relative w-full sm:w-64">
            <span className="sr-only">Search connections</span>
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-subtle-foreground"
              aria-hidden
            />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search connections"
              className="h-[38px] w-full rounded-full border border-input bg-surface-subtle pr-4 pl-10 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20"
            />
          </label>
        ) : null}
      </div>
      {list.length ? (
        <ul className="divide-y">
          {list.map((c) => (
            <li
              key={c.conversationId}
              className="flex flex-wrap items-center gap-4 px-6 py-4 transition-colors hover:bg-surface-subtle/60"
            >
              <OrgTile org={c.org} />
              <div className="flex min-w-[200px] flex-1 flex-col gap-0.5">
                <span className="flex items-center gap-1.5 text-[15px] font-bold">
                  {c.org.name}
                  {c.org.verified ? <VerifiedBadge size="sm" /> : null}
                </span>
                <span className="text-[13px] text-muted-foreground">{c.org.meta}</span>
                <span className="text-xs text-subtle-foreground">
                  Connected {dayFmt.format(new Date(c.since))}
                  {c.via ? ` · via ${c.via}` : ""}
                </span>
              </div>
              <Button asChild variant="outline" className="h-[38px] px-4">
                <Link href={routes.organisations.detail(c.org.slug)}>View profile</Link>
              </Button>
              <Button
                variant="outline-primary"
                className="h-[38px] border-[1.5px] px-[18px] font-bold"
                onClick={() => openDock(c.conversationId)}
              >
                <MessageSquare aria-hidden /> Message
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
          <Users className="size-8 text-subtle-foreground" aria-hidden />
          <p className="font-semibold">
            {q ? "No connections match your search" : "No connections yet"}
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            {q
              ? "Try another name."
              : "When you accept an enquiry, or someone accepts yours, they show up here."}
          </p>
        </div>
      )}
    </section>
  );
}
