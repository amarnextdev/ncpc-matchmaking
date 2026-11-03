import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ONBOARDING_STEPS } from "../constants";

type StepperProps = {
  current: number;
  /** Furthest step reached; earlier steps can be revisited. */
  reached: number;
  onGo: (step: number) => void;
};

/** Progress across the top: a bar per step, then its number and name. */
export function Stepper({ current, reached, onGo }: StepperProps) {
  return (
    <ol aria-label="Steps" className="grid grid-cols-4 gap-2 sm:gap-3">
      {ONBOARDING_STEPS.map((s, i) => {
        const done = i < current || (i <= reached && i !== current && i < reached);
        const isCurrent = i === current;
        const canGo = i <= reached && !isCurrent;
        return (
          <li key={s.title} aria-current={isCurrent ? "step" : undefined} className="flex flex-col gap-2.5">
            <span aria-hidden className="h-1.5 overflow-hidden rounded-full bg-border">
              <span
                className={cn(
                  "block h-full rounded-full transition-all duration-500",
                  done ? "w-full bg-success" : isCurrent ? "w-1/2 bg-primary" : "w-0",
                )}
              />
            </span>
            <button
              type="button"
              disabled={!canGo}
              onClick={() => onGo(i)}
              className="flex items-center gap-2 rounded-md text-left focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none enabled:hover:opacity-80 disabled:cursor-default"
            >
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                  done && "bg-success text-white",
                  isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary-soft",
                  !done && !isCurrent && "border-2 border-input bg-background text-muted-foreground",
                )}
              >
                {done ? <Check className="size-3.5" strokeWidth={3} aria-hidden /> : i + 1}
              </span>
              <span
                className={cn(
                  "hidden truncate text-[13px] sm:inline",
                  isCurrent ? "font-bold text-foreground" : done ? "font-semibold text-foreground" : "font-medium text-muted-foreground",
                )}
              >
                {s.title}
              </span>
              <span className="sr-only">
                {s.title}
                {done ? " (done)" : isCurrent ? " (current step)" : ""}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
