import "server-only";
import { ORGANISATION_CATEGORIES, PROJECT_STAGES, THEMES } from "@/lib/constants";
import { formatRand } from "@/lib/utils";
import { FUNDING_AMOUNTS, FUNDING_PAGE_SIZE, FUNDING_TYPES } from "./constants";
import { offerDetail } from "./data/mock-offer-details";
import { MOCK_OFFERS } from "./data/mock-offers";
import { SOON_DAYS, daysLeft } from "./deadline";
import type { FundingFilters, FundingOffer, FundingOfferDetail, FundingPage } from "./types";

/**
 * Data access for Funding offers. Only NCPC-approved offers (live or closed) are returned.
 * TODO(Module 2/7): replace MOCK_OFFERS with Drizzle queries on `funding_offers`.
 */
async function source(): Promise<FundingOffer[]> {
  return MOCK_OFFERS;
}

type Option = { value: string; label: string; count: number };

function matchesText(o: FundingOffer, q: string): boolean {
  if (!q) return true;
  const text = [o.title, o.summary, o.funder.name, ...o.themes.map((t) => t.replace("_", " "))]
    .join(" ")
    .toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .every((word) => text.includes(word));
}

function inTab(o: FundingOffer, tab: FundingFilters["tab"]): boolean {
  if (tab === "closed") return o.status === "closed";
  if (o.status === "closed") return false;
  return tab ? o.type === tab : true;
}

/** Every filter except the tab (tabs show counts across the other filters). */
function matchesFilters(o: FundingOffer, f: FundingFilters, skip?: keyof FundingFilters): boolean {
  const amount = FUNDING_AMOUNTS.find((a) => a.value === f.amount);
  const left = daysLeft(o);
  return (
    matchesText(o, f.q) &&
    (skip === "themes" || !f.themes.length || f.themes.some((t) => o.themes.includes(t))) &&
    (skip === "stages" || !f.stages.length || f.stages.some((s) => o.stages.includes(s))) &&
    (skip === "applicants" ||
      !f.applicants.length ||
      f.applicants.some((a) => o.applicants.includes(a))) &&
    (!f.province || !o.provinces.length || o.provinces.includes(f.province)) &&
    (!amount || (o.amountMax > amount.min && o.amountMax <= amount.max)) &&
    (!f.deadline ||
      (f.deadline === "rolling" ? left === null : left !== null && left <= SOON_DAYS)) &&
    (!f.eligible || o.qualifies.length > 0)
  );
}

function sortOffers(items: FundingOffer[], sort: FundingFilters["sort"]): FundingOffer[] {
  const copy = [...items];
  if (sort === "amount") return copy.sort((a, b) => b.amountMax - a.amountMax);
  if (sort === "newest") return copy.sort((a, b) => b.listedAt.localeCompare(a.listedAt));
  // Closing soon: dated offers first (soonest first), rolling offers after.
  return copy.sort((a, b) => {
    if (a.deadline && b.deadline) return a.deadline.localeCompare(b.deadline);
    if (a.deadline) return -1;
    if (b.deadline) return 1;
    return b.listedAt.localeCompare(a.listedAt);
  });
}

export async function getFundingOffers(f: FundingFilters): Promise<FundingPage> {
  const all = await source();
  const filtered = sortOffers(
    all.filter((o) => inTab(o, f.tab) && matchesFilters(o, f)),
    f.tab === "closed" ? "newest" : f.sort,
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / FUNDING_PAGE_SIZE));
  const page = Math.min(f.page, pageCount);
  return {
    items: filtered.slice((page - 1) * FUNDING_PAGE_SIZE, page * FUNDING_PAGE_SIZE),
    total: filtered.length,
    page,
    pageCount,
    pageSize: FUNDING_PAGE_SIZE,
  };
}

/** Tab and checkbox counts for the current filters. */
export async function getFundingFacets(f: FundingFilters) {
  const all = await source();
  const base = all.filter((o) => matchesFilters(o, f));
  const open = base.filter((o) => o.status === "open");
  const tabs = [
    { value: null, label: "All", count: open.length, tint: null },
    ...FUNDING_TYPES.map((t) => ({
      value: t.value as string | null,
      label: t.plural,
      count: open.filter((o) => o.type === t.value).length,
      tint: t.tint as string | null,
    })),
    {
      value: "closed",
      label: "Closed",
      count: base.filter((o) => o.status === "closed").length,
      tint: null,
    },
  ];

  const inCurrentTab = (skip: keyof FundingFilters) =>
    all.filter((o) => inTab(o, f.tab) && matchesFilters(o, f, skip));
  const count = <T extends string>(
    options: readonly { value: T; label: string }[],
    items: FundingOffer[],
    pick: (o: FundingOffer) => readonly string[],
  ): Option[] =>
    options.map((opt) => ({
      value: opt.value,
      label: opt.label,
      count: items.filter((o) => pick(o).includes(opt.value)).length,
    }));

  return {
    tabs,
    themes: count(THEMES, inCurrentTab("themes"), (o) => o.themes),
    stages: count(PROJECT_STAGES, inCurrentTab("stages"), (o) => o.stages),
    applicants: count(
      ORGANISATION_CATEGORIES.filter((c) => c.value !== "investor" && c.value !== "funder"),
      inCurrentTab("applicants"),
      (o) => o.applicants,
    ),
  };
}

export type FundingFacets = Awaited<ReturnType<typeof getFundingFacets>>;

/** Hero numbers. */
export async function getFundingStats() {
  const open = (await source()).filter((o) => o.status === "open");
  const available = open.reduce((sum, o) => sum + o.available, 0);
  const closingSoon = open.filter((o) => {
    const left = daysLeft(o);
    return left !== null && left <= SOON_DAYS;
  }).length;
  return { open: open.length, available: formatRand(available), closingSoon };
}

export async function getOfferBySlug(slug: string): Promise<FundingOfferDetail | null> {
  const offer = (await source()).find((o) => o.slug === slug);
  return offer ? offerDetail(offer) : null;
}

/** Other open offers: same type or overlapping themes first. */
export async function getSimilarOffers(o: FundingOffer, limit = 3): Promise<FundingOffer[]> {
  const score = (x: FundingOffer) =>
    (x.type === o.type ? 2 : 0) + x.themes.filter((t) => o.themes.includes(t)).length;
  return (await source())
    .filter((x) => x.slug !== o.slug && x.status === "open")
    .sort((a, b) => score(b) - score(a))
    .slice(0, limit);
}
