import type { LookingFor, OrganisationCategory } from "@/lib/constants";

export const PROJECT_STEPS = [
  { title: "Basics", help: "Name, theme and where the project is." },
  { title: "Needs and funding", help: "Who you need and how much capital." },
  { title: "Details and impact", help: "Tell partners why this project matters." },
  { title: "Photos and documents", help: "Good photos and documents build trust." },
  { title: "Review and submit", help: "Check everything, then send it to NCPC." },
] as const;

export const TITLE_MAX = 100;
export const SUMMARY_MAX = 160;
export const ABOUT_MAX = 4000;
export const PHOTOS_MAX = 12;
/** Shown as advice; one photo (the cover) is required. */
export const PHOTOS_RECOMMENDED = 4;
export const DOCUMENTS_MAX = 10;

/** "What are you looking for?" cards. */
export const NEED_CARDS: { value: LookingFor; label: string; who: string }[] = [
  { value: "investor", label: "Investor", who: "Equity investors" },
  { value: "funder", label: "Funder", who: "Grants and loans" },
  { value: "technology", label: "Technology", who: "Technology providers, ESCOs" },
  { value: "contractor", label: "Contractor", who: "EPC, installers, ESCOs" },
  { value: "site_host", label: "Site host", who: "Parks, SEZs, property" },
  { value: "off_taker", label: "Off-taker", who: "Buys power, water or output" },
];

/** Roles that bring money: a capital amount is required when one of them is picked. */
export const CAPITAL_ROLES: LookingFor[] = ["investor", "funder"];

/** Categories that publish projects. Investors only browse; funders publish funding offers. */
export const LISTS_PROJECTS: OrganisationCategory[] = [
  "project_developer",
  "industrial_park",
  "sez",
  "tenant",
  "property_developer",
  "esco",
  "technology_provider",
];

export const canListProjects = (category: OrganisationCategory) =>
  LISTS_PROJECTS.includes(category);

export const PROJECT_STATUS_LABEL = {
  draft: "Draft",
  in_review: "In review",
  changes_requested: "Changes requested",
  live: "Live",
  closed: "Closed",
  hidden: "Hidden",
  rejected: "Not approved",
} as const;
export type ProjectStatus = keyof typeof PROJECT_STATUS_LABEL;
