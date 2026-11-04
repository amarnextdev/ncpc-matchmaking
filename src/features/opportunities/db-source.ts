import "server-only";
import { cache } from "react";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  files,
  organisations,
  projectDocuments,
  projectMedia,
  projectNeeds,
  projects,
} from "@/db/schema";
import { ORGANISATION_CATEGORIES, PROVINCES, THEMES, labelFor } from "@/lib/constants";
import { privateFileUrl } from "@/lib/storage/server";
import { publicImageUrl } from "@/lib/storage/url";
import { formatRand } from "@/lib/utils";
import { NEED_META } from "./detail-meta";
import type { ImpactItem, Opportunity, OpportunityDetail } from "./types";

const causeOf = (e: unknown) =>
  e instanceof Error && e.cause instanceof Error ? e.cause.message : String(e);

/**
 * Live projects from the database, as marketplace cards. Only status = "live" (NCPC approved)
 * from approved organisations. Cached per request. On a database error the marketplace falls
 * back to demo data only, and the cause is logged.
 */
export const getLiveOpportunities = cache(async (): Promise<Opportunity[]> => {
  if (!process.env.DATABASE_URL) return [];
  try {
    const rows = await db
      .select({
        p: projects,
        orgName: organisations.name,
        orgSlug: organisations.slug,
        orgStatus: organisations.status,
        logoPath: files.path,
      })
      .from(projects)
      .innerJoin(organisations, eq(organisations.id, projects.orgId))
      .leftJoin(files, eq(files.id, organisations.logoFileId))
      .where(and(eq(projects.status, "live"), eq(organisations.status, "approved")))
      .orderBy(desc(projects.listedAt));
    if (!rows.length) return [];

    const ids = rows.map((r) => r.p.id);
    const [covers, needs] = await Promise.all([
      db
        .select({ projectId: projectMedia.projectId, path: files.path })
        .from(projectMedia)
        .innerJoin(files, eq(files.id, projectMedia.fileId))
        .where(and(inArray(projectMedia.projectId, ids), eq(projectMedia.isCover, true))),
      db
        .select({ projectId: projectNeeds.projectId, role: projectNeeds.role })
        .from(projectNeeds)
        .where(and(inArray(projectNeeds.projectId, ids), eq(projectNeeds.status, "open"))),
    ]);

    return rows.map(({ p, orgName, orgSlug, logoPath }) => {
      const cover = covers.find((c) => c.projectId === p.id);
      return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        summary: p.summary,
        theme: p.theme,
        province: p.province,
        stage: p.stage,
        lookingFor: needs.filter((n) => n.projectId === p.id).map((n) => n.role),
        capitalNeeded: p.capitalNeeded ?? 0,
        capitalRaised: p.capitalRaised + p.ownFunds,
        coverUrl: cover ? publicImageUrl(cover.path) : null,
        owner: {
          name: orgName,
          slug: orgSlug,
          logoUrl: logoPath ? publicImageUrl(logoPath) : null,
          verified: true,
        },
        listedAt: (p.listedAt ?? p.updatedAt).toISOString(),
      };
    });
  } catch (error) {
    console.error("[opportunities] could not load live projects:", causeOf(error));
    return [];
  }
});

const num = (n: number) => n.toLocaleString("en-ZA").replace(/ | /g, " ");

