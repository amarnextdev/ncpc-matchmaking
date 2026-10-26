"use client";

import { useFilterParams } from "@/hooks/use-filter-params";
import { OPPORTUNITY_PARAMS } from "./search-params";

/** Opportunities filters in the URL. See useFilterParams. */
export function useOpportunityParams() {
  const params = useFilterParams(OPPORTUNITY_PARAMS);
  return { ...params, clearFilters: () => params.clearFilters() };
}
