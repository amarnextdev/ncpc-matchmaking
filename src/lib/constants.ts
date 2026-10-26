/**
 * Fixed lists used in forms, filters and matchmaking.
 * Keeping them in one place keeps tags consistent ("Solar PV" is always spelled the same).
 */

export const PROVINCES = [
  { value: "eastern-cape", label: "Eastern Cape" },
  { value: "free-state", label: "Free State" },
  { value: "gauteng", label: "Gauteng" },
  { value: "kwazulu-natal", label: "KwaZulu-Natal" },
  { value: "limpopo", label: "Limpopo" },
  { value: "mpumalanga", label: "Mpumalanga" },
  { value: "north-west", label: "North West" },
  { value: "northern-cape", label: "Northern Cape" },
  { value: "western-cape", label: "Western Cape" },
] as const;

export const ORGANISATION_CATEGORIES = [
  { value: "investor", label: "Investor" },
  { value: "funder", label: "Funder" },
  { value: "project_developer", label: "Project developer" },
  { value: "industrial_park", label: "Industrial park" },
  { value: "sez", label: "Special economic zone" },
  { value: "tenant", label: "Tenant" },
  { value: "property_developer", label: "Property developer" },
  { value: "esco", label: "ESCO" },
  { value: "technology_provider", label: "Technology provider" },
] as const;

export const THEMES = [
  { value: "energy", label: "Energy" },
  { value: "energy_efficiency", label: "Energy efficiency" },
  { value: "water", label: "Water" },
  { value: "waste_circularity", label: "Waste & circularity" },
  { value: "green_hydrogen", label: "Green hydrogen" },
] as const;

export const PROJECT_STAGES = [
  { value: "idea", label: "Idea" },
  { value: "feasibility", label: "Feasibility" },
  { value: "funding", label: "Funding" },
  { value: "construction", label: "Construction" },
  { value: "operational", label: "Operational" },
] as const;

export const LOOKING_FOR = [
  { value: "investor", label: "Investor" },
  { value: "funder", label: "Funder" },
  { value: "technology", label: "Technology" },
  { value: "off_taker", label: "Off-taker" },
  { value: "site_host", label: "Site host" },
  { value: "contractor", label: "Contractor" },
] as const;

export const CAPITAL_RANGES = [
  { value: "lt-5m", label: "Under R5m", min: 0, max: 5_000_000 },
  { value: "5m-30m", label: "R5m – R30m", min: 5_000_000, max: 30_000_000 },
  { value: "30m-100m", label: "R30m – R100m", min: 30_000_000, max: 100_000_000 },
  { value: "gt-100m", label: "Over R100m", min: 100_000_000, max: Number.POSITIVE_INFINITY },
] as const;

/** What an organisation brings to a partnership (organisation filters and matchmaking). */
export const ORGANISATION_OFFERS = [
  { value: "capital", label: "Capital" },
  { value: "technology", label: "Technology" },
  { value: "site", label: "Site or roof space" },
  { value: "offtake", label: "Off-take (buys output)" },
  { value: "services", label: "Services" },
] as const;

export const PAGE_SIZE = 12;

export type Province = (typeof PROVINCES)[number]["value"];
export type OrganisationCategory = (typeof ORGANISATION_CATEGORIES)[number]["value"];
export type Theme = (typeof THEMES)[number]["value"];
export type ProjectStage = (typeof PROJECT_STAGES)[number]["value"];
export type LookingFor = (typeof LOOKING_FOR)[number]["value"];
export type OrganisationOffer = (typeof ORGANISATION_OFFERS)[number]["value"];

/** Label for a value in any of the lists above: labelFor(PROVINCES, "gauteng") → "Gauteng" */
export function labelFor(list: readonly { value: string; label: string }[], value: string): string {
  return list.find((item) => item.value === value)?.label ?? value;
}
