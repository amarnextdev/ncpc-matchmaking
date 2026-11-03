"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type OtpInputProps = {
  length: number;
  value: string;
  onChange: (value: string) => void;
  /** Called when every box is filled */
  onComplete?: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  /** id of the element that labels the group */
  labelledBy: string;
  describedBy?: string;
};

/**
 * One box per digit. Typing moves forward, Backspace moves back, pasting a whole code fills
 * every box, and phones offer the code from the email (autocomplete="one-time-code").
 */
export function OtpInput({
  length,
  value,
  onChange,
  onComplete,
  disabled,
  invalid,
  labelledBy,
  describedBy,
}: OtpInputProps) {
  const refs = React.useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  function setFrom(index: number, raw: string, paste = false) {
    let clean = raw.replace(/\D/g, "");
    if (!clean) return;
    // Typing over a filled box gives two digits: keep only the new one.
    const current = digits[index] ?? "";
    if (!paste && current && clean.length === 2) {
      clean = clean.startsWith(current) ? clean.slice(1) : clean.slice(0, 1);
    }
    const arr = [...digits];
    for (let k = 0; k < clean.length && index + k < length; k++) arr[index + k] = clean[k] ?? "";
    const next = arr.join("").slice(0, length);
    onChange(next);
    refs.current[Math.min(index + clean.length, length - 1)]?.focus();
    if (next.length === length) onComplete?.(next);
  }

  return (
    <div
      role="group"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      className="flex gap-2 sm:gap-3"
    >
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={length}
          aria-label={`Digit ${i + 1} of ${length}`}
          aria-invalid={invalid || undefined}
          disabled={disabled}
          value={d}
          onFocus={(e) => e.currentTarget.select()}
          onChange={(e) => setFrom(i, e.target.value)}
          onPaste={(e) => {
            e.preventDefault();
            setFrom(0, e.clipboardData.getData("text"), true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace") {
              e.preventDefault();
              if (d) onChange(value.slice(0, i) + value.slice(i + 1));
              else if (i > 0) {
                onChange(value.slice(0, i - 1) + value.slice(i));
                refs.current[i - 1]?.focus();
              }
            } else if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
            else if (e.key === "ArrowRight" && i < length - 1) refs.current[i + 1]?.focus();
          }}
          className={cn(
            "h-14 w-full min-w-0 rounded-xl border bg-background text-center text-2xl font-semibold text-foreground tabular-nums transition-colors outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20 disabled:opacity-50 sm:h-16",
            invalid ? "border-destructive" : "border-input",
          )}
        />
      ))}
    </div>
  );
}
