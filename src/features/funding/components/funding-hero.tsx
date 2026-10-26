import { MarketplaceHero } from "@/components/shared/marketplace-hero";

export function FundingHero({
  stats,
}: {
  stats: { open: number; available: string; closingSoon: number };
}) {
  return (
    <MarketplaceHero
      crumb="Funding"
      title="Funding for sustainable industry"
      description="Grants, loans, equity and guarantees from verified funders and the NCPC. Check if your project qualifies and apply with it in a few minutes."
      stats={[
        { label: "Open offers", value: String(stats.open) },
        { label: "Funding available", value: stats.available },
        { label: "Closing in 30 days", value: String(stats.closingSoon), tone: "warning" },
      ]}
    />
  );
}
