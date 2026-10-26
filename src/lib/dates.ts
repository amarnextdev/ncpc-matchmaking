const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** "2026-10-12" → "12 Oct 2026" (fixed English months, same on server and browser). */
export function formatDay(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** "2026-07-12" or "2026-07" → "Jul 2026" */
export function formatMonth(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** Whole days between an ISO date and now. */
export function daysSince(iso: string, now: Date = new Date()): number {
  return Math.floor((now.getTime() - new Date(iso).getTime()) / 86_400_000);
}

/** "today" · "yesterday" · "4 days ago" · "Jul 2026" (older than two weeks). */
export function formatListed(iso: string, now: Date = new Date()): string {
  const days = daysSince(iso, now);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 14) return `${days} days ago`;
  return formatMonth(iso);
}
