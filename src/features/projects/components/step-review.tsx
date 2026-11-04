"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { AlertTriangle, Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LOOKING_FOR, PROJECT_STAGES, PROVINCES, THEMES, labelFor } from "@/lib/constants";
import { cn, formatRand } from "@/lib/utils";
import { PROJECT_STEPS } from "../constants";
import { PROJECT_STEP_SCHEMAS, toNumber, type ProjectValues } from "../schema";

const join = (parts: (string | null | undefined | false)[]) => parts.filter(Boolean).join(" · ");

/** Last step: one row per earlier step (green when complete) + the confirmation. */
export function StepReview({
  orgName,
  onEdit,
}: {
  orgName: string;
  onEdit: (step: number) => void;
}) {
  const { control } = useFormContext<ProjectValues>();
  const v = useWatch({ control }) as Partial<ProjectValues>;
  const needed = toNumber(v.capitalNeeded ?? "");
  const own = toNumber(v.ownFunds ?? "");
  const shared = (v.documents ?? []).filter((d) => d.visibility !== "public").length;

  const lines = [
    join([
      v.title,
      v.theme && labelFor(THEMES, v.theme),
      [v.city, v.province && labelFor(PROVINCES, v.province)].filter(Boolean).join(", "),
    ]),
    join([
      (v.needs ?? []).map((n) => labelFor(LOOKING_FOR, n)).join(", "),
      needed ? `${formatRand(needed)} needed` : "Not raising capital",
      own ? `${formatRand(own)} raised` : null,
      v.stage && labelFor(PROJECT_STAGES, v.stage),
    ]),
    join([
      v.impactCo2 && `${v.impactCo2} t CO₂`,
      v.impactMwh && `${v.impactMwh} MWh`,
      v.impactJobs && `${v.impactJobs} jobs`,
      v.impactWater && `${v.impactWater} m³ water`,
    ]) || "About the project added · no impact numbers yet",
    join([
      `${v.photos?.length ?? 0} ${v.photos?.length === 1 ? "photo" : "photos"}`,
      `${v.documents?.length ?? 0} ${v.documents?.length === 1 ? "document" : "documents"}`,
      shared ? `${shared} shared after an enquiry` : null,
    ]),
  ];

  return (
    <>
      <ul className="divide-y overflow-hidden rounded-xl border">
        {PROJECT_STEP_SCHEMAS.map((schema, i) => {
          const ok = schema.safeParse(v).success;
          return (
            <li key={i} className="flex items-center gap-3 px-4 py-3.5">
              <span
                aria-hidden
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full text-white",
                  ok ? "bg-success" : "bg-warning",
                )}
              >
                {ok ? (
                  <Check className="size-3.5" strokeWidth={3} />
                ) : (
                  <AlertTriangle className="size-3.5" strokeWidth={2.6} />
                )}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm font-semibold">
                  {PROJECT_STEPS[i]?.title}
                  {!ok ? <span className="sr-only"> (needs attention)</span> : null}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {ok ? lines[i] : "Something is missing. Open this step to finish it."}
                </span>
              </span>
              <button
                type="button"
                onClick={() => onEdit(i)}
                className="rounded-md px-2 py-1 text-[13px] font-semibold text-primary hover:bg-primary-soft"
              >
                Edit<span className="sr-only"> {PROJECT_STEPS[i]?.title}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <FormField
        control={control}
        name="confirm"
        render={({ field }) => (
          <FormItem>
            <div className="flex gap-3">
              <FormControl>
                <Checkbox
                  ref={field.ref}
                  checked={field.value === true}
                  onCheckedChange={(c) => field.onChange(c === true ? true : undefined)}
                  className="mt-0.5"
                />
              </FormControl>
              <FormLabel className="text-sm leading-[21px] font-normal text-foreground/85">
                I confirm the information is correct and that {orgName} may share it with
                NCPC-verified members.
              </FormLabel>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <p className="rounded-xl bg-primary-soft px-4 py-3 text-[13px] leading-5 text-primary">
        After you submit, NCPC checks the project (usually 2–3 working days). You can still edit it
        while it is in review. You will get an email when it goes live.
      </p>
    </>
  );
}
