import type { ViewerOrg } from "@/types";

export const DEMO_COOKIE = "ncpc_demo_as";
export type DemoRole = "investor" | "owner";

/** Demo members used until Auth exists. */
export const DEMO_ORGS: Record<DemoRole, ViewerOrg> = {
  investor: {
    slug: "sunridge-capital",
    name: "Sunridge Capital",
    initials: "SC",
    tint: "#5B4A8F",
    category: "investor",
    projects: [],
  },
  owner: {
    slug: "greenfuture-energy",
    name: "GreenFuture Energy",
    initials: "GF",
    tint: "#13336B",
    category: "project_developer",
    projects: [
      { slug: "solar-rooftop-battery-storage", title: "Solar Rooftop & Battery Storage" },
      { slug: null, title: "Biogas Plant, Ekurhuleni" },
    ],
  },
};