/** Detail page data for a live database project, or null when the slug is not one of them. */
export async function getLiveOpportunityDetail(slug: string): Promise<OpportunityDetail | null> {
  const base = (await getLiveOpportunities()).find((o) => o.slug === slug);
  if (!base) return null;
  try {
    const [row] = await db
      .select({ p: projects, org: organisations })
      .from(projects)
      .innerJoin(organisations, eq(organisations.id, projects.orgId))
      .where(eq(projects.id, base.id));
    if (!row) return null;
    const { p, org } = row;

    const [needs, media, docs, ownerProjects] = await Promise.all([
      db.select().from(projectNeeds).where(eq(projectNeeds.projectId, p.id)),
      db
        .select({ path: files.path })
        .from(projectMedia)
        .innerJoin(files, eq(files.id, projectMedia.fileId))
        .where(eq(projectMedia.projectId, p.id))
        .orderBy(desc(projectMedia.isCover), asc(projectMedia.sortOrder)),
      db
        .select({
          name: projectDocuments.name,
          visibility: projectDocuments.visibility,
          path: files.path,
          mimeType: files.mimeType,
        })
        .from(projectDocuments)
        .innerJoin(files, eq(files.id, projectDocuments.fileId))
        .where(eq(projectDocuments.projectId, p.id)),
      getLiveOpportunities().then((all) => all.filter((o) => o.owner.slug === org.slug).length),
    ]);

    const location = [p.city, labelFor(PROVINCES, p.province)].filter(Boolean).join(", ");
    const remaining = Math.max(0, (p.capitalNeeded ?? 0) - base.capitalRaised);
    const impactDefs: [ImpactItem["kind"], string, number | null, string][] = [
      ["co2", "CO₂ avoided per year", p.impactCo2Tonnes, " t"],
      ["power", "Clean power per year", p.impactMwh, " MWh"],
      ["jobs", "Jobs created", p.impactJobs, ""],
      ["water", "Water saved per year", p.impactWaterM3, " m³"],
    ];
    const impact: ImpactItem[] = impactDefs
      .filter(([, , value]) => value != null)
      .map(([kind, label, value, unit]) => ({ kind, label, value: `${num(value ?? 0)}${unit}` }));

    const publicDocs = await Promise.all(
      docs
        .filter((d) => d.visibility === "public")
        .map(async (d) => ({
          name: d.name,
          url: (await privateFileUrl(d.path, { minutes: 60, downloadName: d.name })) ?? "#",
          type: d.mimeType === "application/pdf" ? ("pdf" as const) : ("doc" as const),
        })),
    );

    return {
      ...base,
      tags: [labelFor(THEMES, p.theme)],
      location,
      about: p.description ?? p.summary,
      facts: [
        ...(p.city ? [{ label: "Site", value: location }] : []),
        ...(p.expectedStart
          ? [
              {
                label: "Expected start",
                value: new Intl.DateTimeFormat("en-ZA", { month: "long", year: "numeric" }).format(
                  new Date(p.expectedStart),
                ),
              },
            ]
          : []),
      ],
      needs: needs.map((n) => ({
        role: n.role,
        headline:
          n.role === "investor" || n.role === "funder"
            ? remaining
              ? formatRand(remaining)
              : "Open to proposals"
            : (n.headline ?? "Open to proposals"),
        description: n.notes ?? NEED_META[n.role].fallback,
        facts: [],
        status: n.status === "found" ? ("filled" as const) : ("open" as const),
      })),
      gallery: media.map((m, i) => ({
        url: publicImageUrl(m.path),
        caption: i === 0 ? "Cover photo" : `Photo ${i + 1}`,
        tint: "#2E5A9C",
      })),
      stageDates: {},
      nextStage: null,
      stageMetric: null,
      stageNote: null,
      updates: [],
      partners: [],
      documents: {
        public: publicDocs,
        locked: docs.filter((d) => d.visibility !== "public").map((d) => d.name),
        note: null,
      },
      closesAt: null,
      impact,
      ownerProfile: {
        role: labelFor(ORGANISATION_CATEGORIES, org.category),
        location: [org.city, labelFor(PROVINCES, org.province ?? "")].filter(Boolean).join(", "),
        about: org.summary ?? org.about ?? "",
        projects: ownerProjects,
        partners: 0,
        memberSince: (org.approvedAt ?? org.createdAt).toISOString(),
        offers: [],
        website: org.website,
        replyTime: null,
      },
    };
  } catch (error) {
    console.error("[opportunities] could not load project detail:", causeOf(error));
    return null;
  }
}
