import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  ExternalLink,
  FileText,
  Lock,
  MapPin,
  X,
} from "lucide-react";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/config/routes";
import { DecisionPanel } from "@/features/admin/approvals/components/decision-panel";
import { OrgAvatar } from "@/features/admin/approvals/components/org-avatar";
import { WaitingBadge } from "@/features/admin/approvals/components/waiting-badge";
import {
  DOC_LABELS,
  categoryLabel,
  formatBytes,
  formatDate,
  provinceLabel,
} from "@/features/admin/approvals/labels";
import { getReview } from "@/features/admin/approvals/queries";
import { FUNDING_TYPES } from "@/features/funding/constants";
import {
  LOOKING_FOR,
  ORGANISATION_OFFERS,
  PROJECT_STAGES,
  THEMES,
  labelFor,
} from "@/lib/constants";
import { cn, formatRand } from "@/lib/utils";

export const metadata: Metadata = { title: "Review organisation" };
export const dynamic = "force-dynamic";

const STATUS_BADGE = {
  draft: { label: "Draft", variant: "neutral" },
  pending: { label: "Waiting for review", variant: "warning" },
  changes_requested: { label: "Changes requested", variant: "warning" },
  approved: { label: "Approved", variant: "verified" },
  rejected: { label: "Rejected", variant: "neutral" },
  suspended: { label: "Suspended", variant: "neutral" },
} as const;

const CIPC = /^\d{4}\/\d{6}\/\d{2}$/;

function Card({
  id,
  title,
  children,
  action,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="rounded-2xl border bg-background">
      <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
        <h2 id={id} className="text-base font-bold">
          {title}
        </h2>
        {action}
      </div>
      <div className="px-5 py-1">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-b py-3.5 last:border-b-0 sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-6">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground">{children}</dd>
    </div>
  );
}

function Chips({ items }: { items: string[] }) {
  if (!items.length) return <span className="font-normal text-muted-foreground">Not given</span>;
  return (
    <span className="flex flex-wrap gap-1.5">
      {items.map((i) => (
        <Badge key={i} variant="soft">
          {i}
        </Badge>
      ))}
    </span>
  );
}

