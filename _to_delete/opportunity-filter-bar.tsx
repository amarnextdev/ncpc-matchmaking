"use client";

import { CAPITAL_RANGES, PROVINCES } from "@/lib/constants";
import type { OpportunityFilters, OpportunitySort } from "../types";
import { useOpportunityParams } from "../use-opportunity-params";
import { FilterDropdown } from "./filter-dropdown";
import type { Facets } from "./filter-panel";
import { OpportunityFiltersSheet } from "./opportunity-filters";

const SORTS: { value: OpportunitySort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "capital", label: "Capital needed" },
  { value: "funded", label: "Most funded" },
];

type Props = { filters: OpportunityFilters; facets: Facets; total: number; activeCount: number };

/**
 * White bar above the results.
 * Desktop: one pill dropdown per filter + sort. Mobile: "Filters · N" bottom sheet + sort.
 */
export function OpportunityFilterBar({ filters, facets, total, activeCount }: Props) {
  const params = useOpportunityParams();

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3" aria-busy={params.isPending}>
      <div className="hidden flex-1 flex-wrap items-center gap-2 lg:flex">
        <FilterDropdown
          label="Theme"
          options={facets.themes}
          selected={filters.themes}
          onToggle={(v) => params.toggle("theme", v)}
          onClear={() => params.set({ theme: null })}
        />
        <FilterDropdown
          label="Looking for"
          options={facets.lookingFor}
          selected={filters.lookingFor}
          onToggle={(v) => params.toggle("lookingFor", v)}
          onClear={() => params.set({ lookingFor: null })}
        />
        <FilterDropdown
          label="Stage"
          options={facets.stages}
          selected={filters.stages}
          onToggle={(v) => params.toggle("stage", v)}
          onClear={() => params.set({ stage: null })}
        />
        <FilterDropdown
          label="Province"
          multiple={false}
          anyLabel="All provinces"
          options={PROVINCES}
          selected={filters.province ? [filters.province] : []}
          onToggle={(v) => params.set({ province: v })}
          onClear={() => params.set({ province: null })}
        />
        <FilterDropdown
          label="Capital"
          multiple={false}
          anyLabel="Any amount"
          options={CAPITAL_RANGES}
          selected={filters.capital ? [filters.capital] : []}
          onToggle={(v) => params.set({ capital: v })}
          onClear={() => params.set({ capital: null })}
        />
        {activeCount ? (
          <button
            type="button"
            onClick={params.clearFilters}
            className="ml-1 text-[13px] font-semibold text-muted-foreground hover:text-foreground"
          >
            Clear all
          </button>
        ) : null}
      </div>

      <OpportunityFiltersSheet facets={facets} activeCount={activeCount} total={total} />

      <label htmlFor="opportunity-sort" className="sr-only">
        Sort by
      </label>
      <select
        id="opportunity-sort"
        value={filters.sort}
        onChange={(e) => params.set({ sort: e.target.value === "newest" ? null : e.target.value })}
        className="h-10 flex-1 rounded-full border border-input bg-background px-4 text-sm font-medium text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20 focus-visible:outline-none lg:flex-none"
      >
        {SORTS.map((s) => (
          <option key={s.value} value={s.value}>
            Sort: {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}
