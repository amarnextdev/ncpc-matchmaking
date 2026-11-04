import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { THEME_TINT } from "@/features/opportunities/utils";
import {
  LOOKING_FOR,
  PROJECT_STAGES,
  PROVINCES,
  THEMES,
  labelFor,
  type Theme,
} from "@/lib/constants";
import { cn, formatPercent, formatRand } from "@/lib/utils";
import { PROJECT_STATUS_LABEL, PROJECT_STEPS } from "../constants";
import type { MyProjectRow } from "../queries";
import { DeleteDraftButton } from "./delete-draft-button";
import { ProjectMenu } from "./project-menu";

const dayFmt = new Intl.DateTimeFormat("en-ZA", { day: "numeric", month: "short" });

const STATUS_INK: Record<MyProjectRow["status"], string> = {
  live: "text-success",
  in_review: "text-primary",
  changes_requested: "text-warning",
  draft: "text-foreground/70",
  closed: "text-foreground/70",
  hidden: "text-foreground/70",
  rejected: "text-destructive",
};

/** Where the owner continues: the draft, the edit form, or nothing (live projects). */
export function editHrefFor(p: MyProjectRow) {
  if (p.kind === "draft") return routes.workspace.projectDraft(p.id);
  if (p.status === "in_review" || p.status === "changes_requested")
    return routes.workspace.editProject(p.id);
  return null;
}

