import type { LookingFor, ProjectStage, Province, Theme } from "@/lib/constants";
import type { DocumentFile } from "@/types";

/** An opportunity = a published project shown in the marketplace. */
export type Opportunity = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  theme: Theme;
  province: Province;
  stage: ProjectStage;
  lookingFor: LookingFor[];
  /** Rand */
  capitalNeeded: number;
  /** Rand, sum of verified investments */
  capitalRaised: number;
  coverUrl: string | null;
  owner: {
    name: string;
    slug: string;
    logoUrl: string | null;
    verified: boolean;
  };
  listedAt: string; // ISO date
  /** 0–100, only when the viewer is a signed-in member (Matchmaking module). */
  matchScore?: number;
};

export type OpportunitySort = "newest" | "capital" | "funded";

export type OpportunityFilters = {
  q: string;
  themes: Theme[];
  stages: ProjectStage[];
  lookingFor: LookingFor[];
  province: Province | null;
  capital: string | null;
  sort: OpportunitySort;
  page: number;
};

export type OpportunityPage = {
  items: Opportunity[];
  total: number;
  page: number;
  pageCount: number;
  pageSize: number;
};

export type FacetCount<T extends string> = { value: T; label: string; count: number };

/* ---------------------------------------------------------------------------------------------
 * Opportunity detail page
 * ------------------------------------------------------------------------------------------- */

export type { Viewer } from "@/types";

export type Photo = {
  url: string | null;
  caption: string;
  /** Placeholder colour while there is no real photo (demo data). */
  tint: string;
};

export type OpportunityNeed = {
  role: LookingFor;
  /** Big line on the card: "R8m", "1.2 MW", "Membrane systems". */
  headline: string;
  description: string;
  /** Small footer facts: "Min ticket R2m", "15-year PPA". */
  facts: string[];
  status: "open" | "filled";
};

export type ProgressUpdate = {
  id: string;
  date: string; // ISO
  stage: ProjectStage;
  title: string;
  text: string;
  /** Indexes into OpportunityDetail.gallery. */
  photos: number[];
  document?: { name: string; url: string };
};

export type ProjectPartner = {
  name: string;
  slug: string;
  logoUrl: string | null;
  /** "Investor", "Technology provider", "Site host" */
  role: string;
  /** "R10m equity", "Four rooftops" */
  detail: string;
  verified: boolean;
  /** Investors/funders shown as "Backed by …" in the funding card. */
  backer?: boolean;
};

export type { DocumentType } from "@/types";
export type ProjectDocument = DocumentFile;

export type ImpactKind = "co2" | "power" | "jobs" | "water" | "waste";
export type ImpactItem = { kind: ImpactKind; label: string; value: string };

export type OwnerProfile = {
  /** "Project developer" */
  role: string;
  location: string;
  about: string;
  projects: number;
  partners: number;
  memberSince: string; // ISO
  offers: string[];
  website: string | null;
  replyTime: string | null;
};

export type OpportunityDetail = Opportunity & {
  tags: string[];
  /** "Midrand, Gauteng" */
  location: string;
  about: string;
  facts: { label: string; value: string }[];
  needs: OpportunityNeed[];
  gallery: Photo[];
  /** Date each stage was reached (ISO). */
  stageDates: Partial<Record<ProjectStage, string>>;
  nextStage: { stage: ProjectStage; eta: string } | null;
  /** Optional measurable progress inside the current stage: "Roofs completed 2 of 4". */
  stageMetric: { label: string; done: number; total: number } | null;
  /** Shown when there are no updates yet. */
  stageNote: { title: string; text: string } | null;
  /** Newest first. */
  updates: ProgressUpdate[];
  partners: ProjectPartner[];
  documents: {
    public: ProjectDocument[];
    /** Names of documents shared only after an enquiry is accepted. */
    locked: string[];
    note: string | null;
  };
  closesAt: string | null;
  impact: ImpactItem[];
  ownerProfile: OwnerProfile;
  /** Members only (Matchmaking module). */
  match?: { score: number; reasons: string[] };
};

export type SimilarOpportunity = { opportunity: Opportunity; reason: string };
