import { Suspense } from "react";
import { Container } from "@/components/layout/container";
import { OpportunitiesEmpty } from "@/features/opportunities/components/opportunities-empty";
import { OpportunityCard } from "@/features/opportunities/components/opportunity-card";
import { OpportunityFiltersSidebar } from "@/features/opportunities/components/opportunity-filters";
import { OpportunityPagination } from "@/features/opportunities/components/opportunity-pagination";
import { ResultsToolbar } from "@/features/opportunities/components/results-toolbar";
import { VisitorBanner } from "@/features/opportunities/components/visitor-banner";
import { getOpportunities, getOpportunityFacets } from "@/features/opportunities/queries";
import {
  countActiveFilters,
  parseOpportunityFilters,
} from "@/features/opportunities/search-params";
import { getViewer } from "@/lib/viewer";
import type { RawSearchParams } from "./types";

/** Explore → Opportunities: search, filters and project cards. */
export async function OpportunitiesSection({ searchParams }: { searchParams: RawSearchParams }) {
  const filters = parseOpportunityFilters(searchParams);
  const [result, facets] = await Promise.all([getOpportunities(filters), getOpportunityFacets()]);
  // Only people who are not signed in see "Register free" (members and people in onboarding don't).
  const viewer = await getViewer();
  const isVisitor = !viewer.signedIn && !viewer.account;

  return (
    <>
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
              activeCount={countActiveFilters(filters)}
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
    </>
  );
}
