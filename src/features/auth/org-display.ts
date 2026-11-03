import type { OrganisationCategory } from "@/lib/constants";

/** Avatar colour per category (until an organisation uploads a logo). */
const TINTS: Record<OrganisationCategory, string> = {
  investor: "#5B4A8F",
  funder: "#1F6E6A",
  project_developer: "#13336B",
  industrial_park: "#8A5A12",
  sez: "#8A5A12",
  tenant: "#475569",
  property_developer: "#41587A",
  esco: "#2F6B16",
  technology_provider: "#0F5E78",
};

export function tintFor(category: OrganisationCategory): string {
  return TINTS[category];
}
