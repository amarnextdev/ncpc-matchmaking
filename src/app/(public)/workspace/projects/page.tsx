import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  Banknote,
  Check,
  CheckCircle2,
  Clock3,
  FolderPlus,
  Info,
  PencilLine,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { WorkspacePageHeader } from "@/components/layout/workspace-page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LiveRefresh } from "@/components/shared/live-refresh";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { FUNDING_TYPES } from "@/features/funding/constants";
import { deadlineInfo } from "@/features/funding/deadline";
import { getFundingOffers } from "@/features/funding/queries";
import { parseFundingFilters } from "@/features/funding/search-params";
import { MyProjectCard, editHrefFor } from "@/features/projects/components/my-project-card";
import { getListingOrg, listMyProjects, type MyProjectRow } from "@/features/projects/queries";
import { getSessionUser } from "@/lib/auth/session";
import { ORGANISATION_CATEGORIES, THEMES, labelFor } from "@/lib/constants";
import { cn, formatPercent, formatRand } from "@/lib/utils";

export const metadata: Metadata = { title: "My projects" };

const TABS = [
  { value: "all", label: "All" },
  { value: "live", label: "Live" },
  { value: "review", label: "In review" },
  { value: "draft", label: "Drafts" },
] as const;
type Tab = (typeof TABS)[number]["value"];

const inReview = (p: MyProjectRow) => p.status === "in_review" || p.status === "changes_requested";
const inTab = (p: MyProjectRow, tab: Tab) =>
  tab === "all" ||
  (tab === "live" && p.status === "live") ||
  (tab === "review" && inReview(p)) ||
  (tab === "draft" && p.kind === "draft");

const CANNOT: Record<string, string> = {
  "no-org": "Set up your organisation first, then you can list projects.",
  "not-approved": "You can list projects once NCPC has approved your organisation.",
  category: "Investors and funders don't list projects. Funders post funding offers instead.",
};

const HOW = [
  { title: "Create your listing", note: "About 15 minutes, saves as you go" },
  { title: "NCPC reviews it", note: "Usually 2–3 working days" },
  { title: "Live in Explore", note: "Members can send you enquiries" },
];

type PageProps = {
  searchParams: Promise<{ tab?: string; submitted?: string; cannot?: string }>;
};

