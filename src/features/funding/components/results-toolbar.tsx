"use client";

import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ORGANISATION_CATEGORIES,
  PROJECT_STAGES,
  PROVINCES,
  THEMES,
  labelFor,
} from "@/lib/constants";
import type { Viewer } from "@/types";
import { FUNDING_AMOUNTS, FUNDING_DEADLINES } from "../constants";
import type { FundingFilters, FundingSort } from "../types";
import { useFundingParams } from "../use-funding-params";
import { FundingFiltersSheet, type FundingFilterFacets } from "./funding-filters";

const SORTS: { value: FundingSort; label: string }[] = [
  { value: "closing", label: "Closing soon" },
  { value: "amount", label: "Largest amount" },
  { value: "newest", label: "Newest" },
];

type Props = {
  filters: FundingFilters;
  total: number;
  facets: FundingFilterFacets;
  viewer: Viewer;
  activeCount: number;
};

/** "6 open offers" + (mobile Filters) + Sort, then removable chips for the active filters. */
export function FundingResultsToolbar({ filters, total, facets, viewer, activeCount }: Props) {
  const params = useFundingParams();
  const closed = filters.tab === "closed";

  const chips = [
    ...filters.themes.map((v) => ({
      id: `t-${v}`,
      label: labelFor(THEMES, v),
      remove: () => params.toggle("theme", v),
    })),
    ...(filters.amount
      ? [
          {
            id: "a",
            label: labelFor(FUNDING_AMOUNTS, filters.amount),
            remove: () => params.set({ amount: null }),
          },
        ]
      : []),
    ...filters.stages.map((v) => ({
      id: `s-${v}`,
      label: `Funds ${labelFor(PROJECT_STAGES, v).toLowerCase()}`,
      remove: () => params.toggle("stage", v),
    })),
    ...filters.applicants.map((v) => ({
      id: `w-${v}`,
      label: `For ${labelFor(ORGANISATION_CATEGORIES, v).toLowerCase()}s`,
      remove: () => params.toggle("who", v),
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
    ...(filters.deadline
      ? [
          {
            id: "d",
            label: labelFor(FUNDING_DEADLINES, filters.deadline),
            remove: () => params.set({ deadline: null }),
          },
        ]
      : []),
    ...(filters.eligible
      ? [{ id: "e", label: "I qualify", remove: () => params.set({ eligible: null }) }]
      : []),
    ...(filters.q
      ? [{ id: "q", label: `“${filters.q}”`, remove: () => params.set({ q: null }) }]
      : []),
  ];

  return (
    <div className="flex flex-col gap-3" aria-busy={params.isPending}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-bold" aria-live="polite">
          {total} {closed ? "closed" : "open"} {total === 1 ? "offer" : "offers"}
        </h2>
        <div className="flex w-full items-center gap-2.5 sm:w-auto">
          <FundingFiltersSheet
            facets={facets}
            viewer={viewer}
            activeCount={activeCount}
            total={total}
          />
          {closed ? null : (
            <Select
              value={filters.sort}
              onValueChange={(v: string) => params.set({ sort: v === "closing" ? null : v })}
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
          )}
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
