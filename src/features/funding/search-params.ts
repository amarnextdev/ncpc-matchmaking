import { z } from "zod";
import { ORGANISATION_CATEGORIES, PROJECT_STAGES, PROVINCES, THEMES } from "@/lib/constants";
import { FUNDING_AMOUNTS, FUNDING_DEADLINES, FUNDING_TYPES } from "./constants";
import type { FundingFilters } from "./types";

/** URL keys for the Funding list: ?type=loan&theme=energy&amount=10m-50m&page=2 */
export const FUNDING_PARAMS = {
  q: "q",
  tab: "type",
  theme: "theme",
  stage: "stage",
  who: "who",
  province: "province",
  amount: "amount",
  deadline: "deadline",
  eligible: "eligible",
  sort: "sort",
  page: "page",
} as const;

type RawParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value) ?? "";

function list<T extends string>(raw: string, allowed: readonly { value: T }[]): T[] {
  const ok = new Set<string>(allowed.map((a) => a.value));
  return raw
    .split(",")
    .map((v) => v.trim())
    .filter((v): v is T => ok.has(v));
}

function one<T extends string>(raw: string, allowed: readonly { value: T }[]): T | null {
  return allowed.some((a) => a.value === raw) ? (raw as T) : null;
}

const TABS = [...FUNDING_TYPES, { value: "closed" as const }];
const sortSchema = z.enum(["closing", "amount", "newest"]).catch("closing");
const pageSchema = z.coerce.number().int().min(1).catch(1);

/** searchParams → safe, typed filters (unknown values are ignored). */
export function parseFundingFilters(params: RawParams): FundingFilters {
  return {
    q: first(params[FUNDING_PARAMS.q]).trim().slice(0, 100),
    tab: one(first(params[FUNDING_PARAMS.tab]), TABS),
    themes: list(first(params[FUNDING_PARAMS.theme]), THEMES),
    stages: list(first(params[FUNDING_PARAMS.stage]), PROJECT_STAGES),
    applicants: list(first(params[FUNDING_PARAMS.who]), ORGANISATION_CATEGORIES),
    province: one(first(params[FUNDING_PARAMS.province]), PROVINCES),
    amount: one(first(params[FUNDING_PARAMS.amount]), FUNDING_AMOUNTS),
    deadline: one(first(params[FUNDING_PARAMS.deadline]), FUNDING_DEADLINES),
    eligible: first(params[FUNDING_PARAMS.eligible]) === "1",
    sort: sortSchema.parse(first(params[FUNDING_PARAMS.sort]) || "closing"),
    page: pageSchema.parse(first(params[FUNDING_PARAMS.page]) || 1),
  };
}

/** Filters counted on the mobile "Filters · N" button (the type tab is shown separately). */
export function countActiveFundingFilters(f: FundingFilters): number {
  return (
    f.themes.length +
    f.stages.length +
    f.applicants.length +
    (f.province ? 1 : 0) +
    (f.amount ? 1 : 0) +
    (f.deadline ? 1 : 0) +
    (f.eligible ? 1 : 0)
  );
}

/** URL of the list with these filters on another page. */
export function fundingQuery(f: FundingFilters, page: number): string {
  const p = new URLSearchParams();
  if (f.q) p.set(FUNDING_PARAMS.q, f.q);
  if (f.tab) p.set(FUNDING_PARAMS.tab, f.tab);
  if (f.themes.length) p.set(FUNDING_PARAMS.theme, f.themes.join(","));
  if (f.stages.length) p.set(FUNDING_PARAMS.stage, f.stages.join(","));
  if (f.applicants.length) p.set(FUNDING_PARAMS.who, f.applicants.join(","));
  if (f.province) p.set(FUNDING_PARAMS.province, f.province);
  if (f.amount) p.set(FUNDING_PARAMS.amount, f.amount);
  if (f.deadline) p.set(FUNDING_PARAMS.deadline, f.deadline);
  if (f.eligible) p.set(FUNDING_PARAMS.eligible, "1");
  if (f.sort !== "closing") p.set(FUNDING_PARAMS.sort, f.sort);
  if (page > 1) p.set(FUNDING_PARAMS.page, String(page));
  return p.toString();
}
