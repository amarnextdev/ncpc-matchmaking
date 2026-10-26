import type { OrganisationCategory } from "@/lib/constants";
import type { TrackRole } from "./types";

/** Category tabs on the directory. "Parks & SEZs" groups two categories. */
export const ORGANISATION_TABS = [
  { value: "investor", label: "Investors", categories: ["investor"] },
  { value: "funder", label: "Funders", categories: ["funder"] },
  { value: "developer", label: "Project developers", categories: ["project_developer"] },
  { value: "parks", label: "Parks & SEZs", categories: ["industrial_park", "sez"] },
  { value: "technology", label: "Technology providers", categories: ["technology_provider"] },
  { value: "esco", label: "ESCOs", categories: ["esco"] },
  { value: "tenant", label: "Tenants", categories: ["tenant"] },
  { value: "property", label: "Property developers", categories: ["property_developer"] },
] as const satisfies readonly {
  value: string;
  label: string;
  categories: readonly OrganisationCategory[];
}[];

export type OrganisationTab = (typeof ORGANISATION_TABS)[number]["value"];

export function tabForCategory(
  category: OrganisationCategory,
): (typeof ORGANISATION_TABS)[number] | undefined {
  return ORGANISATION_TABS.find((tab) => (tab.categories as readonly string[]).includes(category));
}

/** Banner colours until an organisation uploads a cover photo. */
const COVER_TINTS = [
  "#2E5A9C",
  "#3F7F2A",
  "#41587A",
  "#1F6E6A",
  "#5B6B82",
  "#5B4A8F",
  "#2A4A78",
  "#4E6B3A",
  "#8A5A12",
];

export function coverTint(slug: string): string {
  let hash = 0;
  for (const char of slug) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return COVER_TINTS[hash % COVER_TINTS.length] ?? "#2E5A9C";
}

/** Joined in the last 30 days → "New member". */
export function isNewMember(memberSince: string, now: Date = new Date()): boolean {
  return now.getTime() - new Date(memberSince).getTime() < 30 * 86_400_000;
}

/** Labels for an organisation's role in a project (track record). */
export const TRACK_ROLES = [
  { value: "investor", label: "Investor" },
  { value: "lender", label: "Lender" },
  { value: "funder", label: "Funder" },
  { value: "site_host", label: "Site host" },
  { value: "technology", label: "Technology provider" },
  { value: "offtaker", label: "Off-taker" },
  { value: "contractor", label: "Contractor" },
] as const satisfies readonly { value: TrackRole; label: string }[];

/** Profile page shows this many projects; the rest are on /organisations/[slug]/projects. */
export const TRACK_PREVIEW_COUNT = 5;
export const TRACK_PAGE_SIZE = 12;
