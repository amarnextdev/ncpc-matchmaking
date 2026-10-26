import type * as React from "react";
import { PenLine } from "lucide-react";
import { PROJECT_STAGES, labelFor } from "@/lib/constants";
import { formatDay, formatMonth } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { stageIndex } from "../../detail-meta";
import type { OpportunityDetail } from "../../types";
import { DetailSection } from "./detail-section";
import { UpdatePhotos } from "./photo-button";
import { ProgressStepper } from "./progress-stepper";
import { UpdatesSheet } from "./updates-sheet";

/** Stepper + "current stage" card (dates, stage metric, latest update, all updates). */
export function ProgressSection({
  opportunity: o,
  cta,
}: {
  opportunity: OpportunityDetail;
  cta: React.ReactNode;
}) {
  const index = stageIndex(o.stage);
  const label = labelFor(PROJECT_STAGES, o.stage);
  const started = o.stageDates[o.stage];
  const latest = o.updates[0];
  const metric = o.stageMetric;

  return (
    <DetailSection
      id="progress"
      title="Progress"
      description={
        o.stage === "operational" ? (
          <>
            The project is <strong className="text-foreground">operational</strong>.
          </>
        ) : (
          <>
            The project is in stage {index + 1} of {PROJECT_STAGES.length}:{" "}
            <strong className="text-foreground">{label}</strong>
          </>
        )
      }
    >
      <div className="flex flex-col gap-6 rounded-lg border bg-surface-subtle p-4.5 md:px-6 md:pt-7 md:pb-6">
        <ProgressStepper opportunity={o} />

        <div className="overflow-hidden rounded-lg border bg-card">
          {started || o.nextStage ? (
            <dl className="flex flex-wrap border-b">
              <StageCell label="Current stage">
                <span className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-primary ring-4 ring-primary/15" />
                  <span className="text-base font-bold text-primary">{label}</span>
                </span>
              </StageCell>
              {started ? (
                <StageCell label="Started" bordered>
                  {formatDay(started)}
                </StageCell>
              ) : null}
              {o.nextStage ? (
                <StageCell label="Next stage" bordered>
                  {labelFor(PROJECT_STAGES, o.nextStage.stage)} · {formatMonth(o.nextStage.eta)}
                </StageCell>
              ) : null}
            </dl>
          ) : null}

          <div className="flex flex-col gap-3.5 p-4.5">
            {metric ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="font-semibold">{metric.label}</span>
                  <strong>
                    {metric.done} of {metric.total}
                  </strong>
                </div>
                <div
                  aria-hidden
                  className="grid gap-1.5"
                  style={{ gridTemplateColumns: `repeat(${metric.total}, minmax(0, 1fr))` }}
                >
                  {Array.from({ length: metric.total }, (_, i) => (
                    <span
                      key={i}
                      className={cn(
                        "h-2 rounded-full",
                        i < metric.done ? "bg-success" : "bg-border",
                      )}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {latest ? (
              <div className="flex flex-wrap items-start gap-3.5 rounded-md bg-surface-subtle p-3.5">
                <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-1.5">
                  <p className="text-xs text-subtle-foreground">
                    Latest update · {formatDay(latest.date)} · by {o.owner.name}
                  </p>
                  <p className="text-[15px] font-semibold">{latest.title}</p>
                  <p className="text-sm leading-[21px] text-foreground/80">{latest.text}</p>
                </div>
                {latest.photos.length ? <UpdatePhotos indexes={latest.photos} max={3} /> : null}
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-1.5 rounded-md bg-surface-subtle p-4">
                  <p className="text-eyebrow">Now · {label}</p>
                  <p className="text-[15px] font-semibold">
                    {o.stageNote?.title ?? `${label} in progress`}
                  </p>
                  {o.stageNote?.text ? (
                    <p className="text-sm leading-[21px] text-foreground/80">{o.stageNote.text}</p>
                  ) : null}
                </div>
                <p className="flex items-start gap-3 text-sm text-muted-foreground">
                  <PenLine
                    className="mt-0.5 size-[18px] shrink-0 text-subtle-foreground"
                    aria-hidden
                  />
                  No progress updates yet. The owner will post news here as the project moves
                  forward.
                </p>
              </>
            )}

            {o.updates.length > 1 ? (
              <UpdatesSheet
                updates={o.updates}
                owner={{ name: o.owner.name, logoUrl: o.owner.logoUrl }}
                projectTitle={o.title}
                cta={cta}
              />
            ) : null}
          </div>
        </div>
      </div>
    </DetailSection>
  );
}

function StageCell({
  label,
  bordered,
  children,
}: {
  label: string;
  bordered?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-[1_1_160px] flex-col gap-1 px-4.5 py-4",
        bordered && "max-sm:border-t sm:border-l",
      )}
    >
      <dt className="text-eyebrow">{label}</dt>
      <dd className="text-base font-semibold">{children}</dd>
    </div>
  );
}
