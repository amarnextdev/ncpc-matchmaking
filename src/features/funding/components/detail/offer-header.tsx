import Link from "next/link";
import { Bookmark } from "lucide-react";
import { ShareButton } from "@/components/shared/share-button";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { THEMES, labelFor } from "@/lib/constants";
import { formatMonth } from "@/lib/dates";
import { APPROVED_LABEL, fundingType } from "../../constants";
import type { FundingOfferDetail } from "../../types";
import { FACT_ICONS } from "./fact-icon";

/** Header in the offer type's colour: chips, title + NCPC seal, funder line and four key facts. */
export function OfferHeader({ offer: o }: { offer: FundingOfferDetail }) {
  const type = fundingType(o.type);
  return (
    <section
      aria-labelledby="offer-title"
      className="relative isolate overflow-hidden rounded-xl px-5 pt-5 pb-6 text-white md:px-8 md:pt-7 md:pb-[30px]"
      style={{ backgroundColor: type.tint }}
    >
      {/* Dot pattern and rings */}
      <span
        aria-hidden
        className="absolute inset-0 -z-10 [background-image:radial-gradient(#fff_1px,transparent_1px)] [mask-image:linear-gradient(90deg,transparent_35%,#000)] [background-size:18px_18px] opacity-[0.12]"
      />
      <span
        aria-hidden
        className="absolute -top-28 -right-20 -z-10 size-[360px] rounded-full border-[40px] border-white/[0.06]"
      />
      <span
        aria-hidden
        className="absolute -right-6 -bottom-40 -z-10 size-[300px] rounded-full border border-white/15"
      />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <span
            className="rounded-full bg-white px-3 py-1 text-xs font-bold"
            style={{ color: type.tint }}
          >
            {type.label}
          </span>
          {o.themes.map((theme) => (
            <span
              key={theme}
              className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold"
            >
              {labelFor(THEMES, theme)}
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <ShareButton
            title={o.title}
            label="Share offer"
            className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
          />
          <Button
            type="button"
            variant="outline"
            className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
          >
            <Bookmark />
            Save
          </Button>
        </div>
      </div>

      <h1
        id="offer-title"
        className="mt-6 text-[30px] leading-tight font-bold tracking-tight md:text-[44px]"
      >
        {o.title}{" "}
        <VerifiedBadge size="xl" tone="light" label={APPROVED_LABEL} className="ml-1 md:ml-2" />
      </h1>
      <p className="mt-3 max-w-[680px] text-base leading-6 text-white/85 md:text-[17px] md:leading-7">
        {o.summary}
      </p>
      <p className="mt-3 flex flex-wrap items-center gap-1 text-sm text-white/80">
        by{" "}
        {o.funder.slug ? (
          <Link
            href={routes.organisations.detail(o.funder.slug)}
            className="font-semibold text-white underline-offset-4 hover:underline"
          >
            {o.funder.name}
          </Link>
        ) : (
          <span className="font-semibold text-white">{o.funder.name}</span>
        )}
        {o.funder.verified ? <VerifiedBadge size="sm" tone="light" /> : null}
        <span aria-hidden className="mx-1">
          ·
        </span>
        Listed {formatMonth(o.listedAt)}
      </p>

      <dl className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {o.keyFacts.map((fact) => {
          const Icon = FACT_ICONS[fact.icon];
          return (
            <div
              key={fact.label}
              className="flex items-center gap-3 rounded-md border border-white/15 bg-white/10 px-4 py-3.5 backdrop-blur-sm"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-white/15">
                <Icon className="size-[18px]" aria-hidden />
              </span>
              <div className="flex min-w-0 flex-col">
                <dt className="text-xs text-white/75">{fact.label}</dt>
                <dd className="truncate text-[17px] font-bold">{fact.value}</dd>
              </div>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
