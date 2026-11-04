import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { EXPLORE_TAB_PARAM, routes, type ExploreSection } from "@/config/routes";
import { ExploreHero } from "@/features/explore/components/explore-hero";
import { SectionSkeleton } from "@/features/explore/components/section-skeleton";
import { FundingSection } from "@/features/explore/sections/funding-section";
import { OpportunitiesSection } from "@/features/explore/sections/opportunities-section";
import { OrganisationsSection } from "@/features/explore/sections/organisations-section";
import type { RawSearchParams } from "@/features/explore/sections/types";
import { FundingSearch } from "@/features/funding/components/funding-search";
import { OpportunitySearch } from "@/features/opportunities/components/opportunity-search";
import { OrganisationSearch } from "@/features/organisations/components/organisation-search";

type PageProps = { searchParams: Promise<RawSearchParams> };

const META: Record<ExploreSection, Metadata> = {
  opportunities: {
    title: "Opportunities",
    description:
      "Sustainable industrial projects in South Africa looking for investors, funders, technology and partners.",
  },
  organisations: {
    title: "Organisations",
    description:
      "NCPC-verified investors, funders, project developers, industrial parks and technology providers in South Africa.",
  },
  funding: {
    title: "Funding",
    description:
      "Grants, loans, equity and guarantees for sustainable industrial projects in South Africa, from NCPC-verified funders.",
  },
};

function sectionOf(params: RawSearchParams): ExploreSection {
  const raw = params[EXPLORE_TAB_PARAM];
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value === "organisations" || value === "funding" ? value : "opportunities";
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  return META[sectionOf(await searchParams)];
}

/**
 * Explore: one page, three tabs (?tab=opportunities · organisations · funding).
 * The hero and search bar stay at the top; switching a tab keeps the current results
 * on screen until the new ones are ready (no Suspense key, so no flash of skeleton).
 */
export default async function ExplorePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const section = sectionOf(params);

  // Always show the tab in the URL: /explore → /explore?tab=opportunities (filters kept).
  if (!params[EXPLORE_TAB_PARAM]) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      for (const v of Array.isArray(value) ? value : value ? [value] : []) query.append(key, v);
    }
    redirect(routes.explore.section(section, query.toString()));
  }

  const search =
    section === "organisations" ? (
      <OrganisationSearch />
    ) : section === "funding" ? (
      <FundingSearch />
    ) : (
      <OpportunitySearch />
    );

  return (
    <div className="bg-surface">
      {/* key: a fresh search bar (and its fields) for each tab */}
      <ExploreHero search={<Suspense key={section}>{search}</Suspense>} />
      <Suspense fallback={<SectionSkeleton />}>
        {section === "organisations" ? (
          <OrganisationsSection searchParams={params} />
        ) : section === "funding" ? (
          <FundingSection searchParams={params} />
        ) : (
          <OpportunitiesSection searchParams={params} />
        )}
      </Suspense>
    </div>
  );
}
