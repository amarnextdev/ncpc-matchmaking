"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { STAGE_TONE } from "../../constants";
import type { ConversationView } from "../../types";
import { OrgAvatar } from "../org-avatar";

type Filter = "all" | "unread" | "open";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "open", label: "Open deals" },
];

/** Left column: search, filter pills and the conversations (organisation + project tag). */
export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  className,
}: {
  conversations: ConversationView[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  className?: string;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const items = conversations.filter(
    (c) =>
      (filter === "all" ||
        (filter === "unread"
          ? c.unread > 0
          : c.tagStage !== "active" && c.tagStage !== "not_started")) &&
      (!query || `${c.them.name} ${c.tag}`.toLowerCase().includes(query)),
  );

  return (
    <aside aria-label="Conversations" className={cn("flex min-w-0 flex-col bg-card", className)}>
      <div className="flex flex-col gap-3 px-[18px] pt-[18px] pb-3">
        <h2 className="text-[22px] font-bold">Messages</h2>
        <div className="relative flex items-center">
          <Search
            className="pointer-events-none absolute left-3.5 size-4 text-subtle-foreground"
            aria-hidden
          />
          <Input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search messages"
            placeholder="Search organisations or projects"
            className="h-10 rounded-full pl-10 text-sm"
          />
        </div>
        <div role="tablist" aria-label="Filter conversations" className="flex gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              role="tab"
              aria-selected={filter === f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "h-8 rounded-full border px-3 text-[13px] font-semibold transition-colors",
                filter === f.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground/80 hover:border-subtle-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <ul className="flex-1 overflow-y-auto">
        {items.map((c) => {
          const on = c.id === selectedId;
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onSelect(c.id)}
                aria-current={on ? "true" : undefined}
                className={cn(
                  "flex w-full gap-3 border-l-[3px] py-3.5 pr-4 pl-[15px] text-left transition-colors",
                  on
                    ? "border-primary bg-primary-soft"
                    : "border-transparent hover:bg-surface-subtle",
                )}
              >
                <OrgAvatar initials={c.them.initials} tint={c.them.tint} />
                <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                  <span className="flex items-center gap-1.5">
                    <span
                      className={cn("truncate text-sm", c.unread ? "font-bold" : "font-semibold")}
                    >
                      {c.them.name}
                    </span>
                    <span className="ml-auto shrink-0 text-xs text-subtle-foreground">
                      {c.lastAt}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "truncate text-[13px]",
                      c.unread ? "font-medium text-foreground" : "text-subtle-foreground",
                    )}
                  >
                    {c.preview}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5">
                    <span
                      className={cn(
                        "truncate rounded-full px-2 py-0.5 text-[11px] font-semibold",
                        STAGE_TONE[c.tagStage],
                      )}
                    >
                      {c.tag}
                    </span>
                    {c.unread ? (
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">
                        <span className="sr-only">Unread: </span>
                        {c.unread}
                      </span>
                    ) : null}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
        {!items.length ? (
          <li className="px-5 py-10 text-center text-sm text-subtle-foreground">
            No conversations here.
          </li>
        ) : null}
      </ul>
    </aside>
  );
}
