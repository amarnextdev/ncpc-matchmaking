import "server-only";
import { cache } from "react";
import { and, count, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { files, organisations, projects } from "@/db/schema";
import { ORGANISATION_OFFERS, PROVINCES, labelFor, type OrganisationOffer } from "@/lib/constants";
import { publicImageUrl } from "@/lib/storage/url";
import { formatRand } from "@/lib/utils";
import type { Organisation } from "./types";

export type DbOrgExtras = { about: string; website: string | null };

/**
 * NCPC-approved organisations from the database, as directory cards (+ profile extras by slug).
 * Cached per request; on a database error the directory shows demo data only.
 */
export const getDbOrganisations = cache(
  async (): Promise<{ list: Organisation[]; extras: Map<string, DbOrgExtras> }> => {
    const empty = { list: [], extras: new Map<string, DbOrgExtras>() };
    if (!process.env.DATABASE_URL) return empty;
    try {
      const rows = await db
        .select()
        .from(organisations)
        .where(eq(organisations.status, "approved"));
      if (!rows.length) return empty;
      const fileIds = rows
        .flatMap((o) => [o.logoFileId, o.bannerFileId])
        .filter((v): v is string => Boolean(v));
      const [paths, counts] = await Promise.all([
        fileIds.length
          ? db
              .select({ id: files.id, path: files.path })
              .from(files)
              .where(inArray(files.id, fileIds))
          : Promise.resolve([]),
        db
          .select({ orgId: projects.orgId, n: count() })
          .from(projects)
          .where(
            and(
              eq(projects.status, "live"),
              inArray(
                projects.orgId,
                rows.map((o) => o.id),
              ),
            ),
          )
          .groupBy(projects.orgId),
      ]);
      const url = (id: string | null) => {
        const p = id ? paths.find((x) => x.id === id) : undefined;
        return p ? publicImageUrl(p.path) : null;
      };

      const extras = new Map<string, DbOrgExtras>();
      const list: Organisation[] = rows.map((o) => {
        const projectCount = counts.find((c) => c.orgId === o.id)?.n ?? 0;
        const capital = o.category === "investor" || o.category === "funder";
        const ticket =
          o.investMin && o.investMax
            ? `${formatRand(o.investMin)} – ${formatRand(o.investMax)}`
            : o.investMax
              ? `Up to ${formatRand(o.investMax)}`
              : "On request";
        extras.set(o.slug, { about: o.about ?? o.summary ?? "", website: o.website });
        return {
          id: o.id,
          slug: o.slug,
          name: o.name,
          category: o.category,
          city: o.city ?? "",
          province: o.province ?? "gauteng",
          tagline: o.summary ?? "",
          logoUrl: url(o.logoFileId),
          coverUrl: url(o.bannerFileId),
          verified: true,
          memberSince: (o.approvedAt ?? o.createdAt).toISOString(),
          lastActiveAt: o.updatedAt.toISOString(),
          themes: o.themes ?? [],
          offers: (o.offers ?? []).filter((x): x is OrganisationOffer =>
            ORGANISATION_OFFERS.some((v) => v.value === x),
          ),
          openToPartners: (o.lookingFor ?? []).length > 0 || capital,
          keyFacts: capital
            ? [
                { label: "Ticket size", value: ticket },
                { label: "Themes", value: String((o.themes ?? []).length) },
              ]
            : [
                { label: "Live projects", value: String(projectCount) },
                { label: "Province", value: o.province ? labelFor(PROVINCES, o.province) : "—" },
              ],
          projectCount,
        };
      });
      return { list, extras };
    } catch (error) {
      console.error(
        "[organisations] could not load:",
        error instanceof Error && error.cause instanceof Error ? error.cause.message : error,
      );
      return empty;
    }
  },
);
