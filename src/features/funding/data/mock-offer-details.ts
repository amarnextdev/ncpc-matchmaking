import { PROJECT_STAGES, PROVINCES, THEMES, labelFor } from "@/lib/constants";
import { fundingType } from "../constants";
import type { FundingOffer, FundingOfferDetail } from "../types";

type Extra = Omit<FundingOfferDetail, keyof FundingOffer>;

const list = (items: string[]) =>
  items.length > 1 ? `${items.slice(0, -1).join(", ")} and ${items.at(-1)}` : (items[0] ?? "");

const sentence = (text: string) => text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

/** The complete demo offer (matches the approved design). */
const GREEN_INDUSTRY_LOAN: Extra = {
  about:
    "The Green Industry Loan gives South African manufacturers, industrial parks and project developers long-term finance below commercial rates for solar, battery storage and energy-efficiency projects that are ready to build. Loans are repaid from the energy savings or power sales of the project.",
  keyFacts: [
    { label: "Loan per project", value: "R5m – R50m", icon: "money" },
    { label: "Interest rate", value: "Prime − 1%", icon: "rate" },
    { label: "Term", value: "7 – 10 years", icon: "term" },
    { label: "Fund size", value: "R500m", icon: "fund" },
  ],
  fundsWhat: [
    { label: "Themes", value: "Energy, energy efficiency", icon: "themes" },
    { label: "Project stage", value: "Ready to build (construction)", icon: "stage" },
    { label: "Provinces", value: "All nine provinces", icon: "place" },
    { label: "Who can apply", value: "Developers, parks, SEZs, manufacturers, ESCOs", icon: "who" },
  ],
  criteria: [
    "Registered South African company, NCPC verified",
    "Project listed on NCPC Matchmaking",
    "Feasibility study completed",
    "Site secured (owned, leased or host agreement)",
    "At least 20% of the cost from other sources",
    "B-BBEE Level 1 to 4",
  ],
  terms: [
    { label: "Interest rate", value: "Prime minus 1% (fixed options available)" },
    { label: "Loan term", value: "7 – 10 years" },
    { label: "Grace period", value: "Up to 18 months during construction" },
    { label: "Your contribution", value: "At least 20% from own funds or other funders" },
    { label: "Security", value: "Project assets and power or savings contracts" },
    { label: "Disbursement", value: "In tranches against construction milestones" },
  ],
  termsNote:
    "Indicative terms. Final terms are agreed between Ubuntu Green Fund and the applicant after due diligence.",
  steps: [
    {
      title: "Apply on the platform",
      text: "Choose your project, add a short note and the documents below.",
      time: "15 minutes",
    },
    {
      title: "Shortlist",
      text: "The fund checks fit and may ask questions in the deal room.",
      time: "~2 weeks",
    },
    {
      title: "Due diligence",
      text: "Site visit, financial model review and contract checks.",
      time: "4–6 weeks",
    },
    {
      title: "Decision and agreement",
      text: "Loan agreement signed with the fund; both sides confirm it here.",
      time: "~2 weeks",
    },
  ],
  totalTime: "About 10 weeks",
  documents: [
    "Feasibility study",
    "Financial model",
    "Company financials (2 years)",
    "B-BBEE certificate",
    "Site or roof agreement",
    "Power or savings contract (draft)",
  ],
  funded: {
    total: "R86m",
    count: 6,
    applications: 34,
    items: [
      {
        title: "Bottling Plant Solar and Storage",
        slug: null,
        owner: "Boland Beverages",
        amount: "R18m",
        stage: "construction",
        date: "2026-03-12",
        tint: "#2E5A9C",
      },
      {
        title: "Auto Parts Plant Solar",
        slug: null,
        owner: "Eastern Cape Components",
        amount: "R22m",
        stage: "construction",
        date: "2026-05-04",
        tint: "#5B4A8F",
      },
      {
        title: "Cold Store Solar Carports",
        slug: null,
        owner: "Cape Fresh Logistics",
        amount: "R9m",
        stage: "operational",
        date: "2025-11-20",
        tint: "#3F7F2A",
      },
    ],
  },
  faqs: [
    {
      q: "Does NCPC or the platform lend the money?",
      a: "No. The loan comes from Ubuntu Green Fund. The platform helps you find the offer, apply with your project and talk to the fund. The agreement is signed directly with the fund, then both sides confirm it here so your project shows the funding.",
    },
    {
      q: "Can I apply with more than one project?",
      a: "Yes. Each project is a separate application, and each must meet all six criteria.",
    },
    {
      q: "What happens after I apply?",
      a: "The fund reviews your application within about two weeks. If it is shortlisted, a deal room opens where you can share documents and answer questions.",
    },
    {
      q: "Can I combine this loan with a grant?",
      a: "Yes. Grants and equity from other funders count towards your 20% own contribution.",
    },
  ],
  memberCheck: [
    {
      slug: "solar-rooftop-battery-storage",
      title: "Solar Rooftop & Battery Storage",
      met: 6,
      total: 6,
      missing: null,
    },
    {
      slug: "rooftop-solar-phase-2",
      title: "Rooftop Solar Phase 2",
      met: 5,
      total: 6,
      missing: "completed feasibility study (criterion 3)",
    },
  ],
  funderProfile: {
    about: "Blended-finance fund for green industrial projects across South Africa.",
    openOffers: 2,
    funded: 11,
    since: "2025",
    replyTime: "First reply within 5 working days",
    replyRate: "Replies to 96% of applications",
  },
};

