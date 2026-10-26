import { PROJECT_STAGES, PROVINCES, labelFor } from "@/lib/constants";
import { formatRand } from "@/lib/utils";
import type { FundingOffer } from "../types";

/** "National" · "Gauteng" · "4 provinces" */
export function regionLabel(o: Pick<FundingOffer, "provinces">): string {
  if (!o.provinces.length) return "National";
  if (o.provinces.length === 1 && o.provinces[0]) return labelFor(PROVINCES, o.provinces[0]);
  return `${o.provinces.length} provinces`;
}

/** "Funding, construction" */
export function stagesLabel(o: Pick<FundingOffer, "stages">): string {
  const text = o.stages.map((s) => labelFor(PROJECT_STAGES, s).toLowerCase()).join(", ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export const fundSizeLabel = (o: Pick<FundingOffer, "fundSize">) => formatRand(o.fundSize);
