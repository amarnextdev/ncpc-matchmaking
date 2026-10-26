"use client";

import { useFilterParams } from "@/hooks/use-filter-params";
import { FUNDING_PARAMS } from "./search-params";

/** Funding list filters in the URL. See useFilterParams. */
export function useFundingParams() {
  const params = useFilterParams(FUNDING_PARAMS);
  return { ...params, clearFilters: () => params.clearFilters(["q", "sort", "tab"]) };
}
