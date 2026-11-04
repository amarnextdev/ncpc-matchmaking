"use client";

import { useFormContext } from "react-hook-form";
import { Check } from "lucide-react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PROJECT_STAGES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { NEED_CARDS } from "../constants";
import type { ProjectValues } from "../schema";
import { MoneyInput } from "./field-helpers";

export function StepNeeds() {
  const { control, clearErrors } = useFormContext<ProjectValues>();
  return (
    <>
      <FormField
        control={control}
        name="needs"
        render={({ field }) => {
          const selected = field.value ?? [];
          return (
            <FormItem role="group" aria-labelledby="needs-label" className="gap-2.5">
              <div>
                <p id="needs-label" className="text-sm font-semibold">
                  What are you looking for?
                </p>
                <p className="mt-0.5 text-[13px] text-muted-foreground">
                  Only organisations that can take these roles can send you an enquiry about this
                  project.
                </p>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {NEED_CARDS.map((n, i) => {
                  const on = selected.includes(n.value);
                  return (
                    <button
                      key={n.value}
                      ref={i === 0 ? field.ref : undefined}
                      type="button"
                      aria-pressed={on}
                      onClick={() => {
                        field.onChange(
                          on ? selected.filter((v) => v !== n.value) : [...selected, n.value],
                        );
                        clearErrors("needs");
                      }}
                      className={cn(
                        "relative flex flex-col gap-0.5 rounded-xl border px-3.5 py-3 text-left transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none",
                        on
                          ? "border-primary bg-primary-soft ring-1 ring-primary"
                          : "border-border bg-background hover:border-subtle-foreground",
                      )}
                    >
                      <span className="text-sm font-bold">{n.label}</span>
                      <span className="text-xs text-muted-foreground">{n.who}</span>
                      {on ? (
                        <span
                          aria-hidden
                          className="absolute top-2.5 right-2.5 flex size-5 items-center justify-center rounded-full bg-primary text-white"
                        >
                          <Check className="size-3" strokeWidth={3} />
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
              <FormMessage />
            </FormItem>
          );
        }}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          control={control}
          name="capitalNeeded"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total capital needed</FormLabel>
              <FormControl>
                <MoneyInput placeholder="10 000 000" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormDescription>Leave empty if you are not raising money.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="ownFunds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Already raised</FormLabel>
              <FormControl>
                <MoneyInput placeholder="0" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormDescription>Own funds or earlier partners.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="stage"
        render={({ field }) => (
          <FormItem className="gap-2.5">
            <p id="stage-label" className="text-sm font-semibold">
              Current stage
            </p>
            <div
              role="radiogroup"
              aria-labelledby="stage-label"
              className="grid grid-cols-2 gap-2 sm:grid-cols-5"
            >
              {PROJECT_STAGES.map((s, i) => {
                const on = field.value === s.value;
                return (
                  <button
                    key={s.value}
                    ref={i === 0 ? field.ref : undefined}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => field.onChange(s.value)}
                    className={cn(
                      "h-11 rounded-xl border text-[13px] font-semibold transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none",
                      on
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-background text-foreground/80 hover:bg-muted",
                    )}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
