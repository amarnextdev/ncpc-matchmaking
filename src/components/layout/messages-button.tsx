"use client";

import { MessageSquare } from "lucide-react";
import { openDock } from "@/features/collaboration/dock-events";

/** Header Messages icon: opens the messaging dock (no separate Messages page). */
export function MessagesButton({ count = 0 }: { count?: number }) {
  return (
    <button
      type="button"
      onClick={() => openDock()}
      title="Messages"
      aria-label={count ? `Messages, ${count} unread` : "Messages"}
      className="relative flex size-11 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-muted hover:text-primary focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
    >
      <MessageSquare className="size-[21px]" strokeWidth={2} aria-hidden />
      {count ? (
        <span
          aria-hidden
          className="absolute top-1 right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-background bg-destructive px-1 text-[10px] font-bold text-white tabular-nums"
        >
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </button>
  );
}
