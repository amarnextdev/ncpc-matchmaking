"use client";

import Link from "next/link";
import { useState } from "react";
import { Building2, FolderKanban, Wallet, type LucideIcon } from "lucide-react";
import { routes, type ExploreSection } from "@/config/routes";
import { cn } from "@/lib/utils";

const SECTIONS: { value: ExploreSection; title: string; icon: LucideIcon }[] = [
  { value: "opportunities", title: "Opportunities", icon: FolderKanban },
  { value: "organisations", title: "Organisations", icon: Building2 },
  { value: "funding", title: "Funding", icon: Wallet },
];

/**
 * Segmented tabs above the results: Opportunities · Organisations · Funding.
 * Each tab is a URL (/explore?tab=…). The clicked tab lights up at once and the
 * current results stay on screen until the new ones arrive, so nothing jumps.
 */
export function ExploreTabs({
  active,
  total,
  noun,
}: {
  active: ExploreSection;
  total: number;
  /** For screen readers, e.g. "open offers" → "6 open offers" */
  noun: string;
}) {
  const [pending, setPending] = useState<ExploreSection | null>(null);
  const current = pending ?? active;

  return (
    <nav aria-label="Explore" className="max-w-full [scrollbar-width:none] overflow-x-auto">
      <ul className="inline-flex items-center gap-1 rounded-full border bg-background p-1 shadow-card">
        {SECTIONS.map(({ value, title, icon: Icon }) => {
          const selected = value === current;
          return (
            <li key={value}>
              <Link
                href={routes.explore.section(value)}
                scroll={false}
                aria-current={value === active ? "page" : undefined}
                onClick={() => value !== active && setPending(value)}
                className={cn(
                  "flex h-9 items-center gap-2 rounded-full px-4 text-sm whitespace-nowrap transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none",
                  selected
                    ? "bg-primary font-semibold text-primary-foreground shadow-card"
                    : "font-medium text-foreground/70 hover:bg-background hover:text-primary",
                )}
              >
                <Icon className="size-4" strokeWidth={2} aria-hidden />
                {title}
                {value === active ? (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-[11px] font-bold text-primary tabular-nums">
                    {total}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="sr-only" aria-live="polite">
        {total} {noun}
      </p>
    </nav>
  );
}
