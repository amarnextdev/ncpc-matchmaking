import { ORGANISATION_CATEGORIES, PROVINCES, labelFor } from "@/lib/constants";

export const categoryLabel = (v: string) => labelFor(ORGANISATION_CATEGORIES, v);
export const provinceLabel = (v: string | null) => (v ? labelFor(PROVINCES, v) : "—");

export const DOC_LABELS: Record<string, string> = {
  cipc: "Company registration (CIPC)",
  bbbee: "B-BBEE certificate or affidavit",
  tax: "Tax compliance status (SARS)",
};

const fmt = new Intl.DateTimeFormat("en-ZA", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Africa/Johannesburg",
});
export const formatDate = (d: Date | null) => (d ? fmt.format(d) : "—");

/** "Waiting 3 days", for the review queue. */
export function waitingFor(d: Date | null, now = new Date()): string {
  if (!d) return "Not submitted";
  const days = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
  return days <= 0 ? "Today" : days === 1 ? "1 day" : `${days} days`;
}

export function formatBytes(n: number): string {
  return n < 1024 * 1024
    ? `${Math.max(1, Math.round(n / 1024))} KB`
    : `${(n / 1024 / 1024).toFixed(1)} MB`;
}
