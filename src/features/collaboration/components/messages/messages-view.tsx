"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { ConversationView, Deal, DealDocument, Message } from "../../types";
import { ChatThread } from "./chat-thread";
import { ConversationList } from "./conversation-list";
import { DealPanel } from "./deal-panel";

const now = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

/**
 * Full Messages page (LinkedIn-style): conversation list · chat · Deal panel.
 * Phones: list → chat (back button) and the Deal panel in a sheet.
 * Demo: sending, starting a deal and document status changes are kept in memory only.
 * TODO(Module 9): server actions + Supabase Realtime.
 */
export function MessagesView({ conversations }: { conversations: ConversationView[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlId = searchParams.get("c");
  const selected = conversations.find((c) => c.id === urlId) ?? null;
  const active = selected ?? conversations[0] ?? null;

  const [panelOpen, setPanelOpen] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dealFor, setDealFor] = useState<Record<string, string>>({});
  const [started, setStarted] = useState<Record<string, true>>({});
  const [sent, setSent] = useState<Record<string, Message[]>>({});
  const [docs, setDocs] = useState<Record<string, DealDocument["status"]>>({});

  const select = useCallback(
    (id: string | null) => {
      const next = new URLSearchParams(searchParams.toString());
      if (id) next.set("c", id);
      else next.delete("c");
      const q = next.toString();
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const isStarted = useCallback(
    (d: Deal) => d.stage !== "not_started" || Boolean(started[d.id]),
    [started],
  );
  const dealStarted = useCallback(
    (dealId: string) =>
      Boolean(started[dealId]) ||
      conversations.some((c) => c.deals.some((d) => d.id === dealId && d.stage !== "not_started")),
    [conversations, started],
  );

  const deal = useMemo(() => {
    if (!active) return null;
    const id = dealFor[active.id];
    return (
      active.deals.find((d) => d.id === id) ??
      active.deals.find((d) => d.stage !== "not_started") ??
      active.deals[0] ??
      null
    );
  }, [active, dealFor]);

  if (!active || !deal) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No messages yet"
        description="When an organisation accepts your enquiry, or you accept theirs, your conversation appears here."
        className="bg-card"
      />
    );
  }

  const messages = [...active.messages, ...(sent[active.id] ?? [])];

  function startDeal(dealId: string) {
    if (!active) return;
    const d = active.deals.find((x) => x.id === dealId);
    setStarted((s) => ({ ...s, [dealId]: true }));
    setDealFor((s) => ({ ...s, [active.id]: dealId }));
    setSent((s) => ({
      ...s,
      [active.id]: [
        ...(s[active.id] ?? []),
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

  function send(text: string) {
    if (!active) return;
    const me = active.me;
    setSent((s) => ({
      ...s,
      [active.id]: [
        ...(s[active.id] ?? []),
        {
          id: `s-${Date.now()}`,
          kind: "post",
          from: me.slug,
          person: me.contact.name,
          time: now(),
          text,
        },
      ],
    }));
  }

  const panel = (
    <DealPanel
      conversation={active}
      deal={deal}
      onDealChange={(id) => setDealFor((s) => ({ ...s, [active.id]: id }))}
      isStarted={isStarted}
      onStartDeal={startDeal}
      docStatus={(d, doc) => docs[`${d.id}:${doc.name}`] ?? doc.status}
      onDocStatus={(d, doc, status) => setDocs((s) => ({ ...s, [`${d.id}:${doc.name}`]: status }))}
    />
  );

  return (
    <div className="flex h-[calc(100dvh-14rem)] min-h-[560px] overflow-hidden rounded-lg border bg-card shadow-card">
      <ConversationList
        conversations={conversations}
        selectedId={active.id}
        onSelect={select}
        className={cn(
          "w-full border-r lg:flex lg:w-[320px] xl:w-[340px]",
          selected ? "hidden" : "flex",
        )}
      />
      <ChatThread
        conversation={active}
        messages={messages}
        deal={deal}
        dealStarted={dealStarted}
        onStartDeal={startDeal}
        onSend={send}
        onBack={() => select(null)}
        panelOpen={panelOpen}
        onTogglePanel={() => setPanelOpen((v) => !v)}
        onOpenDealSheet={() => setSheetOpen(true)}
        className={cn("flex-1 lg:flex", selected ? "flex" : "hidden")}
      />
      {panelOpen ? (
        <aside
          aria-label="Deal panel"
          className="hidden w-[360px] shrink-0 border-l xl:flex xl:flex-col"
        >
          {panel}
        </aside>
      ) : null}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="p-0 xl:hidden">
          <div className="border-b px-[18px] py-4 pr-14">
            <SheetTitle>Deal with {active.them.name}</SheetTitle>
            <SheetDescription className="sr-only">
              Documents, meetings and key terms for this deal.
            </SheetDescription>
          </div>
          <div className="min-h-0 flex-1">{panel}</div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
