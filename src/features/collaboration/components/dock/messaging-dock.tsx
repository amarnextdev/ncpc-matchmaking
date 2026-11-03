"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Maximize2,
  Minimize2,
  Search,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { LOOKING_FOR, ORGANISATION_CATEGORIES, labelFor } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ViewerOrg } from "@/types";
import { STAGE_TONE } from "../../constants";
import type { ConversationView, Deal, DealDocument, EnquiryRequest, Message } from "../../types";
import { dealStageLabel } from "../../views";
import { DealPanel } from "../messages/deal-panel";
import { MessageItem } from "../messages/message-item";
import { OrgAvatar } from "../org-avatar";

type Tab = "all" | "unread" | "requests";
const MAX_WINDOWS = 2;

const fullView = (id: string) => `${routes.workspace.messages}?c=${id}`;

/**
 * LinkedIn-style messaging dock (bottom-right, desktop only, members only).
 * Quick replies on any page; "Open full view" goes to the Messages page with the Deal panel.
 * Hidden on the Messages page itself.
 */
export function MessagingDock({
  viewerOrg,
  conversations,
  requests,
}: {
  viewerOrg: ViewerOrg;
  conversations: ConversationView[];
  requests: EnquiryRequest[];
}) {
  const pathname = usePathname();
  const [listOpen, setListOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("all");
  const [windows, setWindows] = useState<string[]>([]);
  const [minimised, setMinimised] = useState<Record<string, boolean>>({});
  const [answered, setAnswered] = useState<Record<string, "accepted" | "declined">>({});
  const [sent, setSent] = useState<Record<string, Message[]>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [big, setBig] = useState<string | null>(null);
  /** Conversation whose Deal window is open next to its chat (one at a time, to fit the screen). */
  const [dealOf, setDealOf] = useState<string | null>(null);
  const [dealMin, setDealMin] = useState(false);
  const [dealFor, setDealFor] = useState<Record<string, string>>({});
  const [started, setStarted] = useState<Record<string, true>>({});
  const [docs, setDocs] = useState<Record<string, DealDocument["status"]>>({});

  if (pathname.startsWith(routes.workspace.messages)) return null;

  const unread = conversations.reduce((sum, c) => sum + c.unread, 0);
  const pending = requests.filter((r) => !answered[r.id]).length;
  const list = tab === "unread" ? conversations.filter((c) => c.unread) : conversations;

  function openDeal(id: string) {
    setWindows([id]);
    setBig(null);
    setDealOf(id);
    setDealMin(false);
    setMinimised((m) => ({ ...m, [id]: false }));
  }

  function open(id: string) {
    if (dealOf && dealOf !== id) setDealOf(null);
    setWindows((w) => [id, ...w.filter((x) => x !== id)].slice(0, MAX_WINDOWS));
    setMinimised((m) => ({ ...m, [id]: false }));
  }

  function send(c: ConversationView) {
    const text = (drafts[c.id] ?? "").trim();
    if (!text) return;
    const d = new Date();
    const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    setSent((s) => ({
      ...s,
      [c.id]: [
        ...(s[c.id] ?? []),
        {
          id: `s-${Date.now()}`,
          kind: "post",
          from: c.me.slug,
          person: c.me.contact.name,
          time,
          text,
        },
      ],
    }));
    setDrafts((s) => ({ ...s, [c.id]: "" }));
  }

  function answer(r: EnquiryRequest, result: "accepted" | "declined") {
    setAnswered((a) => ({ ...a, [r.id]: result }));
    toast.success(
      result === "accepted" ? `You are now connected with ${r.from.name}` : "Enquiry declined",
    );
  }

  const isStarted = (d: Deal) => d.stage !== "not_started" || Boolean(started[d.id]);
  const dealStarted = (dealId: string) =>
    Boolean(started[dealId]) ||
    conversations.some((c) => c.deals.some((d) => d.id === dealId && d.stage !== "not_started"));
  const stageOf = (d: Deal) =>
    d.stage === "not_started" && started[d.id] ? "in_discussion" : d.stage;
  const stageText = (d: Deal) =>
    d.stage === "not_started" && started[d.id] ? "In discussion" : dealStageLabel(d);
  const currentDeal = (c: ConversationView) =>
    c.deals.find((d) => d.id === dealFor[c.id]) ??
    c.deals.find((d) => d.stage !== "not_started") ??
    c.deals[0];

  function startDeal(c: ConversationView, dealId: string) {
    const d = c.deals.find((x) => x.id === dealId);
    setStarted((s) => ({ ...s, [dealId]: true }));
    setDealFor((s) => ({ ...s, [c.id]: dealId }));
    setSent((s) => ({
      ...s,
      [c.id]: [
        ...(s[c.id] ?? []),
        {
          id: `e-${dealId}`,
          kind: "event",
          icon: "check",
          tone: "green",
          title: "Deal started.",
          text: d?.projectTitle ?? "",
        },
      ],
    }));
  }

  return (
    <div className="fixed right-6 bottom-0 z-40 hidden items-end gap-3 lg:flex">
      {[...windows].reverse().map((id) => {
        const c = conversations.find((x) => x.id === id);
        if (!c) return null;
        if (big && big !== id) return null;
        const isOpen = !minimised[id];
        const isBig = big === id && isOpen;
        const deal = currentDeal(c);
        const all = [...c.messages, ...(sent[id] ?? [])];
        const messages = isBig ? all : all.filter((m) => m.kind !== "divider").slice(-6);
        const dealWindow =
          dealOf === id && deal ? (
            <section
              key={`deal-${id}`}
              aria-label={`Deal with ${c.them.name}`}
              className={cn(
                "flex w-[380px] flex-col overflow-hidden rounded-t-[14px] border border-b-0 bg-card shadow-[0_-8px_32px_rgb(15_23_42/0.14)]",
                dealMin ? "h-14" : "h-[580px]",
              )}
            >
              <div className="flex h-14 shrink-0 items-center gap-1 border-b pr-2 pl-3">
                <button
                  type="button"
                  onClick={() => setDealMin((v) => !v)}
                  aria-expanded={!dealMin}
                  className="flex min-w-0 flex-1 flex-col text-left"
                >
                  <span className="truncate text-sm font-bold">Deal · {deal.projectTitle}</span>
                  <span className="truncate text-xs text-subtle-foreground">
                    with {c.them.name}
                  </span>
                </button>
                <Button
                  asChild
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Open in Messages"
                  title="Open in Messages"
                >
                  <Link href={fullView(id)}>
                    <ExternalLink aria-hidden />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={dealMin ? "Expand deal" : "Minimise deal"}
                  onClick={() => setDealMin((v) => !v)}
                >
                  {dealMin ? <ChevronUp aria-hidden /> : <ChevronDown aria-hidden />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Close deal"
                  onClick={() => setDealOf(null)}
                >
                  <X aria-hidden />
                </Button>
              </div>
              {dealMin ? null : (
                <div className="min-h-0 flex-1">
                  <DealPanel
                    conversation={c}
                    deal={deal}
                    onDealChange={(dealId) => setDealFor((x) => ({ ...x, [id]: dealId }))}
                    isStarted={isStarted}
                    onStartDeal={(dealId) => startDeal(c, dealId)}
                    docStatus={(d, doc) => docs[`${d.id}:${doc.name}`] ?? doc.status}
                    onDocStatus={(d, doc, status) =>
                      setDocs((x) => ({ ...x, [`${d.id}:${doc.name}`]: status }))
                    }
                  />
                </div>
              )}
            </section>
          ) : null;
        return [
          dealWindow,
          <section
            key={id}
            aria-label={`Chat with ${c.them.name}`}
            className={cn(
              "flex flex-col overflow-hidden rounded-t-[14px] border border-b-0 bg-card shadow-[0_-8px_32px_rgb(15_23_42/0.14)] transition-[width,height] duration-200",
              isBig ? "w-[min(720px,calc(100vw-420px))]" : "w-[440px]",
              !isOpen ? "h-14" : isBig ? "h-[min(860px,calc(100dvh-88px))]" : "h-[580px]",
            )}
          >
            <div className="flex h-14 shrink-0 items-center gap-1 border-b pr-2 pl-3">
              <button
                type="button"
                onClick={() => setMinimised((m) => ({ ...m, [id]: isOpen }))}
                aria-expanded={isOpen}
                className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
              >
                <OrgAvatar initials={c.them.initials} tint={c.them.tint} size="md" />
                <span className="flex min-w-0 flex-col">
                  <span className="flex items-center gap-1 text-sm font-bold">
                    <span className="truncate">{c.them.name}</span>
                    {c.them.verified ? <VerifiedBadge size="sm" /> : null}
                  </span>
                  <span className="truncate text-xs text-subtle-foreground">
                    {labelFor(ORGANISATION_CATEGORIES, c.them.category)} · {c.them.location}
                  </span>
                </span>
              </button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={isBig ? "Smaller window" : "Bigger window"}
                title={isBig ? "Smaller window" : "Bigger window"}
                aria-pressed={isBig}
                onClick={() => {
                  if (!isBig) setDealOf(null);
                  setBig(isBig ? null : id);
                  setMinimised((m) => ({ ...m, [id]: false }));
                }}
              >
                {isBig ? <Minimize2 aria-hidden /> : <Maximize2 aria-hidden />}
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={isOpen ? "Minimise chat" : "Expand chat"}
                onClick={() => setMinimised((m) => ({ ...m, [id]: isOpen }))}
              >
                {isOpen ? <ChevronDown aria-hidden /> : <ChevronUp aria-hidden />}
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Close chat"
                onClick={() => {
                  setWindows((w) => w.filter((x) => x !== id));
                  if (dealOf === id) setDealOf(null);
                  if (big === id) setBig(null);
                }}
              >
                <X aria-hidden />
              </Button>
            </div>
            {isOpen ? (
              <>
                {deal ? (
                  <button
                    type="button"
                    onClick={() => openDeal(id)}
                    className="flex shrink-0 items-center gap-2 border-b bg-surface-subtle px-3.5 py-2 text-left text-xs hover:bg-muted"
                  >
                    <span className="text-subtle-foreground">Deal:</span>
                    <span className="truncate font-semibold">{deal.projectTitle}</span>
                    <span className="shrink-0 text-subtle-foreground">
                      · {labelFor(LOOKING_FOR, deal.role)}
                    </span>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                        STAGE_TONE[stageOf(deal)],
                      )}
                    >
                      {stageText(deal)}
                    </span>
                    <span className="ml-auto shrink-0 font-semibold text-primary">Open deal ›</span>
                  </button>
                ) : null}
                <DockMessages
                  conversation={c}
                  messages={messages}
                  compact={!isBig}
                  dealStarted={dealStarted}
                  onStartDeal={(dealId) => startDeal(c, dealId)}
                />
                <form
                  className="flex shrink-0 flex-col gap-2 border-t px-3 pt-2.5 pb-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    send(c);
                  }}
                >
                  <label htmlFor={`dock-${id}`} className="sr-only">
                    Write a message
                  </label>
                  <textarea
                    id={`dock-${id}`}
                    rows={2}
                    value={drafts[id] ?? ""}
                    onChange={(e) => setDrafts((s) => ({ ...s, [id]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send(c);
                      }
                    }}
                    placeholder="Write a message…"
                    className="resize-none rounded-md bg-muted px-3 py-2.5 text-[13px] leading-[19px] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30"
                  />
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => openDeal(id)}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Documents, meetings and terms ›
                    </button>
                    <Button type="submit" size="sm" disabled={!(drafts[id] ?? "").trim()}>
                      Send
                    </Button>
                  </div>
                </form>
              </>
            ) : null}
          </section>,
        ];
      })}

      <section
        aria-label="Messages"
        className={cn(
          "flex w-[340px] flex-col overflow-hidden rounded-t-[14px] border border-b-0 bg-card shadow-[0_-8px_32px_rgb(15_23_42/0.14)]",
          listOpen ? "h-[600px]" : "h-14",
        )}
      >
        <div
          className={cn("flex h-14 shrink-0 items-center gap-1 pr-2 pl-3", listOpen && "border-b")}
        >
          <button
            type="button"
            onClick={() => setListOpen((v) => !v)}
            aria-expanded={listOpen}
            className="flex flex-1 items-center gap-2.5 text-left"
          >
            <span
              aria-hidden
              className="flex size-[34px] items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: viewerOrg.tint }}
            >
              {viewerOrg.initials}
            </span>
            <span className="text-[15px] font-bold">Messages</span>
            {unread + pending ? (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[11px] font-bold text-white">
                <span className="sr-only">New: </span>
                {unread + pending}
              </span>
            ) : null}
          </button>
          <Button
            asChild
            variant="ghost"
            size="icon-sm"
            aria-label="Open full view"
            title="Open full view"
          >
            <Link href={routes.workspace.messages}>
              <Maximize2 aria-hidden />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={listOpen ? "Collapse messages" : "Expand messages"}
            onClick={() => setListOpen((v) => !v)}
          >
            {listOpen ? <ChevronDown aria-hidden /> : <ChevronUp aria-hidden />}
          </Button>
        </div>

        {listOpen ? (
          <>
            <div className="flex shrink-0 flex-col gap-2.5 px-3 pt-3">
              <div className="relative flex items-center">
                <Search
                  className="pointer-events-none absolute left-3 size-[15px] text-subtle-foreground"
                  aria-hidden
                />
                <input
                  type="search"
                  aria-label="Search messages"
                  placeholder="Search messages"
                  className="h-9 w-full rounded-[10px] bg-muted pr-3 pl-[34px] text-[13px] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30"
                />
              </div>
              <div role="tablist" aria-label="Messages" className="grid grid-cols-3 border-b">
                {(
                  [
                    ["all", "All"],
                    ["unread", "Unread"],
                    ["requests", `Requests${pending ? ` · ${pending}` : ""}`],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    role="tab"
                    aria-selected={tab === value}
                    onClick={() => setTab(value)}
                    className={cn(
                      "-mb-px h-[38px] border-b-2 text-[13px] font-semibold",
                      tab === value
                        ? "border-primary text-primary"
                        : "border-transparent text-subtle-foreground",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {tab === "requests" ? (
              <ul className="flex flex-1 flex-col gap-2.5 overflow-y-auto p-3">
                {requests.map((r) => (
                  <li key={r.id} className="flex flex-col gap-2 rounded-md border p-3">
                    <div className="flex gap-2.5">
                      <OrgAvatar initials={r.from.initials} tint={r.from.tint} size="md" />
                      <span className="flex min-w-0 flex-col gap-px">
                        <span className="text-[13px] font-bold">{r.from.name}</span>
                        <span className="text-xs text-muted-foreground">
                          About <strong>{r.project}</strong> · as {labelFor(LOOKING_FOR, r.role)}
                        </span>
                        <span className="text-[11px] text-subtle-foreground">
                          {r.sentAgo} · {r.match}% match
                        </span>
                      </span>
                    </div>
                    <p className="rounded-[8px] bg-surface-subtle px-2.5 py-2 text-xs leading-[18px] text-foreground/80">
                      “{r.note}”
                    </p>
                    {answered[r.id] ? (
                      <span
                        className={cn(
                          "text-xs font-semibold",
                          answered[r.id] === "accepted" ? "text-success" : "text-subtle-foreground",
                        )}
                      >
                        {answered[r.id] === "accepted"
                          ? "Accepted · you can now message"
                          : "Declined"}
                      </span>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => answer(r, "declined")}
                        >
                          Decline
                        </Button>
                        <Button size="sm" className="flex-1" onClick={() => answer(r, "accepted")}>
                          Accept
                        </Button>
                      </div>
                    )}
                  </li>
                ))}
                {!requests.length ? (
                  <li className="py-8 text-center text-[13px] text-subtle-foreground">
                    No new enquiries.
                  </li>
                ) : null}
                <li className="self-center">
                  <Link
                    href={routes.workspace.enquiries}
                    className="p-1.5 text-xs font-semibold text-primary hover:underline"
                  >
                    See all enquiries
                  </Link>
                </li>
              </ul>
            ) : (
              <ul className="flex-1 overflow-y-auto">
                {list.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => open(c.id)}
                      className={cn(
                        "flex w-full gap-2.5 border-b border-muted p-3 text-left hover:bg-surface-subtle",
                        windows.includes(c.id) && "bg-primary-soft",
                      )}
                    >
                      <OrgAvatar initials={c.them.initials} tint={c.them.tint} />
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="flex gap-1.5">
                          <span
                            className={cn(
                              "truncate text-sm",
                              c.unread ? "font-bold" : "font-semibold",
                            )}
                          >
                            {c.them.name}
                          </span>
                          <span className="ml-auto shrink-0 text-[11px] text-subtle-foreground">
                            {c.lastAt}
                          </span>
                        </span>
                        <span
                          className={cn(
                            "truncate text-xs",
                            c.unread ? "font-semibold text-foreground" : "text-subtle-foreground",
                          )}
                        >
                          {c.preview}
                        </span>
                        <span className="truncate text-[11px] font-semibold text-primary">
                          {c.tag}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
                {!list.length ? (
                  <li className="py-8 text-center text-[13px] text-subtle-foreground">
                    No unread messages.
                  </li>
                ) : null}
              </ul>
            )}
          </>
        ) : null}
      </section>
    </div>
  );
}

/** Message list of one dock window; keeps the newest message in view. */
function DockMessages({
  conversation: c,
  messages,
  compact,
  dealStarted,
  onStartDeal,
}: {
  conversation: ConversationView;
  messages: Message[];
  compact: boolean;
  dealStarted: (dealId: string) => boolean;
  onStartDeal: (dealId: string) => void;
}) {
  const listRef = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, compact]);
  return (
    <ol
      ref={listRef}
      className={cn(
        "flex flex-1 flex-col gap-3.5 overflow-y-auto",
        compact ? "p-3.5" : "px-5 py-4",
      )}
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
  );
}
