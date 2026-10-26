import type { Province } from "@/lib/constants";
import type { Organisation, OrganisationDetail, TrackRecordItem } from "../types";

/** Everything on the profile page that is not already on the directory card. */
export type OrganisationExtras = Partial<Omit<OrganisationDetail, keyof Organisation>>;

const OWNER_PROVINCE: Record<string, Province> = {
  "GreenFuture Energy": "gauteng",
  "Dube TradePort SEZ": "kwazulu-natal",
  "ThermaLoop ESCO": "gauteng",
  "SunCool Logistics": "limpopo",
  "Atlantis SEZ": "western-cape",
  "Riverside Industrial Park": "gauteng",
  "Northgate Industrial Park": "gauteng",
  "Cape Fresh Logistics": "western-cape",
  "Atlantis Textiles": "western-cape",
  "Boland Beverages": "western-cape",
  "Eastern Cape Components": "eastern-cape",
  "Karoo Foods": "northern-cape",
  "Highveld Water Co": "mpumalanga",
  "Umgeni Paper": "kwazulu-natal",
  "Westbank SEZ": "western-cape",
};

/** Extra demo projects for SolarTech SA (shows how a long track record is paged). */
const SOLARTECH_MORE: TrackRecordItem[] = (
  [
    [
      "Industrial Park Microgrid",
      "industrial-park-microgrid",
      "Dube TradePort SEZ",
      "Solar and storage design",
      "2026-09-12",
      "feasibility",
    ],
    [
      "Battery Storage for Riverside Park",
      "riverside-battery-storage",
      "Riverside Industrial Park",
      "Shortlisted battery supplier",
      "2026-10-12",
      "funding",
    ],
    [
      "Cold Store Solar Carports",
      null,
      "Cape Fresh Logistics",
      "650 kW carport system",
      "2025-11-03",
      "operational",
    ],
    [
      "Textile Mill Rooftop Solar",
      null,
      "Atlantis Textiles",
      "1.8 MW rooftop system",
      "2025-06-18",
      "operational",
    ],
    [
      "Bottling Plant Solar and Storage",
      null,
      "Boland Beverages",
      "900 kW solar + 1 MWh battery",
      "2026-03-22",
      "construction",
    ],
    [
      "Auto Parts Plant Solar",
      null,
      "Eastern Cape Components",
      "2.2 MW rooftop system",
      "2026-05-09",
      "construction",
    ],
    [
      "Warehouse Solar Programme",
      null,
      "Northgate Industrial Park",
      "Six warehouse roofs",
      "2026-08-01",
      "funding",
    ],
    [
      "Food Processing Microgrid",
      null,
      "Karoo Foods",
      "Solar, storage and controls",
      "2026-07-14",
      "feasibility",
    ],
    [
      "Mine Workshop Solar",
      null,
      "Highveld Water Co",
      "400 kW ground-mount",
      "2025-09-30",
      "operational",
    ],
    ["Paper Mill Solar Pilot", null, "Umgeni Paper", "1 MW pilot array", "2026-02-17", "funding"],
    [
      "Logistics Hub Rooftop",
      null,
      "Westbank SEZ",
      "1.4 MW rooftop system",
      "2025-04-08",
      "operational",
    ],
  ] as const
).map(([projectTitle, projectSlug, projectOwner, detail, since, stage], i) => ({
  id: `st-${i}`,
  projectTitle,
  projectSlug,
  projectOwner,
  province: OWNER_PROVINCE[projectOwner] ?? "gauteng",
  roleType: "technology" as const,
  detail,
  since,
  stage,
  tint: ["#2E5A9C", "#1F6E6A", "#3F7F2A", "#41587A", "#5B4A8F", "#2A4A78"][i % 6] ?? "#2E5A9C",
}));

const CHECKS = [
  "Company registration (CIPC)",
  "B-BBEE certificate",
  "Tax compliance status (SARS)",
];

/**
 * DEMO DATA — profile content keyed by slug. Others get defaults (buildDetail in ../queries.ts).
 * Showcase: investor (sunridge-capital), park (riverside-industrial-park),
 * technology provider (solartech-sa), new member (aquacycle-solutions).
 */
