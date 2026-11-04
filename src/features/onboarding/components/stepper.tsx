import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ONBOARDING_STEPS } from "../constants";

type StepperProps = {
  /** Defaults to the onboarding steps; the project form passes its own. */
  steps?: readonly { title: string }[];
  current: number;
  /** "dark" = on the navy hero */
  tone?: "light" | "dark";
  /** Furthest step reached; earlier steps can be revisited. */
  reached: number;
  onGo: (step: number) => void;
};

/** Progress across the top: a bar per step, then its number and name. */
export function Stepper({
  steps = ONBOARDING_STEPS,
  current,
  reached,
  onGo,
  tone = "light",
}: StepperProps) {
  const dark = tone === "dark";
  return (
    <ol
      aria-label="Steps"
      className="grid gap-2 sm:gap-3"
      style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
    >
      {steps.map((s, i) => {
        const done = i < current || (i <= reached && i !== current && i < reached);
        const isCurrent = i === current;
        const canGo = i <= reached && !isCurrent;
        return (
          <li
            key={s.title}
            aria-current={isCurrent ? "step" : undefined}
            className="flex flex-col gap-2.5"
          >
            <span
              aria-hidden
              className={cn(
                "h-1.5 overflow-hidden rounded-full",
                dark ? "bg-white/15" : "bg-border",
              )}
            >
              <span
                className={cn(
                  "block h-full rounded-full transition-all duration-500",
                  done
                    ? cn("w-full", dark ? "bg-success-bar" : "bg-success")
                    : isCurrent
                      ? cn("w-1/2", dark ? "bg-white" : "bg-primary")
                      : "w-0",
                )}
              />
            </span>
            <button
              type="button"
              disabled={!canGo}
              onClick={() => onGo(i)}
              className="flex items-center gap-2 rounded-md text-left focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none enabled:hover:opacity-80 disabled:cursor-default disabled:opacity-100"
            >
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                  done && (dark ? "bg-success-bar text-white" : "bg-success text-white"),
                  isCurrent &&
                    (dark
                      ? "bg-white text-primary ring-4 ring-white/20"
                      : "bg-primary text-primary-foreground ring-4 ring-primary-soft"),
                  !done &&
                    !isCurrent &&
                    (dark
                      ? "border-2 border-white/35 text-[#B9C7DD]"
                      : "border-2 border-input bg-background text-muted-foreground"),
                )}
              >
                {done ? <Check className="size-3.5" strokeWidth={3} aria-hidden /> : i + 1}
              </span>
              <span
                className={cn(
                  "hidden truncate text-[13px] sm:inline",
                  isCurrent
                    ? cn("font-bold", dark ? "text-white" : "text-foreground")
                    : done
                      ? cn("font-semibold", dark ? "text-[#D6E0F0]" : "text-foreground")
                      : cn("font-medium", dark ? "text-[#B9C7DD]" : "text-muted-foreground"),
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
