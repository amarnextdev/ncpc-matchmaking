import { Check } from "lucide-react";
import { PROJECT_STAGES, type ProjectStage } from "@/lib/constants";
import { formatMonth } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { stageIndex } from "../../detail-meta";
import type { OpportunityDetail } from "../../types";

type StepState = "done" | "current" | "todo";

/** 5-step stage tracker: horizontal from md, vertical on phones. */
export function ProgressStepper({ opportunity: o }: { opportunity: OpportunityDetail }) {
  const current = stageIndex(o.stage);
  const finished = o.stage === "operational";

  const steps = PROJECT_STAGES.map((stage, i) => {
    const state: StepState =
      i < current || (finished && i === current) ? "done" : i === current ? "current" : "todo";
    return { ...stage, num: i + 1, state, note: stepNote(stage.value, state, o) };
  });

  return (
    <>
      <ol aria-label="Project stages" className="hidden grid-cols-5 md:grid">
        {steps.map((step, i) => (
          <li
            key={step.value}
            aria-current={step.state === "current" ? "step" : undefined}
            className="relative flex flex-col items-center gap-2.5 text-center"
          >
            {i > 0 ? (
              <span
                aria-hidden
                className={cn(
                  "absolute top-[17px] left-0 h-[3px] w-1/2",
                  i <= current ? "bg-success" : "bg-input",
                )}
              />
            ) : null}
            {i < steps.length - 1 ? (
              <span
                aria-hidden
                className={cn(
                  "absolute top-[17px] right-0 h-[3px] w-1/2",
                  i < current ? "bg-success" : "bg-input",
                )}
              />
            ) : null}
            <StepDot state={step.state} num={step.num} className="relative size-9 text-sm" />
            <span className={cn("text-[15px]", labelClass(step.state))}>{step.label}</span>
            {step.note ? (
              <span className="-mt-1.5 text-[13px] text-subtle-foreground">{step.note}</span>
            ) : null}
          </li>
        ))}
      </ol>

      <ol aria-label="Project stages" className="flex flex-col md:hidden">
        {steps.map((step, i) => (
          <li
            key={step.value}
            aria-current={step.state === "current" ? "step" : undefined}
            className="flex gap-3.5"
          >
            <div className="flex flex-col items-center">
              <StepDot state={step.state} num={step.num} className="size-[30px] text-[13px]" />
              {i < steps.length - 1 ? (
                <span
                  aria-hidden
                  className={cn(
                    "min-h-[18px] w-[3px] flex-1",
                    i < current ? "bg-success" : "bg-input",
                  )}
                />
              ) : null}
            </div>
            <div className="flex flex-col gap-0.5 pt-1 pb-4">
              <span className={cn("text-[15px]", labelClass(step.state))}>{step.label}</span>
              {step.note ? (
                <span className="text-[13px] text-subtle-foreground">{step.note}</span>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}

function stepNote(stage: ProjectStage, state: StepState, o: OpportunityDetail): string | null {
  const date = o.stageDates[stage];
  if (state === "done") return date ? formatMonth(date) : "Done";
  if (state === "current") return "In progress";
  if (o.nextStage?.stage === stage) return formatMonth(o.nextStage.eta);
  return null;
}

function labelClass(state: StepState) {
  if (state === "done") return "font-semibold text-foreground";
  if (state === "current") return "font-bold text-primary";
  return "font-medium text-subtle-foreground";
}

function StepDot({ state, num, className }: { state: StepState; num: number; className?: string }) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-bold",
        state === "done" && "bg-success text-white",
        state === "current" && "bg-primary text-white ring-[6px] ring-primary/15",
        state === "todo" && "border-2 border-input bg-background text-subtle-foreground",
        className,
      )}
    >
      {state === "done" ? <Check className="size-4" strokeWidth={3} aria-label="Done" /> : num}
    </span>
  );
}
