import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Factory,
  HandCoins,
  Home,
  Cpu,
  Landmark,
  LayoutGrid,
  Warehouse,
  Zap,
} from "lucide-react";
import type { OrganisationCategory } from "@/lib/constants";

export const ONBOARDING_STEPS = [
  { title: "Company", help: "The basics NCPC checks against your registration." },
  { title: "Matchmaking", help: "Pick from fixed lists so we can match you accurately." },
  { title: "Profile look", help: "How your organisation looks on cards and your profile." },
  { title: "Documents", help: "NCPC uses these to verify your organisation." },
] as const;

type CategoryCard = {
  value: OrganisationCategory;
  label: string;
  note: string;
  icon: LucideIcon;
  /** Who this category is matched with (shown on the Matchmaking step). */
  matchesWith: string;
};

export const CATEGORY_CARDS: CategoryCard[] = [
  {
    value: "investor",
    label: "Investor",
    note: "Takes equity in projects",
    icon: HandCoins,
    matchesWith: "project developers and property developers",
  },
  {
    value: "funder",
    label: "Funder",
    note: "Grants, loans or guarantees",
    icon: Landmark,
    matchesWith: "project developers, ESCOs and property developers",
  },
  {
    value: "project_developer",
    label: "Project developer",
    note: "Plans and builds projects",
    icon: Building2,
    matchesWith: "investors, funders, technology providers, ESCOs and parks",
  },
  {
    value: "industrial_park",
    label: "Industrial park",
    note: "Runs a private industrial area",
    icon: Warehouse,
    matchesWith: "tenants, property developers, ESCOs and technology providers",
  },
  {
    value: "sez",
    label: "Special economic zone",
    note: "Government industrial zone",
    icon: LayoutGrid,
    matchesWith: "tenants, property developers, ESCOs and technology providers",
  },
  {
    value: "tenant",
    label: "Tenant / manufacturer",
    note: "A factory in a park or zone",
    icon: Factory,
    matchesWith: "parks, SEZs, ESCOs and technology providers",
  },
  {
    value: "property_developer",
    label: "Property developer",
    note: "Builds industrial property",
    icon: Home,
    matchesWith: "parks, SEZs, investors and funders",
  },
  {
    value: "esco",
    label: "ESCO",
    note: "Energy-saving services",
    icon: Zap,
    matchesWith: "tenants, parks, SEZs and funders",
  },
  {
    value: "technology_provider",
    label: "Technology provider",
    note: "Supplies and installs equipment",
    icon: Cpu,
    matchesWith: "project developers, parks, tenants and ESCOs",
  },
];

/** Capital providers describe what they fund; everyone else what they need. */
export function isCapitalProvider(category: OrganisationCategory | undefined): boolean {
  return category === "investor" || category === "funder";
}

export const BBBEE_LEVELS = [
  "Level 1",
  "Level 2",
  "Level 3",
  "Level 4",
  "Level 5",
  "Level 6",
  "Level 7",
  "Level 8",
  "Exempt (EME or QSE affidavit)",
  "Not rated yet",
] as const;

export const SUMMARY_MAX = 140;
export const DESCRIPTION_MAX = 600;

/** Documents NCPC needs to verify an organisation. */
export const VERIFICATION_DOCS = [
  { key: "cipc", name: "Company registration (CIPC)", note: "Certificate of incorporation" },
  {
    key: "bbbee",
    name: "B-BBEE certificate or affidavit",
    note: "Valid for at least 3 more months",
  },
  { key: "tax", name: "Tax compliance status (SARS)", note: "PIN or certificate from eFiling" },
] as const;
export type DocKey = (typeof VERIFICATION_DOCS)[number]["key"];

export const DOC_MAX_MB = 10;
export const DOC_ACCEPT = ".pdf,.jpg,.jpeg,.png";
export const IMAGE_ACCEPT = ".jpg,.jpeg,.png,.webp";
