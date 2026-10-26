import Image from "next/image";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FundingProgress } from "@/components/shared/funding-progress";
import { MatchBadge } from "@/components/shared/match-badge";
import { OrgLogo } from "@/components/shared/org-logo";
import { routes } from "@/config/routes";
import { LOOKING_FOR, PROJECT_STAGES, PROVINCES, THEMES, labelFor } from "@/lib/constants";
import { cn, formatRand } from "@/lib/utils";
import type { Opportunity } from "../types";
import { THEME_TINT } from "../utils";

type OpportunityCardProps = {
  opportunity: Opportunity;
  className?: string;
};

/** Marketplace card. Also used for "Similar opportunities" on the detail page. */
export function OpportunityCard({ opportunity: o, className }: OpportunityCardProps) {
  const href = routes.opportunities.detail(o.slug);
  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-lg border bg-card shadow-card",
        className,
      )}
    >
      <Link
        href={href}
        aria-label={o.title}
        className="relative block h-[156px]"
        style={o.coverUrl ? undefined : { backgroundColor: THEME_TINT[o.theme] }}
      >
        {o.coverUrl ? (
          <Image
            src={o.coverUrl}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="object-cover"
          />
        ) : null}
        {typeof o.matchScore === "number" ? (
          <MatchBadge score={o.matchScore} className="absolute top-3.5 right-3.5" />
        ) : null}
        <OrgLogo
          name={o.owner.name}
          logoUrl={o.owner.logoUrl}
          ring
          className="absolute -bottom-6 left-5"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-3.5 px-5 pt-9 pb-5">
        <div className="flex flex-col gap-1.5">
          <p className="text-eyebrow">
            {labelFor(THEMES, o.theme)} · {labelFor(PROVINCES, o.province)}
          </p>
          <h3 className="text-lg leading-6 font-bold">
            <Link href={href} className="hover:text-primary">
              {o.title}
            </Link>
          </h3>
          <p className="truncate text-sm text-muted-foreground">
            by {o.owner.name}
            {o.owner.verified ? <VerifiedBadge size="sm" className="ml-1" /> : null}
          </p>
        </div>

        <dl className="grid grid-cols-2 border-y border-muted py-3">
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs text-subtle-foreground">Capital needed</dt>
            <dd className="text-lg font-bold">{formatRand(o.capitalNeeded)}</dd>
          </div>
          <div className="flex flex-col gap-0.5 border-l border-muted pl-4">
            <dt className="text-xs text-subtle-foreground">Stage</dt>
            <dd className="text-base leading-7 font-semibold">
              {labelFor(PROJECT_STAGES, o.stage)}
            </dd>
          </div>
        </dl>

        <FundingProgress raised={o.capitalRaised} target={o.capitalNeeded} />

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[13px] text-subtle-foreground">Looking for:</span>
          {o.lookingFor.map((need) => (
            <Badge key={need} variant="neutral">
              {labelFor(LOOKING_FOR, need)}
            </Badge>
          ))}
        </div>

        <div className="mt-auto flex gap-2 pt-1">
          <Button className="flex-1" asChild>
            <Link href={href}>View opportunity</Link>
          </Button>
          <Button variant="outline" size="icon" aria-label={`Save ${o.title}`}>
            <Bookmark />
          </Button>
        </div>
      </div>
    </article>
  );
}
