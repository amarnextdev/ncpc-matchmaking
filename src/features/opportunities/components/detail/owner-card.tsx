import Link from "next/link";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { Clock, Globe } from "lucide-react";
import { OrgLogo } from "@/components/shared/org-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { formatMonth } from "@/lib/dates";
import type { OpportunityDetail } from "../../types";

/** Sidebar card about the organisation that listed the project. */
export function OwnerCard({ opportunity: o }: { opportunity: OpportunityDetail }) {
  const p = o.ownerProfile;
  const firstProject = p.projects <= 1 && p.partners === 0;
  const stats = [
    { label: "Projects", value: p.projects },
    { label: "Partners", value: p.partners },
    { label: "Since", value: new Date(p.memberSince).getUTCFullYear() },
  ];

  return (
    <section
      aria-labelledby="owner-title"
      className="flex flex-col gap-3.5 rounded-lg border bg-card p-[22px] shadow-float"
    >
      <div className="flex items-center justify-between gap-3">
        <OrgLogo
          name={o.owner.name}
          logoUrl={o.owner.logoUrl}
          size="md"
          className="size-[52px] text-[17px]"
        />
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-eyebrow">Project owner</p>
        <h2 id="owner-title" className="text-lg font-bold">
          <Link href={routes.organisations.detail(o.owner.slug)} className="hover:text-primary">
            {o.owner.name}
          </Link>
          {o.owner.verified ? <VerifiedBadge className="ml-1.5" /> : null}
        </h2>
        <p className="text-[13px] text-muted-foreground">
          {p.role} · {p.location}
        </p>
      </div>

      {p.about ? <p className="text-sm leading-[21px] text-foreground/80">{p.about}</p> : null}

      {firstProject ? (
        <p className="text-[13px] text-muted-foreground">
          First project on the platform · member since {formatMonth(p.memberSince)}
        </p>
      ) : (
        <dl className="grid grid-cols-3 border-y border-muted py-1.5 text-center">
          {stats.map((stat, i) => (
            <div key={stat.label} className={i ? "border-l py-2" : "py-2"}>
              <dt className="text-xs text-subtle-foreground">{stat.label}</dt>
              <dd className="mt-0.5 text-[17px] font-bold">{stat.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {p.offers.length ? (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs text-muted-foreground">Offers</p>
          <div className="flex flex-wrap gap-1.5">
            {p.offers.map((offer) => (
              <Badge key={offer} variant="neutral">
                {offer}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}

      {p.website || p.replyTime ? (
        <div className="flex flex-col gap-1.5 text-[13px] text-muted-foreground">
          {p.website ? (
            <a
              href={`https://${p.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-primary"
            >
              <Globe className="size-[15px] text-subtle-foreground" aria-hidden />
              {p.website}
            </a>
          ) : null}
          {p.replyTime ? (
            <span className="flex items-center gap-2">
              <Clock className="size-[15px] text-subtle-foreground" aria-hidden />
              {p.replyTime}
            </span>
          ) : null}
        </div>
      ) : null}

      <Button asChild variant="outline-primary">
        <Link href={routes.organisations.detail(o.owner.slug)}>View organisation profile</Link>
      </Button>
    </section>
  );
}
