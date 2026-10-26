import Link from "next/link";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { OrgLogo } from "@/components/shared/org-logo";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/config/routes";
import { PROJECT_STAGES, PROVINCES, THEMES, labelFor } from "@/lib/constants";
import { formatPercent, formatRand } from "@/lib/utils";
import type { Opportunity } from "../../types";
import { THEME_TINT } from "../../utils";

/** Compact, fully clickable card for "Similar opportunities". */
export function OpportunityMiniCard({
  opportunity: o,
  reason,
}: {
  opportunity: Opportunity;
  reason: string;
}) {
  const ratio = o.capitalNeeded > 0 ? Math.min(1, o.capitalRaised / o.capitalNeeded) : 0;
  const facts = [
    { label: "Capital", value: formatRand(o.capitalNeeded) },
    { label: "Stage", value: labelFor(PROJECT_STAGES, o.stage) },
    { label: "Province", value: labelFor(PROVINCES, o.province) },
  ];
  return (
    <article className="relative flex w-full flex-col overflow-hidden rounded-md border bg-card transition-shadow hover:shadow-float">
      <div
        className="relative flex h-24 items-start justify-between p-3"
        style={{ backgroundColor: THEME_TINT[o.theme] }}
      >
        <Badge variant="overlay" className="text-[11px]">
          {labelFor(THEMES, o.theme)}
        </Badge>
        {typeof o.matchScore === "number" ? (
          <Badge variant="verified">{o.matchScore}% match</Badge>
        ) : null}
        <OrgLogo
          name={o.owner.name}
          logoUrl={o.owner.logoUrl}
          size="sm"
          ring
          className="absolute -bottom-[18px] left-3.5 size-[38px] text-xs"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2.5 px-3.5 pt-6 pb-3.5">
        <p className="truncate text-xs text-muted-foreground">
          {o.owner.name}
          {o.owner.verified ? <VerifiedBadge size="sm" className="ml-1" /> : null}
        </p>
        <h3 className="text-[15px] leading-[21px] font-bold">
          <Link
            href={routes.opportunities.detail(o.slug)}
            className="after:absolute after:inset-0 hover:text-primary focus-visible:outline-none"
          >
            {o.title}
          </Link>
        </h3>
        <dl className="grid grid-cols-3 gap-1.5">
          {facts.map((fact) => (
            <div key={fact.label} className="flex min-w-0 flex-col">
              <dt className="text-[11px] text-subtle-foreground">{fact.label}</dt>
              <dd className="truncate text-[13px] font-semibold">{fact.value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-auto flex flex-col gap-1.5">
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>{formatPercent(ratio)} funded</span>
            <span>
              {formatRand(o.capitalRaised)} of {formatRand(o.capitalNeeded)}
            </span>
          </div>
          <div className="h-[5px] overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-success-bar"
              style={{ width: formatPercent(ratio) }}
            />
          </div>
        </div>
        {reason ? (
          <p className="border-t border-muted pt-2.5 text-xs text-muted-foreground">
            Similar because: <strong className="font-semibold text-foreground">{reason}</strong>
          </p>
        ) : null}
      </div>
    </article>
  );
}
