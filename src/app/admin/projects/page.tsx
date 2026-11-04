import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Clock3, Hourglass, Rocket, RotateCcw, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { WaitingBadge } from "@/features/admin/approvals/components/waiting-badge";
import { getReviewCounts } from "@/features/admin/approvals/queries";
import { ReviewSwitch } from "@/features/admin/components/review-switch";
import { categoryLabel, formatDate, provinceLabel } from "@/features/admin/approvals/labels";
import {
  PROJECT_REVIEW_TABS,
  getProjectReviewCounts,
  getProjectReviewStats,
  listProjectsForReview,
  type ProjectReviewTab,
} from "@/features/admin/projects/queries";
import { THEME_TINT } from "@/features/opportunities/utils";
import { PROJECT_STAGES, THEMES, labelFor } from "@/lib/constants";
import { cn, formatRand } from "@/lib/utils";

export const metadata: Metadata = { title: "Projects" };
export const dynamic = "force-dynamic";

function Stat({
  label,
  value,
  note,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  note: string;
  icon: typeof Clock3;
  tone?: "default" | "warning" | "success";
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border bg-background p-5">
      <span
        aria-hidden
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-xl",
          tone === "warning" && "bg-warning-soft text-warning",
          tone === "success" && "bg-success-soft text-success",
          tone === "default" && "bg-primary-soft text-primary",
        )}
      >
        <Icon className="size-5" />
      </span>
      <div className="flex flex-col gap-0.5">
        <span className="text-[13px] font-medium text-muted-foreground">{label}</span>
        <span className="text-2xl font-bold tracking-tight">{value}</span>
        <span className="text-xs text-muted-foreground">{note}</span>
      </div>
    </div>
  );
}

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string }>;
}) {
  const params = await searchParams;
  const tab: ProjectReviewTab = PROJECT_REVIEW_TABS.some((t) => t.value === params.tab)
    ? (params.tab as ProjectReviewTab)
    : "in_review";
  const q = typeof params.q === "string" ? params.q : "";
  const [counts, stats, rows, orgCounts] = await Promise.all([
    getProjectReviewCounts(),
    getProjectReviewStats(),
    listProjectsForReview(tab, q),
    getReviewCounts(),
  ]);
  const oldestDays = stats.oldestSubmittedAt
    ? Math.max(0, Math.floor((Date.now() - stats.oldestSubmittedAt.getTime()) / 86_400_000))
    : 0;

  return (
    <div className="flex flex-col gap-6 px-5 py-8 lg:px-8 xl:px-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
            Approvals
          </p>
          <h1 className="text-[28px] font-bold tracking-tight">Projects</h1>
          <p className="text-[15px] text-muted-foreground">
            Check each project before it goes live in Explore. Target: a decision within 2–3 working
            days.
          </p>
        </div>
        <ReviewSwitch
          active="projects"
          organisations={orgCounts.pending}
          projects={counts.in_review}
        />
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Waiting for review"
          value={String(counts.in_review)}
          note="Projects to check"
          icon={Hourglass}
        />
        <Stat
          label="Longest wait"
          value={counts.in_review ? (oldestDays === 1 ? "1 day" : `${oldestDays} days`) : "—"}
          note="Oldest submission in the queue"
          icon={Clock3}
          tone={oldestDays >= 3 ? "warning" : "default"}
        />
        <Stat
          label="Changes requested"
          value={String(counts.changes_requested)}
          note="Waiting for the owner"
          icon={RotateCcw}
        />
        <Stat
          label="Went live"
          value={String(stats.liveLast30)}
          note="In the last 30 days"
          icon={Rocket}
          tone="success"
        />
      </div>

      <section
        aria-labelledby="queue-title"
        className="overflow-hidden rounded-2xl border bg-background"
      >
        <h2 id="queue-title" className="sr-only">
          Project review queue
        </h2>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
          <nav aria-label="Review status" className="flex flex-wrap gap-1">
            {PROJECT_REVIEW_TABS.map((t) => {
              const on = t.value === tab;
              return (
                <Link
                  key={t.value}
                  href={`${routes.admin.projects}?tab=${t.value}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                  aria-current={on ? "page" : undefined}
                  className={cn(
                    "flex h-9 items-center gap-2 rounded-full px-3.5 text-sm font-medium transition-colors",
                    on
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground/70 hover:bg-muted hover:text-foreground",
                  )}
                >
                  {t.label}
                  <span
                    className={cn(
                      "min-w-5 rounded-full px-1.5 text-center text-xs font-semibold",
                      on ? "bg-white/20" : "bg-muted text-foreground/70",
                    )}
                  >
                    {counts[t.value]}
                  </span>
                </Link>
              );
            })}
          </nav>
          <form role="search" action={routes.admin.projects} className="relative w-full sm:w-72">
            <input type="hidden" name="tab" value={tab} />
            <label htmlFor="projects-q" className="sr-only">
              Search projects
            </label>
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              id="projects-q"
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Search project or organisation"
              className="h-10 w-full rounded-full border border-input bg-surface-subtle pr-4 pl-10 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20"
            />
          </form>
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-20 text-center">
            <CheckCircle2 className="size-10 text-success" aria-hidden />
            <p className="text-lg font-semibold">
              {q
                ? "No projects match your search"
                : tab === "in_review"
                  ? "All caught up"
                  : "No projects here"}
            </p>
            <p className="max-w-md text-sm text-muted-foreground">
              {q
                ? "Try another project or organisation name."
                : tab === "in_review"
                  ? "New projects appear here as soon as a member submits one."
                  : "Projects move here after a decision."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <caption className="sr-only">
                {PROJECT_REVIEW_TABS.find((t) => t.value === tab)?.label}: {rows.length} projects
              </caption>
              <thead className="bg-surface-subtle text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                <tr>
                  <th scope="col" className="px-5 py-3">
                    Project
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Theme · stage
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Capital
                  </th>
                  <th scope="col" className="px-5 py-3">
                    {tab === "in_review" ? "Submitted" : "Reviewed"}
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Media
                  </th>
                  <th scope="col" className="px-5 py-3 text-right">
                    <span className="sr-only">Action</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((r) => (
                  <tr key={r.id} className="transition-colors hover:bg-primary-soft/30">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          aria-hidden
                          className="size-10 shrink-0 rounded-lg"
                          style={{ backgroundColor: THEME_TINT[r.theme] }}
                        />
                        <div className="flex min-w-0 flex-col">
                          <Link
                            href={routes.admin.project(r.id)}
                            className="truncate font-semibold text-foreground hover:text-primary hover:underline"
                          >
                            {r.title}
                          </Link>
                          <span className="truncate text-xs text-muted-foreground">
                            {r.orgName} · {categoryLabel(r.orgCategory)} ·{" "}
                            {[r.city, provinceLabel(r.province)].filter(Boolean).join(", ")}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col items-start gap-1">
                        <Badge variant="neutral">{labelFor(THEMES, r.theme)}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {labelFor(PROJECT_STAGES, r.stage)}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-semibold tabular-nums">
                      {r.capitalNeeded ? formatRand(r.capitalNeeded) : "—"}
                    </td>
                    <td className="px-5 py-4">
                      {tab === "in_review" ? (
                        <div className="flex flex-col items-start gap-1">
                          <span className="text-foreground/80">{formatDate(r.submittedAt)}</span>
                          <WaitingBadge since={r.submittedAt} />
                        </div>
                      ) : (
                        <span className="text-foreground/80">{formatDate(r.reviewedAt)}</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-muted-foreground">
                      <span className={cn(r.photos >= 4 && "font-semibold text-success")}>
                        {r.photos} photos
                      </span>{" "}
                      · {r.docs} docs
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button
                        variant={tab === "in_review" ? "outline-primary" : "outline"}
                        size="sm"
                        asChild
                      >
                        <Link href={routes.admin.project(r.id)}>
                          {tab === "in_review" ? "Review" : "View"}
                          <span className="sr-only"> {r.title}</span>
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
