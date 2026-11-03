"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROVINCES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { BBBEE_LEVELS, CATEGORY_CARDS, DESCRIPTION_MAX } from "../constants";
import type { OnboardingValues } from "../schema";

export function StepCompany() {
  const { control } = useFormContext<OnboardingValues>();
  return (
    <>
      <FormField
        control={control}
        name="category"
        render={({ field }) => (
          <FormItem className="gap-3">
            <p id="category-label" className="text-sm font-semibold">
              What best describes your organisation?
            </p>
            <div
              role="radiogroup"
              aria-labelledby="category-label"
              className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {CATEGORY_CARDS.map((c) => {
                const on = field.value === c.value;
                const Icon = c.icon;
                return (
                  <button
                    key={c.value}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    ref={on ? field.ref : undefined}
                    onClick={() => field.onChange(c.value)}
                    className={cn(
                      "flex items-start gap-3 rounded-[14px] border p-3.5 text-left transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none",
                      on
                        ? "border-2 border-primary bg-primary-soft p-[13px]"
                        : "border-border bg-background hover:bg-muted/60",
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-[10px]",
                        on ? "bg-primary text-primary-foreground" : "bg-primary-soft text-primary",
                      )}
                    >
                      <Icon className="size-[18px]" />
                    </span>
                    <span className="flex flex-col gap-0.5">
                      <span className="text-sm font-bold text-foreground">{c.label}</span>
                      <span className="text-xs leading-[17px] text-muted-foreground">{c.note}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Registered company name</FormLabel>
              <FormControl>
                <Input
                  autoComplete="organization"
                  placeholder="As on your CIPC certificate"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="regNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Registration number</FormLabel>
              <FormControl>
                <Input placeholder="2019/482117/07" inputMode="numeric" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
          name="town"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Town or city</FormLabel>
              <FormControl>
                <Input autoComplete="address-level2" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Website <span className="font-normal text-muted-foreground">(optional)</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="url"
                  inputMode="url"
                  autoComplete="url"
                  placeholder="https://"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="bbbee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>B-BBEE level</FormLabel>
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger ref={field.ref} onBlur={field.onBlur} className="w-full">
                    <SelectValue placeholder="Choose a level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {BBBEE_LEVELS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>What does your organisation do?</FormLabel>
            <FormControl>
              <Textarea
                rows={3}
                maxLength={DESCRIPTION_MAX}
                placeholder="Two or three sentences for your public profile."
                className="resize-none"
                {...field}
              />
            </FormControl>
            <FormDescription>
              {(field.value ?? "").length} / {DESCRIPTION_MAX}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
