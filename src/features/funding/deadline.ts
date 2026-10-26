import { daysSince, formatDay } from "@/lib/dates";
import type { FundingOffer } from "./types";

export const SOON_DAYS = 30;

/** Days left until the deadline (negative once it has passed); null for rolling offers. */
export function daysLeft(o: Pick<FundingOffer, "deadline">, now: Date = new Date()): number | null {
  return o.deadline ? -daysSince(o.deadline, now) : null;
}

/** "Rolling" · "Closes in 12 days" · "Closes 15 Dec 2026" · "Closed 30 Jun 2026" + whether it is soon. */
export function deadlineInfo(
  o: Pick<FundingOffer, "deadline" | "status">,
  now: Date = new Date(),
): { label: string; soon: boolean } {
  if (o.status === "closed") {
    return { label: o.deadline ? `Closed ${formatDay(o.deadline)}` : "Closed", soon: false };
  }
  const left = daysLeft(o, now);
  if (left === null || !o.deadline) return { label: "Rolling", soon: false };
  if (left <= 0) return { label: "Closes today", soon: true };
  if (left <= SOON_DAYS)
    return { label: `Closes in ${left} ${left === 1 ? "day" : "days"}`, soon: true };
  return { label: `Closes ${formatDay(o.deadline)}`, soon: false };
}
