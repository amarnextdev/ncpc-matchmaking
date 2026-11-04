import "server-only";
import { and, asc, count, desc, eq, gte, ilike, or, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  files,
  organisations,
  projectDocuments,
  projectMedia,
  projectNeeds,
  projects,
} from "@/db/schema";
import { publicImageUrl } from "@/lib/storage/url";

export const PROJECT_REVIEW_TABS = [
  { value: "in_review", label: "Waiting" },
  { value: "changes_requested", label: "Changes requested" },
  { value: "live", label: "Live" },
  { value: "rejected", label: "Not approved" },
] as const;
export type ProjectReviewTab = (typeof PROJECT_REVIEW_TABS)[number]["value"];

export async function getProjectReviewCounts(): Promise<Record<ProjectReviewTab, number>> {
  const rows = await db
    .select({ status: projects.status, n: count() })
    .from(projects)
    .groupBy(projects.status);
  const by = (s: string) => rows.find((r) => r.status === s)?.n ?? 0;
  return {
    in_review: by("in_review"),
    changes_requested: by("changes_requested"),
    live: by("live"),
    rejected: by("rejected"),
  };
}

export async function getProjectReviewStats() {
  const since = new Date(Date.now() - 30 * 86_400_000);
  const [[oldest], [approved]] = await Promise.all([
    db
      .select({ at: projects.submittedAt })
      .from(projects)
      .where(eq(projects.status, "in_review"))
      .orderBy(asc(projects.submittedAt))
      .limit(1),
    db
      .select({ n: count() })
      .from(projects)
      .where(and(eq(projects.status, "live"), gte(projects.listedAt, since))),
  ]);
  return { oldestSubmittedAt: oldest?.at ?? null, liveLast30: approved?.n ?? 0 };
}

export async function listProjectsForReview(tab: ProjectReviewTab, q: string) {
  const term = q.trim().slice(0, 80);
  const rows = await db
    .select({
      id: projects.id,
      title: projects.title,
      theme: projects.theme,
      province: projects.province,
      city: projects.city,
      stage: projects.stage,
      capitalNeeded: projects.capitalNeeded,
      submittedAt: projects.submittedAt,
      reviewedAt: projects.reviewedAt,
      orgName: organisations.name,
      orgCategory: organisations.category,
      photos: sql<number>`(select count(*) from ${projectMedia} where ${projectMedia.projectId} = ${projects.id})`,
      docs: sql<number>`(select count(*) from ${projectDocuments} where ${projectDocuments.projectId} = ${projects.id})`,
    })
    .from(projects)
    .innerJoin(organisations, eq(organisations.id, projects.orgId))
    .where(
      and(
        eq(projects.status, tab),
        term
          ? or(ilike(projects.title, `%${term}%`), ilike(organisations.name, `%${term}%`))
          : undefined,
      ),
    )
    .orderBy(tab === "in_review" ? asc(projects.submittedAt) : desc(projects.updatedAt))
    .limit(100);
  return rows.map((r) => ({ ...r, photos: Number(r.photos), docs: Number(r.docs) }));
}

/** Everything NCPC needs to decide on one project. */
export async function getProjectReview(id: string) {
  const [row] = await db
    .select({ project: projects, org: organisations })
    .from(projects)
    .innerJoin(organisations, eq(organisations.id, projects.orgId))
    .where(eq(projects.id, id));
  if (!row) return null;
  const [needs, media, docs] = await Promise.all([
    db.select().from(projectNeeds).where(eq(projectNeeds.projectId, id)),
    db
      .select({ id: files.id, path: files.path, isCover: projectMedia.isCover })
      .from(projectMedia)
      .innerJoin(files, eq(files.id, projectMedia.fileId))
      .where(eq(projectMedia.projectId, id))
      .orderBy(desc(projectMedia.isCover), asc(projectMedia.sortOrder)),
    db
      .select({
        fileId: files.id,
        name: projectDocuments.name,
        visibility: projectDocuments.visibility,
        bytes: files.bytes,
        mimeType: files.mimeType,
      })
      .from(projectDocuments)
      .innerJoin(files, eq(files.id, projectDocuments.fileId))
      .where(eq(projectDocuments.projectId, id)),
  ]);
  return {
    ...row,
    needs,
    photos: media.map((m) => ({ id: m.id, url: publicImageUrl(m.path), isCover: m.isCover })),
    docs,
  };
}

/**
 * Pending project count for the admin sidebar and the review switch.
 * A badge must never break the page: on a database error it logs the cause and returns 0.
 */
export async function countProjectsInReview() {
  try {
    const [r] = await db
      .select({ n: count() })
      .from(projects)
      .where(eq(projects.status, "in_review"));
    return r?.n ?? 0;
  } catch (error) {
    const cause =
      error instanceof Error && error.cause instanceof Error ? error.cause.message : String(error);
    console.error("[admin] could not count projects in review:", cause);
    return 0;
  }
}
