"use client";

import { useFormContext, type FieldPath } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ABOUT_MAX } from "../constants";
import type { ProjectValues } from "../schema";
import { CharCount, groupDigits } from "./field-helpers";

const IMPACT: { name: FieldPath<ProjectValues>; label: string; placeholder: string }[] = [
  { name: "impactCo2", label: "CO₂ avoided (t)", placeholder: "4 200" },
  { name: "impactMwh", label: "Clean power (MWh)", placeholder: "5 600" },
  { name: "impactJobs", label: "Jobs created", placeholder: "45" },
  { name: "impactWater", label: "Water saved (m³)", placeholder: "Optional" },
];

export function StepDetails() {
  const { control } = useFormContext<ProjectValues>();
  return (
    <>
      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>About the project</FormLabel>
            <FormControl>
              <Textarea
                rows={7}
                className="min-h-40"
                placeholder="What will you build, where, and what problem does it solve? Mention the site, the technology and why now."
                {...field}
              />
            </FormControl>
            <div className="flex items-start justify-between gap-3">
              <FormMessage />
              <CharCount value={field.value ?? ""} max={ABOUT_MAX} />
            </div>
          </FormItem>
        )}
      />

      <fieldset className="flex flex-col gap-2.5">
        <legend className="text-sm font-semibold">Expected impact per year</legend>
        <p className="-mt-1 text-[13px] text-muted-foreground">
          Optional. Shown on your project page and used in NCPC reports.
        </p>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {IMPACT.map((item) => (
            <FormField
              key={item.name}
              control={control}
              name={item.name}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[13px]">{item.label}</FormLabel>
                  <FormControl>
                    <Input
                      inputMode="numeric"
                      placeholder={item.placeholder}
                      className="tabular-nums"
                      name={field.name}
                      ref={field.ref}
                      value={(field.value as string | undefined) ?? ""}
                      onChange={(e) => field.onChange(e.target.value.replace(/[^\d\s,]/g, ""))}
                      onBlur={() => {
                        field.onChange(groupDigits((field.value as string | undefined) ?? ""));
                        field.onBlur();
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
      </fieldset>

      <FormField
        control={control}
        name="expectedStart"
        render={({ field }) => (
          <FormItem className="max-w-[280px]">
            <FormLabel>Expected start of construction</FormLabel>
            <FormControl>
              <Input type="month" {...field} value={field.value ?? ""} />
            </FormControl>
            <FormDescription>Optional.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
