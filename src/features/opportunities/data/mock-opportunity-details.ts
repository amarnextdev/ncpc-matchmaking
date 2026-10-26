import type { Opportunity, OpportunityDetail } from "../types";

/** Everything on the detail page that is not already on the marketplace card. */
export type DetailExtras = Partial<Omit<OpportunityDetail, keyof Opportunity>>;

/**
 * DEMO DATA — extra detail-page content, keyed by opportunity slug.
 * Projects without an entry get sensible defaults (see buildDetail in ../queries.ts).
 * Two showcase projects:
 *   - solar-rooftop-battery-storage  → full page (photos, updates, partners, backer)
 *   - textile-park-water-recycling   → new listing (no photos, no updates, no partners)
 */
export const MOCK_OPPORTUNITY_DETAILS: Record<string, DetailExtras> = {
  "solar-rooftop-battery-storage": {
    tags: ["Energy", "Solar PV", "Battery storage"],
    location: "Midrand, Gauteng",
    about:
      "A 4.2 MW rooftop solar array with 6 MWh of battery storage across four factory roofs in a Gauteng industrial park. Park tenants buy the power below the grid tariff under a 15-year power purchase agreement, which cuts their costs and their carbon footprint.",
    facts: [
      { label: "Technology", value: "Solar PV + battery" },
      { label: "Capacity", value: "4.2 MW / 6 MWh" },
      { label: "Site", value: "Riverside Industrial Park" },
      { label: "Contract", value: "15-year PPA" },
    ],
    needs: [
      {
        role: "investor",
        headline: "R8m",
        description: "Equity to complete the funding round",
        facts: ["Min ticket R2m", "Closes 15 Dec 2026"],
        status: "open",
      },
      {
        role: "off_taker",
        headline: "1.2 MW",
        description: "Buyers for surplus solar power",
        facts: ["15-year PPA", "Park tenants preferred"],
        status: "open",
      },
    ],
    gallery: [
      { url: null, caption: "Roof A, installed array", tint: "#2E5A9C" },
      { url: null, caption: "Roof B, mounting rails", tint: "#3B6AAE" },
      { url: null, caption: "Battery containers on site", tint: "#1F6E6A" },
      { url: null, caption: "Inverter room", tint: "#41587A" },
      { url: null, caption: "Aerial view of the park", tint: "#3F7F2A" },
      { url: null, caption: "Roof C before install", tint: "#5B6B82" },
      { url: null, caption: "Grid connection point", tint: "#2A4A78" },
      { url: null, caption: "Site team briefing", tint: "#4E6B3A" },
      { url: null, caption: "Cable trenching", tint: "#6B5A3A" },
      { url: null, caption: "Monitoring dashboard", tint: "#334155" },
      { url: null, caption: "Roof D survey", tint: "#2F5D8A" },
      { url: null, caption: "Tenant factory floor", tint: "#5B4A8F" },
    ],
    stageDates: {
      idea: "2026-01-18",
      feasibility: "2026-04-10",
      funding: "2026-07-20",
      construction: "2026-08-28",
    },
    nextStage: { stage: "operational", eta: "2027-03" },
    stageMetric: { label: "Roofs completed", done: 2, total: 4 },
    updates: [
      {
        id: "u6",
        date: "2026-10-12",
        stage: "construction",
        title: "Solar panels installed on roofs A and B",
        text: "Battery containers are on site. Roofs C and D are next, then the system is switched on in January.",
        photos: [0, 1, 2, 3, 4],
      },
      {
        id: "u5",
        date: "2026-08-28",
        stage: "construction",
        title: "Construction has started",
        text: "We signed the building contract with SolarTech SA, and Riverside Industrial Park handed over the roofs.",
        photos: [],
      },
      {
        id: "u4",
        date: "2026-07-20",
        stage: "funding",
        title: "R10m equity committed by Sunridge Capital",
        text: "The investment agreement was confirmed on the platform. R8m is still open to investors.",
        photos: [],
      },
      {
        id: "u3",
        date: "2026-06-15",
        stage: "funding",
        title: "Funding round opened",
        text: "We are raising R18m to build the system. The project summary is available to registered members.",
        photos: [],
        document: { name: "Project summary.pdf", url: "#" },
      },
      {
        id: "u2",
        date: "2026-05-02",
        stage: "feasibility",
        title: "Feasibility study completed",
        text: "Roof surveys and grid connection checks confirmed that all four roofs can carry the panels.",
        photos: [],
        document: { name: "Feasibility study (summary).pdf", url: "#" },
      },
      {
        id: "u1",
        date: "2026-01-18",
        stage: "idea",
        title: "Project listed on NCPC Matchmaking",
        text: "GreenFuture Energy and Riverside Industrial Park agreed to explore rooftop solar for park tenants.",
        photos: [],
      },
    ],
    partners: [
      {
        name: "Sunridge Capital",
        slug: "sunridge-capital",
        logoUrl: null,
        role: "Investor",
        detail: "R10m equity",
        verified: true,
        backer: true,
      },
      {
        name: "SolarTech SA",
        slug: "solartech-sa",
        logoUrl: null,
        role: "Technology provider",
        detail: "Panels and batteries",
        verified: true,
      },
      {
        name: "Riverside Industrial Park",
        slug: "riverside-industrial-park",
        logoUrl: null,
        role: "Site host",
        detail: "Four rooftops",
        verified: true,
      },
    ],
    documents: {
      public: [{ name: "Project summary", url: "#", type: "pdf" }],
      locked: ["Feasibility study", "Financial model"],
      note: null,
    },
    closesAt: "2026-12-15",
    impact: [
      { kind: "co2", label: "CO₂ avoided per year", value: "≈ 4,100 t" },
      { kind: "power", label: "Clean power capacity", value: "4.2 MW" },
      { kind: "jobs", label: "Jobs created", value: "35" },
    ],
    ownerProfile: {
      role: "Project developer",
      location: "Midrand, Gauteng",
      about: "Develops rooftop solar and storage for industrial parks and their tenants.",
      projects: 2,
      partners: 3,
      memberSince: "2025-03-01",
      offers: ["Solar EPC", "Power purchase agreements"],
      website: "greenfuture.co.za",
      replyTime: "Usually replies within 2 days",
    },
    match: {
      score: 88,
      reasons: [
        "They need an investor; you invest in energy",
        "R18m is inside your R5m – R30m range",
        "Both active in Gauteng",
      ],
    },
  },

  "textile-park-water-recycling": {
    tags: ["Water", "Water recycling"],
    location: "Atlantis, Western Cape",
    about:
      "A shared water recycling plant for the dye houses in the Atlantis textile park. Treated water goes back to the factories, cutting municipal water use and wastewater discharge.",
    facts: [
      { label: "Technology", value: "Membrane filtration" },
      { label: "Capacity", value: "2,000 m³ per day" },
      { label: "Site", value: "Atlantis SEZ" },
      { label: "Target start", value: "Q3 2027" },
    ],
    needs: [
      {
        role: "investor",
        headline: "R25m",
        description: "Equity or loan for construction",
        facts: [],
        status: "open",
      },
      {
        role: "technology",
        headline: "Membrane systems",
        description: "Supply, install and maintain",
        facts: [],
        status: "open",
      },
    ],
    gallery: [],
    stageDates: { idea: "2026-09-30", feasibility: "2026-10-19" },
    nextStage: null,
    stageMetric: null,
    stageNote: {
      title: "Feasibility study under way",
      text: "Water quality testing at three dye houses. Results expected in December 2026.",
    },
    updates: [],
    partners: [],
    documents: {
      public: [{ name: "Project summary", url: "#", type: "pdf" }],
      locked: [],
      note: "The feasibility study will be shared with members once it is complete.",
    },
    closesAt: null,
    impact: [{ kind: "water", label: "Municipal water saved", value: "≈ 600,000 m³ / yr" }],
    ownerProfile: {
      role: "Project developer",
      location: "Cape Town",
      about: "",
      projects: 1,
      partners: 0,
      memberSince: "2026-10-01",
      offers: [],
      website: null,
      replyTime: null,
    },
  },
};
