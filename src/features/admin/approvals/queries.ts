import "server-only";
import { and, asc, count, desc, eq, gte, ilike, inArray, min, or } from "drizzle-orm";
import { authUsers } from "drizzle-orm/supabase";
import { db } from "@/db";
import {
  files,
  organisationDocuments,
  organisationMembers,
  organisations,
  profiles,
} from "@/db/schema";
import { publicImageUrl } from "@/lib/storage/url";

export const REVIEW_TABS = [
  { value: "pending", label: "Waiting for review" },
  { value: "changes_requested", label: "Changes requested" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
] as const;
export type ReviewTab = (typeof REVIEW_TABS)[number]["value"];

export async function getReviewCounts(): Promise<Record<ReviewTab, number>> {
  const rows = await db
    .select({ status: organisations.status, n: count() })
    .from(organisations)
    .where(
      inArray(
        organisations.status,
        REVIEW_TABS.map((t) => t.value),
      ),
    )
    .groupBy(organisations.status);
  const out = { pending: 0, changes_requested: 0, approved: 0, rejected: 0 };
  for (const r of rows) out[r.status as ReviewTab] = r.n;
  return out;
}

/** Numbers for the top of the approvals page. */
export async function getReviewStats() {
  const since = new Date(Date.now() - 30 * 86_400_000);
  const [[oldest], [approved]] = await Promise.all([
    db
      .select({ at: min(organisations.submittedAt) })
      .from(organisations)
      .where(eq(organisations.status, "pending")),
    db
      .select({ n: count() })
      .from(organisations)
      .where(and(eq(organisations.status, "approved"), gte(organisations.approvedAt, since))),
  ]);
  return { oldestSubmittedAt: oldest?.at ?? null, approvedLast30: approved?.n ?? 0 };
}

/** Organisations in one review state. Oldest submission first, so nobody waits too long. */
export async function listForReview(tab: ReviewTab, q = "") {
  const term = q.trim().slice(0, 80);
  const docCounts = db
    .select({ orgId: organisationDocuments.orgId, docs: count().as("docs") })
    .from(organisationDocuments)
    .groupBy(organisationDocuments.orgId)
    .as("doc_counts");

  return db
    .select({
      id: organisations.id,
      name: organisations.name,
      category: organisations.category,
      province: organisations.province,
      city: organisations.city,
      registrationNo: organisations.registrationNo,
      submittedAt: organisations.submittedAt,
      approvedAt: organisations.approvedAt,
      docs: docCounts.docs,
    })
    .from(organisations)
    .leftJoin(docCounts, eq(docCounts.orgId, organisations.id))
    .where(
      and(
        eq(organisations.status, tab),
        term
          ? or(
              ilike(organisations.name, `%${term.replace(/[%_\\]/g, "\\$&")}%`),
              ilike(organisations.registrationNo, `%${term.replace(/[%_\\]/g, "\\$&")}%`),
            )
          : undefined,
      ),
    )
    .orderBy(tab === "pending" ? asc(organisations.submittedAt) : desc(organisations.updatedAt))
    .limit(200);
}

export type ReviewRow = Awaited<ReturnType<typeof listForReview>>[number];

/** Everything NCPC needs to decide on one organisation. */
export async function getReview(orgId: string) {
  const [org] = await db.select().from(organisations).where(eq(organisations.id, orgId)).limit(1);
  if (!org) return null;

  const people = await db
    .select({
      userId: organisationMembers.userId,
      role: organisationMembers.role,
      name: profiles.fullName,
      jobTitle: profiles.jobTitle,
      email: authUsers.email,
    })
    .from(organisationMembers)
    .leftJoin(profiles, eq(profiles.id, organisationMembers.userId))
    .leftJoin(authUsers, eq(authUsers.id, organisationMembers.userId))
    .where(eq(organisationMembers.orgId, orgId))
    .orderBy(asc(organisationMembers.createdAt));

  const documents = await db
    .select({
      kind: organisationDocuments.kind,
      fileId: files.id,
      name: files.originalName,
      bytes: files.bytes,
      mimeType: files.mimeType,
      uploadedAt: organisationDocuments.createdAt,
    })
    .from(organisationDocuments)
    .innerJoin(files, eq(files.id, organisationDocuments.fileId))
    .where(eq(organisationDocuments.orgId, orgId));

  const imageIds = [org.logoFileId, org.bannerFileId].filter((v): v is string => Boolean(v));
  const imagePaths = imageIds.length
    ? await db
        .select({ id: files.id, path: files.path })
        .from(files)
        .where(and(eq(files.bucket, "public-images"), inArray(files.id, imageIds)))
    : [];
  const imageUrl = (id: string | null) => {
    const f = imagePaths.find((p) => p.id === id);
    return f ? publicImageUrl(f.path) : null;
  };

  return {
    org,
    people,
    documents,
    logoUrl: imageUrl(org.logoFileId),
    bannerUrl: imageUrl(org.bannerFileId),
  };
}

export type Review = NonNullable<Awaited<ReturnType<typeof getReview>>>;
