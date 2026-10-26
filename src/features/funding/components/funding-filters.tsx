"use client";

import { SlidersHorizontal } from "lucide-react";
import { FacetAccordion, type FacetGroup } from "@/components/shared/filters/facet-accordion";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { PROVINCES } from "@/lib/constants";
import type { Viewer } from "@/types";
import { FUNDING_AMOUNTS, FUNDING_DEADLINES } from "../constants";
import { useFundingParams } from "../use-funding-params";

type Option = { value: string; label: string; count: number };
export type FundingFilterFacets = { themes: Option[]; stages: Option[]; applicants: Option[] };

type ParamKey = "theme" | "stage" | "who" | "province" | "amount" | "deadline";

/** "Only offers I qualify for" (members) + accordion groups. Shared by the sidebar and the sheet. */
function FilterPanel({ facets, viewer }: { facets: FundingFilterFacets; viewer: Viewer }) {
  const params = useFundingParams();
  const groups: FacetGroup[] = [
    { kind: "checkbox", key: "theme", title: "Themes", options: facets.themes },
    {
      kind: "radio",
      key: "amount",
      title: "Amount",
      anyLabel: "Any amount",
      options: FUNDING_AMOUNTS,
    },
    { kind: "checkbox", key: "stage", title: "Stage funded", options: facets.stages },
    { kind: "checkbox", key: "who", title: "Who can apply", options: facets.applicants },
    {
      kind: "radio",
      key: "province",
      title: "Province",
      anyLabel: "All provinces",
      options: PROVINCES,
    },
    {
      kind: "radio",
      key: "deadline",
      title: "Deadline",
      anyLabel: "Any deadline",
      options: FUNDING_DEADLINES,
    },
  ];
  return (
    <div className="flex flex-col">
      {viewer.signedIn ? (
        <label
          htmlFor="filter-eligible"
          className="mt-3 flex cursor-pointer items-center justify-between gap-3 rounded-md bg-success-soft px-3.5 py-3 text-sm font-semibold text-success"
        >
          Only offers I qualify for
          <Switch
            id="filter-eligible"
            checked={params.get("eligible") === "1"}
            onCheckedChange={(on) => params.set({ eligible: on ? "1" : null })}
          />
        </label>
      ) : null}
      <FacetAccordion
        groups={groups}
        defaultOpen={["theme"]}
        get={(key) => params.get(key as ParamKey)}
        getList={(key) => params.getList(key as ParamKey)}
        onToggle={(key, value) => params.toggle(key as ParamKey, value)}
        onSelect={(key, value) => params.set({ [key as ParamKey]: value })}
      />
      <p className="py-3.5 text-xs leading-[18px] text-subtle-foreground">
        Offers are posted by verified funders and NCPC, and checked by NCPC before they go live.
      </p>
    </div>
  );
}

/** Desktop: sticky sidebar card. */
export function FundingFiltersSidebar({
  facets,
  viewer,
}: {
  facets: FundingFilterFacets;
  viewer: Viewer;
}) {
  const params = useFundingParams();
  return (
    <aside
      aria-label="Filters"
      className="sticky top-28 hidden max-h-[calc(100dvh-8rem)] w-[264px] shrink-0 flex-col self-start overflow-y-auto rounded-lg border bg-card px-5 pt-4 pb-1 lg:flex"
    >
      <div className="flex items-center justify-between border-b border-muted pb-3">
        <h2 className="text-base font-bold">Filters</h2>
        <button
          type="button"
          onClick={params.clearFilters}
          className="text-[13px] font-semibold text-primary hover:underline"
        >
          Clear all
        </button>
      </div>
      <FilterPanel facets={facets} viewer={viewer} />
    </aside>
  );
}

/** Mobile: "Filters · N" button → bottom sheet. */
export function FundingFiltersSheet({
  facets,
  viewer,
  activeCount,
  total,
}: {
  facets: FundingFilterFacets;
  viewer: Viewer;
  activeCount: number;
  total: number;
}) {
  const params = useFundingParams();
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="h-10 flex-1 lg:hidden">
          <SlidersHorizontal />
          Filters{activeCount ? ` · ${activeCount}` : ""}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>Narrow down the funding offers.</SheetDescription>
        </SheetHeader>
        <div className="overflow-y-auto px-5 pb-2">
          <FilterPanel facets={facets} viewer={viewer} />
        </div>
        <SheetFooter>
          <Button variant="outline" className="flex-1" onClick={params.clearFilters}>
            Clear all
          </Button>
          <SheetClose asChild>
            <Button className="flex-1">Show {total} results</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
