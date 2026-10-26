import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/layout/container";
import { Pagination } from "@/components/shared/pagination";
import { VisitorBanner } from "@/components/shared/visitor-banner";
import { routes } from "@/config/routes";
import { FundingEmpty } from "@/features/funding/components/funding-empty";
import { FundingFiltersSidebar } from "@/features/funding/components/funding-filters";
import { FundingHero } from "@/features/funding/components/funding-hero";
import { FundingSearch } from "@/features/funding/components/funding-search";
import { MemberMatchBanner } from "@/features/funding/components/member-banner";
import { OfferCard } from "@/features/funding/components/offer-card";
import { FundingResultsToolbar } from "@/features/funding/components/results-toolbar";
import { TypeTabs } from "@/features/funding/components/type-tabs";
import { getFundingFacets, getFundingOffers, getFundingStats } from "@/features/funding/queries";
import {
  countActiveFundingFilters,
  fundingQuery,
  parseFundingFilters,
} from "@/features/funding/search-params";
import type { Viewer } from "@/types";

export const metadata: Metadata = {
  title: "Funding",
  description:
    "Grants, loans, equity and guarantees for sustainable industrial projects in South Africa, from NCPC-verified funders.",
};

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function FundingPage({ searchParams }: PageProps) {
  const filters = parseFundingFilters(await searchParams);
  const [result, facets, stats] = await Promise.all([
    getFundingOffers(filters),
    getFundingFacets(filters),
    getFundingStats(),
  ]);
  // TODO(Module 3 – Auth): real session. Members see "qualifies" lines and the eligibility toggle.
  const viewer: Viewer = { signedIn: false };
  // TODO(Module 6 – Matching): the member's listed projects and how many offers they qualify for.
  const myProjects = ["Solar Rooftop & Battery Storage", "Rooftop Solar Phase 2"];

  return (
    <div className="bg-surface">
      <FundingHero stats={stats} />
      <Suspense>
        <FundingSearch />
      </Suspense>

      <Container className="pt-7">
        <Suspense>
          <TypeTabs tabs={facets.tabs} active={filters.tab} />
        </Suspense>
      </Container>

      <Container className="flex items-start gap-7 pt-6 pb-16">
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

          {viewer.signedIn ? (
            <MemberMatchBanner projects={myProjects} offers={7} />
          ) : (
            <VisitorBanner
              title="See which offers your project qualifies for"
              description="Register your organisation and list a project to get matched and apply."
            />
          )}

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
            hrefForPage={(page) => {
              const query = fundingQuery(filters, page);
              return query ? `${routes.funding.list}?${query}` : routes.funding.list;
            }}
          />
        </section>
      </Container>
    </div>
  );
}
