import Image from "next/image";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { MatchBadge } from "@/components/shared/match-badge";
import { OrgLogo } from "@/components/shared/org-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { ORGANISATION_CATEGORIES, PROVINCES, THEMES, labelFor } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { coverTint, isNewMember } from "../constants";
import type { Organisation } from "../types";

/** Directory card — same shape as the opportunity card: banner, overlapping logo, facts, actions. */
export function OrganisationCard({
  organisation: o,
  className,
}: {
  organisation: Organisation;
  className?: string;
}) {
  const href = routes.organisations.detail(o.slug);
  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-lg border bg-card shadow-card",
        className,
      )}
    >
      <Link
        href={href}
        aria-label={o.name}
        className="relative block h-[156px]"
        style={o.coverUrl ? undefined : { backgroundColor: coverTint(o.slug) }}
      >
        {o.coverUrl ? (
          <Image
            src={o.coverUrl}
            alt=""
            fill
            sizes="(min-width: 1024px) 480px, 100vw"
            className="object-cover"
          />
        ) : null}
        {isNewMember(o.memberSince) ? (
          <Badge variant="overlay" className="absolute top-3.5 left-3.5">
            New member
          </Badge>
        ) : null}
        {typeof o.matchScore === "number" ? (
          <MatchBadge score={o.matchScore} className="absolute top-3.5 right-3.5" />
        ) : null}
        <OrgLogo
          name={o.name}
          logoUrl={o.logoUrl}
          ring
          className="absolute -bottom-6 left-5 size-[52px]"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-3.5 px-5 pt-9 pb-5">
        <div className="flex flex-col gap-1.5">
          <p className="text-eyebrow">
            {labelFor(ORGANISATION_CATEGORIES, o.category)} · {labelFor(PROVINCES, o.province)}
          </p>
          <h3 className="text-lg leading-6 font-bold">
            <Link href={href} className="hover:text-primary">
              {o.name}
            </Link>
          </h3>
          <p className="truncate text-sm text-muted-foreground">
            {o.city}
            {o.verified ? <VerifiedBadge size="sm" className="ml-1" /> : null}
          </p>
        </div>

        <p className="line-clamp-2 text-sm leading-[21px] text-foreground/80">{o.tagline}</p>

        <dl className="grid grid-cols-2 border-y border-muted py-3">
          {o.keyFacts.map((fact, i) => (
            <div
              key={fact.label}
              className={cn(
                "flex min-w-0 flex-col gap-0.5",
                i === 1 && "border-l border-muted pl-4",
              )}
            >
              <dt className="text-xs text-subtle-foreground">{fact.label}</dt>
              <dd className="truncate text-[15px] font-bold">{fact.value}</dd>
            </div>
          ))}
        </dl>

        {o.themes.length ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[13px] text-subtle-foreground">Works in:</span>
            {o.themes.map((theme) => (
              <Badge key={theme} variant="neutral">
                {labelFor(THEMES, theme)}
              </Badge>
            ))}
          </div>
        ) : null}

        <div className="mt-auto flex gap-2 pt-1">
          <Button className="flex-1" asChild>
            <Link href={href}>View profile</Link>
          </Button>
          <Button variant="outline" size="icon" aria-label={`Save ${o.name}`}>
            <Bookmark />
          </Button>
        </div>
      </div>
    </article>
  );
}
