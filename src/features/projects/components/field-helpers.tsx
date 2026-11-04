"use client";

import type * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** "12 500 000" style grouping while keeping whatever the person typed valid. */
export function groupDigits(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  return digits ? Number(digits).toLocaleString("en-ZA").replace(/ | /g, " ") : "";
}

/** Rand amount input with an "R" prefix; groups digits when the field loses focus. */
export function MoneyInput({
  value,
  onChange,
  onBlur,
  className,
  ...props
}: Omit<React.ComponentProps<"input">, "value" | "onChange"> & {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-sm font-semibold text-muted-foreground"
      >
        R
      </span>
      <Input
        inputMode="numeric"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^\d\s,]/g, ""))}
        onBlur={(e) => {
          onChange(groupDigits(value));
          onBlur?.(e);
        }}
        className={cn("pl-8 tabular-nums", className)}
        {...props}
      />
    </div>
  );
}

/** "76/160 · shown on cards" */
export function CharCount({ value, max, note }: { value: string; max: number; note?: string }) {
  const over = value.length > max;
  return (
    <span
      className={cn(
        "self-end text-xs tabular-nums",
        over ? "font-semibold text-destructive" : "text-muted-foreground",
      )}
    >
      {value.length}/{max}
      {note ? ` · ${note}` : ""}
    </span>
  );
}