export const MOCK_ORGANISATION_DETAILS: Record<string, OrganisationExtras> = {
  "sunridge-capital": {
    website: "sunridgecapital.co.za",
    about:
      "Sunridge Capital is an impact investor that backs solar, storage and energy-efficiency projects in South African industrial parks. We invest alongside project developers from funding through construction and stay on as long-term owners.",
    facts: [
      { label: "Founded", value: "2014" },
      { label: "Team size", value: "25 people" },
      { label: "B-BBEE level", value: "Level 2" },
      { label: "Funds under management", value: "R1.2bn" },
    ],
    stats: [
      { label: "Portfolio projects", value: "4" },
      { label: "Capital invested", value: "R38m" },
      { label: "Partnerships", value: "6" },
      { label: "Provinces", value: "3" },
    ],
    offerCards: [
      {
        title: "Growth equity",
        text: "R5m – R30m tickets for projects in funding or construction.",
        icon: "capital",
      },
      {
        title: "Mezzanine debt",
        text: "Flexible debt alongside senior lenders to close funding gaps.",
        icon: "debt",
      },
      {
        title: "Structuring support",
        text: "Help with power purchase agreements, contracts and financial models.",
        icon: "support",
      },
    ],
    wants: [
      {
        title: "Solar and storage projects",
        text: "In industrial parks, ready to build within 12 months.",
      },
      {
        title: "Energy-efficiency retrofits",
        text: "Delivered by an ESCO under a shared-savings contract.",
      },
    ],
    roleSection: {
      kind: "criteria",
      title: "Investment criteria",
      intro: "What Sunridge Capital looks for before it invests",
      items: [
        { label: "Ticket size", value: "R5m – R30m" },
        { label: "Instruments", value: "Equity, mezzanine debt" },
        { label: "Project stages", value: "Funding, construction" },
        { label: "Themes", value: "Energy, energy efficiency" },
        { label: "Provinces", value: "Gauteng, Western Cape, KwaZulu-Natal" },
        { label: "Typical hold", value: "7 – 10 years" },
      ],
      offer: {
        name: "Green Industry Growth Fund II",
        detail: "Open funding offer · R5m – R30m · closes 31 Mar 2027",
      },
    },
    track: {
      title: "Portfolio",
      intro: "Projects Sunridge Capital has invested in on the platform, confirmed by both sides",
      items: [
        {
          projectTitle: "Solar Rooftop & Battery Storage",
          projectSlug: "solar-rooftop-battery-storage",
          projectOwner: "GreenFuture Energy",
          province: "gauteng",
          id: "t1",
          roleType: "investor",
          detail: "R10m equity",
          since: "2026-07-20",
          stage: "construction",
          tint: "#2E5A9C",
        },
        {
          projectTitle: "Industrial Park Microgrid",
          projectSlug: "industrial-park-microgrid",
          projectOwner: "Dube TradePort SEZ",
          province: "kwazulu-natal",
          id: "t2",
          roleType: "investor",
          detail: "R20m equity",
          since: "2026-09-10",
          stage: "feasibility",
          tint: "#1F6E6A",
        },
        {
          projectTitle: "Waste-Heat Recovery for Foundries",
          projectSlug: "waste-heat-recovery-foundries",
          projectOwner: "ThermaLoop ESCO",
          province: "gauteng",
          id: "t3",
          roleType: "investor",
          detail: "R2m equity",
          since: "2026-10-16",
          stage: "funding",
          tint: "#5B4A8F",
        },
        {
          projectTitle: "Solar-powered Cold Storage",
          projectSlug: "solar-cold-storage",
          projectOwner: "SunCool Logistics",
          province: "limpopo",
          id: "t4",
          roleType: "lender",
          detail: "R6m debt",
          since: "2025-02-20",
          stage: "operational",
          tint: "#3F7F2A",
        },
      ],
    },
    impact: [
      { label: "CO₂ avoided per year", value: "≈ 9,800 t" },
      { label: "Clean power capacity", value: "11 MW" },
      { label: "Jobs supported", value: "120" },
    ],
    documents: {
      public: [{ name: "Company profile", url: "#", type: "pdf" }],
      locked: ["Investment policy", "B-BBEE certificate"],
    },
    contact: { replyTime: "2 days", replyRate: "90%" },
    verification: { verifiedAt: "2025-03-14", checks: CHECKS },
    match: {
      score: 92,
      reasons: [
        "They invest in energy; your project is solar + storage",
        "Your R18m need is inside their R5m – R30m range",
        "Both active in Gauteng",
      ],
    },
  },

  "riverside-industrial-park": {
    website: "riversidepark.co.za",
    about:
      "Riverside Industrial Park is a 48-hectare managed park in Midrand with 60 manufacturing and logistics tenants. We host clean-energy and water projects on our roofs and land so our tenants pay less for power and water, and we act as the single off-taker so developers deal with one counterparty instead of sixty. Since 2024 the park has run an ISO 14001 environmental management system and reports energy and water use per tenant every month.",
    facts: [
      { label: "Founded", value: "1998" },
      { label: "Park size", value: "48 ha" },
      { label: "Tenants", value: "60" },
      { label: "Electricity use", value: "38 GWh / yr" },
      { label: "B-BBEE level", value: "Level 3" },
      { label: "Certifications", value: "ISO 14001" },
    ],
    stats: [
      { label: "Tenants", value: "60" },
      { label: "Projects hosted", value: "2" },
      { label: "Sites available", value: "3" },
      { label: "Park size", value: "48 ha" },
    ],
    offerCards: [
      {
        title: "Rooftop space",
        text: "42,000 m² of usable factory roofs, structurally checked for solar.",
        icon: "roof",
      },
      {
        title: "Serviced land",
        text: "2.4 ha with an 11 kV grid connection and water on site.",
        icon: "land",
      },
      {
        title: "Tenant off-take",
        text: "The park buys power and water on behalf of all 60 tenants.",
        icon: "offtake",
      },
      {
        title: "Site management",
        text: "Security, access and permits handled by the park team.",
        icon: "services",
      },
    ],
    wants: [
      { title: "Battery storage developer", text: "To add about 10 MWh for evening peak demand." },
      {
        title: "Water recycling partner",
        text: "For a shared greywater treatment plant serving 12 tenants.",
      },
      {
        title: "Investor for battery storage",
        text: "R26m still open for our own battery project (see Projects).",
      },
    ],
    roleSection: {
      kind: "sites",
      title: "Available sites",
      intro: "Roofs and land open to new projects",
      sites: [
        {
          name: "Roof block C",
          detail: "12,000 m² roof · structural check done",
          status: "available",
        },
        { name: "Plot 14", detail: "2.4 ha serviced land · 11 kV connection", status: "available" },
        { name: "Warehouse 7 roof", detail: "8,000 m² roof", status: "reserved" },
      ],
      utilities: ["11 kV grid connection", "Municipal water", "Fibre"],
      incentives: ["Rates rebate for green projects", "Free site visits for members"],
    },
    track: {
      title: "Projects hosted",
      intro: "Projects built on Riverside roofs and land, confirmed by both sides",
      items: [
        {
          projectTitle: "Solar Rooftop & Battery Storage",
          projectSlug: "solar-rooftop-battery-storage",
          projectOwner: "GreenFuture Energy",
          province: "gauteng",
          id: "t5",
          roleType: "site_host",
          detail: "Four rooftops",
          since: "2026-08-28",
          stage: "construction",
          tint: "#2E5A9C",
        },
        {
          projectTitle: "Park-wide LED Retrofit",
          projectSlug: null,
          projectOwner: "ThermaLoop ESCO",
          province: "gauteng",
          id: "t6",
          roleType: "site_host",
          detail: "Common areas",
          since: "2025-03-10",
          stage: "operational",
          tint: "#5B4A8F",
        },
      ],
    },
    impact: [
      { label: "CO₂ avoided per year", value: "≈ 4,600 t" },
      { label: "Clean power capacity", value: "4.2 MW" },
      { label: "Electricity saved per year", value: "1.1 GWh" },
      { label: "Tenants served", value: "60" },
    ],
    documents: {
      public: [
        { name: "Park brochure", url: "#", type: "pdf" },
        { name: "Available sites and roof areas", url: "#", type: "xlsx" },
      ],
      locked: ["Site plans", "Roof structural reports", "Tenant energy data"],
    },
    contact: { replyTime: "3 days", replyRate: "84%" },
    verification: { verifiedAt: "2025-01-22", checks: CHECKS },
    match: {
      score: 85,
      reasons: [
        "They host rooftop solar; you develop rooftop solar",
        "They want a battery storage partner",
        "Both active in Gauteng",
      ],
    },
  },

  "solartech-sa": {
    website: "solartech.co.za",
    about:
      "SolarTech SA designs, supplies and installs solar PV, battery storage and monitoring for factories and industrial parks, with local installation teams in Gauteng and the Western Cape.",
    facts: [
      { label: "Founded", value: "2011" },
      { label: "Team size", value: "140 people" },
      { label: "B-BBEE level", value: "Level 1" },
      { label: "Certifications", value: "ISO 9001, ISO 14001" },
    ],
    stats: [
      { label: "Projects supplied", value: "14" },
      { label: "Installed capacity", value: "38 MW" },
      { label: "Partnerships", value: "6" },
      { label: "Team", value: "140 people" },
    ],
    offerCards: [
      {
        title: "Solar PV systems",
        text: "Rooftop and ground-mount, 100 kW to 10 MW.",
        icon: "solar",
      },
      {
        title: "Battery storage",
        text: "Containerised systems with a 10-year warranty.",
        icon: "battery",
      },
      {
        title: "Monitoring and O&M",
        text: "Remote monitoring and maintenance contracts.",
        icon: "monitoring",
      },
    ],
    wants: [
      {
        title: "Projects ready to build",
        text: "Developers with funding in place or close to it.",
      },
      { title: "Industrial park partners", text: "For multi-roof solar programmes." },
    ],
    roleSection: {
      kind: "solutions",
      title: "Solutions",
      intro: "Products and services SolarTech SA supplies",
      solutions: [
        {
          name: "Rooftop solar PV",
          category: "Solar PV",
          icon: "solar",
          description:
            "Rooftop and carport systems for factories and warehouses, designed and installed by our own teams.",
          specs: [
            { label: "System size", value: "100 kW – 10 MW" },
            { label: "Warranty", value: "25-year performance" },
            { label: "Lead time", value: "8–12 weeks" },
          ],
          certifications: ["IEC 61215", "SANS 10142"],
          usedIn: 9,
          imageUrl: null,
          tint: "#2E5A9C",
        },
        {
          name: "Battery storage",
          category: "Energy storage",
          icon: "battery",
          description:
            "Containerised lithium iron phosphate batteries for peak shaving and backup power.",
          specs: [
            { label: "Capacity", value: "500 kWh – 20 MWh" },
            { label: "Warranty", value: "10 years / 6,000 cycles" },
            { label: "Lead time", value: "12–16 weeks" },
          ],
          certifications: ["IEC 62619", "UL 9540A"],
          usedIn: 5,
          imageUrl: null,
          tint: "#1F6E6A",
        },
        {
          name: "Monitoring and O&M",
          category: "Software & service",
          icon: "software",
          description:
            "Live output, alerts and monthly reports, backed by on-site maintenance contracts.",
          specs: [
            { label: "Coverage", value: "Every SolarTech system" },
            { label: "Response", value: "48 hours on site" },
            { label: "Contract", value: "1–10 years" },
          ],
          certifications: ["ISO 9001"],
          usedIn: 14,
          imageUrl: null,
          tint: "#41587A",
        },
      ],
    },
    track: {
      title: "Projects supplied",
      intro: "Projects using SolarTech SA equipment, confirmed by both sides",
      items: [
        ...SOLARTECH_MORE,
        {
          projectTitle: "Solar Rooftop & Battery Storage",
          projectSlug: "solar-rooftop-battery-storage",
          projectOwner: "GreenFuture Energy",
          province: "gauteng",
          id: "t7",
          roleType: "technology",
          detail: "Panels and batteries",
          since: "2026-08-28",
          stage: "construction",
          tint: "#2E5A9C",
        },
        {
          projectTitle: "Rooftop Solar for 40 Tenants",
          projectSlug: "rooftop-solar-40-tenants",
          projectOwner: "Atlantis SEZ",
          province: "western-cape",
          id: "t8",
          roleType: "technology",
          detail: "Selected supplier",
          since: "2026-10-18",
          stage: "funding",
          tint: "#1F6E6A",
        },
        {
          projectTitle: "Solar-powered Cold Storage",
          projectSlug: "solar-cold-storage",
          projectOwner: "SunCool Logistics",
          province: "limpopo",
          id: "t9",
          roleType: "technology",
          detail: "1.2 MW system",
          since: "2025-02-14",
          stage: "operational",
          tint: "#3F7F2A",
        },
      ],
    },
    impact: [
      { label: "CO₂ avoided per year", value: "≈ 36,000 t" },
      { label: "Installed capacity", value: "38 MW" },
      { label: "Local jobs", value: "140" },
    ],
    documents: {
      public: [{ name: "Company profile", url: "#", type: "pdf" }],
      locked: ["Product datasheets", "Price list"],
    },
    contact: { replyTime: "1 day", replyRate: "95%" },
    verification: { verifiedAt: "2025-02-09", checks: CHECKS },
    match: {
      score: 81,
      reasons: [
        "They supply solar + storage; your project needs both",
        "They look for projects ready to build",
        "Installation team in Gauteng",
      ],
    },
  },

  "aquacycle-solutions": {
    website: null,
    about:
      "AquaCycle Solutions develops shared water recycling plants for textile and food processing parks, so factories can reuse treated water instead of buying more from the municipality.",
    facts: [
      { label: "Founded", value: "2024" },
      { label: "Team size", value: "8 people" },
      { label: "B-BBEE level", value: "Level 1" },
      { label: "Works in", value: "Water" },
    ],
    stats: [
      { label: "Projects listed", value: "1" },
      { label: "Capital sought", value: "R25m" },
      { label: "Partnerships", value: "None yet" },
      { label: "Looking for", value: "2 partners" },
    ],
    offerCards: [],
    wants: [
      { title: "Investor", text: "Equity or loan for our first plant in Atlantis." },
      {
        title: "Technology provider",
        text: "Membrane filtration systems: supply, install and maintain.",
      },
    ],
    contact: { replyTime: null, replyRate: null },
    verification: { verifiedAt: "2026-10-15", checks: CHECKS },
    match: {
      score: 71,
      reasons: [
        "They need an investor; you invest in water projects",
        "R25m is inside your R5m – R30m range",
      ],
    },
  },
};
