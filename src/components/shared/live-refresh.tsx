"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

type LiveRefreshProps = {
  userId: string;
  /** Only react to these notification kinds (prefix match, e.g. "organisation_"). Empty = all. */
  kinds?: string[];
  /** Backup check while the tab is open, in case Realtime is unavailable. 0 = off. */
  pollMs?: number;
};

/**
 * Re-renders the page as soon as NCPC decides something for this person, without a manual reload.
 * Listens for new rows in `notifications` (Supabase Realtime, RLS: own rows only), then calls
 * router.refresh(); the server page redirects or shows the new status. Also refreshes when the
 * tab becomes visible again, and every `pollMs` as a fallback. Renders nothing.
 */
export function LiveRefresh({ userId, kinds = [], pollMs = 20_000 }: LiveRefreshProps) {
  const router = useRouter();
  const kindsKey = kinds.join(",");

  React.useEffect(() => {
    const wanted = kindsKey ? kindsKey.split(",") : [];
    const refresh = () => router.refresh();
    let supabase: ReturnType<typeof createClient> | null = null;
    let channel: ReturnType<ReturnType<typeof createClient>["channel"]> | null = null;

    try {
      supabase = createClient();
      const client = supabase;
      void client.auth.getSession().then(({ data }) => {
        // Realtime checks RLS with the person's own token.
        if (data.session) client.realtime.setAuth(data.session.access_token);
        channel = client
          .channel(`live:${userId}:${Math.random().toString(36).slice(2, 8)}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "notifications",
              filter: `user_id=eq.${userId}`,
            },
            (payload) => {
              const row = payload.new as { kind?: string; title?: string; body?: string | null };
              if (wanted.length && !wanted.some((k) => row.kind?.startsWith(k))) return;
              if (row.title) toast.success(row.title, { description: row.body ?? undefined });
              refresh();
            },
          )
          .subscribe();
      });
    } catch (error) {
      console.warn("[live] realtime unavailable, using polling only:", error);
    }

    const onVisible = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", onVisible);
    const timer = pollMs
      ? window.setInterval(() => document.visibilityState === "visible" && refresh(), pollMs)
      : null;

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      if (timer) window.clearInterval(timer);
      if (channel && supabase) void supabase.removeChannel(channel);
    };
  }, [router, userId, kindsKey, pollMs]);

  return null;
}