const DETAILS: Record<string, Extra> = { "green-industry-loan": GREEN_INDUSTRY_LOAN };

/** Sensible detail content for demo offers that have no hand-written page yet. */
function buildDetail(o: FundingOffer): Extra {
  const type = fundingType(o.type);
  const themes = o.themes.map((t) => labelFor(THEMES, t));
  const stages = o.stages.map((s) => labelFor(PROJECT_STAGES, s).toLowerCase());
  const provinces = o.provinces.length
    ? o.provinces.map((p) => labelFor(PROVINCES, p)).join(", ")
    : "All nine provinces";
  const repaid = o.type === "loan" || o.type === "blended";
  return {
    about: `${o.summary} The offer is run by ${o.funder.name} and listed on NCPC Matchmaking after NCPC checked the funder and the terms. Apply with one of your listed projects; the agreement is made directly with the funder.`,
    keyFacts: [
      { label: `${type.label} per project`, value: o.amountLabel, icon: "money" },
      {
        label: repaid ? "Repayment" : o.type === "equity" ? "Stake" : "Repayable",
        value: repaid ? "From project cash flow" : o.type === "equity" ? "Minority" : "No",
        icon: "rate",
      },
      { label: "Deadline", value: o.deadline ? "Fixed date" : "Rolling", icon: "deadline" },
      {
        label: "Fund size",
        value: `R${Math.round(o.fundSize / 1_000_000)}m`,
        icon: "fund",
      },
    ],
    fundsWhat: [
      { label: "Themes", value: sentence(themes.join(", ")), icon: "themes" },
      { label: "Project stage", value: sentence(stages.join(", ")), icon: "stage" },
      { label: "Provinces", value: provinces, icon: "place" },
      { label: "Who can apply", value: "NCPC-verified members", icon: "who" },
    ],
    criteria: [
      "Registered South African company, NCPC verified",
      "Project listed on NCPC Matchmaking",
      `Project at the ${list(stages)} stage`,
      `Project works on ${list(themes.map((t) => t.toLowerCase()))}`,
    ],
    terms: [
      { label: "Amount", value: `${o.amountLabel} ${o.amountNote.split("·")[0]?.trim() ?? ""}` },
      { label: "Type", value: type.label },
      { label: "Deadline", value: o.deadline ? "See the apply card" : "Rolling, apply any time" },
    ],
    termsNote: `Indicative terms. Final terms are agreed between ${o.funder.name} and the applicant.`,
    steps: [
      {
        title: "Apply on the platform",
        text: "Choose your project and add a short note.",
        time: "15 minutes",
      },
      { title: "Review", text: "The funder checks fit and may ask questions.", time: "~3 weeks" },
      {
        title: "Decision and agreement",
        text: "Signed with the funder; both sides confirm it here.",
        time: "~3 weeks",
      },
    ],
    totalTime: "About 6 weeks",
    documents: ["Project summary", "Company registration", "B-BBEE certificate", "Budget"],
    funded: { total: "R0", count: 0, applications: 0, items: [] },
    faqs: [
      {
        q: "Does NCPC or the platform provide the money?",
        a: `No. The money comes from ${o.funder.name}. The platform helps you find the offer, apply with your project and talk to the funder.`,
      },
    ],
    memberCheck: [],
    funderProfile: {
      about: `${o.funder.category} based in ${o.funder.location}.`,
      openOffers: 1,
      funded: 0,
      since: "2026",
      replyTime: "First reply within 10 working days",
      replyRate: null,
    },
  };
}

export function offerDetail(o: FundingOffer): FundingOfferDetail {
  return { ...o, ...(DETAILS[o.slug] ?? buildDetail(o)) };
}
