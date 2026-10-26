import { z } from "zod";
import { CAPITAL_RANGES, LOOKING_FOR, PROJECT_STAGES, PROVINCES, THEMES } from "@/lib/constants";
import { OPPORTUNITY_SORTS } from "./types";

const values = <T extends readonly { value: string }[]>(list: T) =>
  list.map((item) => item.value) as [T[number]["value"], ...T[number]["value"][]];

/** Unknown or invalid values fall back to "no filter" instead of throwing. */
const optionalEnum = <T extends [string, ...string[]]>(options: T) =>
  z.enum(options).optional().catch(undefined);

const single = (value: unknown) => (Array.isArray(value) ? value[0] : value);

/** Filters for the Opportunities list, read from the URL (?q=&theme=&stage=…). */
export const opportunityFiltersSchema = z.object({
  q: z.preprocess(single, z.string().trim().max(100).optional().catch(undefined)),
  theme: z.preprocess(single, optionalEnum(values(THEMES))),
  stage: z.preprocess(single, optionalEnum(values(PROJECT_STAGES))),
  province: z.preprocess(single, optionalEnum(values(PROVINCES))),
  lookingFor: z.preprocess(single, optionalEnum(values(LOOKING_FOR))),
  capital: z.preprocess(single, optionalEnum(values(CAPITAL_RANGES))),
  sort: z.preprocess(single, z.enum(values(OPPORTUNITY_SORTS)).catch("newest").default("newest")),
  page: z.preprocess(single, z.coerce.number().int().min(1).catch(1).default(1)),
});

export type OpportunityFilters = z.infer<typeof opportunityFiltersSchema>;