function Empty() {
  return <span className="font-normal text-muted-foreground">Not given</span>;
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const id = z
    .string()
    .uuid()
    .safeParse((await params).id);
  if (!id.success) notFound();
  const review = await getReview(id.data);
  if (!review) notFound();
  const { org, people, documents, logoUrl } = review;
  const capital = org.category === "investor" || org.category === "funder";
  const badge = STATUS_BADGE[org.status];
  const docsByKind = new Map(documents.map((d) => [d.kind, d]));

  const checks = [
    {
      label: "Registration number in CIPC format",
      ok: Boolean(org.registrationNo && CIPC.test(org.registrationNo)),
    },
    { label: "All 3 verification documents uploaded", ok: documents.length >= 3 },
    { label: "At least one person linked", ok: people.length > 0 },
    { label: "Description and summary written", ok: Boolean(org.about && org.summary) },
    {
      label: "Matchmaking details complete",
      ok: capital
        ? org.themes.length > 0 && org.instruments.length > 0 && org.investMin != null
        : org.themes.length > 0 && org.offers.length > 0 && org.lookingFor.length > 0,
    },
  ];
  const passed = checks.filter((c) => c.ok).length;

  return (
    <div className="flex flex-col gap-6 px-5 py-8 lg:px-8 xl:px-10">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-sm text-muted-foreground"
      >
        <Link
          href={routes.admin.approvals}
          className="font-medium hover:text-foreground hover:underline"
        >
          Approvals
        </Link>
        <ChevronRight className="size-4" aria-hidden />
        <span aria-current="page" className="truncate font-medium text-foreground">
          {org.name}
        </span>
      </nav>

      {/* Identity */}
      <header className="flex flex-wrap items-center justify-between gap-5 rounded-2xl border bg-background p-5 lg:p-6">
        <div className="flex min-w-0 items-center gap-4">
          <OrgAvatar name={org.name} category={org.category} logoUrl={logoUrl} size="lg" />
          <div className="flex min-w-0 flex-col gap-2">
            <h1 className="truncate text-2xl font-bold tracking-tight">{org.name}</h1>
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <Building2 className="size-4" aria-hidden />
                {categoryLabel(org.category)}
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="size-4" aria-hidden />
                {[org.city, provinceLabel(org.province)].filter(Boolean).join(", ")}
              </li>
              <li className="flex items-center gap-1.5">
                <CalendarDays className="size-4" aria-hidden />
                Submitted {formatDate(org.submittedAt)}
              </li>
            </ul>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {org.status === "pending" ? <WaitingBadge since={org.submittedAt} /> : null}
          <Badge variant={badge.variant} className="px-3 py-1 text-sm">
            {badge.label}
          </Badge>
        </div>
      </header>

      {org.reviewNote && org.status !== "pending" ? (
        <p className="rounded-xl border border-warning/20 bg-warning-soft px-4 py-3 text-sm text-warning">
          <strong>NCPC note:</strong> {org.reviewNote}
        </p>
      ) : null}

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex flex-col gap-6">
          <Card id="company" title="Company">
            <dl>
              <Row label="Registered name">{org.name}</Row>
              <Row label="Registration number">
                <span className="tabular-nums">{org.registrationNo ?? <Empty />}</span>
              </Row>
              <Row label="B-BBEE level">{org.bbbeeLevel ?? <Empty />}</Row>
              <Row label="Website">
                {org.website ? (
                  <a
                    href={org.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    {org.website.replace(/^https?:\/\//, "")}{" "}
                    <ExternalLink className="size-3.5" aria-hidden />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                ) : (
                  <Empty />
                )}
              </Row>
              <Row label="One-line summary">{org.summary ?? <Empty />}</Row>
              <Row label="What they do">
                <span className="leading-6 font-normal">{org.about ?? <Empty />}</span>
              </Row>
            </dl>
          </Card>

          <Card id="matching" title="Matchmaking">
            <dl>
              <Row label="Themes">
                <Chips items={org.themes.map((t) => labelFor(THEMES, t))} />
              </Row>
              {capital ? (
                <>
                  <Row label="Types of finance">
                    <Chips items={org.instruments.map((t) => labelFor(FUNDING_TYPES, t))} />
                  </Row>
                  <Row label="Stages they fund">
                    <Chips items={org.stages.map((t) => labelFor(PROJECT_STAGES, t))} />
                  </Row>
                  <Row label="Amount per project">
                    {org.investMin != null && org.investMax != null ? (
                      `${formatRand(org.investMin)} – ${formatRand(org.investMax)}`
                    ) : (
                      <Empty />
                    )}
                  </Row>
                </>
              ) : (
                <>
                  <Row label="They offer">
                    <Chips items={org.offers.map((t) => labelFor(ORGANISATION_OFFERS, t))} />
                  </Row>
                  <Row label="Looking for">
                    <Chips items={org.lookingFor.map((t) => labelFor(LOOKING_FOR, t))} />
                  </Row>
                </>
              )}
            </dl>
          </Card>

          <Card
            id="people"
            title="People"
            action={<span className="text-sm text-muted-foreground">{people.length}</span>}
          >
            {people.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">
                No people linked to this organisation yet.
              </p>
            ) : (
              <ul>
                {people.map((p) => (
                  <li
                    key={p.userId}
                    className="flex flex-wrap items-center justify-between gap-2 border-b py-3.5 text-sm last:border-b-0"
                  >
                    <span className="flex flex-col">
                      <span className="font-semibold">{p.name ?? "—"}</span>
                      <span className="text-muted-foreground">
                        {[p.jobTitle, p.email].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                    <Badge variant="neutral" className="capitalize">
                      {p.role}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <aside className="flex flex-col gap-6 xl:sticky xl:top-6">
          <section aria-labelledby="checks" className="rounded-2xl border bg-background p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 id="checks" className="text-base font-bold">
                Review checklist
              </h2>
              <span
                className={cn(
                  "text-sm font-semibold",
                  passed === checks.length ? "text-success" : "text-warning",
                )}
              >
                {passed} of {checks.length}
              </span>
            </div>
            <div aria-hidden className="mt-3 h-1.5 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-success-bar"
                style={{ width: `${(passed / checks.length) * 100}%` }}
              />
            </div>
            <ul className="mt-4 flex flex-col gap-2.5">
              {checks.map((c) => (
                <li key={c.label} className="flex items-start gap-2.5 text-sm">
                  <span
                    aria-hidden
                    className={cn(
                      "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
                      c.ok ? "bg-success-soft text-success" : "bg-destructive/10 text-destructive",
                    )}
                  >
                    {c.ok ? (
                      <Check className="size-3" strokeWidth={3} />
                    ) : (
                      <X className="size-3" strokeWidth={3} />
                    )}
                  </span>
                  <span className={c.ok ? "text-foreground" : "text-foreground/80"}>
                    {c.label}
                    <span className="sr-only">{c.ok ? " (passed)" : " (missing)"}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">
              Automatic checks. Always open the documents before approving.
            </p>
          </section>

          <section aria-labelledby="docs" className="rounded-2xl border bg-background p-5">
            <h2 id="docs" className="text-base font-bold">
              Documents
            </h2>
            <ul className="mt-3 flex flex-col gap-2">
              {(["cipc", "bbbee", "tax"] as const).map((kind) => {
                const d = docsByKind.get(kind);
                return (
                  <li
                    key={kind}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border p-3",
                      !d && "border-dashed bg-surface-subtle",
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-lg",
                        d ? "bg-primary-soft text-primary" : "bg-muted text-muted-foreground",
                      )}
                    >
                      <FileText className="size-4" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="text-sm font-semibold">{DOC_LABELS[kind]}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {d ? `${d.name} · ${formatBytes(d.bytes)}` : "Not uploaded"}
                      </span>
                    </span>
                    {d ? (
                      <a
                        href={routes.admin.file(d.fileId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-sm font-semibold text-primary hover:underline"
                      >
                        Open<span className="sr-only"> {DOC_LABELS[kind]} (new tab)</span>
                      </a>
                    ) : null}
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 flex gap-2 text-xs text-muted-foreground">
              <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              Private. Each link works for 10 minutes and every opening is logged.
            </p>
          </section>

          {org.status === "pending" ? <DecisionPanel orgId={org.id} orgName={org.name} /> : null}
        </aside>
      </div>
    </div>
  );
}
