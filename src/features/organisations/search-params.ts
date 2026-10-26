import { z } from "zod";
import { ORGANISATION_OFFERS, PROJECT_STAGES, PROVINCES, THEMES } from "@/lib/constants";
import { ORGANISATION_TABS, TRACK_ROLES } from "./constants";
import type { OrganisationFilters, TrackFilters } from "./types";

/** URL keys for the Organisations directory: ?type=investor&theme=energy&offer=capital&page=2 */
export const ORGANISATION_PARAMS = {
  q: "q",
  tab: "type",
  theme: "theme",
  offer: "offer",
  province: "province",
  open: "open",
  sort: "sort",
  page: "page",
} as const;

type RawParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value) ?? "";

function list<T extends string>(raw: string, allowed: readonly { value: T }[]): T[] {
  const ok = new Set<string>(allowed.map((a) => a.value));
  return raw
    .split(",")
    .map((v) => v.trim())
    .filter((v): v is T => ok.has(v));
}

function one<T extends string>(raw: string, allowed: readonly { value: T }[]): T | null {
  return allowed.some((a) => a.value === raw) ? (raw as T) : null;
}

const sortSchema = z.enum(["recent", "projects", "name"]).catch("recent");
const pageSchema = z.coerce.number().int().min(1).catch(1);

/** searchParams → safe, typed filters (unknown values are ignored). */
export function parseOrganisationFilters(params: RawParams): OrganisationFilters {
  return {
    q: first(params[ORGANISATION_PARAMS.q]).trim().slice(0, 100),
    tab: one(first(params[ORGANISATION_PARAMS.tab]), ORGANISATION_TABS),
    themes: list(first(params[ORGANISATION_PARAMS.theme]), THEMES),
    offers: list(first(params[ORGANISATION_PARAMS.offer]), ORGANISATION_OFFERS),
    province: one(first(params[ORGANISATION_PARAMS.province]), PROVINCES),
    openOnly: first(params[ORGANISATION_PARAMS.open]) === "1",
    sort: sortSchema.parse(first(params[ORGANISATION_PARAMS.sort]) || "recent"),
    page: pageSchema.parse(first(params[ORGANISATION_PARAMS.page]) || 1),
  };
}

/** Filters counted on the mobile "Filters · N" button (the category tab is shown separately). */
export function countActiveOrganisationFilters(f: OrganisationFilters): number {
  return f.themes.length + f.offers.length + (f.province ? 1 : 0) + (f.openOnly ? 1 : 0);
}

/** URL of the directory with these filters on another page. */
export function organisationsQuery(f: OrganisationFilters, page: number): string {
  const p = new URLSearchParams();
  if (f.q) p.set(ORGANISATION_PARAMS.q, f.q);
  if (f.tab) p.set(ORGANISATION_PARAMS.tab, f.tab);
  if (f.themes.length) p.set(ORGANISATION_PARAMS.theme, f.themes.join(","));
  if (f.offers.length) p.set(ORGANISATION_PARAMS.offer, f.offers.join(","));
  if (f.province) p.set(ORGANISATION_PARAMS.province, f.province);
  if (f.openOnly) p.set(ORGANISATION_PARAMS.open, "1");
  if (f.sort !== "recent") p.set(ORGANISATION_PARAMS.sort, f.sort);
  if (page > 1) p.set(ORGANISATION_PARAMS.page, String(page));
  return p.toString();
}

/* ---------------------------------------------------------------------------------------------
 * Track record page (/organisations/[slug]/projects)
 * ------------------------------------------------------------------------------------------- */

export const TRACK_PARAMS = {
  q: "q",
  province: "province",
  stage: "stage",
  role: "role",
  sort: "sort",
  page: "page",
} as const;

const trackSortSchema = z.enum(["newest", "oldest", "stage"]).catch("newest");

export function parseTrackFilters(params: RawParams): TrackFilters {
  return {
    q: first(params[TRACK_PARAMS.q]).trim().slice(0, 100),
    province: one(first(params[TRACK_PARAMS.province]), PROVINCES),
    stage: one(first(params[TRACK_PARAMS.stage]), PROJECT_STAGES),
    role: one(first(params[TRACK_PARAMS.role]), TRACK_ROLES),
    sort: trackSortSchema.parse(first(params[TRACK_PARAMS.sort]) || "newest"),
    page: pageSchema.parse(first(params[TRACK_PARAMS.page]) || 1),
  };
}

export function trackQuery(f: TrackFilters, page: number): string {
  const p = new URLSearchParams();
  if (f.q) p.set(TRACK_PARAMS.q, f.q);
  if (f.province) p.set(TRACK_PARAMS.province, f.province);
  if (f.stage) p.set(TRACK_PARAMS.stage, f.stage);
  if (f.role) p.set(TRACK_PARAMS.role, f.role);
  if (f.sort !== "newest") p.set(TRACK_PARAMS.sort, f.sort);
  if (page > 1) p.set(TRACK_PARAMS.page, String(page));
  return p.toString();
}
