import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely (used by every component). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const randCompact = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  notation: "compact",
  maximumFractionDigits: 1,
});

/** 18000000 → "R18m" (short Rand amounts for cards and stats). */
export function formatRand(amount: number): string {
  return randCompact
    .format(amount)
    .replace(/\s/g, "")
    .replace("M", "m")
    .replace("K", "k")
    .replace("B", "bn");
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
