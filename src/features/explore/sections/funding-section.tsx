import { Suspense } from "react";
import { Container } from "@/components/layout/container";
import { Pagination } from "@/components/shared/pagination";
import { VisitorBanner } from "@/components/shared/visitor-banner";
import { routes } from "@/config/routes";
import { FundingEmpty } from "@/features/funding/components/funding-empty";
import { FundingFiltersSidebar } from "@/features/funding/components/funding-filters";
import { MemberMatchBanner } from "@/features/funding/components/member-banner";
import { OfferCard } from "@/features/funding/components/offer-card";
import { FundingResultsToolbar } from "@/features/funding/components/results-toolbar";
import { TypeTabs } from "@/features/funding/components/type-tabs";
import { getFundingFacets, getFundingOffers } from "@/features/funding/queries";
import {
  countActiveFundingFilters,
  fundingQuery,
  parseFundingFilters,
} from "@/features/funding/search-params";
import { getViewer } from "@/lib/viewer";
import type { RawSearchParams } from "./types";

/** Explore → Funding: search, funding-type pills, filters and offer cards. */
export async function FundingSection({ searchParams }: { searchParams: RawSearchParams }) {
  const filters = parseFundingFilters(searchParams);
  const [result, facets, viewer] = await Promise.all([
    getFundingOffers(filters),
    getFundingFacets(filters),
    getViewer(),
  ]);
  // TODO(Module 6 – Matching): the member's listed projects and how many offers they qualify for.
  const myProjects = ["Solar Rooftop & Battery Storage", "Rooftop Solar Phase 2"];

  return (
    <>
      <Container className="flex items-start gap-7 pt-9 pb-16">
        <Suspense>
          <FundingFiltersSidebar facets={facets} viewer={viewer} />
        </Suspense>

        <section aria-label="Results" className="flex min-w-0 flex-1 flex-col gap-6">
          <Suspense>
            <FundingResultsToolbar
              filters={filters}
              total={result.total}
              facets={facets}
              viewer={viewer}
              activeCount={countActiveFundingFilters(filters)}
            />
          </Suspense>
          <Suspense>
            <TypeTabs tabs={facets.tabs} active={filters.tab} />
          </Suspense>

          {viewer.signedIn ? (
            result.total ? (
              <MemberMatchBanner projects={myProjects} offers={result.total} />
            ) : null
          ) : !viewer.account ? (
            <VisitorBanner
              title="See which offers your project qualifies for"
              description="Register your organisation and list a project to get matched and apply."
            />
          ) : null}

          {result.items.length ? (
            <ul className="grid gap-6 md:grid-cols-2">
              {result.items.map((offer) => (
                <li key={offer.id} className="flex">
                  <OfferCard offer={offer} viewer={viewer} className="w-full" />
                </li>
              ))}
            </ul>
          ) : (
            <FundingEmpty />
          )}

          <Pagination
            page={result.page}
            pageCount={result.pageCount}
            total={result.total}
            pageSize={result.pageSize}
            hrefForPage={(page) => routes.explore.section("funding", fundingQuery(filters, page))}
          />
        </section>
      </Container>
    </>
  );
}
