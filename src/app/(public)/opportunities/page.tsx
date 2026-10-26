import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/layout/container";
import { OpportunitiesEmpty } from "@/features/opportunities/components/opportunities-empty";
import { OpportunitiesHero } from "@/features/opportunities/components/opportunities-hero";
import { OpportunityCard } from "@/features/opportunities/components/opportunity-card";
import { OpportunityFiltersSidebar } from "@/features/opportunities/components/opportunity-filters";
import { OpportunityPagination } from "@/features/opportunities/components/opportunity-pagination";
import { OpportunitySearch } from "@/features/opportunities/components/opportunity-search";
import { ResultsToolbar } from "@/features/opportunities/components/results-toolbar";
import { VisitorBanner } from "@/features/opportunities/components/visitor-banner";
import {
  getOpportunities,
  getOpportunityFacets,
  getOpportunityStats,
} from "@/features/opportunities/queries";
import {
  countActiveFilters,
  parseOpportunityFilters,
} from "@/features/opportunities/search-params";

export const metadata: Metadata = {
  title: "Opportunities",
  description:
    "Sustainable industrial projects in South Africa looking for investors, funders, technology and partners.",
};

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function OpportunitiesPage({ searchParams }: PageProps) {
  const filters = parseOpportunityFilters(await searchParams);
  const [result, facets, stats] = await Promise.all([
    getOpportunities(filters),
    getOpportunityFacets(),
    getOpportunityStats(),
  ]);
  const activeCount = countActiveFilters(filters);
  // TODO(Module 3 – Auth): hide for signed-in members and show match scores instead.
  const isVisitor = true;

  return (
    <div className="bg-surface">
      <OpportunitiesHero stats={stats} />
      {/* Client components that read the URL must sit inside Suspense. */}
      <Suspense>
        <OpportunitySearch />
      </Suspense>

      <Container className="flex items-start gap-7 pt-9 pb-16">
        <Suspense>
          <OpportunityFiltersSidebar facets={facets} />
        </Suspense>

        <section aria-label="Results" className="flex min-w-0 flex-1 flex-col gap-6">
          <Suspense>
            <ResultsToolbar
              filters={filters}
              total={result.total}
              facets={facets}
              activeCount={activeCount}
            />
          </Suspense>

          {isVisitor ? <VisitorBanner /> : null}

          {result.items.length ? (
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
              {result.items.map((opportunity) => (
                <li key={opportunity.id} className="flex">
                  <OpportunityCard opportunity={opportunity} className="w-full" />
                </li>
              ))}
            </ul>
          ) : (
            <OpportunitiesEmpty />
          )}

          <OpportunityPagination
            filters={filters}
            page={result.page}
            pageCount={result.pageCount}
            total={result.total}
            pageSize={result.pageSize}
          />
        </section>
      </Container>
    </div>
  );
}