/** One row on My projects: cover + status, progress for its stage, key numbers, next action. */
export function MyProjectCard({ p }: { p: MyProjectRow }) {
  const theme = (p.theme ?? "energy") as Theme;
  const location = [p.province && labelFor(PROVINCES, p.province)].filter(Boolean).join("");
  const eyebrow = [p.theme && labelFor(THEMES, p.theme), location].filter(Boolean).join(" · ");
  const editHref = editHrefFor(p);
  const publicHref = p.status === "live" && p.slug ? routes.opportunities.detail(p.slug) : null;
  const total = PROJECT_STEPS.length;
  const done = p.step === null ? 0 : Math.min(total, p.step);
  const nextStep = PROJECT_STEPS[done]?.title;
  const ratio = p.capitalNeeded ? Math.min(1, p.raised / p.capitalNeeded) : 0;
  const metrics = [
    { label: "Capital needed", value: p.capitalNeeded ? formatRand(p.capitalNeeded) : "—" },
    { label: "Stage", value: p.stage ? labelFor(PROJECT_STAGES, p.stage) : "—" },
    { label: "Photos", value: String(p.photos) },
    { label: "Documents", value: String(p.documents) },
  ];

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border bg-card transition-[box-shadow,border-color] duration-200 hover:border-subtle-foreground/40 hover:shadow-[0_10px_28px_rgba(15,23,42,0.08)] sm:flex-row">
      <div
        className={cn(
          "relative h-40 shrink-0 sm:h-auto sm:min-h-[220px] sm:w-[220px]",
          p.kind === "draft" && !p.coverUrl && "bg-muted",
        )}
        style={
          p.coverUrl || p.kind === "draft" ? undefined : { backgroundColor: THEME_TINT[theme] }
        }
      >
        {p.coverUrl ? (
          <Image src={p.coverUrl} alt="" fill sizes="220px" className="object-cover" />
        ) : null}
        <span
          className={cn(
            "absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-semibold shadow-card",
            STATUS_INK[p.status],
          )}
        >
          <span aria-hidden className="size-1.5 rounded-full bg-current" />
          {PROJECT_STATUS_LABEL[p.status]}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3 p-5 sm:px-[22px]">
        <div className="flex items-start gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            {eyebrow ? <span className="text-[13px] text-muted-foreground">{eyebrow}</span> : null}
            <h3 className="text-lg leading-6 font-bold">
              {editHref ? (
                <Link href={editHref} className="hover:text-primary hover:underline">
                  {p.title}
                </Link>
              ) : publicHref ? (
                <Link href={publicHref} className="hover:text-primary hover:underline">
                  {p.title}
                </Link>
              ) : (
                p.title
              )}
            </h3>
          </div>
          <ProjectMenu
            title={p.title}
            editHref={editHref}
            publicHref={publicHref}
            draftId={p.kind === "draft" ? p.id : null}
          />
        </div>

        {p.status === "live" && p.capitalNeeded ? (
          <div className="flex flex-col gap-1.5">
            <div aria-hidden className="h-1.5 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-success-bar"
                style={{ width: formatPercent(ratio) }}
              />
            </div>
            <p className="text-[13px] text-muted-foreground">
              <strong className="font-semibold text-foreground">
                {formatRand(p.raised)} of {formatRand(p.capitalNeeded)} raised
              </strong>{" "}
              · {formatPercent(ratio)} funded
            </p>
          </div>
        ) : p.status === "in_review" ? (
          <p className="text-[13px] leading-5 text-muted-foreground">
            <strong className="font-semibold text-foreground">
              Submitted {dayFmt.format(new Date(p.updatedAt))}.
            </strong>{" "}
            NCPC usually reviews projects within 2–3 working days. You can still edit it.
          </p>
        ) : p.status === "changes_requested" ? (
          <p className="rounded-xl bg-warning-soft px-3 py-2.5 text-[13px] leading-5 text-warning">
            <strong className="font-semibold">NCPC asked for changes:</strong>{" "}
            {p.reviewNote ?? "open the project to see the note."}
          </p>
        ) : p.status === "rejected" ? (
          <p className="rounded-xl bg-destructive/5 px-3 py-2.5 text-[13px] leading-5 text-destructive">
            <strong className="font-semibold">Not approved.</strong> Contact NCPC if you have
            questions.
          </p>
        ) : p.kind === "draft" ? (
          <div className="flex flex-col gap-1.5">
            <p className="text-[13px] text-muted-foreground">
              <strong className="font-semibold text-foreground">
                {done} of {total} steps done.
              </strong>{" "}
              {nextStep ? `Next: ${nextStep.toLowerCase()}. ` : ""}Saved{" "}
              {dayFmt.format(new Date(p.updatedAt))}.
            </p>
            <div aria-hidden className="h-1.5 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${(done / total) * 100}%` }}
              />
            </div>
          </div>
        ) : null}

        {p.needs.length ? (
          <p className="text-[13px] text-foreground/80">
            <span className="text-muted-foreground">Looking for </span>
            {p.needs.map((n) => labelFor(LOOKING_FOR, n)).join(" · ")}
          </p>
        ) : null}

        <dl className="grid grid-cols-2 gap-y-3 border-t pt-3 sm:grid-cols-4">
          {metrics.map((m, i) => (
            <div
              key={m.label}
              className={cn(
                i > 0 && "sm:border-l sm:pl-3.5",
                i % 2 === 1 && "max-sm:border-l max-sm:pl-3.5",
              )}
            >
              <dt className="text-xs text-muted-foreground">{m.label}</dt>
              <dd className="mt-0.5 text-[15px] font-bold tabular-nums">{m.value}</dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-wrap gap-2">
          {p.kind === "draft" ? (
            <>
              <Button asChild size="sm" className="h-[38px] px-[18px]">
                <Link href={routes.workspace.projectDraft(p.id)}>Finish listing</Link>
              </Button>
              <DeleteDraftButton draftId={p.id} title={p.title} />
            </>
          ) : publicHref ? (
            <Button asChild size="sm" className="h-[38px] px-[18px]">
              <Link href={publicHref}>View public page</Link>
            </Button>
          ) : editHref ? (
            <Button asChild size="sm" className="h-[38px] px-[18px]">
              <Link href={editHref}>
                {p.status === "changes_requested" ? "Make changes" : "Edit"}
              </Link>
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
