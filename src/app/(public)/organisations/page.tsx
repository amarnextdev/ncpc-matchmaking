import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/layout/container";
import { Pagination } from "@/components/shared/pagination";
import { VisitorBanner } from "@/components/shared/visitor-banner";
import { routes } from "@/config/routes";
import { CategoryTabs } from "@/features/organisations/components/category-tabs";
import { OrganisationCard } from "@/features/organisations/components/organisation-card";
import { OrganisationFiltersSidebar } from "@/features/organisations/components/organisation-filters";
import { OrganisationSearch } from "@/features/organisations/components/organisation-search";
import { OrganisationsEmpty } from "@/features/organisations/components/organisations-empty";
import { OrganisationsHero } from "@/features/organisations/components/organisations-hero";
import { OrganisationResultsToolbar } from "@/features/organisations/components/results-toolbar";
import {
  getOrganisationFacets,
  getOrganisationStats,
  getOrganisations,
} from "@/features/organisations/queries";
import {
  countActiveOrganisationFilters,
  organisationsQuery,
  parseOrganisationFilters,
} from "@/features/organisations/search-params";

export const metadata: Metadata = {
  title: "Organisations",
  description:
    "NCPC-verified investors, funders, project developers, industrial parks and technology providers in South Africa.",
};

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function OrganisationsPage({ searchParams }: PageProps) {
  const filters = parseOrganisationFilters(await searchParams);
  const [result, facets, stats] = await Promise.all([
    getOrganisations(filters),
    getOrganisationFacets(filters),
    getOrganisationStats(),
  ]);
  // TODO(Module 3 – Auth): hide for signed-in members and show match scores instead.
  const isVisitor = true;

  return (
    <div className="bg-surface">
      <OrganisationsHero stats={stats} />
      <Suspense>
        <OrganisationSearch />
      </Suspense>

      <Container className="pt-7">
        <Suspense>
          <CategoryTabs tabs={facets.tabs} active={filters.tab} />
        </Suspense>
      </Container>

      <Container className="flex items-start gap-7 pt-6 pb-16">
        <Suspense>
          <OrganisationFiltersSidebar facets={facets} />
        </Suspense>

        <section aria-label="Results" className="flex min-w-0 flex-1 flex-col gap-6">
          <Suspense>
            <OrganisationResultsToolbar
              filters={filters}
              total={result.total}
              facets={facets}
              activeCount={countActiveOrganisationFilters(filters)}
            />
          </Suspense>

          {isVisitor ? (
            <VisitorBanner
              title="Find the right partners faster"
              description="Register your organisation to see how well each one matches you and to send enquiries."
            />
          ) : null}

          {result.items.length ? (
            <ul className="grid gap-6 md:grid-cols-2">
              {result.items.map((organisation) => (
                <li key={organisation.id} className="flex">
                  <OrganisationCard organisation={organisation} className="w-full" />
                </li>
              ))}
            </ul>
          ) : (
            <OrganisationsEmpty />
          )}

          <Pagination
            page={result.page}
            pageCount={result.pageCount}
            total={result.total}
            pageSize={result.pageSize}
            hrefForPage={(page) => {
              const query = organisationsQuery(filters, page);
              return query ? `${routes.organisations.list}?${query}` : routes.organisations.list;
            }}
          />
        </section>
      </Container>
    </div>
  );
}
