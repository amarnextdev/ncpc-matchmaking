import type * as React from "react";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { routes } from "@/config/routes";

/** One navy hero for all of Explore, with the current tab's search bar inside it. */
export function ExploreHero({ search }: { search: React.ReactNode }) {
  return (
    <section aria-labelledby="explore-title" className="bg-primary text-white">
      <Container className="flex flex-col gap-3 pt-9 pb-10 lg:pt-11 lg:pb-12">
        <nav aria-label="Breadcrumb" className="text-[13px] text-[#B9C7DD]">
          <Link href={routes.home} className="hover:text-white">
            Home
          </Link>
          <span aria-hidden className="mx-1.5">
            /
          </span>
          <span className="text-white">Explore</span>
        </nav>
        <h1
          id="explore-title"
          className="text-[28px] leading-tight font-bold tracking-tight md:text-[36px]"
        >
          Explore the marketplace
        </h1>
        <p className="max-w-[640px] text-base leading-7 text-[#D6E0F0]">
          Sustainable industrial projects, NCPC-verified organisations and funding offers across
          South Africa, in one place.
        </p>
        <div className="mt-4 text-foreground">{search}</div>
      </Container>
    </section>
  );
}
