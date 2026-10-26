import "server-only";
import {
  ORGANISATION_CATEGORIES,
  ORGANISATION_OFFERS,
  PAGE_SIZE,
  PROJECT_STAGES,
  PROVINCES,
  THEMES,
  labelFor,
} from "@/lib/constants";
import { formatListed } from "@/lib/dates";

const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
import { ORGANISATION_TABS, TRACK_PAGE_SIZE, TRACK_ROLES, tabForCategory } from "./constants";
import { MOCK_ORGANISATION_DETAILS } from "./data/mock-organisation-details";
import { MOCK_ORGANISATIONS } from "./data/mock-organisations";
import type {
  Organisation,
  OrganisationDetail,
  OrganisationFilters,
  OrganisationPage,
  SimilarOrganisation,
  TrackFilters,
  TrackRecordItem,
} from "./types";

/**
 * Data access for the Organisations directory and profiles.
 * TODO(Module 2/4): replace MOCK_ORGANISATIONS with Drizzle queries on `organisations` (approved only).
 */
async function source(): Promise<Organisation[]> {
  return MOCK_ORGANISATIONS.filter((o) => o.verified);
}

function inTab(o: Organisation, tab: OrganisationFilters["tab"]): boolean {
  if (!tab) return true;
  const def = ORGANISATION_TABS.find((t) => t.value === tab);
  return def ? (def.categories as readonly string[]).includes(o.category) : true;
}

function matches(o: Organisation, f: OrganisationFilters, ignoreTab = false): boolean {
  if (f.q) {
    const hay =
      `${o.name} ${o.tagline} ${labelFor(ORGANISATION_CATEGORIES, o.category)} ${o.city}`.toLowerCase();
    if (
      !f.q
        .toLowerCase()
        .split(/\s+/)
        .every((word) => hay.includes(word))
    )
      return false;
  }
  if (!ignoreTab && !inTab(o, f.tab)) return false;
  if (f.themes.length && !f.themes.some((t) => o.themes.includes(t))) return false;
  if (f.offers.length && !f.offers.some((x) => o.offers.includes(x))) return false;
  if (f.province && o.province !== f.province) return false;
  if (f.openOnly && !o.openToPartners) return false;
  return true;
}

const sorters: Record<OrganisationFilters["sort"], (a: Organisation, b: Organisation) => number> = {
  recent: (a, b) => b.lastActiveAt.localeCompare(a.lastActiveAt),
  projects: (a, b) => b.projectCount - a.projectCount || a.name.localeCompare(b.name),
  name: (a, b) => a.name.localeCompare(b.name),
};

