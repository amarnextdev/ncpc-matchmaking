import type { OrganisationCategory, ProjectStage, Province, Theme } from "@/lib/constants";
import type { Stat } from "@/types";
import type { FundingType } from "./constants";

/** A funding offer as shown on the list card. */
export type FundingOffer = {
  id: string;
  slug: string;
  title: string;
  type: FundingType;
  /** One or two lines under the title. */
  summary: string;
  funder: {
    name: string;
    /** Organisation profile; null for NCPC's own programmes. */
    slug: string | null;
    logoUrl: string | null;
    verified: boolean;
    /** "Funder", "Investor", "NCPC" */
    category: string;
    location: string;
  };
  /** "R5m – R50m" */
  amountLabel: string;
  /** "per project · 7–10 year term" */
  amountNote: string;
  /** Largest amount for one project (Rand), used by the amount filter and sort. */
  amountMax: number;
  fundSize: number;
  available: number;
  themes: Theme[];
  stages: ProjectStage[];
  /** Empty = all provinces. */
  provinces: Province[];
  applicants: OrganisationCategory[];
  /** ISO date; null = rolling. */
  deadline: string | null;
  status: "open" | "closed";
  listedAt: string;
  /** Demo: the signed-in member's projects that meet every criterion. TODO(Module 6 – Matching). */
  qualifies: string[];
};

export type FundingSort = "closing" | "amount" | "newest";

export type FundingFilters = {
  q: string;
  /** A type, or "closed" for the Closed tab. */
  tab: FundingType | "closed" | null;
  themes: Theme[];
  stages: ProjectStage[];
  applicants: OrganisationCategory[];
  province: Province | null;
  amount: string | null;
  deadline: "soon" | "rolling" | null;
  /** Members only: offers at least one of my projects qualifies for. */
  eligible: boolean;
  sort: FundingSort;
  page: number;
};

export type FundingPage = {
  items: FundingOffer[];
  total: number;
  page: number;
  pageCount: number;
  pageSize: number;
};

export type OfferFactIcon = "money" | "rate" | "term" | "fund" | "deadline" | "share";
export type OfferWhatIcon = "themes" | "stage" | "place" | "who";

export type FundingOfferDetail = FundingOffer & {
  about: string;
  keyFacts: (Stat & { icon: OfferFactIcon })[];
  fundsWhat: { label: string; value: string; icon: OfferWhatIcon }[];
  criteria: string[];
  terms: Stat[];
  termsNote: string;
  steps: { title: string; text: string; time: string }[];
  totalTime: string;
  documents: string[];
  funded: {
    total: string;
    count: number;
    applications: number;
    items: {
      title: string;
      slug: string | null;
      owner: string;
      amount: string;
      stage: ProjectStage;
      date: string;
      tint: string;
    }[];
  };
  faqs: { q: string; a: string }[];
  /** Demo: eligibility of each of the member's projects. TODO(Module 6 – Matching). */
  memberCheck: {
    slug: string;
    title: string;
    met: number;
    total: number;
    missing: string | null;
  }[];
  funderProfile: {
    about: string;
    openOffers: number;
    funded: number;
    since: string;
    replyTime: string;
    replyRate: string | null;
  };
};

export type SimilarOffer = FundingOffer;
