import type * as React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ChevronRight, Eye, FileText, Lock, MapPin, X } from "lucide-react";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/config/routes";
import { DecisionPanel } from "@/features/admin/approvals/components/decision-panel";
import { WaitingBadge } from "@/features/admin/approvals/components/waiting-badge";
import {
  categoryLabel,
  formatBytes,
  formatDate,
  provinceLabel,
} from "@/features/admin/approvals/labels";
import { getProjectReview } from "@/features/admin/projects/queries";
import { THEME_TINT } from "@/features/opportunities/utils";
import { PROJECT_STATUS_LABEL } from "@/features/projects/constants";
import { LOOKING_FOR, PROJECT_STAGES, THEMES, labelFor } from "@/lib/constants";
import { cn, formatRand } from "@/lib/utils";

export const metadata: Metadata = { title: "Review project" };
export const dynamic = "force-dynamic";

const monthFmt = new Intl.DateTimeFormat("en-ZA", { month: "long", year: "numeric" });
const num = (n: number | null) => (n == null ? null : n.toLocaleString("en-ZA"));

function Card({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="rounded-2xl border bg-background">
      <h2 id={id} className="border-b px-5 py-4 text-base font-bold">
        {title}
      </h2>
      <div className="px-5 py-1">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-b py-3.5 last:border-b-0 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-6">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground">
        {children ?? <span className="font-normal text-muted-foreground">Not given</span>}
      </dd>
    </div>
  );
}

