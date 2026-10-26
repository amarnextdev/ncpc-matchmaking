import { z } from "zod";
import { LOOKING_FOR, PROJECT_STAGES, PROVINCES, THEMES, CAPITAL_RANGES } from "@/lib/constants";
import type { OpportunityFilters } from "./types";

/** URL keys used by the Opportunities page, e.g. ?theme=energy,water&stage=funding&page=2 */
export const OPPORTUNITY_PARAMS = {
  q: "q",
  theme: "theme",
  stage: "stage",
  lookingFor: "need",
  province: "province",
  capital: "capital",
  sort: "sort",
  page: "page",
} as const;

type RawParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value) ?? "";

/** Comma-separated list → only values that exist in the allowed list. */
function list<T extends string>(raw: string, allowed: readonly { value: T }[]): T[] {
  const ok = new Set(allowed.map((a) => a.value));
  return raw
    .split(",")
    .map((v) => v.trim())
    .filter((v): v is T => ok.has(v as T));
}

const sortSchema = z.enum(["newest", "capital", "funded"]).catch("newest");
const pageSchema = z.coerce.number().int().min(1).catch(1);

/** Turns the page's searchParams into safe, typed filters (bad values are ignored). */
export function parseOpportunityFilters(params: RawParams): OpportunityFilters {
  const province = first(params[OPPORTUNITY_PARAMS.province]);
  const capital = first(params[OPPORTUNITY_PARAMS.capital]);
  return {
    q: first(params[OPPORTUNITY_PARAMS.q]).trim().slice(0, 100),
    themes: list(first(params[OPPORTUNITY_PARAMS.theme]), THEMES),
    stages: list(first(params[OPPORTUNITY_PARAMS.stage]), PROJECT_STAGES),
    lookingFor: list(first(params[OPPORTUNITY_PARAMS.lookingFor]), LOOKING_FOR),
    province: PROVINCES.some((p) => p.value === province)
      ? (province as OpportunityFilters["province"])
      : null,
    capital: CAPITAL_RANGES.some((c) => c.value === capital) ? capital : null,
    sort: sortSchema.parse(first(params[OPPORTUNITY_PARAMS.sort]) || "newest"),
    page: pageSchema.parse(first(params[OPPORTUNITY_PARAMS.page]) || 1),
  };
}

/** Number of active filters (for the mobile "Filters · 2" button). */
export function countActiveFilters(f: OpportunityFilters): number {
  return (
    f.themes.length +
    f.stages.length +
    f.lookingFor.length +
    (f.province ? 1 : 0) +
    (f.capital ? 1 : 0)
  );
}
