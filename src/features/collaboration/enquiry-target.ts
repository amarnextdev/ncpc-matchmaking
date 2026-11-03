import { ORGANISATION_CATEGORIES, PROJECT_STAGES, PROVINCES, labelFor } from "@/lib/constants";
import { formatRand, initials } from "@/lib/utils";
import type { OpportunityDetail } from "@/features/opportunities/types";
import { THEME_TINT } from "@/features/opportunities/utils";
import type { OrganisationDetail } from "@/features/organisations/types";
import type { EnquiryTarget } from "./types";

/** Send enquiry from a project page: to the owner, about this project. */
export function targetFromOpportunity(o: OpportunityDetail, connectedHref?: string): EnquiryTarget {
  const needed = Math.max(0, o.capitalNeeded - o.capitalRaised);
  return {
    org: {
      slug: o.owner.slug,
      name: o.owner.name,
      initials: initials(o.owner.name),
      tint: "#13336B",
      meta: `${o.ownerProfile.role} · ${o.ownerProfile.location}`,
      verified: o.owner.verified,
    },
    project: {
      title: o.title,
      slug: o.slug,
      meta: `${needed ? `${formatRand(needed)} needed · ` : ""}${labelFor(PROJECT_STAGES, o.stage)} stage`,
      tint: THEME_TINT[o.theme],
      lookingFor: o.lookingFor,
    },
    match: o.match,
    connectedHref,
  };
}

/** Send enquiry from an organisation profile: project optional. */
export function targetFromOrganisation(
  o: OrganisationDetail,
  connectedHref?: string,
): EnquiryTarget {
  return {
    org: {
      slug: o.slug,
      name: o.name,
      initials: initials(o.name),
      tint: "#13336B",
      meta: `${labelFor(ORGANISATION_CATEGORIES, o.category)} · ${o.city}, ${labelFor(PROVINCES, o.province)}`,
      verified: o.verified,
      category: o.category,
    },
    match: o.match ? { score: o.match.score, reasons: o.match.reasons } : undefined,
    connectedHref,
  };
}