export default async function AdminProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const id = z
    .string()
    .uuid()
    .safeParse((await params).id);
  if (!id.success) notFound();
  const review = await getProjectReview(id.data);
  if (!review) notFound();
  const { project: p, org, needs, photos, docs } = review;
  const raised = p.ownFunds + p.capitalRaised;
  const impact = [
    p.impactCo2Tonnes != null && `${num(p.impactCo2Tonnes)} t CO₂ avoided`,
    p.impactMwh != null && `${num(p.impactMwh)} MWh clean power`,
    p.impactJobs != null && `${num(p.impactJobs)} jobs`,
    p.impactWaterM3 != null && `${num(p.impactWaterM3)} m³ water saved`,
  ].filter(Boolean) as string[];

  const checks = [
    { label: "Organisation is NCPC-approved", ok: org.status === "approved" },
    { label: "At least 4 photos", ok: photos.length >= 4 },
    { label: "At least one document", ok: docs.length > 0 },
    { label: "Clear description (200+ characters)", ok: (p.description?.length ?? 0) >= 200 },
    { label: "Impact numbers given", ok: impact.length > 0 },
    {
      label: "Already raised is not more than capital needed",
      ok: !p.capitalNeeded || p.ownFunds <= p.capitalNeeded,
    },
  ];
  const passed = checks.filter((c) => c.ok).length;

  return (
    <div className="flex flex-col gap-6 px-5 py-8 lg:px-8 xl:px-10">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-sm text-muted-foreground"
      >
        <Link href={routes.admin.projects} className="hover:text-primary hover:underline">
          Projects
        </Link>
        <ChevronRight className="size-3.5" aria-hidden />
        <span className="truncate text-foreground">{p.title}</span>
      </nav>

      <header className="flex flex-wrap items-start gap-5 rounded-2xl border bg-background p-5">
        <span
          aria-hidden
          className="size-16 shrink-0 rounded-xl"
          style={{ backgroundColor: THEME_TINT[p.theme] }}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{p.title}</h1>
            <Badge
              variant={
                p.status === "live"
                  ? "verified"
                  : p.status === "in_review" || p.status === "changes_requested"
                    ? "warning"
                    : "neutral"
              }
            >
              {p.status === "in_review" ? "Waiting for review" : PROJECT_STATUS_LABEL[p.status]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            by{" "}
            <Link
              href={routes.admin.approval(org.id)}
              className="font-semibold text-primary hover:underline"
            >
              {org.name}
            </Link>{" "}
            · {categoryLabel(org.category)}
          </p>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-foreground/80">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4 text-muted-foreground" aria-hidden />
              {[p.city, provinceLabel(p.province)].filter(Boolean).join(", ")}
            </span>
            <span>Submitted {formatDate(p.submittedAt)}</span>
            {p.status === "in_review" ? <WaitingBadge since={p.submittedAt} /> : null}
          </p>
        </div>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-6">
          <Card id="overview" title="Project">
            <dl>
              <Row label="Theme">{labelFor(THEMES, p.theme)}</Row>
              <Row label="Stage">{labelFor(PROJECT_STAGES, p.stage)}</Row>
              <Row label="Short summary">{p.summary}</Row>
              <Row label="About the project">
                {p.description ? (
                  <span className="block leading-6 font-normal whitespace-pre-line">
                    {p.description}
                  </span>
                ) : null}
              </Row>
              <Row label="Expected start">
                {p.expectedStart ? monthFmt.format(new Date(p.expectedStart)) : null}
              </Row>
            </dl>
          </Card>

          <Card id="needs" title="Needs and funding">
            <dl>
              <Row label="Looking for">
                <span className="flex flex-wrap gap-1.5">
                  {needs.map((n) => (
                    <Badge key={n.id} variant="soft">
                      {labelFor(LOOKING_FOR, n.role)}
                    </Badge>
                  ))}
                </span>
              </Row>
              <Row label="Capital needed">
                {p.capitalNeeded ? formatRand(p.capitalNeeded) : "Not raising capital"}
              </Row>
              <Row label="Already raised">{raised ? formatRand(raised) : "—"}</Row>
              <Row label="Impact per year">
                {impact.length ? (
                  <span className="flex flex-wrap gap-1.5">
                    {impact.map((i) => (
                      <Badge key={i} variant="neutral">
                        {i}
                      </Badge>
                    ))}
                  </span>
                ) : null}
              </Row>
            </dl>
          </Card>

          <Card id="photos" title={`Photos (${photos.length})`}>
            <ul className="grid grid-cols-2 gap-2.5 py-4 sm:grid-cols-3 lg:grid-cols-4">
              {photos.map((ph, i) => (
                <li
                  key={ph.id}
                  className="relative aspect-[4/3] overflow-hidden rounded-xl border bg-muted"
                >
                  <Image
                    src={ph.url}
                    alt={`Photo ${i + 1}`}
                    fill
                    sizes="240px"
                    className="object-cover"
                  />
                  {ph.isCover ? (
                    <span className="absolute top-2 left-2 rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-primary">
                      Cover
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <aside className="flex flex-col gap-6 xl:sticky xl:top-6">
          <section aria-labelledby="checks" className="rounded-2xl border bg-background p-5">
            <div className="flex items-center justify-between">
              <h2 id="checks" className="text-base font-bold">
                Review checklist
              </h2>
              <span className="text-sm font-semibold text-muted-foreground tabular-nums">
                {passed}/{checks.length}
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
                      c.ok ? "bg-success-soft text-success" : "bg-warning-soft text-warning",
                    )}
                  >
                    {c.ok ? (
                      <Check className="size-3" strokeWidth={3} />
                    ) : (
                      <X className="size-3" strokeWidth={3} />
                    )}
                  </span>
                  <span>
                    {c.label}
                    <span className="sr-only">{c.ok ? " (passed)" : " (missing)"}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">
              Automatic checks are advice. Missing items don&rsquo;t block approval.
            </p>
          </section>

          <section aria-labelledby="docs" className="rounded-2xl border bg-background p-5">
            <h2 id="docs" className="text-base font-bold">
              Documents
            </h2>
            {docs.length ? (
              <ul className="mt-3 flex flex-col gap-2">
                {docs.map((d) => (
                  <li key={d.fileId} className="flex items-center gap-3 rounded-xl border p-3">
                    <span
                      aria-hidden
                      className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary"
                    >
                      <FileText className="size-4" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-semibold">{d.name}</span>
                      <span className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                        {d.visibility === "public" ? (
                          <Eye className="size-3" aria-hidden />
                        ) : (
                          <Lock className="size-3" aria-hidden />
                        )}
                        {d.visibility === "public" ? "Public" : "After enquiry"} ·{" "}
                        {formatBytes(d.bytes)}
                      </span>
                    </span>
                    <a
                      href={routes.admin.file(d.fileId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-sm font-semibold text-primary hover:underline"
                    >
                      Open<span className="sr-only"> {d.name} (new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">No documents uploaded.</p>
            )}
          </section>

          {p.reviewNote && p.status !== "in_review" ? (
            <section className="rounded-2xl border bg-background p-5 text-sm">
              <h2 className="font-bold">Last message to the owner</h2>
              <p className="mt-2 text-foreground/80">&ldquo;{p.reviewNote}&rdquo;</p>
            </section>
          ) : null}

          {p.status === "in_review" ? (
            <DecisionPanel kind="project" id={p.id} name={p.title} />
          ) : null}
        </aside>
      </div>
    </div>
  );
}
