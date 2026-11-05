"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Handshake, Maximize2, Minimize2, Search, X } from "lucide-react";
import { toast } from "sonner";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { LOOKING_FOR, ORGANISATION_CATEGORIES, labelFor } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ViewerOrg } from "@/types";
import { STAGE_TONE } from "../../constants";
import { markConversationReadAction, respondEnquiryAction, sendMessageAction } from "../../actions";
import { DOCK_EVENT } from "../../dock-events";
import { useChatRealtime } from "../../use-chat-realtime";
import { isDbId } from "../../use-live-messages";
import type { ConversationView, Deal, DealDocument, EnquiryRequest, Message } from "../../types";
import { dealStageLabel } from "../../views";
import { DealPanel } from "../messages/deal-panel";
import { LiveDealPanel } from "../messages/live-deal-panel";
import { startDealAction } from "../../deal-actions";
import { dealTodo } from "../../deal-todo";
import { MessageItem } from "../messages/message-item";
import { OrgAvatar } from "../org-avatar";

type Tab = "all" | "unread" | "requests";
const MAX_WINDOWS = 2;

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
  const router = useRouter();
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

  // Live chat: instant messages, typing and seen; fresh server data replaces optimistic messages.
  const rt = useChatRealtime(conversations, { name: viewerOrg.name });
  useEffect(() => setSent({}), [conversations]);

  // A message arriving in an open chat is read straight away.
  useEffect(() => {
    for (const id of Object.keys(rt.lastIncomingAt)) {
      const c = conversations.find((x) => x.id === id);
      if (c && windows.includes(id) && !minimised[id] && document.visibilityState === "visible") {
        void markConversationReadAction(id);
        rt.sendRead(id, c.me.slug);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when something new arrives
  }, [rt.lastIncomingAt]);

  // Open from the header icon / "Message" buttons (openDock) or from links (?chat=… / ?dock=1).
  useEffect(() => {
    const openChat = (id: string | null) => {
      setListOpen(id ? false : true);
      if (id) {
        setWindows((w) => [id, ...w.filter((x) => x !== id)].slice(0, MAX_WINDOWS));
        setMinimised((m) => ({ ...m, [id]: false }));
      }
    };
    const onEvent = (e: Event) => {
      const d = (e as CustomEvent<{ chat: string | null; deal?: boolean }>).detail;
      if (d?.chat && d.deal) openDeal(d.chat);
      else openChat(d?.chat ?? null);
    };
    window.addEventListener(DOCK_EVENT, onEvent);
    const params = new URLSearchParams(window.location.search);
    const chat = params.get("chat");
    if (chat || params.get("dock")) {
      if (chat && params.get("deal")) openDeal(chat);
      else openChat(chat);
      params.delete("chat");
      params.delete("dock");
      params.delete("deal");
      const q = params.toString();
      window.history.replaceState(null, "", `${window.location.pathname}${q ? `?${q}` : ""}`);
    }
    return () => window.removeEventListener(DOCK_EVENT, onEvent);
  }, [pathname]);

  const isOpenChat = (id: string) => windows.includes(id) && !minimised[id];
  const unreadOf = (c: ConversationView) =>
    isOpenChat(c.id) ? 0 : c.unread + (rt.incoming[c.id]?.length ?? 0);
  const unread = conversations.reduce((sum, c) => sum + unreadOf(c), 0);
  /** Server messages + live ones + my optimistic ones; "Sent" turns "Seen" when they read it. */
  const messagesOf = (c: ConversationView): Message[] =>
    [...c.messages, ...(rt.incoming[c.id] ?? []), ...(sent[c.id] ?? [])].map((m) =>
      rt.seen[c.id] && m.kind === "post" && m.status === "sent" ? { ...m, status: "seen" } : m,
    );
  const pending = requests.filter((r) => !answered[r.id]).length;
  const list = tab === "unread" ? conversations.filter((c) => unreadOf(c)) : conversations;

  function openDeal(id: string) {
    setWindows([id]);
    setBig(null);
    setDealOf(id);
    setDealMin(false);
    setMinimised((m) => ({ ...m, [id]: false }));
  }

  function open(id: string) {
    const c = conversations.find((x) => x.id === id);
    if (c && isDbId(id)) {
      rt.sendRead(id, c.me.slug);
      if (unreadOf(c)) void markConversationReadAction(id).then(() => rt.scheduleSync());
    }
    if (dealOf && dealOf !== id) setDealOf(null);
    setWindows((w) => [id, ...w.filter((x) => x !== id)].slice(0, MAX_WINDOWS));
    setMinimised((m) => ({ ...m, [id]: false }));
  }

  function send(c: ConversationView) {
    const text = (drafts[c.id] ?? "").trim();
    if (!text) return;
    const d = new Date();
    const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    const tempId = `s-${Date.now()}`;
    rt.stopTyping(c.id, c.me.slug);
    setSent((s) => ({
      ...s,
      [c.id]: [
        ...(s[c.id] ?? []),
        {
          id: tempId,
          kind: "post",
          from: c.me.slug,
          person: c.me.contact.name,
          time,
          text,
          status: "sending" as const,
        },
      ],
    }));
    setDrafts((s) => ({ ...s, [c.id]: "" }));
    if (isDbId(c.id)) {
      const mark = (status: "sent" | "failed") =>
        setSent((s) => ({
          ...s,
          [c.id]: (s[c.id] ?? []).flatMap((m) =>
            m.id !== tempId || m.kind !== "post"
              ? [m]
              : status === "sent"
                ? [{ ...m, status: "sent" as const }]
                : [],
          ),
        }));
      void sendMessageAction({ conversationId: c.id, body: text })
        .then((r) => {
          if (r.ok) {
            mark("sent");
            rt.scheduleSync();
          } else {
            mark("failed");
            setDrafts((s) => ({ ...s, [c.id]: text }));
            toast.error(r.error);
          }
        })
        .catch(() => {
          mark("failed");
          setDrafts((s) => ({ ...s, [c.id]: text }));
          toast.error("We could not send the message. Your text is back in the box.");
        });
    }
  }

  async function answer(r: EnquiryRequest, result: "accepted" | "declined") {
    // Database enquiries have uuid ids; demo requests are answered in memory only.
    if (/^[0-9a-f-]{36}$/i.test(r.id)) {
      setAnswered((a) => ({ ...a, [r.id]: result }));
      const res = await respondEnquiryAction({
        enquiryId: r.id,
        decision: result === "accepted" ? "accept" : "decline",
      }).catch(() => ({ ok: false as const, error: "We could not save your answer." }));
      if (!res.ok) {
        setAnswered((a) => {
          const next = { ...a };
          delete next[r.id];
          return next;
        });
        toast.error(res.error);
        return;
      }
      router.refresh();
    } else {
      setAnswered((a) => ({ ...a, [r.id]: result }));
    }
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
    // Real deals start on the server (the "Deal started" event then comes from the database).
    if (d?.live) {
      setDealFor((s) => ({ ...s, [c.id]: dealId }));
      void startDealAction(d.live.enquiryId).then((r) => {
        if (!r.ok) toast.error(r.error);
        else {
          toast.success("Deal started");
          router.refresh();
        }
      });
      return;
    }
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
    <div className="pointer-events-none fixed right-6 bottom-0 z-40 flex items-end gap-3 max-lg:inset-0 max-lg:right-0 [&>*]:pointer-events-auto">
      {[...windows].reverse().map((id) => {
        const c = conversations.find((x) => x.id === id);
        if (!c) return null;
        if (big && big !== id) return null;
        const isOpen = !minimised[id];
        const isBig = big === id && isOpen;
        const deal = currentDeal(c);
        const messages = messagesOf(c);
        const dealWindow =
          dealOf === id && deal ? (
            <section
              key={`deal-${id}`}
              aria-label={`Deal with ${c.them.name}`}
              className={cn(
                "flex w-[460px] flex-col overflow-hidden rounded-t-[14px] border border-b-0 bg-card shadow-[0_-8px_32px_rgb(15_23_42/0.14)]",
                dealMin ? "h-16" : "h-[min(720px,calc(100dvh-72px))]",
                // Phones: full screen, above the chat
                "max-lg:fixed max-lg:inset-0 max-lg:z-50 max-lg:h-dvh max-lg:w-full max-lg:rounded-none max-lg:border-0",
              )}
            >
              <div className="flex h-16 shrink-0 items-center gap-1 border-b pr-2 pl-3.5">
                <button
                  type="button"
                  onClick={() => setDealMin((v) => !v)}
                  aria-expanded={!dealMin}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <span
                    aria-hidden
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white"
                  >
                    <Handshake className="size-[18px]" />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-[15px] font-bold">{deal.projectTitle}</span>
                    <span className="truncate text-xs text-subtle-foreground">
                      Deal with {c.them.name}
                    </span>
                  </span>
                </button>
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
                  {deal.live ? (
                    <LiveDealPanel
                      conversation={c}
                      deal={deal as typeof deal & { live: NonNullable<typeof deal.live> }}
                      deals={c.deals}
                      onDealChange={(dealId) => setDealFor((x) => ({ ...x, [id]: dealId }))}
                    />
                  ) : (
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
                  )}
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
              // Phones: the newest chat full screen, others hidden
              id === windows[0]
                ? "max-lg:fixed max-lg:inset-0 max-lg:z-40 max-lg:h-dvh max-lg:w-full max-lg:rounded-none max-lg:border-0"
                : "max-lg:hidden",
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
                {(() => {
                  const todo = dealTodo(deal?.live, c.them.name);
                  if (!todo || dealOf === id) return null;
                  return (
                    <div
                      role="status"
                      className="flex shrink-0 items-center gap-3 border-b bg-primary px-3.5 py-2.5 text-white"
                    >
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-[13px] font-bold">{todo.title}</span>
                        <span className="line-clamp-2 text-[11px] leading-4 text-[#D6E0F0]">
                          {todo.text}
                        </span>
                      </span>
                      <Button
                        size="sm"
                        className="shrink-0 bg-white font-bold text-primary hover:bg-white/90"
                        onClick={() => openDeal(id)}
                      >
                        {todo.cta}
                      </Button>
                    </div>
                  );
                })()}
                <DockMessages
                  conversation={c}
                  messages={messages}
                  typing={rt.typing[id]}
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
                    onChange={(e) => {
                      setDrafts((s) => ({ ...s, [id]: e.target.value }));
                      if (e.target.value.trim()) rt.sendTyping(id, c.me.slug);
                    }}
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
                      {c.deals.some((d) => d.live)
                        ? "Deal and collaboration ›"
                        : "Documents, meetings and terms ›"}
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
          // Phones: only when opened (header icon), full screen
          listOpen
            ? "max-lg:fixed max-lg:inset-0 max-lg:z-30 max-lg:h-dvh max-lg:w-full max-lg:rounded-none max-lg:border-0"
            : "max-lg:hidden",
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
                          {r.sentAgo}
                          {r.match ? ` · ${r.match}% match` : ""}
                        </span>
                      </span>
                    </div>
                    {r.note ? (
                      <p className="rounded-[8px] bg-surface-subtle px-2.5 py-2 text-xs leading-[18px] text-foreground/80">
                        “{r.note}”
                      </p>
                    ) : null}
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
                    href={routes.workspace.network}
                    className="p-1.5 text-xs font-semibold text-primary hover:underline"
                  >
                    See all invitations
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
                              unreadOf(c) ? "font-bold" : "font-semibold",
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
                            "flex items-center gap-1.5 truncate text-xs",
                            rt.typing[c.id]
                              ? "font-semibold text-success"
                              : unreadOf(c)
                                ? "font-semibold text-foreground"
                                : "text-subtle-foreground",
                          )}
                        >
                          <span className="truncate">
                            {rt.typing[c.id]
                              ? "Typing…"
                              : ((rt.incoming[c.id]?.at(-1) as { text?: string } | undefined)
                                  ?.text ?? c.preview)}
                          </span>
                          {unreadOf(c) ? (
                            <span className="ml-auto flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                              {unreadOf(c)}
                            </span>
                          ) : null}
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
  typing,
  compact,
  dealStarted,
  onStartDeal,
}: {
  conversation: ConversationView;
  messages: Message[];
  /** Name of whoever is typing on the other side */
  typing?: string;
  compact: boolean;
  dealStarted: (dealId: string) => boolean;
  onStartDeal: (dealId: string) => void;
}) {
  const listRef = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, compact, typing]);
  return (
    <ol
      ref={listRef}
      className={cn("flex flex-1 flex-col overflow-y-auto", compact ? "px-3.5 py-3" : "px-5 py-4")}
    >
      {messages.map((m, i) => {
        const side = (x?: Message) => (x && x.kind === "post" ? x.from : null);
        const me = side(m);
        return (
          <li key={m.id} className="flex flex-col">
            <MessageItem
              message={m}
              parties={[c.me, c.them]}
              mySlug={c.me.slug}
              compact={compact}
              dealStarted={dealStarted}
              onStartDeal={onStartDeal}
              first={side(messages[i - 1]) !== me}
              last={side(messages[i + 1]) !== me}
            />
          </li>
        );
      })}
      {typing ? (
        <li className="mt-2.5 flex items-center gap-2" aria-live="polite">
          <span
            className="flex gap-1 rounded-[16px_16px_16px_4px] bg-muted px-3 py-2.5"
            aria-hidden
          >
            {[0, 150, 300].map((d) => (
              <span
                key={d}
                className="size-1.5 animate-bounce rounded-full bg-muted-foreground/70"
                style={{ animationDelay: `${d}ms`, animationDuration: "1s" }}
              />
            ))}
          </span>
          <span className="text-[11px] text-muted-foreground">{typing} is typing…</span>
        </li>
      ) : null}
    </ol>
  );
}
