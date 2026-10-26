"use client";

import { cn } from "@/lib/utils";
import { useFundingParams } from "../use-funding-params";

type Tab = { value: string | null; label: string; count: number; tint: string | null };

/** Pill tabs: All · Grants · Loans · Equity · Blended · Guarantees · Closed (with a colour swatch per type). */
export function TypeTabs({ tabs, active }: { tabs: Tab[]; active: string | null }) {
  const params = useFundingParams();
  return (
    <div
      role="tablist"
      aria-label="Funding type"
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
              "flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold whitespace-nowrap transition-colors",
              selected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input bg-background text-foreground/80 hover:border-subtle-foreground",
              tab.value === "closed" && !selected && "text-subtle-foreground",
            )}
          >
            {tab.tint ? (
              <span
                aria-hidden
                className={cn("size-2.5 rounded-full", selected && "ring-2 ring-white/70")}
                style={{ backgroundColor: tab.tint }}
              />
            ) : null}
            {tab.label} <span className="font-medium opacity-70">{tab.count}</span>
          </button>
        );
      })}
    </div>
  );
}