export async function getOrganisations(filters: OrganisationFilters): Promise<OrganisationPage> {
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

/** Counts for the category tabs (respecting the other filters) and for the filter options. */
export async function getOrganisationFacets(filters: OrganisationFilters) {
  const all = await source();
  const forTabs = all.filter((o) => matches(o, filters, true));
  return {
    tabs: [
      { value: null, label: "All", count: forTabs.length },
      ...ORGANISATION_TABS.map((tab) => ({
        value: tab.value,
        label: tab.label,
        count: forTabs.filter((o) => inTab(o, tab.value)).length,
      })),
    ],
    themes: THEMES.map((t) => ({
      value: t.value,
      label: t.label,
      count: all.filter((o) => o.themes.includes(t.value)).length,
    })),
    offers: ORGANISATION_OFFERS.map((x) => ({
      value: x.value,
      label: x.label,
      count: all.filter((o) => o.offers.includes(x.value)).length,
    })),
  };
}

export async function getOrganisationStats() {
  const all = await source();
  return {
    organisations: all.length,
    capitalProviders: all.filter((o) => o.category === "investor" || o.category === "funder")
      .length,
    provinces: new Set(all.map((o) => o.province)).size,
  };
}

/** Defaults for organisations that only have directory data. */
function buildDetail(o: Organisation): OrganisationDetail {
  return {
    ...o,
    website: null,
    about: o.tagline,
    facts: [],
    stats: [
      o.keyFacts[0],
      o.keyFacts[1],
      { label: "Projects", value: String(o.projectCount) },
      { label: "Last active", value: capitalise(formatListed(o.lastActiveAt)) },
    ],
    offerCards: o.offers.map((x) => ({
      title: labelFor(ORGANISATION_OFFERS, x),
      text: "",
      icon: x,
    })),
    wants: [],
    roleSection: null,
    track: {
      title: "Track record",
      intro: "Projects this organisation has partnered on, confirmed by both sides",
      items: [],
    },
    impact: [],
    documents: { public: [], locked: [] },
    contact: { replyTime: null, replyRate: null },
    verification: {
      verifiedAt: o.memberSince,
      checks: ["Company registration (CIPC)", "B-BBEE certificate", "Tax compliance status (SARS)"],
    },
    ...MOCK_ORGANISATION_DETAILS[o.slug],
  };
}

export async function getOrganisationBySlug(slug: string): Promise<OrganisationDetail | null> {
  const base = (await source()).find((o) => o.slug === slug);
  return base ? buildDetail(base) : null;
}

/** Same type first, then shared themes, then same province. */
export async function getSimilarOrganisations(
  o: Organisation,
  limit = 3,
): Promise<SimilarOrganisation[]> {
  const tab = tabForCategory(o.category)?.value ?? null;
  return (await source())
    .filter((other) => other.id !== o.id)
    .map((other) => {
      const sameType = tab !== null && inTab(other, tab);
      const sharedTheme = other.themes.find((t) => o.themes.includes(t));
      const sameProvince = other.province === o.province;
      const score = (sameType ? 3 : 0) + (sharedTheme ? 1 : 0) + (sameProvince ? 1 : 0);
      const reason = [
        sameType ? labelFor(ORGANISATION_CATEGORIES, other.category) : null,
        sharedTheme ? labelFor(THEMES, sharedTheme) : null,
        sameProvince ? labelFor(PROVINCES, other.province) : null,
      ]
        .filter(Boolean)
        .slice(0, 2)
        .join(" · ");
      return { organisation: other, score, reason };
    })
    .filter((x) => x.score >= 3)
    .sort(
      (a, b) =>
        b.score - a.score || b.organisation.lastActiveAt.localeCompare(a.organisation.lastActiveAt),
    )
    .slice(0, limit)
    .map(({ organisation, reason }) => ({ organisation, reason }));
}

/* ---------------------------------------------------------------------------------------------
 * Track record (projects an organisation invested in, hosted or supplied)
 * ------------------------------------------------------------------------------------------- */

const stageRank = (item: TrackRecordItem) =>
  PROJECT_STAGES.findIndex((s) => s.value === item.stage);

const trackSorters: Record<
  TrackFilters["sort"],
  (a: TrackRecordItem, b: TrackRecordItem) => number
> = {
  newest: (a, b) => b.since.localeCompare(a.since),
  oldest: (a, b) => a.since.localeCompare(b.since),
  stage: (a, b) => stageRank(b) - stageRank(a) || b.since.localeCompare(a.since),
};

/** Counts per stage, for the summary pills and the stage tabs. */
export function summariseTrack(items: TrackRecordItem[]) {
  return PROJECT_STAGES.map((stage) => ({
    value: stage.value,
    label: stage.label,
    count: items.filter((item) => item.stage === stage.value).length,
  })).filter((s) => s.count > 0);
}

/** Newest first — the preview on the profile page. */
export function latestTrack(items: TrackRecordItem[], limit: number): TrackRecordItem[] {
  return [...items].sort(trackSorters.newest).slice(0, limit);
}

/** One page of an organisation's track record with search, stage, role and sort. */
export async function getTrackRecord(slug: string, filters: TrackFilters) {
  const organisation = await getOrganisationBySlug(slug);
  if (!organisation) return null;
  const all = organisation.track.items;

  const filtered = all
    .filter((item) => {
      if (filters.q) {
        const hay =
          `${item.projectTitle} ${item.projectOwner} ${item.detail} ${labelFor(PROVINCES, item.province)}`.toLowerCase();
        if (
          !filters.q
            .toLowerCase()
            .split(/\s+/)
            .every((word) => hay.includes(word))
        )
          return false;
      }
      if (filters.province && item.province !== filters.province) return false;
      if (filters.stage && item.stage !== filters.stage) return false;
      if (filters.role && item.roleType !== filters.role) return false;
      return true;
    })
    .sort(trackSorters[filters.sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / TRACK_PAGE_SIZE));
  const page = Math.min(filters.page, pageCount);
  const start = (page - 1) * TRACK_PAGE_SIZE;

  return {
    organisation,
    items: filtered.slice(start, start + TRACK_PAGE_SIZE),
    total: filtered.length,
    allCount: all.length,
    page,
    pageCount,
    pageSize: TRACK_PAGE_SIZE,
    stages: summariseTrack(all),
    summary: {
      operational: all.filter((item) => item.stage === "operational").length,
      construction: all.filter((item) => item.stage === "construction").length,
      early: all.filter((item) => ["idea", "feasibility", "funding"].includes(item.stage)).length,
      inProgress: all.filter((item) => item.stage !== "operational").length,
      listed: all.filter((item) => item.projectSlug).length,
      firstYear: all.length
        ? Math.min(...all.map((item) => new Date(item.since).getUTCFullYear()))
        : null,
    },
    roles: TRACK_ROLES.filter((r) => all.some((item) => item.roleType === r.value)),
  };
}
