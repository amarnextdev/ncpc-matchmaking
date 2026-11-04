"use client";

import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { THEME_TINT } from "@/features/opportunities/utils";
import { PROVINCES, THEMES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { SUMMARY_MAX, TITLE_MAX } from "../constants";
import type { ProjectValues } from "../schema";
import { CharCount } from "./field-helpers";

export function StepBasics() {
  const { control } = useFormContext<ProjectValues>();
  return (
    <>
      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Project name</FormLabel>
            <FormControl>
              <Input
                placeholder="For example: Solar Rooftop & Battery Storage"
                maxLength={TITLE_MAX}
                {...field}
              />
            </FormControl>
            <FormDescription>
              Use the name partners will recognise. You can change it later.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="theme"
        render={({ field }) => (
          <FormItem className="gap-2.5">
            <p id="theme-label" className="text-sm font-semibold">
              Theme
            </p>
            <div role="radiogroup" aria-labelledby="theme-label" className="flex flex-wrap gap-2">
              {THEMES.map((t, i) => {
                const on = field.value === t.value;
                return (
                  <button
                    key={t.value}
                    ref={i === 0 ? field.ref : undefined}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => field.onChange(t.value)}
                    className={cn(
                      "flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none",
                      on
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-input bg-background text-foreground/80 hover:bg-muted",
                    )}
                  >
                    <span
                      aria-hidden
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: THEME_TINT[t.value] }}
                    />
                    {t.label}
                  </button>
                );
              })}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          control={control}
          name="province"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Province</FormLabel>
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger ref={field.ref} onBlur={field.onBlur} className="w-full">
                    <SelectValue placeholder="Choose a province" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PROVINCES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Town or city</FormLabel>
              <FormControl>
                <Input
                  autoComplete="address-level2"
                  placeholder="For example: Germiston"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="summary"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Short summary</FormLabel>
            <FormControl>
              <Textarea
                rows={3}
                className="resize-none"
                placeholder="One sentence partners will see on the project card."
                {...field}
              />
            </FormControl>
            <div className="flex items-start justify-between gap-3">
              <FormMessage />
              <CharCount value={field.value ?? ""} max={SUMMARY_MAX} note="shown on cards" />
            </div>
          </FormItem>
        )}
      />
    </>
  );
}
