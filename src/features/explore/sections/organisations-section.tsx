import { Suspense } from "react";
import { Container } from "@/components/layout/container";
import { Pagination } from "@/components/shared/pagination";
import { VisitorBanner } from "@/components/shared/visitor-banner";
import { routes } from "@/config/routes";
import { CategoryTabs } from "@/features/organisations/components/category-tabs";
import { OrganisationCard } from "@/features/organisations/components/organisation-card";
import { OrganisationFiltersSidebar } from "@/features/organisations/components/organisation-filters";
import { OrganisationsEmpty } from "@/features/organisations/components/organisations-empty";
import { OrganisationResultsToolbar } from "@/features/organisations/components/results-toolbar";
import { getOrganisationFacets, getOrganisations } from "@/features/organisations/queries";
import {
  countActiveOrganisationFilters,
  organisationsQuery,
  parseOrganisationFilters,
} from "@/features/organisations/search-params";
import type { RawSearchParams } from "./types";

/** Explore → Organisations: search, category pills, filters and organisation cards. */
export async function OrganisationsSection({ searchParams }: { searchParams: RawSearchParams }) {
  const filters = parseOrganisationFilters(searchParams);
  const [result, facets] = await Promise.all([
    getOrganisations(filters),
    getOrganisationFacets(filters),
  ]);
  // TODO(Module 6 – Matching): hide for signed-in members and show match scores instead.
  const isVisitor = true;

  return (
    <>
      <Container className="flex items-start gap-7 pt-9 pb-16">
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
          <Suspense>
            <CategoryTabs tabs={facets.tabs} active={filters.tab} />
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
            hrefForPage={(page) =>
              routes.explore.section("organisations", organisationsQuery(filters, page))
            }
          />
        </section>
      </Container>
    </>
  );
}
