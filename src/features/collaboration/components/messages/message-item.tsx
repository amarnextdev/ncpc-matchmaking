import Link from "next/link";
import { CalendarDays, Check, CheckCheck, CheckCircle2, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";
import type { FileRef, Message, Party } from "../../types";

const EVENT_ICON = { link: Handshake, calendar: CalendarDays, check: CheckCircle2 };

const FILE_TONE: Record<FileRef["type"], string> = {
  pdf: "bg-[#FDECEA] text-destructive",
  xlsx: "bg-success-soft text-success",
  doc: "bg-primary-soft text-primary",
};

/** One row of the chat: day divider, system event, or a message bubble (mine right, theirs left). */
export function MessageItem({
  message: m,
  parties,
  mySlug,
  compact,
  dealStarted,
  onStartDeal,
  first = true,
  last = true,
}: {
  message: Message;
  parties: Party[];
  mySlug: string;
  compact?: boolean;
  dealStarted?: (dealId: string) => boolean;
  onStartDeal?: (dealId: string) => void;
  /** First message of a run from the same side (shows the name) */
  first?: boolean;
  /** Last message of a run (shows time and Sent / Seen) */
  last?: boolean;
}) {
  if (m.kind === "divider") {
    return (
      <div className="my-1.5 flex justify-center">
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold tracking-[0.03em] text-muted-foreground">
          {m.text}
        </span>
      </div>
    );
  }
  if (m.kind === "event") {
    const Icon = EVENT_ICON[m.icon];
    return (
      <p
        className={cn(
          "flex max-w-full items-center gap-2 self-center rounded-full px-3.5 py-2 text-center text-[13px]",
          m.tone === "green" ? "bg-success-soft text-[#1F4F0C]" : "bg-primary-soft text-primary",
        )}
      >
        <Icon className="size-[15px] shrink-0" aria-hidden />
        <span>
          <strong>{m.title}</strong> {m.text}
        </span>
      </p>
    );
  }
  const from = parties.find((p) => p.slug === m.from);
  const mine = m.from === mySlug;
  void compact;
  return (
    <div
      className={cn(
        "flex flex-col",
        mine ? "items-end" : "items-start",
        first ? "mt-2.5" : "mt-0.5",
      )}
    >
      {first && !mine ? (
        <span className="mx-1 mb-0.5 text-[11px] text-muted-foreground">
          {[m.person, from?.name].filter(Boolean).join(" · ")}
        </span>
      ) : null}
      <div
        className={cn(
          "flex max-w-[82%] min-w-0 flex-col gap-1.5",
          mine ? "items-end" : "items-start",
        )}
      >
        <p
          className={cn(
            "px-3 py-2 text-sm leading-5 break-words whitespace-pre-line",
            mine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
            mine
              ? last
                ? "rounded-[16px_16px_4px_16px]"
                : "rounded-[16px_4px_4px_16px]"
              : last
                ? "rounded-[16px_16px_16px_4px]"
                : "rounded-[4px_16px_16px_4px]",
            m.status === "sending" && "opacity-70",
          )}
        >
          {m.text}
        </p>
        {m.files?.length ? (
          <div className="mt-0.5 flex flex-wrap gap-2">
            {m.files.map((f) => (
              <a
                key={f.name}
                href="#"
                className="flex min-w-0 items-center gap-2.5 rounded-md border py-2.5 pr-3.5 pl-2.5 hover:bg-muted"
              >
                <span
                  aria-hidden
                  className={cn(
                    "flex size-[34px] shrink-0 items-center justify-center rounded-[8px] text-[10px] font-bold uppercase",
                    FILE_TONE[f.type],
                  )}
                >
                  {f.type === "xlsx" ? "xls" : f.type}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-[13px] font-semibold">{f.name}</span>
                  <span className="text-xs text-subtle-foreground">{f.size}</span>
                </span>
              </a>
            ))}
          </div>
        ) : null}
        {m.project ? (
          <div className="mt-0.5 w-full max-w-[380px] overflow-hidden rounded-lg border">
            <div className="relative h-[72px]" style={{ backgroundColor: m.project.tint }}>
              <span
                className="absolute top-3 left-3 rounded-full bg-white px-2.5 py-0.5 text-[11px] font-bold"
                style={{ color: m.project.tint }}
              >
                Shared project
              </span>
            </div>
            <div className="flex flex-col gap-1 px-3.5 pt-3 pb-3.5">
              <span className="text-eyebrow">{m.project.eyebrow}</span>
              <span className="text-[15px] font-bold">{m.project.title}</span>
              <span className="text-[13px] text-muted-foreground">{m.project.meta}</span>
              <div className="mt-2 flex gap-2">
                {m.project.slug ? (
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={routes.opportunities.detail(m.project.slug)}>View project</Link>
                  </Button>
                ) : null}
                {mine ? (
                  <span className="flex h-9 flex-1 items-center justify-center rounded-full bg-muted px-3 text-xs font-semibold text-muted-foreground">
                    {dealStarted?.(m.project.dealId)
                      ? "Deal started"
                      : "Shared · waiting for reply"}
                  </span>
                ) : (
                  <Button
                    size="sm"
                    className="flex-1"
                    disabled={dealStarted?.(m.project.dealId)}
                    onClick={() => m.project && onStartDeal?.(m.project.dealId)}
                  >
                    {dealStarted?.(m.project.dealId) ? "Deal started" : "Start a deal"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
      {last ? (
        <span
          className={cn(
            "mx-1 mt-0.5 flex items-center gap-1 text-[11px]",
            m.status === "seen" ? "text-success" : "text-subtle-foreground",
          )}
        >
          {m.status === "sending" ? (
            "Sending…"
          ) : (
            <>
              {m.time}
              {m.status === "sent" ? (
                <>
                  <Check className="size-3" strokeWidth={2.6} aria-hidden /> Sent
                </>
              ) : m.status === "seen" ? (
                <>
                  <CheckCheck className="size-3.5" strokeWidth={2.4} aria-hidden /> Seen
                </>
              ) : null}
            </>
          )}
        </span>
      ) : null}
    </div>
  );
}
