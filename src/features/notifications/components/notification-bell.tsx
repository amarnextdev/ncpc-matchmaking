"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Inbox } from "lucide-react";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { markNotificationsReadAction } from "../actions";
import type { BellData, BellItem } from "../queries";

function ago(iso: string) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "Just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86_400) return `${Math.floor(s / 3600)} h ago`;
  return new Intl.DateTimeFormat("en-ZA", { day: "numeric", month: "short" }).format(new Date(iso));
}

/**
 * Header bell: unread badge + the latest notifications. New ones arrive live (Supabase Realtime,
 * RLS: own rows only) with a toast; enquiry updates also refresh the page so counts stay right.
 */
export function NotificationBell({ userId, initial }: { userId: string; initial: BellData }) {
  const router = useRouter();
  const [items, setItems] = React.useState<BellItem[]>(initial.items);
  const [unread, setUnread] = React.useState(initial.unread);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setItems(initial.items);
    setUnread(initial.unread);
  }, [initial]);

  React.useEffect(() => {
    let channel: ReturnType<ReturnType<typeof createClient>["channel"]> | null = null;
    const supabase = createClient();
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) supabase.realtime.setAuth(data.session.access_token);
      channel = supabase
        .channel(`bell:${userId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            const r = payload.new as {
              id: string;
              kind: string;
              title: string;
              body: string | null;
              link: string | null;
              created_at: string;
            };
            const item: BellItem = {
              id: r.id,
              kind: r.kind,
              title: r.title,
              body: r.body,
              link: r.link,
              read: false,
              createdAt: r.created_at,
            };
            setItems((list) => [item, ...list.filter((i) => i.id !== item.id)].slice(0, 8));
            setUnread((n) => n + 1);
            toast(r.title, {
              description: r.body ?? undefined,
              action: r.link ? { label: "Open", onClick: () => router.push(r.link!) } : undefined,
            });
            if (/^(enquiry_|deal_|collab_|partnership_)/.test(r.kind)) router.refresh();
          },
        )
        .subscribe();
    });
    return () => {
      if (channel) void supabase.removeChannel(channel);
    };
  }, [userId, router]);

  function markAll() {
    setItems((list) => list.map((i) => ({ ...i, read: true })));
    setUnread(0);
    void markNotificationsReadAction();
  }

  function openItem(item: BellItem) {
    setOpen(false);
    if (!item.read) {
      setItems((list) => list.map((i) => (i.id === item.id ? { ...i, read: true } : i)));
      setUnread((n) => Math.max(0, n - 1));
      void markNotificationsReadAction([item.id]);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        className="relative flex size-11 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-muted hover:text-primary focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none data-[state=open]:bg-muted"
      >
        <Bell className="size-[21px]" aria-hidden />
        {unread ? (
          <span
            aria-hidden
            className="absolute top-1 right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-background bg-destructive px-1 text-[10px] font-bold text-white tabular-nums"
          >
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-[360px] overflow-hidden rounded-2xl p-0"
      >
        <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
          <p className="text-sm font-bold">Notifications</p>
          {unread ? (
            <button
              type="button"
              onClick={markAll}
              className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              <CheckCheck className="size-3.5" aria-hidden /> Mark all as read
            </button>
          ) : null}
        </div>
        {items.length ? (
          <ul className="max-h-[400px] divide-y overflow-y-auto">
            {items.map((n) => {
              const inner = (
                <span className="flex gap-3 px-4 py-3">
                  <span
                    aria-hidden
                    className={cn(
                      "mt-1.5 size-2 shrink-0 rounded-full",
                      n.read ? "bg-transparent" : "bg-primary",
                    )}
                  />
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span
                      className={cn(
                        "text-sm leading-5",
                        n.read ? "text-foreground/80" : "font-semibold",
                      )}
                    >
                      {n.title}
                    </span>
                    {n.body ? (
                      <span className="line-clamp-2 text-xs leading-[18px] text-muted-foreground">
                        {n.body}
                      </span>
                    ) : null}
                    <span className="text-[11px] text-subtle-foreground">{ago(n.createdAt)}</span>
                  </span>
                </span>
              );
              return (
                <li key={n.id} className={cn(!n.read && "bg-primary-soft/40")}>
                  {n.link ? (
                    <Link
                      href={n.link}
                      onClick={() => openItem(n)}
                      className="block transition-colors hover:bg-muted/60"
                    >
                      {inner}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openItem(n)}
                      className="block w-full text-left hover:bg-muted/60"
                    >
                      {inner}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
            <Inbox className="size-7 text-subtle-foreground" aria-hidden />
            <p className="text-sm font-semibold">You&apos;re all caught up</p>
            <p className="text-xs text-muted-foreground">
              Enquiries, reviews and messages show up here.
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
