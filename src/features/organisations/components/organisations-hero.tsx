import { MarketplaceHero } from "@/components/shared/marketplace-hero";

export function OrganisationsHero({
  stats,
}: {
  stats: { organisations: number; capitalProviders: number; provinces: number };
}) {
  return (
    <MarketplaceHero
      crumb="Organisations"
      title="Verified organisations"
      description="Investors, funders, project developers, industrial parks and technology providers working on sustainable industry in South Africa. Every organisation is checked by the NCPC."
      stats={[
        { label: "Organisations", value: String(stats.organisations) },
        { label: "Investors & funders", value: String(stats.capitalProviders) },
        { label: "Provinces", value: String(stats.provinces) },
      ]}
    />
  );
}
