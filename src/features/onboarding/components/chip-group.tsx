"use client";

import { useId } from "react";
import { useFormContext, type FieldPath } from "react-hook-form";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import type { OnboardingValues } from "../schema";

type ArrayField = "themes" | "offers" | "instruments" | "stages" | "lookingFor";

type ChipGroupProps = {
  name: ArrayField & FieldPath<OnboardingValues>;
  label: string;
  options: readonly { value: string; label: string }[];
};

/** Multi-select as toggle chips. */
export function ChipGroup({ name, label, options }: ChipGroupProps) {
  const { control, clearErrors } = useFormContext<OnboardingValues>();
  const labelId = useId();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const selected = (field.value ?? []) as string[];
        return (
          <FormItem role="group" aria-labelledby={labelId} className="gap-2.5">
            <p id={labelId} className="text-sm font-semibold">
              {label}
            </p>
            <div className="flex flex-wrap gap-2">
              {options.map((o) => {
                const on = selected.includes(o.value);
                return (
                  <button
                    key={o.value}
                    type="button"
                    aria-pressed={on}
                    onClick={() => {
                      field.onChange(
                        on ? selected.filter((v) => v !== o.value) : [...selected, o.value],
                      );
                      clearErrors(name);
                    }}
                    className={cn(
                      "h-[38px] rounded-full border px-3.5 text-[13px] font-semibold transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none",
                      on
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-background text-foreground/80 hover:bg-muted",
                    )}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
