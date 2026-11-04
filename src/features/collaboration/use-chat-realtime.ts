"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { ConversationView, Message } from "./types";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TYPING_MS = 3500;
const SEND_TYPING_EVERY = 1500;
const SYNC_AFTER_MS = 2500;

const clock = (d: Date) =>
  `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

type Row = {
  id: string;
  conversation_id: string;
  sender_org_id: string;
  body: string;
  created_at: string;
};

/**
 * Real-time chat for the dock:
 * - new messages from the other side are added at once (Postgres changes on `messages`,
 *   RLS: members of either organisation only), then the page data syncs quietly a moment later;
 * - "typing…" and "seen" travel as Broadcast events on one channel per conversation (no database).
 * Demo conversations (non-uuid ids) are ignored.
 */
export function useChatRealtime(conversations: ConversationView[], me: { name: string }) {
  const router = useRouter();
  const db = useMemo(() => conversations.filter((c) => UUID.test(c.id)), [conversations]);
  const key = db
    .map((c) => c.id)
    .sort()
    .join(",");

  const [incoming, setIncoming] = useState<Record<string, Message[]>>({});
  const [typing, setTyping] = useState<Record<string, string>>({});
  const [seen, setSeen] = useState<Record<string, true>>({});
  const [lastIncomingAt, setLastIncomingAt] = useState<Record<string, number>>({});

  const channels = useRef<Map<string, RealtimeChannel>>(new Map());
  const typingTimers = useRef<Map<string, number>>(new Map());
  const lastTypingSent = useRef<Map<string, number>>(new Map());
  const syncTimer = useRef<number | null>(null);
  const convRef = useRef(db);
  convRef.current = db;

  // Fresh server data includes everything: drop the live copies.
  useEffect(() => {
    setIncoming({});
    setSeen({});
  }, [conversations]);

  const scheduleSync = useCallback(() => {
    if (syncTimer.current) window.clearTimeout(syncTimer.current);
    syncTimer.current = window.setTimeout(() => router.refresh(), SYNC_AFTER_MS);
  }, [router]);

  useEffect(() => {
    if (!key) return;
    const supabase = createClient();
    const map = channels.current;
    let changes: RealtimeChannel | null = null;
    let cancelled = false;

    void supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      if (data.session) supabase.realtime.setAuth(data.session.access_token);

      // 1) New messages (from anyone; our own are already shown optimistically).
      changes = supabase
        .channel(`msgs:${Math.random().toString(36).slice(2, 8)}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=in.(${key})`,
          },
          (payload) => {
            const r = payload.new as Row;
            const c = convRef.current.find((x) => x.id === r.conversation_id);
            if (!c || r.sender_org_id === c.me.orgId) return;
            const msg: Message = {
              id: r.id,
              kind: "post",
              from: c.them.slug,
              person: c.them.contact.name,
              time: clock(new Date(r.created_at)),
              text: r.body,
            };
            setIncoming((s) => {
              const list = s[c.id] ?? [];
              if (list.some((m) => m.id === msg.id) || c.messages.some((m) => m.id === msg.id))
                return s;
              return { ...s, [c.id]: [...list, msg] };
            });
            setTyping((t) => {
              const next = { ...t };
              delete next[c.id];
              return next;
            });
            setLastIncomingAt((s) => ({ ...s, [c.id]: Date.now() }));
            scheduleSync();
          },
        )
        .subscribe();

      // 2) Typing and seen, per conversation.
      for (const c of convRef.current) {
        const ch = supabase.channel(`conv:${c.id}`, { config: { broadcast: { self: false } } });
        ch.on("broadcast", { event: "typing" }, ({ payload }) => {
          const p = payload as { org?: string; name?: string; stop?: boolean };
          if (p.org === c.me.slug) return;
          const t = typingTimers.current.get(c.id);
          if (t) window.clearTimeout(t);
          if (p.stop) {
            setTyping((s) => {
              const next = { ...s };
              delete next[c.id];
              return next;
            });
            return;
          }
          setTyping((s) => ({ ...s, [c.id]: p.name || c.them.name }));
          typingTimers.current.set(
            c.id,
            window.setTimeout(
              () =>
                setTyping((s) => {
                  const next = { ...s };
                  delete next[c.id];
                  return next;
                }),
              TYPING_MS,
            ),
          );
        });
        ch.on("broadcast", { event: "read" }, ({ payload }) => {
          if ((payload as { org?: string }).org === c.me.slug) return;
          setSeen((s) => ({ ...s, [c.id]: true }));
        });
        ch.subscribe();
        map.set(c.id, ch);
      }
    });

    return () => {
      cancelled = true;
      if (changes) void supabase.removeChannel(changes);
      for (const ch of map.values()) void supabase.removeChannel(ch);
      map.clear();
    };
  }, [key, scheduleSync]);

  /** Call on every keystroke; sends at most one "typing" event every 1.5 s. */
  const sendTyping = useCallback(
    (conversationId: string, mySlug: string) => {
      const ch = channels.current.get(conversationId);
      if (!ch) return;
      const now = Date.now();
      if (now - (lastTypingSent.current.get(conversationId) ?? 0) < SEND_TYPING_EVERY) return;
      lastTypingSent.current.set(conversationId, now);
      void ch.send({ type: "broadcast", event: "typing", payload: { org: mySlug, name: me.name } });
    },
    [me.name],
  );

  const stopTyping = useCallback((conversationId: string, mySlug: string) => {
    lastTypingSent.current.delete(conversationId);
    void channels.current
      .get(conversationId)
      ?.send({ type: "broadcast", event: "typing", payload: { org: mySlug, stop: true } });
  }, []);

  /** Tell the other side we have read the chat (their messages turn "Seen"). */
  const sendRead = useCallback((conversationId: string, mySlug: string) => {
    void channels.current
      .get(conversationId)
      ?.send({ type: "broadcast", event: "read", payload: { org: mySlug } });
  }, []);

  return { incoming, typing, seen, lastIncomingAt, sendTyping, stopTyping, sendRead, scheduleSync };
}
