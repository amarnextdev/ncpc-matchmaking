"use client";

import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ORGANISATION_OFFERS, PROVINCES, THEMES, labelFor } from "@/lib/constants";
import { ORGANISATION_TABS } from "../constants";
import type { OrganisationFilters, OrganisationSort } from "../types";
import { useOrganisationParams } from "../use-organisation-params";
import { OrganisationFiltersSheet, type OrganisationFacets } from "./organisation-filters";

const SORTS: { value: OrganisationSort; label: string }[] = [
  { value: "recent", label: "Recently active" },
  { value: "projects", label: "Most projects" },
  { value: "name", label: "Name A–Z" },
];

type Props = {
  filters: OrganisationFilters;
  total: number;
  facets: OrganisationFacets;
  activeCount: number;
};

/** "38 organisations" + (mobile Filters) + Sort, then removable chips for the active filters. */
export function OrganisationResultsToolbar({ filters, total, facets, activeCount }: Props) {
  const params = useOrganisationParams();

  const chips = [
    ...(filters.tab
      ? [
          {
            id: "tab",
            label: labelFor(ORGANISATION_TABS, filters.tab),
            remove: () => params.set({ tab: null }),
          },
        ]
      : []),
    ...filters.themes.map((v) => ({
      id: `t-${v}`,
      label: labelFor(THEMES, v),
      remove: () => params.toggle("theme", v),
    })),
    ...filters.offers.map((v) => ({
      id: `o-${v}`,
      label: `Offers ${labelFor(ORGANISATION_OFFERS, v).toLowerCase()}`,
      remove: () => params.toggle("offer", v),
    })),
    ...(filters.province
      ? [
          {
            id: "p",
            label: labelFor(PROVINCES, filters.province),
            remove: () => params.set({ province: null }),
          },
        ]
      : []),
    ...(filters.openOnly
      ? [{ id: "open", label: "Open to new partners", remove: () => params.set({ open: null }) }]
      : []),
    ...(filters.q
      ? [{ id: "q", label: `“${filters.q}”`, remove: () => params.set({ q: null }) }]
      : []),
  ];

  return (
    <div className="flex flex-col gap-3" aria-busy={params.isPending}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-bold" aria-live="polite">
          {total} {total === 1 ? "organisation" : "organisations"}
        </h2>
        <div className="flex w-full items-center gap-2.5 sm:w-auto">
          <OrganisationFiltersSheet facets={facets} activeCount={activeCount} total={total} />
          <Select
            value={filters.sort}
            onValueChange={(v: string) => params.set({ sort: v === "recent" ? null : v })}
          >
            <SelectTrigger
              aria-label="Sort by"
              className="h-10 flex-1 justify-start gap-1.5 rounded-full px-4 font-medium sm:w-[220px] sm:flex-none [&>svg]:ml-auto"
            >
              <span className="text-subtle-foreground">Sort:</span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {SORTS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {chips.length ? (
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <span
              key={chip.id}
              className="flex items-center gap-1 rounded-full bg-primary-soft py-1 pr-1.5 pl-3 text-[13px] font-medium text-primary"
            >
              {chip.label}
              <button
                type="button"
                onClick={chip.remove}
                aria-label={`Remove ${chip.label} filter`}
                className="flex size-5 items-center justify-center rounded-full hover:bg-primary/10"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={params.clearFilters}
            className="ml-1 text-[13px] font-semibold text-muted-foreground hover:text-foreground"
          >
            Clear filters
          </button>
        </div>
      ) : null}
    </div>
  );
}
