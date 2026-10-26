"use client";

import { useFilterParams } from "@/hooks/use-filter-params";
import { ORGANISATION_PARAMS } from "./search-params";

/** Organisations directory filters in the URL. See useFilterParams. */
export function useOrganisationParams() {
  const params = useFilterParams(ORGANISATION_PARAMS);
  return { ...params, clearFilters: () => params.clearFilters(["q", "sort", "tab"]) };
}
