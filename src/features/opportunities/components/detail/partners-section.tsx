import type * as React from "react";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { OrgLogo } from "@/components/shared/org-logo";
import { routes } from "@/config/routes";
import { needsSentence } from "../../detail-meta";
import type { OpportunityDetail } from "../../types";
import { DetailSection } from "./detail-section";

/** Confirmed partners, or a "Be the first" empty state for new projects. */
export function PartnersSection({
  opportunity: o,
  cta,
}: {
  opportunity: OpportunityDetail;
  cta: React.ReactNode;
}) {
  return (
    <DetailSection id="partners" title="Project partners">
      {o.partners.length ? (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-3">
          {o.partners.map((partner) => (
            <li key={partner.slug} className="flex items-center gap-3 rounded-md border p-3.5">
              <OrgLogo
                name={partner.name}
                logoUrl={partner.logoUrl}
                size="md"
                className="size-11"
              />
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="flex min-w-0 items-center gap-1">
                  <Link
                    href={routes.organisations.detail(partner.slug)}
                    className="truncate text-[15px] font-semibold hover:text-primary"
                  >
                    {partner.name}
                  </Link>
                  {partner.verified ? <VerifiedBadge size="sm" /> : null}
                </span>
                <span className="text-[13px] text-muted-foreground">{partner.role}</span>
                <span className="text-xs font-semibold text-success">{partner.detail}</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-wrap items-start gap-4 rounded-lg border border-dashed border-input bg-surface-subtle p-6">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-primary-soft">
            <UserPlus className="size-[22px] text-primary" aria-hidden />
          </span>
          <div className="flex flex-[1_1_280px] flex-col gap-1.5">
            <p className="text-base font-bold">No partners yet. Be the first.</p>
            <p className="text-sm leading-[22px] text-muted-foreground">
              This project is looking for {needsSentence(o.lookingFor)}. Partners appear here once
              both sides confirm an agreement.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              {cta}
              <span className="flex items-center gap-2 text-[13px] text-muted-foreground">
                <OrgLogo
                  name={o.owner.name}
                  logoUrl={o.owner.logoUrl}
                  size="sm"
                  className="size-7 text-[10px]"
                />
                Owner: {o.owner.name}
              </span>
            </div>
          </div>
        </div>
      )}
    </DetailSection>
  );
}
