import { MarketplaceHero } from "@/components/shared/marketplace-hero";
import { formatRand } from "@/lib/utils";

type OpportunitiesHeroProps = {
  stats: { openProjects: number; capitalSought: number; provinces: number };
};

export function OpportunitiesHero({ stats }: OpportunitiesHeroProps) {
  return (
    <MarketplaceHero
      crumb="Opportunities"
      title="Investment and partnership opportunities"
      description="Sustainable industrial projects from NCPC-verified organisations across South Africa. Find projects to fund, supply or host."
      stats={[
        { label: "Open projects", value: String(stats.openProjects) },
        { label: "Capital sought", value: formatRand(stats.capitalSought) },
        { label: "Provinces", value: String(stats.provinces) },
      ]}
    />
  );
}
