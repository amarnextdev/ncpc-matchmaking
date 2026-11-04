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
      className="-mx-5 -mt-2 flex [scrollbar-width:none] gap-1.5 overflow-x-auto px-5 lg:mx-0 lg:px-0"
    >
      {/* Empty categories are hidden (unless selected) so the row stays on one line. */}
      {tabs
        .filter((tab) => tab.count > 0 || tab.value === null || tab.value === active)
        .map((tab) => {
          const selected = tab.value === active;
          return (
            <button
              key={tab.label}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => params.set({ tab: tab.value })}
              className={cn(
                "flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[13px] whitespace-nowrap transition-colors",
                selected
                  ? "border-primary/25 bg-primary-soft font-semibold text-primary"
                  : "border-border bg-background font-medium text-foreground/75 hover:border-subtle-foreground hover:text-foreground",
                tab.value === "closed" && !selected && "text-subtle-foreground",
              )}
            >
              {tab.tint ? (
                <span
                  aria-hidden
                  className="size-2 rounded-full"
                  style={{ backgroundColor: tab.tint }}
                />
              ) : null}
              {tab.label} <span className="tabular-nums opacity-60">{tab.count}</span>
            </button>
          );
        })}
    </div>
  );
}
