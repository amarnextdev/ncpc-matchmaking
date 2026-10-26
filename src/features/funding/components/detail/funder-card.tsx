import Link from "next/link";
import { Clock, MessageSquare, ShieldCheck } from "lucide-react";
import { OrgLogo } from "@/components/shared/org-logo";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import type { FundingOfferDetail } from "../../types";

/** "Offered by": funder, short stats, reply time and a link to the profile. */
export function FunderCard({ offer: o }: { offer: FundingOfferDetail }) {
  const p = o.funderProfile;
  return (
    <section aria-labelledby="funder-title" className="flex flex-col gap-4 rounded-lg border p-5">
      <span className="text-xs font-semibold tracking-[0.08em] text-subtle-foreground uppercase">
        Offered by
      </span>
      <div className="flex items-center gap-3">
        <OrgLogo name={o.funder.name} logoUrl={o.funder.logoUrl} />
        <div className="flex min-w-0 flex-col">
          <h2 id="funder-title" className="flex items-center gap-1.5 text-base font-bold">
            {o.funder.name}
            {o.funder.verified ? <VerifiedBadge size="sm" /> : null}
          </h2>
          <span className="truncate text-[13px] text-subtle-foreground">
            {o.funder.category} · {o.funder.location}
          </span>
        </div>
      </div>
      <p className="text-sm leading-[21px] text-muted-foreground">{p.about}</p>
      <dl className="grid grid-cols-3 border-y border-muted py-3 text-center">
        <div>
          <dt className="text-xs text-subtle-foreground">Open offers</dt>
          <dd className="text-[17px] font-bold">{p.openOffers}</dd>
        </div>
        <div className="border-x border-muted">
          <dt className="text-xs text-subtle-foreground">Funded</dt>
          <dd className="text-[17px] font-bold">{p.funded}</dd>
        </div>
        <div>
          <dt className="text-xs text-subtle-foreground">Since</dt>
          <dd className="text-[17px] font-bold">{p.since}</dd>
        </div>
      </dl>
      <ul className="flex flex-col gap-2 text-[13px] text-muted-foreground">
        <li className="flex items-center gap-2">
          <Clock className="size-[15px] text-subtle-foreground" aria-hidden />
          {p.replyTime}
        </li>
        {p.replyRate ? (
          <li className="flex items-center gap-2">
            <MessageSquare className="size-[15px] text-subtle-foreground" aria-hidden />
            {p.replyRate}
          </li>
        ) : null}
      </ul>
      {o.funder.slug ? (
        <Button asChild variant="outline-primary">
          <Link href={routes.organisations.detail(o.funder.slug)}>View funder profile</Link>
        </Button>
      ) : null}
    </section>
  );
}

export function SafetyNote() {
  return (
    <p className="flex items-start gap-3 rounded-lg border border-dashed border-input px-4 py-3.5 text-[13px] leading-5 text-muted-foreground">
      <ShieldCheck className="mt-0.5 size-[18px] shrink-0 text-primary" aria-hidden />
      <span>
        <strong className="text-foreground">NCPC never asks for fees.</strong> Report any offer that
        asks you to pay to apply.
      </span>
    </p>
  );
}
