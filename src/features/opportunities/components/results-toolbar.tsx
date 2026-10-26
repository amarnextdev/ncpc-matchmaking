"use client";

import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CAPITAL_RANGES,
  LOOKING_FOR,
  PROJECT_STAGES,
  PROVINCES,
  THEMES,
  labelFor,
} from "@/lib/constants";
import type { OpportunityFilters, OpportunitySort } from "../types";
import { useOpportunityParams } from "../use-opportunity-params";
import type { Facets } from "./filter-panel";
import { OpportunityFiltersSheet } from "./opportunity-filters";

const SORTS: { value: OpportunitySort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "capital", label: "Capital needed" },
  { value: "funded", label: "Most funded" },
];

type Props = { filters: OpportunityFilters; total: number; facets: Facets; activeCount: number };

/** "24 opportunities" + (mobile Filters button) + Get alerts + Sort, then removable chips for active filters. */
export function ResultsToolbar({ filters, total, facets, activeCount }: Props) {
  const params = useOpportunityParams();

  const chips = [
    ...filters.themes.map((v) => ({
      id: `t-${v}`,
      label: labelFor(THEMES, v),
      remove: () => params.toggle("theme", v),
    })),
    ...filters.lookingFor.map((v) => ({
      id: `l-${v}`,
      label: `Needs ${labelFor(LOOKING_FOR, v).toLowerCase()}`,
      remove: () => params.toggle("lookingFor", v),
    })),
    ...filters.stages.map((v) => ({
      id: `s-${v}`,
      label: labelFor(PROJECT_STAGES, v),
      remove: () => params.toggle("stage", v),
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
    ...(filters.capital
      ? [
          {
            id: "c",
            label: labelFor(CAPITAL_RANGES, filters.capital),
            remove: () => params.set({ capital: null }),
          },
        ]
      : []),
    ...(filters.q
      ? [{ id: "q", label: `“${filters.q}”`, remove: () => params.set({ q: null }) }]
      : []),
  ];

  return (
    <div className="flex flex-col gap-3" aria-busy={params.isPending}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-bold" aria-live="polite">
          {total} {total === 1 ? "opportunity" : "opportunities"}
        </h2>
        <div className="flex w-full items-center gap-2.5 sm:w-auto">
          <OpportunityFiltersSheet facets={facets} activeCount={activeCount} total={total} />
          <Button variant="outline" className="max-sm:hidden" type="button">
            <Bell />
            Get alerts
          </Button>
          <Select
            value={filters.sort}
            onValueChange={(v: string) => params.set({ sort: v === "newest" ? null : v })}
          >
            <SelectTrigger
              aria-label="Sort by"
              className="h-10 flex-1 justify-start gap-1.5 rounded-full px-4 font-medium sm:w-[200px] sm:flex-none [&>svg]:ml-auto"
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
