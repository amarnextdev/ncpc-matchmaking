import type {
  OrganisationCategory,
  OrganisationOffer,
  ProjectStage,
  Province,
  Theme,
} from "@/lib/constants";
import type { DocumentFile, Stat } from "@/types";
import type { OrganisationTab } from "./constants";

/** An organisation as shown on the directory card. */
export type Organisation = {
  id: string;
  slug: string;
  name: string;
  category: OrganisationCategory;
  city: string;
  province: Province;
  /** One line for the card. */
  tagline: string;
  logoUrl: string | null;
  coverUrl: string | null;
  verified: boolean;
  memberSince: string; // ISO
  lastActiveAt: string; // ISO
  themes: Theme[];
  offers: OrganisationOffer[];
  openToPartners: boolean;
  /** Two role-specific facts: Investor → Ticket size, Portfolio; Park → Sites, Tenants… */
  keyFacts: [Stat, Stat];
  /** Used by the "Most projects" sort. */
  projectCount: number;
  /** 0–100, signed-in members only (Matchmaking module). */
  matchScore?: number;
};

/** Icon shown on a "What we offer" card. */
export type OfferIcon =
  | "capital"
  | "debt"
  | "support"
  | "technology"
  | "site"
  | "roof"
  | "land"
  | "offtake"
  | "services"
  | "solar"
  | "battery"
  | "monitoring";

export type OrganisationSort = "recent" | "projects" | "name";

export type OrganisationFilters = {
  q: string;
  tab: OrganisationTab | null;
  themes: Theme[];
  offers: OrganisationOffer[];
  province: Province | null;
  openOnly: boolean;
  sort: OrganisationSort;
  page: number;
};

export type OrganisationPage = {
  items: Organisation[];
  total: number;
  page: number;
  pageCount: number;
  pageSize: number;
};

/** How an organisation took part in a project. */
export type TrackRole =
  "investor" | "lender" | "funder" | "site_host" | "technology" | "offtaker" | "contractor";

export type TrackRecordItem = {
  id: string;
  projectTitle: string;
  /** Link to the opportunity when it is listed on the platform. */
  projectSlug: string | null;
  projectOwner: string;
  /** Where the project is built. */
  province: Province;
  roleType: TrackRole;
  /** "R10m equity", "Four rooftops", "Panels and batteries" */
  detail: string;
  since: string; // ISO
  stage: ProjectStage;
  tint: string;
};

export type TrackSort = "newest" | "oldest" | "stage";

export type TrackFilters = {
  q: string;
  province: Province | null;
  stage: ProjectStage | null;
  role: TrackRole | null;
  sort: TrackSort;
  page: number;
};

/** A product or service on a technology provider's profile. */
export type Solution = {
  name: string;
  /** "Solar PV", "Energy storage", "Software & service" */
  category: string;
  icon: "solar" | "battery" | "software" | "water" | "efficiency";
  description: string;
  /** Three key specs: size range, warranty, lead time… */
  specs: Stat[];
  certifications: string[];
  /** How many projects in the track record use it. */
  usedIn: number;
  imageUrl: string | null;
  /** Placeholder colour until a product photo is uploaded. */
  tint: string;
};

/** The section that differs per organisation type. */
export type RoleSection =
  | {
      kind: "criteria";
      title: string;
      intro: string;
      items: Stat[];
      offer: { name: string; detail: string } | null;
    }
  | {
      kind: "sites";
      title: string;
      intro: string;
      sites: { name: string; detail: string; status: "available" | "reserved" }[];
      utilities: string[];
      incentives: string[];
    }
  | {
      kind: "solutions";
      title: string;
      intro: string;
      solutions: Solution[];
    };

export type OrganisationDetail = Organisation & {
  website: string | null;
  about: string;
  facts: Stat[];
  /** 4 numbers under the header. */
  stats: Stat[];
  offerCards: { title: string; text: string; icon?: OfferIcon }[];
  wants: { title: string; text: string }[];
  roleSection: RoleSection | null;
  track: { title: string; intro: string; items: TrackRecordItem[] };
  impact: Stat[];
  documents: { public: DocumentFile[]; locked: string[] };
  contact: { replyTime: string | null; replyRate: string | null };
  verification: { verifiedAt: string; checks: string[] };
  match?: { score: number; reasons: string[] };
};

export type SimilarOrganisation = { organisation: Organisation; reason: string };
