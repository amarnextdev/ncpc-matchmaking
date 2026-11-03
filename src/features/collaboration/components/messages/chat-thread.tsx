"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  CalendarDays,
  ChevronLeft,
  FilePlus2,
  Handshake,
  Lock,
  PanelRight,
  Paperclip,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { LOOKING_FOR, ORGANISATION_CATEGORIES, labelFor } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { STAGE_TONE } from "../../constants";
import type { ConversationView, Deal, Message } from "../../types";
import { dealStageLabel } from "../../views";
import { OrgAvatar } from "../org-avatar";
import { MessageItem } from "./message-item";

const soon = (what: string) => toast.info(`${what} comes in the next step of this module.`);

/** Middle column: header, deal strip, messages and the composer. */
export function ChatThread({
  conversation: c,
  messages,
  deal,
  dealStarted,
  onStartDeal,
  onSend,
  onBack,
  panelOpen,
  onTogglePanel,
  onOpenDealSheet,
  compact,
  className,
}: {
  conversation: ConversationView;
  messages: Message[];
  deal: Deal;
  dealStarted: (dealId: string) => boolean;
  onStartDeal: (dealId: string) => void;
  onSend: (text: string) => void;
  onBack?: () => void;
  panelOpen?: boolean;
  onTogglePanel?: () => void;
  onOpenDealSheet?: () => void;
  compact?: boolean;
  className?: string;
}) {
  const [draft, setDraft] = useState("");
  const [tools, setTools] = useState(false);
  const listRef = useRef<HTMLOListElement>(null);
  const isOwner = deal.ownerSlug === c.me.slug;
  const started = dealStarted(deal.id);
  const stage = started && deal.stage === "not_started" ? "in_discussion" : deal.stage;

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, c.id]);

  function send() {
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft("");
  }

  const toolList = [
    { label: "Share a project", icon: Briefcase, show: isOwner },
    { label: "Propose meeting", icon: CalendarDays, show: true },
    { label: isOwner ? "Upload document" : "Request document", icon: FilePlus2, show: true },
    { label: "Send collaboration request", icon: Handshake, show: isOwner },
  ].filter((t) => t.show);

  const pad = compact ? "px-4" : "px-6";

  return (
    <section
      aria-label={`Conversation with ${c.them.name}`}
      className={cn("flex min-h-0 min-w-0 flex-col bg-card", className)}
    >
      <div className={cn("flex shrink-0 items-center gap-3 border-b py-3", pad)}>
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to messages"
            className="-ml-1.5 flex size-9 items-center justify-center rounded-full hover:bg-muted lg:hidden"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
        ) : null}
        <OrgAvatar initials={c.them.initials} tint={c.them.tint} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex items-center gap-1.5 text-base font-bold">
            <span className="truncate">{c.them.name}</span>
            {c.them.verified ? <VerifiedBadge size="sm" /> : null}
          </span>
          <span className="truncate text-[13px] text-subtle-foreground">
            {labelFor(ORGANISATION_CATEGORIES, c.them.category)} · {c.them.location}
          </span>
        </div>
        <Button asChild variant="outline" size="sm" className="hidden md:inline-flex">
          <Link href={routes.organisations.detail(c.them.slug)}>View profile</Link>
        </Button>
        {onTogglePanel ? (
          <Button
            variant="outline"
            size="sm"
            aria-pressed={panelOpen}
            onClick={onTogglePanel}
            className={cn(
              "hidden xl:inline-flex",
              panelOpen && "border-primary bg-primary-soft text-primary",
            )}
          >
            <PanelRight aria-hidden />
            Deal panel
          </Button>
        ) : null}
        {onOpenDealSheet ? (
          <Button
            size="sm"
            variant="secondary"
            onClick={onOpenDealSheet}
            className="bg-primary-soft text-primary xl:hidden"
          >
            Deal
          </Button>
        ) : null}
      </div>

      <div
        className={cn(
          "flex shrink-0 flex-wrap items-center gap-2 border-b bg-surface-subtle py-2.5 text-[13px]",
          pad,
        )}
      >
        <span className="text-subtle-foreground">Deal:</span>
        <span className="font-semibold">{deal.projectTitle}</span>
        <span className="text-subtle-foreground">· {labelFor(LOOKING_FOR, deal.role)}</span>
        <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", STAGE_TONE[stage])}>
          {stage === deal.stage ? dealStageLabel(deal) : "In discussion"}
        </span>
      </div>

      <ol
        ref={listRef}
        className={cn("flex flex-1 flex-col gap-3.5 overflow-y-auto pt-4 pb-2", pad)}
      >
        {messages.map((m) => (
          <li key={m.id} className="flex flex-col">
            <MessageItem
              message={m}
              parties={[c.me, c.them]}
              mySlug={c.me.slug}
              compact={compact}
              dealStarted={dealStarted}
              onStartDeal={onStartDeal}
            />
          </li>
        ))}
      </ol>

      <div className={cn("flex shrink-0 flex-col gap-2 border-t pt-2.5 pb-3.5", pad)}>
        {tools ? (
          <div className="flex flex-wrap gap-1.5">
            {toolList.map((t) => (
              <button
                key={t.label}
                type="button"
                onClick={() => {
                  soon(t.label);
                  setTools(false);
                }}
                className="flex h-[34px] items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium text-foreground/80 hover:border-primary hover:text-primary"
              >
                <t.icon className="size-[15px] text-primary" aria-hidden />
                {t.label}
              </button>
            ))}
          </div>
        ) : null}
        <form
          className="flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="More actions"
            aria-expanded={tools}
            onClick={() => setTools((v) => !v)}
            className={cn(tools && "bg-primary-soft")}
          >
            <Plus className="text-primary" aria-hidden />
          </Button>
          <label htmlFor={`msg-${c.id}`} className="sr-only">
            Write a message
          </label>
          <textarea
            id={`msg-${c.id}`}
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Write a message…"
            className="h-11 min-w-0 flex-1 resize-none rounded-[22px] border border-input bg-background px-4 py-[11px] text-sm leading-5 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Attach file"
            onClick={() => soon("Attaching files")}
          >
            <Paperclip aria-hidden />
          </Button>
          <Button type="submit" disabled={!draft.trim()}>
            Send
          </Button>
        </form>
        <span className="flex items-center gap-1.5 text-xs text-subtle-foreground">
          <Lock className="size-3" aria-hidden />
          Private between {c.me.name} and {c.them.name}. NCPC cannot read messages.
        </span>
      </div>
    </section>
  );
}
