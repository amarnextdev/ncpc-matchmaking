import { cn } from "@/lib/utils";

/** How long an organisation has waited. Amber after 2 days, red after 5 (target: 2–3 working days). */
export function WaitingBadge({ since, now = new Date() }: { since: Date | null; now?: Date }) {
  if (!since) return <span className="text-sm text-muted-foreground">—</span>;
  const days = Math.floor((now.getTime() - since.getTime()) / 86_400_000);
  const label = days <= 0 ? "Today" : days === 1 ? "1 day" : `${days} days`;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        days >= 5
          ? "bg-destructive/10 text-destructive"
          : days >= 2
            ? "bg-warning-soft text-warning"
            : "bg-muted text-foreground/70",
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {label}
      {days >= 5 ? <span className="sr-only"> (overdue)</span> : null}
    </span>
  );
}
