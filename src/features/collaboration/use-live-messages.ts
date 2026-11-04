"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Live chat: listens for new rows in `messages` for these conversations (Realtime, RLS: members
 * of either organisation only) and refreshes the page data. Demo conversations are ignored.
 */
export function useLiveMessages(conversationIds: string[], onNew?: () => void) {
  const router = useRouter();
  const ids = useMemo(
    () => conversationIds.filter((id) => UUID.test(id)).sort(),
    [conversationIds],
  );
  const key = ids.join(",");

  useEffect(() => {
    if (!key) return;
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) supabase.realtime.setAuth(data.session.access_token);
      channel = supabase
        .channel(`chat:${Math.random().toString(36).slice(2, 8)}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=in.(${key})`,
          },
          () => {
            onNew?.();
            router.refresh();
          },
        )
        .subscribe();
    });
    return () => {
      if (channel) void supabase.removeChannel(channel);
    };
  }, [key, router, onNew]);
}

export const isDbId = (id: string) => UUID.test(id);
