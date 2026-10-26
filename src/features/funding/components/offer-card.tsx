import Link from "next/link";
import { Bookmark, Check } from "lucide-react";
import { OrgLogo } from "@/components/shared/org-logo";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { THEMES, labelFor } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Viewer } from "@/types";
import { fundingType } from "../constants";
import { deadlineInfo } from "../deadline";
import type { FundingOffer } from "../types";
import { fundSizeLabel, regionLabel, stagesLabel } from "./offer-labels";

/** List card: banner in the type colour with the amount, overlapping funder logo, facts, actions. */
export function OfferCard({
  offer: o,
  viewer,
  className,
}: {
  offer: FundingOffer;
  viewer: Viewer;
  className?: string;
}) {
  const href = routes.funding.detail(o.slug);
  const type = fundingType(o.type);
  const deadline = deadlineInfo(o);
  const closed = o.status === "closed";
  const qualifies = viewer.signedIn ? o.qualifies : [];

  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-lg border bg-card shadow-card",
        closed && "opacity-75",
        className,
      )}
    >
      <Link
        href={href}
        aria-label={o.title}
        className="relative flex h-[136px] flex-col justify-center px-[22px] text-white"
        style={{ backgroundColor: type.tint }}
      >
        <span
          className="absolute top-3.5 left-3.5 rounded-full bg-white px-2.5 py-1 text-xs font-bold"
          style={{ color: type.tint }}
        >
          {type.label}
        </span>
        <span
          className={cn(
            "absolute top-3.5 right-3.5 rounded-full px-2.5 py-1 text-xs font-semibold",
            deadline.soon ? "bg-[#FDE9C4] text-warning" : "bg-white/90 text-foreground/80",
          )}
        >
          {deadline.label}
        </span>
        <span className="mt-2.5 text-[26px] font-bold tracking-tight">{o.amountLabel}</span>
        <span className="text-[13px] text-white/80">{o.amountNote}</span>
        <OrgLogo
          name={o.funder.name}
          logoUrl={o.funder.logoUrl}
          ring
          className="absolute -bottom-[22px] left-5 size-[46px]"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-3.5 px-5 pt-[34px] pb-5">
        <div className="flex flex-col gap-1.5">
          <p className="text-eyebrow">
            {type.label} · {regionLabel(o)}
          </p>
          <h3 className="text-lg leading-[25px] font-bold">
            <Link href={href} className="hover:text-primary">
              {o.title}
            </Link>
          </h3>
          <p className="flex items-center gap-1 truncate text-sm text-muted-foreground">
            by {o.funder.name}
            {o.funder.verified ? <VerifiedBadge size="sm" /> : null}
          </p>
        </div>

        <p className="line-clamp-2 text-sm leading-[21px] text-foreground/80">{o.summary}</p>

        <dl className="grid grid-cols-2 border-y border-muted py-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            <dt className="text-xs text-subtle-foreground">Fund size</dt>
            <dd className="truncate text-[15px] font-bold">{fundSizeLabel(o)}</dd>
          </div>
          <div className="flex min-w-0 flex-col gap-0.5 border-l border-muted pl-4">
            <dt className="text-xs text-subtle-foreground">Stages funded</dt>
            <dd className="truncate text-[15px] font-bold">{stagesLabel(o)}</dd>
          </div>
        </dl>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[13px] text-subtle-foreground">For:</span>
          {o.themes.map((theme) => (
            <Badge key={theme} variant="neutral">
              {labelFor(THEMES, theme)}
            </Badge>
          ))}
        </div>

        {qualifies.length && !closed ? (
          <p className="flex items-center gap-2 rounded-[10px] bg-success-soft px-3 py-2 text-[13px] text-[#1F4F0C]">
            <Check className="size-4 shrink-0 text-success" strokeWidth={2.5} aria-hidden />
            <span>
              <strong>{qualifies.join(", ")}</strong>{" "}
              {qualifies.length === 1 ? "qualifies" : "qualify"}
            </span>
          </p>
        ) : null}

        <div className="mt-auto flex gap-2 pt-0.5">
          <Button className="flex-1" asChild>
            <Link href={href}>{closed ? "View results" : "View offer"}</Link>
          </Button>
          <Button variant="outline" size="icon" aria-label={`Save ${o.title}`}>
            <Bookmark />
          </Button>
        </div>
      </div>
    </article>
  );
}
