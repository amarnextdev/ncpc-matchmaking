import { LOOKING_FOR, type LookingFor, type OrganisationCategory } from "@/lib/constants";

/**
 * Who can respond to each "Looking for" need on a project (agreed 26 Oct).
 * A project that looks for an Investor only accepts enquiries from Investors, and so on.
 */
export const ROLE_CATEGORIES: Record<LookingFor, OrganisationCategory[]> = {
  investor: ["investor"],
  funder: ["funder"],
  technology: ["technology_provider", "esco"],
  contractor: ["technology_provider", "esco", "project_developer"],
  site_host: ["industrial_park", "sez", "property_developer"],
  off_taker: ["tenant", "industrial_park", "sez"],
};

export function canPlay(category: OrganisationCategory, role: LookingFor): boolean {
  return ROLE_CATEGORIES[role].includes(category);
}

/** Roles an organisation of this category can take on a partner's project. */
export function rolesFor(category: OrganisationCategory): LookingFor[] {
  return LOOKING_FOR.map((r) => r.value).filter((r) => canPlay(category, r));
}

export const DEAL_STAGES = [
  { value: "in_discussion", label: "In discussion" },
  { value: "due_diligence", label: "Due diligence" },
  { value: "agreement", label: "Agreement" },
  { value: "active", label: "Active partner" },
] as const;

export type DealStage = (typeof DEAL_STAGES)[number]["value"];

/** Badge colours per stage (text, background). */
export const STAGE_TONE: Record<DealStage | "not_started", string> = {
  not_started: "bg-muted text-muted-foreground",
  in_discussion: "bg-primary-soft text-primary",
  due_diligence: "bg-warning-soft text-warning",
  agreement: "bg-[#F1EEF8] text-[#5B4A8F]",
  active: "bg-success-soft text-success",
};

export const NOTE_MAX = 300;

/** Pending enquiries expire after this many days. */
export const ENQUIRY_EXPIRY_DAYS = 30;
