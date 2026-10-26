"use client";

import { SlidersHorizontal } from "lucide-react";
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
import { FilterPanel, type Facets } from "./filter-panel";
import { useOpportunityParams } from "../use-opportunity-params";

/** Desktop: sticky sidebar card with the accordion filters. */
export function OpportunityFiltersSidebar({ facets }: { facets: Facets }) {
  const params = useOpportunityParams();
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
      <FilterPanel facets={facets} />
    </aside>
  );
}

/** Mobile: "Filters · 2" button that opens a bottom sheet. */
export function OpportunityFiltersSheet({
  facets,
  activeCount,
  total,
}: {
  facets: Facets;
  activeCount: number;
  total: number;
}) {
  const params = useOpportunityParams();
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
          <SheetDescription>Narrow down the opportunities.</SheetDescription>
        </SheetHeader>
        <div className="overflow-y-auto px-5 pb-2">
          <FilterPanel facets={facets} />
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
