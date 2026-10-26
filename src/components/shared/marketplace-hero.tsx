import Link from "next/link";
import { Container } from "@/components/layout/container";
import { routes } from "@/config/routes";
import type { Stat } from "@/types";

type MarketplaceHeroProps = {
  /** Last breadcrumb item and the H1's id prefix, e.g. "Organisations". */
  crumb: string;
  title: string;
  description: string;
  stats: Stat[];
};

/** Navy hero for marketplace list pages. The search card overlaps its bottom edge (-mt-11). */
export function MarketplaceHero({ crumb, title, description, stats }: MarketplaceHeroProps) {
  const id = `${crumb.toLowerCase().replace(/\s+/g, "-")}-title`;
  return (
    <section aria-labelledby={id} className="bg-primary text-white">
      <Container className="flex flex-wrap items-end justify-between gap-12 pt-10 pb-24 lg:pt-13 lg:pb-[100px]">
        <div className="flex max-w-[680px] flex-[1_1_520px] flex-col gap-[18px]">
          <nav aria-label="Breadcrumb" className="text-[13px] text-[#B9C7DD]">
            <Link href={routes.home} className="hover:text-white">
              Home
            </Link>
            <span aria-hidden className="mx-1.5">
              /
            </span>
            <span className="text-white">{crumb}</span>
          </nav>
          <h1 id={id} className="text-[28px] leading-tight font-bold tracking-tight md:text-[40px]">
            {title}
          </h1>
          <p className="max-w-[600px] text-[17px] leading-7 text-[#D6E0F0]">{description}</p>
        </div>
        <dl
          className="grid flex-[0_1_420px] overflow-hidden rounded-lg border border-white/15 bg-white/[0.06]"
          style={{ gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))` }}
        >
          {stats.map((stat, i) => (
            <div key={stat.label} className={i ? "border-l border-white/15 p-5" : "p-5"}>
              <dt className="text-xs text-[#B9C7DD]">{stat.label}</dt>
              <dd
                className={
                  stat.tone === "warning"
                    ? "mt-1.5 text-[28px] font-bold tracking-tight text-[#F5B544]"
                    : "mt-1.5 text-[28px] font-bold tracking-tight"
                }
              >
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
