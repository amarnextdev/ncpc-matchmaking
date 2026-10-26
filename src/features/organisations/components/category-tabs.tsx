"use client";

import { cn } from "@/lib/utils";
import { useOrganisationParams } from "../use-organisation-params";

type Tab = { value: string | null; label: string; count: number };

/** Pill tabs with counts: All · Investors · Funders · … (the main way to browse the directory). */
export function CategoryTabs({ tabs, active }: { tabs: Tab[]; active: string | null }) {
  const params = useOrganisationParams();
  return (
    <div
      role="tablist"
      aria-label="Organisation category"
      className="-mx-5 flex [scrollbar-width:none] gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:flex-wrap lg:px-0"
    >
      {tabs.map((tab) => {
        const selected = tab.value === active;
        return (
          <button
            key={tab.label}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => params.set({ tab: tab.value })}
            className={cn(
              "h-10 shrink-0 rounded-full border px-4 text-sm font-semibold whitespace-nowrap transition-colors",
              selected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input bg-background text-foreground/80 hover:border-subtle-foreground",
            )}
          >
            {tab.label} <span className="font-medium opacity-70">{tab.count}</span>
          </button>
        );
      })}
    </div>
  );
}
