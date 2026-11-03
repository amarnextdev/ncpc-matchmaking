import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Clock3, Hourglass, RotateCcw, Search, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { OrgAvatar } from "@/features/admin/approvals/components/org-avatar";
import { WaitingBadge } from "@/features/admin/approvals/components/waiting-badge";
import { categoryLabel, formatDate, provinceLabel } from "@/features/admin/approvals/labels";
import {
  REVIEW_TABS,
  getReviewCounts,
  getReviewStats,
  listForReview,
  type ReviewTab,
} from "@/features/admin/approvals/queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Approvals" };
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

function DocDots({ n }: { n: number }) {
  return (
    <span className="flex items-center gap-2">
      <span aria-hidden className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn("h-1.5 w-4 rounded-full", i < n ? "bg-success-bar" : "bg-border")}
          />
        ))}
      </span>
      <span
        className={cn("text-xs font-semibold", n >= 3 ? "text-success" : "text-muted-foreground")}
      >
        {n}/3<span className="sr-only"> documents uploaded</span>
      </span>
    </span>
  );
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string }>;
}) {
  const params = await searchParams;
  const tab: ReviewTab = REVIEW_TABS.some((t) => t.value === params.tab)
    ? (params.tab as ReviewTab)
    : "pending";
  const q = typeof params.q === "string" ? params.q : "";
  const [counts, stats, rows] = await Promise.all([
    getReviewCounts(),
    getReviewStats(),
    listForReview(tab, q),
  ]);
  const oldestDays = stats.oldestSubmittedAt
    ? Math.max(0, Math.floor((Date.now() - stats.oldestSubmittedAt.getTime()) / 86_400_000))
    : 0;

  return (
    <div className="flex flex-col gap-6 px-5 py-8 lg:px-8 xl:px-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
            Organisations
          </p>
          <h1 className="text-[28px] font-bold tracking-tight">Approvals</h1>
          <p className="text-[15px] text-muted-foreground">
            Check each organisation&rsquo;s details and documents before it goes live. Target: a
            decision within 2–3 working days.
          </p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Waiting for review"
          value={String(counts.pending)}
          note="Organisations to check"
          icon={Hourglass}
        />
        <Stat
          label="Longest wait"
          value={counts.pending ? (oldestDays === 1 ? "1 day" : `${oldestDays} days`) : "—"}
          note="Oldest submission in the queue"
          icon={Clock3}
          tone={oldestDays >= 3 ? "warning" : "default"}
        />
        <Stat
          label="Changes requested"
          value={String(counts.changes_requested)}
          note="Waiting for the organisation"
          icon={RotateCcw}
        />
        <Stat
          label="Approved"
          value={String(stats.approvedLast30)}
          note="In the last 30 days"
          icon={ShieldCheck}
          tone="success"
        />
      </div>

      <section
        aria-labelledby="queue-title"
        className="overflow-hidden rounded-2xl border bg-background"
      >
        <h2 id="queue-title" className="sr-only">
          Review queue
        </h2>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
          <nav aria-label="Review status" className="flex flex-wrap gap-1">
            {REVIEW_TABS.map((t) => {
              const on = t.value === tab;
              return (
                <Link
                  key={t.value}
                  href={`${routes.admin.approvals}?tab=${t.value}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
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
          <form role="search" action={routes.admin.approvals} className="relative w-full sm:w-72">
            <input type="hidden" name="tab" value={tab} />
            <label htmlFor="approvals-q" className="sr-only">
              Search organisations
            </label>
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              id="approvals-q"
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Search name or registration no."
              className="h-10 w-full rounded-full border border-input bg-surface-subtle pr-4 pl-10 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20"
            />
          </form>
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-20 text-center">
            <CheckCircle2 className="size-10 text-success" aria-hidden />
            <p className="text-lg font-semibold">
              {q
                ? "No organisations match your search"
                : tab === "pending"
                  ? "All caught up"
                  : "No organisations here"}
            </p>
            <p className="max-w-md text-sm text-muted-foreground">
              {q
                ? "Try another name or registration number."
                : tab === "pending"
                  ? "New registrations appear here as soon as an organisation submits its details."
                  : "Organisations move here after a decision."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <caption className="sr-only">
                {REVIEW_TABS.find((t) => t.value === tab)?.label}: {rows.length} organisations
              </caption>
              <thead className="bg-surface-subtle text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                <tr>
                  <th scope="col" className="px-5 py-3">
                    Organisation
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Category
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Location
                  </th>
                  <th scope="col" className="px-5 py-3">
                    {tab === "pending" ? "Submitted" : "Updated"}
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Documents
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
                        <OrgAvatar name={r.name} category={r.category} />
                        <div className="flex min-w-0 flex-col">
                          <Link
                            href={routes.admin.approval(r.id)}
                            className="truncate font-semibold text-foreground hover:text-primary hover:underline"
                          >
                            {r.name}
                          </Link>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {r.registrationNo ?? "No registration number"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant="neutral">{categoryLabel(r.category)}</Badge>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {[r.city, provinceLabel(r.province)].filter(Boolean).join(", ")}
                    </td>
                    <td className="px-5 py-4">
                      {tab === "pending" ? (
                        <div className="flex flex-col items-start gap-1">
                          <span className="text-foreground/80">{formatDate(r.submittedAt)}</span>
                          <WaitingBadge since={r.submittedAt} />
                        </div>
                      ) : (
                        <span className="text-foreground/80">
                          {formatDate(r.approvedAt ?? r.submittedAt)}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <DocDots n={Number(r.docs ?? 0)} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button
                        variant={tab === "pending" ? "outline-primary" : "outline"}
                        size="sm"
                        asChild
                      >
                        <Link href={routes.admin.approval(r.id)}>
                          {tab === "pending" ? "Review" : "View"}
                          <span className="sr-only"> {r.name}</span>
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