function HeroStat({
  label,
  value,
  note,
  icon: Icon,
  tone,
  bar,
}: {
  label: string;
  value: string;
  note: string;
  icon: LucideIcon;
  tone: "green" | "amber" | "plain";
  bar?: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[14px] border border-white/15 bg-white/[0.06] px-4 py-3.5">
      <span
        aria-hidden
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-[10px]",
          tone === "green" && "bg-success-bar/20 text-[#A8DC8C]",
          tone === "amber" && "bg-[#F5B544]/20 text-[#F5C978]",
          tone === "plain" && "bg-white/10 text-white",
        )}
      >
        <Icon className="size-[17px]" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <dt className="text-xs font-medium text-[#B9C7DD]">{label}</dt>
        <dd className="flex items-baseline gap-1.5 whitespace-nowrap">
          <span className="text-xl leading-tight font-bold tracking-tight text-white tabular-nums">
            {value}
          </span>
          <span className="truncate text-xs text-[#B9C7DD]">{note}</span>
        </dd>
        {bar !== undefined ? (
          <div aria-hidden className="mt-1 h-1 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-success-bar"
              style={{ width: formatPercent(bar) }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default async function MyProjectsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const user = await getSessionUser();
  const listing = user ? await getListingOrg(user.id) : null;

  if (!user || !listing?.org) {
    const reason = listing && !listing.org ? listing.reason : null;
    return (
      <div className="bg-surface pb-16">
        <WorkspacePageHeader title="My projects" />
        <Container>
          <EmptyState
            icon={FolderPlus}
            title={
              user
                ? "Projects aren't available for your organisation"
                : "Sign in to see your projects"
            }
            description={
              user
                ? (CANNOT[sp.cannot ?? reason ?? ""] ?? CANNOT["not-approved"])
                : "Approved project owners can list projects here and follow NCPC's review."
            }
            className="bg-card"
            action={
              user ? (
                <Button asChild variant="outline">
                  <Link href={routes.workspace.root}>Back to dashboard</Link>
                </Button>
              ) : (
                <Button asChild>
                  <Link
                    href={`${routes.auth.signIn}?next=${encodeURIComponent(routes.workspace.projects)}`}
                  >
                    Sign in
                  </Link>
                </Button>
              )
            }
          />
        </Container>
      </div>
    );
  }

  const org = listing.org;
  const tab: Tab = TABS.some((t) => t.value === sp.tab) ? (sp.tab as Tab) : "all";
  const [all, funding] = await Promise.all([
    listMyProjects(org.id),
    getFundingOffers(parseFundingFilters({})),
  ]);
  const items = all.filter((p) => inTab(p, tab));
  const empty = all.length === 0;

  // Hero numbers
  const live = all.filter((p) => p.status === "live");
  const review = all.filter(inReview);
  const drafts = all.filter((p) => p.kind === "draft");
  const raised = live.reduce((n, p) => n + p.raised, 0);
  const sought = [...live, ...review].reduce((n, p) => n + (p.capitalNeeded ?? 0), 0);
  const ratio = sought ? Math.min(1, raised / sought) : 0;

  // Listing strength: the most recent submitted project, else the newest draft.
  const focus = all.find((p) => p.kind === "project") ?? all[0];
  const focusEdit = focus ? editHrefFor(focus) : null;
  const tips = focus
    ? [
        { text: "Feasibility study or other document", ok: focus.documents > 0 },
        { text: "At least 4 photos", ok: focus.photos >= 4 },
        { text: "Clear “Looking for” needs", ok: focus.needs.length > 0 },
        { text: "Impact numbers (CO₂, jobs)", ok: focus.hasImpact },
      ]
    : [];
  const passed = tips.filter((t) => t.ok).length;

  // Funding: offers for the focus project's theme first.
  const theme = focus?.theme ?? null;
  const offers = [
    ...funding.items.filter((o) => theme && o.themes.includes(theme as never)),
    ...funding.items.filter((o) => !theme || !o.themes.includes(theme as never)),
  ].slice(0, 3);

  return (
    <div className="bg-surface pb-16">
      <LiveRefresh userId={user.id} kinds={["project_"]} pollMs={0} />

      {/* Hero: solid primary, actions on the right, stats inside */}
      <section aria-labelledby="mp-title" className="bg-primary text-white">
        <Container className="flex flex-col gap-7 pt-9 pb-8 lg:pt-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="flex max-w-[680px] min-w-0 flex-col gap-2.5">
              <p className="flex flex-wrap items-center gap-1.5 text-sm text-[#B9C7DD]">
                <span className="font-semibold text-white">{org.name}</span>
                <VerifiedBadge tone="light" />
                <span aria-hidden>·</span>
                {labelFor(ORGANISATION_CATEGORIES, org.category)}
              </p>
              <h1
                id="mp-title"
                className="text-[30px] leading-tight font-bold tracking-tight md:text-[34px]"
              >
                My projects
              </h1>
              <p className="text-base leading-[25px] text-[#D6E0F0]">
                {empty
                  ? "List projects and follow NCPC’s review in one place."
                  : "Everything your organisation has listed. NCPC checks each project before it goes live in Explore."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Button
                asChild
                variant="ghost"
                className="h-[46px] border border-white/30 px-5 text-white hover:bg-white/10 hover:text-white"
              >
                <Link href={routes.about}>How NCPC reviews</Link>
              </Button>
              <Button
                asChild
                className="h-[46px] bg-white px-[22px] font-bold text-primary hover:bg-white/90"
              >
                <Link href={routes.workspace.newProject}>
                  <Plus aria-hidden /> List a project
                </Link>
              </Button>
            </div>
          </div>

          {!empty ? (
            <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <HeroStat
                label="Live projects"
                value={String(live.length)}
                note="in Explore"
                icon={Activity}
                tone="green"
              />
              <HeroStat
                label="In review"
                value={String(review.length)}
                note="with NCPC"
                icon={Clock3}
                tone="amber"
              />
              <HeroStat
                label="Drafts"
                value={String(drafts.length)}
                note="not submitted"
                icon={PencilLine}
                tone="plain"
              />
              <HeroStat
                label="Funding raised"
                value={formatRand(raised)}
                note={
                  sought
                    ? `of ${formatRand(sought)} · ${formatPercent(ratio)}`
                    : "nothing sought yet"
                }
                icon={Banknote}
                tone="plain"
                bar={ratio}
              />
            </dl>
          ) : null}
        </Container>
      </section>

      <Container
        className={cn(
          "grid items-start gap-7 pt-7",
          !empty && "lg:grid-cols-[minmax(0,1fr)_340px]",
        )}
      >
        <section aria-label="Projects" className="flex min-w-0 flex-col gap-4">
          {sp.submitted ? (
            <p
              role="status"
              className="flex items-center gap-3 rounded-2xl border border-success/25 bg-success-soft px-4 py-3.5 text-sm text-success"
            >
              <CheckCircle2 className="size-5 shrink-0" aria-hidden />
              <span>
                <strong>Submitted for review.</strong> We will email you when NCPC approves the
                project.
              </span>
            </p>
          ) : null}
          {sp.cannot && CANNOT[sp.cannot] ? (
            <p className="flex items-center gap-3 rounded-2xl bg-primary-soft px-4 py-3 text-sm text-primary">
              <Info className="size-4 shrink-0" aria-hidden /> {CANNOT[sp.cannot]}
            </p>
          ) : null}

          {empty ? (
            <section
              aria-labelledby="no-projects"
              className="overflow-hidden rounded-2xl border bg-card"
            >
              <div className="flex flex-col items-center gap-3 px-8 pt-12 pb-10 text-center">
                <span
                  aria-hidden
                  className="flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-primary"
                >
                  <FolderPlus className="size-[26px]" strokeWidth={1.8} />
                </span>
                <h2 id="no-projects" className="mt-1 text-[22px] font-bold tracking-tight">
                  No projects yet
                </h2>
                <p className="max-w-[460px] text-[15px] leading-[23px] text-foreground/75">
                  List your first project so verified investors, funders and partners can find it.
                </p>
                <Button asChild className="mt-2 h-[46px] px-6">
                  <Link href={routes.workspace.newProject}>
                    <Plus aria-hidden /> List a project
                  </Link>
                </Button>
              </div>
              <ol
                aria-label="How it works"
                className="grid border-t bg-surface-subtle sm:grid-cols-3"
              >
                {HOW.map((h, i) => (
                  <li
                    key={h.title}
                    className={cn(
                      "flex gap-3 px-6 py-5",
                      i > 0 && "border-t sm:border-t-0 sm:border-l",
                    )}
                  >
                    <span
                      aria-hidden
                      className="flex size-[26px] shrink-0 items-center justify-center rounded-full border border-input bg-background text-xs font-bold text-primary"
                    >
                      {i + 1}
                    </span>
                    <span className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold">{h.title}</span>
                      <span className="text-[13px] text-muted-foreground">{h.note}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <nav
                  aria-label="Status"
                  className="max-w-full [scrollbar-width:none] overflow-x-auto"
                >
                  <ul className="inline-flex gap-1 rounded-full border bg-background p-1">
                    {TABS.map((t) => {
                      const on = t.value === tab;
                      const count = all.filter((p) => inTab(p, t.value)).length;
                      return (
                        <li key={t.value}>
                          <Link
                            href={
                              t.value === "all"
                                ? routes.workspace.projects
                                : `${routes.workspace.projects}?tab=${t.value}`
                            }
                            aria-current={on ? "page" : undefined}
                            scroll={false}
                            className={cn(
                              "flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold whitespace-nowrap transition-colors",
                              on
                                ? "bg-primary text-primary-foreground"
                                : "text-foreground/70 hover:text-foreground",
                            )}
                          >
                            {t.label}
                            <span className="text-xs font-semibold tabular-nums opacity-70">
                              {count}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
                <span className="text-[13px] text-muted-foreground">Sorted by last activity</span>
              </div>

              {items.length ? (
                <ul className="flex flex-col gap-4">
                  {items.map((p) => (
                    <li key={`${p.kind}-${p.id}`}>
                      <MyProjectCard p={p} />
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  icon={FolderPlus}
                  title="Nothing here yet"
                  description="Projects with this status will show up here."
                  className="bg-card"
                />
              )}
            </>
          )}
        </section>

        {!empty ? (
          <aside className="flex flex-col gap-4 lg:sticky lg:top-6">
            {focus ? (
              <section
                aria-labelledby="strength-title"
                className="rounded-2xl bg-primary p-5 text-white shadow-[0_12px_32px_rgba(19,51,107,0.22)]"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h2 id="strength-title" className="text-base font-bold">
                    Listing strength
                  </h2>
                  <span className="text-sm font-bold tabular-nums">
                    {passed}
                    <span className="font-medium text-[#B9C7DD]"> of {tips.length}</span>
                  </span>
                </div>
                <p className="mt-0.5 mb-3 truncate text-[13px] text-[#B9C7DD]">{focus.title}</p>
                <div aria-hidden className="h-1.5 overflow-hidden rounded-full bg-white/15">
                  <div
                    className="h-full rounded-full bg-success-bar"
                    style={{ width: `${(passed / tips.length) * 100}%` }}
                  />
                </div>
                <ul className="mt-3.5 flex flex-col">
                  {tips.map((t, i) => (
                    <li
                      key={t.text}
                      className={cn(
                        "flex items-center gap-2.5 py-2.5 text-[13px]",
                        i > 0 && "border-t border-white/12",
                      )}
                    >
                      {t.ok ? (
                        <Check
                          className="size-4 shrink-0 text-success-bar"
                          strokeWidth={2.6}
                          aria-hidden
                        />
                      ) : (
                        <Plus
                          className="size-4 shrink-0 text-white/50"
                          strokeWidth={2.6}
                          aria-hidden
                        />
                      )}
                      <span className={cn("flex-1", t.ok ? "text-[#D6E0F0]" : "text-white")}>
                        {t.text}
                        <span className="sr-only">{t.ok ? " (done)" : " (to do)"}</span>
                      </span>
                      {!t.ok && focusEdit ? (
                        <Link
                          href={focusEdit}
                          className="font-semibold text-white underline underline-offset-[3px] hover:no-underline"
                        >
                          Add
                        </Link>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {offers.length ? (
              <section
                aria-labelledby="fund-title"
                className="overflow-hidden rounded-2xl border bg-card"
              >
                <div className="px-5 pt-4.5 pb-3">
                  <h2 id="fund-title" className="text-base font-bold">
                    Funding for projects like yours
                  </h2>
                  <p className="mt-0.5 text-[13px] text-muted-foreground">
                    {theme
                      ? `Open offers for ${labelFor(THEMES, theme).toLowerCase()} projects`
                      : "Open funding offers"}
                  </p>
                </div>
                <ul>
                  {offers.map((o) => {
                    const type = FUNDING_TYPES.find((t) => t.value === o.type);
                    const due = deadlineInfo(o);
                    return (
                      <li key={o.id} className="border-t">
                        <Link
                          href={routes.funding.detail(o.slug)}
                          className="flex gap-3 px-5 py-3 transition-colors hover:bg-surface-subtle"
                        >
                          <span
                            aria-hidden
                            className="w-1 shrink-0 rounded-full"
                            style={{ backgroundColor: type?.tint }}
                          />
                          <span className="flex min-w-0 flex-col gap-0.5">
                            <span className="truncate text-sm font-semibold">{o.title}</span>
                            <span className="truncate text-xs text-muted-foreground">
                              {type?.label} · {o.amountLabel} · {o.funder.name}
                            </span>
                            <span
                              className={cn(
                                "text-xs font-semibold",
                                due.soon ? "text-destructive" : "text-foreground/70",
                              )}
                            >
                              {due.label}
                            </span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                <Link
                  href={routes.funding.list}
                  className="block border-t px-5 py-3 text-sm font-semibold text-primary hover:bg-surface-subtle"
                >
                  See all funding
                </Link>
              </section>
            ) : null}
          </aside>
        ) : null}
      </Container>
    </div>
  );
}
