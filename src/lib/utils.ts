import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely (used by every component). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Compact numbers with a dot decimal ("R12.5m"), the way amounts are written across the platform.
// (en-ZA would give "R5,0m" because its currency format forces a decimal comma and digit.)
const compact = new Intl.NumberFormat("en-GB", {
  notation: "compact",
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

/** 18000000 → "R18m", 12500000 → "R12.5m", 750000 → "R750k", 1400000000 → "R1.4bn". */
export function formatRand(amount: number): string {
  return `R${compact.format(amount).replace("K", "k").replace("M", "m").replace("B", "bn").replace("T", "tn")}`;
}

/** 0.55 → "55%" */
export function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}

/** Initials for logo placeholders: "GreenFuture Energy" → "GE" */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** "Solar Rooftop & Battery" → "solar-rooftop-battery" */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-");
}
