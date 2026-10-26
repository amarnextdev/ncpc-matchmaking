import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/layout/container";
import { OrgLogo } from "@/components/shared/org-logo";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { routes } from "@/config/routes";
import { ORGANISATION_CATEGORIES, PROVINCES, labelFor } from "@/lib/constants";
import type { Organisation } from "../types";

type TrackStat = { label: string; value: string; note: string; dot: string };

/**
 * Navy hero for /organisations/[slug]/projects: organisation card, title, and 2×2 stat tiles.
 * The search card overlaps its bottom edge.
 */
export function TrackHero({
  organisation: o,
  title,
  description,
  stats,
}: {
  organisation: Organisation;
  title: string;
  description: string;
  stats: TrackStat[];
}) {
  const profile = routes.organisations.detail(o.slug);
  return (
    <section
      aria-labelledby="track-title"
      className="relative overflow-hidden bg-primary text-white"
    >
      {/* Quiet texture: dot grid + two soft rings (same language as the profile cover). */}
      <span
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(rgb(255_255_255/0.07)_1px,transparent_1px)] [background-size:18px_18px]"
      />
      <span
        aria-hidden
        className="absolute -top-40 -right-24 size-[520px] rounded-full border-[64px] border-white/[0.04]"
      />
      <span
        aria-hidden
        className="absolute -bottom-40 left-1/3 size-[300px] rounded-full border-[40px] border-success-bar/10"
      />

      <Container className="relative flex flex-col gap-7 pt-7 pb-24 lg:pb-[100px]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1.5 text-[13px] text-[#B9C7DD]"
          >
            <Link href={routes.organisations.list} className="hover:text-white">
              Organisations
            </Link>
            <span aria-hidden>/</span>
            <Link href={profile} className="hover:text-white">
              {o.name}
            </Link>
            <span aria-hidden>/</span>
            <span className="text-white">{title}</span>
          </nav>
          <Link
            href={profile}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white/90 hover:text-white"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            Back to profile
          </Link>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-10">
          <div className="flex max-w-[640px] flex-[1_1_520px] flex-col gap-5">
            <Link
              href={profile}
              className="flex items-center gap-3 self-start rounded-lg border border-white/15 bg-white/[0.07] p-2 pr-4 transition-colors hover:bg-white/[0.12]"
            >
              <OrgLogo
                name={o.name}
                logoUrl={o.logoUrl}
                size="md"
                className="size-11 rounded-md bg-white text-sm text-primary"
              />
              <span className="flex flex-col">
                <span className="flex items-center gap-1.5 text-[15px] font-semibold">
                  {o.name}
                  {o.verified ? <VerifiedBadge tone="light" /> : null}
                </span>
                <span className="text-[13px] text-[#B9C7DD]">
                  {labelFor(ORGANISATION_CATEGORIES, o.category)} · {o.city},{" "}
                  {labelFor(PROVINCES, o.province)}
                </span>
              </span>
            </Link>
            <div className="flex flex-col gap-3">
              <h1
                id="track-title"
                className="text-[30px] leading-tight font-bold tracking-tight md:text-[44px]"
              >
                {title}
              </h1>
              <p className="max-w-[580px] text-[17px] leading-7 text-[#D6E0F0]">{description}</p>
            </div>
          </div>

          <dl className="grid flex-[0_1_480px] grid-cols-2 gap-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col gap-2 rounded-md border border-white/15 bg-white/[0.06] px-4 py-3.5 backdrop-blur-sm"
              >
                <dt className="flex items-center gap-2 text-xs text-[#B9C7DD]">
                  <span
                    aria-hidden
                    className="size-2 rounded-full"
                    style={{ backgroundColor: stat.dot }}
                  />
                  {stat.label}
                </dt>
                <dd className="flex items-baseline gap-2">
                  <span className="text-[32px] leading-none font-bold tracking-tight">
                    {stat.value}
                  </span>
                  <span className="text-[13px] text-[#B9C7DD]">{stat.note}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  );
}
