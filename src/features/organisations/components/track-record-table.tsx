import Link from "next/link";
import { ArrowUpRight, Lock } from "lucide-react";
import { routes } from "@/config/routes";
import { PROJECT_STAGES, labelFor, type ProjectStage } from "@/lib/constants";
import { formatMonth } from "@/lib/dates";
import { cn, initials } from "@/lib/utils";
import { TRACK_ROLES } from "../constants";
import type { TrackRecordItem } from "../types";

const COLUMNS = "md:grid-cols-[minmax(0,2.3fr)_minmax(0,1.5fr)_minmax(0,1.2fr)_84px_104px]";

/** Status colours: green = done, navy = building, amber = raising money, grey = early. */
const STAGE_BADGE: Record<ProjectStage, { pill: string; dot: string }> = {
  operational: { pill: "bg-success-soft text-success", dot: "bg-success" },
  construction: { pill: "bg-primary-soft text-primary", dot: "bg-primary" },
  funding: { pill: "bg-warning-soft text-warning", dot: "bg-[#C98A16]" },
  feasibility: { pill: "bg-muted text-foreground/80", dot: "bg-subtle-foreground" },
  idea: { pill: "bg-muted text-foreground/80", dot: "bg-input" },
};

/**
 * Track record table: Project · Role · Status · Since · action. Stacks into rows on phones.
 * `bare` drops the outer border when the table sits inside a card.
 */
export function TrackRecordTable({
  items,
  bare = false,
}: {
  items: TrackRecordItem[];
  bare?: boolean;
}) {
  return (
    <div className={cn("overflow-hidden bg-card", !bare && "rounded-lg border")}>
      <div
        aria-hidden
        className={cn(
          "hidden gap-4 border-b bg-surface-subtle px-5 py-3 text-[11px] font-semibold tracking-[0.08em] text-subtle-foreground uppercase md:grid",
          COLUMNS,
        )}
      >
        <span>Project</span>
        <span>Role</span>
        <span>Status</span>
        <span>Since</span>
        <span className="sr-only">Action</span>
      </div>
      <ul className="divide-y">
        {items.map((item) => (
          <TrackRow key={item.id} item={item} />
        ))}
      </ul>
    </div>
  );
}

function TrackRow({ item }: { item: TrackRecordItem }) {
  const index = PROJECT_STAGES.findIndex((s) => s.value === item.stage);
  const finished = item.stage === "operational";
  const badge = STAGE_BADGE[item.stage];
  const href = item.projectSlug ? routes.opportunities.detail(item.projectSlug) : null;

  return (
    <li
      className={cn(
        "relative grid gap-3 px-5 py-4 md:items-center md:gap-4",
        COLUMNS,
        href && "transition-colors hover:bg-surface-subtle/80",
      )}
    >
      <div className="flex min-w-0 items-center gap-3.5">
        <span
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-md text-[13px] font-bold text-white"
          style={{ backgroundColor: item.tint }}
        >
          {initials(item.projectTitle)}
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          {href ? (
            <Link
              href={href}
              className="truncate text-[15px] font-semibold after:absolute after:inset-0 hover:text-primary focus-visible:outline-none focus-visible:after:ring-[3px] focus-visible:after:ring-ring/30 focus-visible:after:ring-inset"
            >
              {item.projectTitle}
            </Link>
          ) : (
            <p className="truncate text-[15px] font-semibold">{item.projectTitle}</p>
          )}
          <p className="truncate text-[13px] text-muted-foreground">
            {item.projectOwner}
            <span className="md:hidden"> · {formatMonth(item.since)}</span>
          </p>
        </div>
      </div>

      <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 md:flex-col md:gap-0.5">
        <span className="text-sm font-medium text-foreground">
          {labelFor(TRACK_ROLES, item.roleType)}
        </span>
        <span className="truncate text-[13px] text-muted-foreground">
          <span className="md:hidden">· </span>
          {item.detail}
        </span>
      </div>

      <div className="flex items-center gap-3 md:flex-col md:items-start md:gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
            badge.pill,
          )}
        >
          <span aria-hidden className={cn("size-1.5 rounded-full", badge.dot)} />
          {labelFor(PROJECT_STAGES, item.stage)}
          <span className="font-medium opacity-70">
            {index + 1}/{PROJECT_STAGES.length}
          </span>
        </span>
        <span aria-hidden className="grid w-24 grid-cols-5 gap-0.5">
          {PROJECT_STAGES.map((stage, i) => (
            <span
              key={stage.value}
              className={cn(
                "h-1 rounded-full",
                i < index || finished ? "bg-success" : i === index ? "bg-primary" : "bg-border",
              )}
            />
          ))}
        </span>
      </div>

      <span className="hidden text-[13px] text-muted-foreground tabular-nums md:block">
        {formatMonth(item.since)}
      </span>

      <span className="hidden justify-end md:flex">
        {href ? (
          <span
            aria-hidden
            className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[13px] font-semibold text-primary"
          >
            View
            <ArrowUpRight className="size-3.5" />
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-subtle-foreground">
            <Lock className="size-3" aria-hidden />
            Private
          </span>
        )}
      </span>
    </li>
  );
}
