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
import { useOrganisationParams } from "../use-organisation-params";

type Option = { value: string; label: string; count: number };
export type OrganisationFacets = { themes: Option[]; offers: Option[] };

type ParamKey = "theme" | "offer" | "province";

/** Accordion groups + "Open to new partners". Shared by the sidebar and the mobile sheet. */
function FilterPanel({ facets }: { facets: OrganisationFacets }) {
  const params = useOrganisationParams();
  const groups: FacetGroup[] = [
    { kind: "checkbox", key: "theme", title: "Themes", options: facets.themes },
    { kind: "checkbox", key: "offer", title: "Offers", options: facets.offers },
    {
      kind: "radio",
      key: "province",
      title: "Province",
      anyLabel: "All provinces",
      options: PROVINCES,
    },
  ];
  return (
    <div className="flex flex-col">
      <FacetAccordion
        groups={groups}
        defaultOpen={["theme"]}
        get={(key) => params.get(key as ParamKey)}
        getList={(key) => params.getList(key as ParamKey)}
        onToggle={(key, value) => params.toggle(key as ParamKey, value)}
        onSelect={(key, value) => params.set({ [key as ParamKey]: value })}
      />
      <label
        htmlFor="filter-open"
        className="flex cursor-pointer items-center justify-between gap-3 py-4 text-sm"
      >
        Open to new partners
        <Switch
          id="filter-open"
          checked={params.get("open") === "1"}
          onCheckedChange={(on) => params.set({ open: on ? "1" : null })}
        />
      </label>
    </div>
  );
}

/** Desktop: sticky sidebar card. */
export function OrganisationFiltersSidebar({ facets }: { facets: OrganisationFacets }) {
  const params = useOrganisationParams();
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

/** Mobile: "Filters · N" button → bottom sheet. */
export function OrganisationFiltersSheet({
  facets,
  activeCount,
  total,
}: {
  facets: OrganisationFacets;
  activeCount: number;
  total: number;
}) {
  const params = useOrganisationParams();
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
          <SheetDescription>Narrow down the organisations.</SheetDescription>
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
