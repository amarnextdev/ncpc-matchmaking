import Link from "next/link";
import { routes } from "@/config/routes";
import { THEMES, labelFor, type Theme } from "@/lib/constants";
import type { SimilarOpportunity } from "../../types";
import { OpportunityMiniCard } from "./opportunity-mini-card";

export function SimilarOpportunities({
  items,
  theme,
}: {
  items: SimilarOpportunity[];
  theme: Theme;
}) {
  if (!items.length) return null;
  return (
    <section aria-labelledby="similar-title" className="mt-12 flex flex-col gap-4 border-t pt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 id="similar-title" className="text-[22px] leading-7 font-bold tracking-tight">
            Similar opportunities
          </h2>
          <p className="text-[13px] text-muted-foreground">
            Other {labelFor(THEMES, theme).toLowerCase()} projects seeking investors and partners
          </p>
        </div>
        <Link
          href={`${routes.opportunities.list}?theme=${theme}`}
          className="text-sm font-semibold text-primary hover:underline"
        >
          View all opportunities →
        </Link>
      </div>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-3.5">
        {items.map(({ opportunity, reason }) => (
          <li key={opportunity.id} className="flex">
            <OpportunityMiniCard opportunity={opportunity} reason={reason} />
          </li>
        ))}
      </ul>
    </section>
  );
}
