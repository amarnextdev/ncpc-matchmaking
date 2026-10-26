import "server-only";
import {
  CAPITAL_RANGES,
  LOOKING_FOR,
  PAGE_SIZE,
  PROJECT_STAGES,
  PROVINCES,
  THEMES,
  labelFor,
} from "@/lib/constants";
import { formatRand } from "@/lib/utils";
import { MOCK_OPPORTUNITIES } from "./data/mock-opportunities";
import { MOCK_OPPORTUNITY_DETAILS } from "./data/mock-opportunity-details";
import { NEED_META } from "./detail-meta";
import type {
  FacetCount,
  Opportunity,
  OpportunityDetail,
  OpportunityFilters,
  OpportunityPage,
  SimilarOpportunity,
} from "./types";

/**
 * Data access for the Opportunities marketplace.
 * TODO(Module 7): replace MOCK_OPPORTUNITIES with Drizzle queries on `projects` (published only).
 */
async function source(): Promise<Opportunity[]> {
  return MOCK_OPPORTUNITIES;
}

function matches(o: Opportunity, f: OpportunityFilters): boolean {
  if (f.q) {
    const hay = `${o.title} ${o.summary} ${o.owner.name}`.toLowerCase();
    if (
      !f.q
        .toLowerCase()
        .split(/\s+/)
        .every((word) => hay.includes(word))
    )
      return false;
  }
  if (f.themes.length && !f.themes.includes(o.theme)) return false;
  if (f.stages.length && !f.stages.includes(o.stage)) return false;
  if (f.lookingFor.length && !f.lookingFor.some((need) => o.lookingFor.includes(need)))
    return false;
  if (f.province && o.province !== f.province) return false;
  if (f.capital) {
    const range = CAPITAL_RANGES.find((r) => r.value === f.capital);
    if (range && (o.capitalNeeded < range.min || o.capitalNeeded >= range.max)) return false;
  }
  return true;
}

const sorters: Record<OpportunityFilters["sort"], (a: Opportunity, b: Opportunity) => number> = {
  newest: (a, b) => b.listedAt.localeCompare(a.listedAt),
  capital: (a, b) => b.capitalNeeded - a.capitalNeeded,
  funded: (a, b) => b.capitalRaised / b.capitalNeeded - a.capitalRaised / a.capitalNeeded,
};

export async function getOpportunities(filters: OpportunityFilters): Promise<OpportunityPage> {
  const all = (await source()).filter((o) => matches(o, filters)).sort(sorters[filters.sort]);
  const pageCount = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const page = Math.min(filters.page, pageCount);
  const start = (page - 1) * PAGE_SIZE;
  return {
    items: all.slice(start, start + PAGE_SIZE),
    total: all.length,
    page,
    pageCount,
    pageSize: PAGE_SIZE,
  };
}

/** Counts shown next to each filter option. */
export async function getOpportunityFacets() {
  const all = await source();
  const count = <T extends string>(
    options: readonly { value: T; label: string }[],
    pick: (o: Opportunity) => T[],
  ) =>
    options.map<FacetCount<T>>((opt) => ({
      value: opt.value,
      label: opt.label,
      count: all.filter((o) => pick(o).includes(opt.value)).length,
    }));
  return {
    themes: count(THEMES, (o) => [o.theme]),
    lookingFor: count(LOOKING_FOR, (o) => o.lookingFor),
    stages: count(PROJECT_STAGES, (o) => [o.stage]),
  };
}

/** Numbers for the hero stats panel. */
export async function getOpportunityStats() {
  const all = await source();
  const open = all.filter((o) => o.stage !== "operational");
  return {
    openProjects: open.length,
    capitalSought: open.reduce((sum, o) => sum + Math.max(0, o.capitalNeeded - o.capitalRaised), 0),
    provinces: new Set(all.map((o) => o.province)).size,
  };
}

/* ---------------------------------------------------------------------------------------------
 * Detail page
 * ------------------------------------------------------------------------------------------- */

/** Defaults for projects that only have card data (keeps every demo card clickable). */
function buildDetail(o: Opportunity): OpportunityDetail {
  const province = labelFor(PROVINCES, o.province);
  const remaining = Math.max(0, o.capitalNeeded - o.capitalRaised);
  return {
    ...o,
    tags: [labelFor(THEMES, o.theme)],
    location: province,
    about: o.summary,
    facts: [],
    needs: o.lookingFor.map((role) => ({
      role,
      headline:
        role === "investor" || role === "funder" ? formatRand(remaining) : "Open to proposals",
      description: NEED_META[role].fallback,
      facts: [],
      status: "open" as const,
    })),
    gallery: [],
    stageDates: {},
    nextStage: null,
    stageMetric: null,
    stageNote: null,
    updates: [],
    partners: [],
    documents: { public: [], locked: [], note: null },
    closesAt: null,
    impact: [],
    ownerProfile: {
      role: "Project developer",
      location: province,
      about: "",
      projects: 1,
      partners: 0,
      memberSince: o.listedAt,
      offers: [],
      website: null,
      replyTime: null,
    },
    ...MOCK_OPPORTUNITY_DETAILS[o.slug],
  };
}

/** One published opportunity with everything the detail page needs, or null (→ 404). */
export async function getOpportunityBySlug(slug: string): Promise<OpportunityDetail | null> {
  const base = (await source()).find((o) => o.slug === slug);
  return base ? buildDetail(base) : null;
}

/** Up to `limit` related projects: same theme first, then shared needs, then same province. */
export async function getSimilarOpportunities(
  o: Opportunity,
  limit = 3,
): Promise<SimilarOpportunity[]> {
  const scored = (await source())
    .filter((other) => other.id !== o.id && other.stage !== "operational")
    .map((other) => {
      const sharedNeed = other.lookingFor.find((need) => o.lookingFor.includes(need));
      const sameTheme = other.theme === o.theme;
      const sameProvince = other.province === o.province;
      const score = (sameTheme ? 3 : 0) + (sharedNeed ? 1 : 0) + (sameProvince ? 1 : 0);
      const reasons = [
        sameTheme ? labelFor(THEMES, other.theme) : null,
        sharedNeed ? `needs ${NEED_META[sharedNeed].label.toLowerCase()}` : null,
        sameProvince ? labelFor(PROVINCES, other.province) : null,
      ].filter(Boolean);
      return { opportunity: other, score, reason: reasons.slice(0, 2).join(" · ") };
    })
    .filter((item) => item.score > 0)
    .sort(
      (a, b) => b.score - a.score || b.opportunity.listedAt.localeCompare(a.opportunity.listedAt),
    );
  return scored.slice(0, limit).map(({ opportunity, reason }) => ({ opportunity, reason }));
}

/** Published opportunities listed by one organisation (organisation profile → Projects). */
export async function getOpportunitiesByOwner(ownerSlug: string): Promise<Opportunity[]> {
  return (await source()).filter((o) => o.owner.slug === ownerSlug).sort(sorters.newest);
}
