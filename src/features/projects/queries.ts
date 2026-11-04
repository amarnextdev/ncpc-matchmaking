import "server-only";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  files,
  organisations,
  projectDocuments,
  projectDrafts,
  projectMedia,
  projectNeeds,
  projects,
} from "@/db/schema";
import { getMembershipOrg } from "@/features/onboarding/queries";
import type { OrganisationCategory } from "@/lib/constants";
import { publicImageUrl } from "@/lib/storage/url";
import { canListProjects, type ProjectStatus } from "./constants";
import {
  PROJECT_DEFAULTS,
  projectDraftSchema,
  type FileRef,
  type ProjectDocumentRef,
  type ProjectDraftValues,
} from "./schema";

/** Statuses the owner may still change and send to NCPC. */
export const EDITABLE_STATUSES: ProjectStatus[] = ["draft", "in_review", "changes_requested"];

export type ListingOrg = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  category: OrganisationCategory;
  role: "owner" | "admin" | "member";
};

/**
 * The approved organisation this person lists projects for, or a reason they can't.
 * Any team member may list; NCPC reviews before anything goes live.
 */
export async function getListingOrg(
  userId: string,
): Promise<{ org: ListingOrg } | { org: null; reason: "no-org" | "not-approved" | "category" }> {
  const membership = await getMembershipOrg(userId);
  if (!membership) return { org: null, reason: "no-org" };
  const o = membership.org;
  if (o.status !== "approved") return { org: null, reason: "not-approved" };
  if (!canListProjects(o.category)) return { org: null, reason: "category" };
  let logoUrl: string | null = null;
  if (o.logoFileId) {
    const [logo] = await db
      .select({ path: files.path })
      .from(files)
      .where(eq(files.id, o.logoFileId));
    logoUrl = logo ? publicImageUrl(logo.path) : null;
  }
  return {
    org: {
      id: o.id,
      name: o.name,
      slug: o.slug,
      logoUrl,
      category: o.category,
      role: membership.role,
    },
  };
}

const fromNumber = (n: number | null | undefined) => (n == null ? "" : String(n));

export type ProjectFormState = {
  values: ProjectDraftValues;
  step: number;
  savedAt: string | null;
  draftId: string | null;
  projectId: string | null;
  status: ProjectStatus | null;
  reviewNote: string | null;
  mode: "new" | "draft" | "edit";
};

const EMPTY: ProjectFormState = {
  values: PROJECT_DEFAULTS,
  step: 0,
  savedAt: null,
  draftId: null,
  projectId: null,
  status: null,
  reviewNote: null,
  mode: "new",
};

/** A draft of this organisation, or null. */
export async function getProjectDraft(orgId: string, draftId: string) {
  const [row] = await db
    .select()
    .from(projectDrafts)
    .where(and(eq(projectDrafts.id, draftId), eq(projectDrafts.orgId, orgId)));
  return row ?? null;
}

/** What the form opens with: a saved draft, a project being edited, or an empty form. */
export async function loadProjectForm(
  orgId: string,
  opts: { draftId?: string | null; projectId?: string | null },
): Promise<ProjectFormState | null> {
  if (opts.draftId) {
    const draft = await getProjectDraft(orgId, opts.draftId).catch((error: unknown) => {
      console.error("[projects] could not load draft:", error);
      return null;
    });
    if (!draft) return null;
    const parsed = projectDraftSchema.safeParse(draft.data);
    return {
      ...EMPTY,
      values: { ...PROJECT_DEFAULTS, ...(parsed.success ? parsed.data : {}) },
      step: Math.min(draft.step, 4),
      savedAt: draft.updatedAt.toISOString(),
      draftId: draft.id,
      mode: "draft",
    };
  }
  if (opts.projectId) return loadExistingProject(orgId, opts.projectId);
  return EMPTY;
}

async function loadExistingProject(
  orgId: string,
  projectId: string,
): Promise<ProjectFormState | null> {
  const [p] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.orgId, orgId)));
  if (!p || !EDITABLE_STATUSES.includes(p.status)) return null;

  const [needs, media, docs] = await Promise.all([
    db
      .select({ role: projectNeeds.role })
      .from(projectNeeds)
      .where(eq(projectNeeds.projectId, p.id)),
    db
      .select({ fileId: files.id, name: files.originalName, path: files.path })
      .from(projectMedia)
      .innerJoin(files, eq(files.id, projectMedia.fileId))
      .where(eq(projectMedia.projectId, p.id))
      .orderBy(desc(projectMedia.isCover), asc(projectMedia.sortOrder)),
    db
      .select({
        fileId: files.id,
        name: projectDocuments.name,
        visibility: projectDocuments.visibility,
      })
      .from(projectDocuments)
      .innerJoin(files, eq(files.id, projectDocuments.fileId))
      .where(eq(projectDocuments.projectId, p.id))
      .orderBy(asc(projectDocuments.createdAt)),
  ]);

  const photos: FileRef[] = media.map((m) => ({
    fileId: m.fileId,
    name: m.name,
    url: publicImageUrl(m.path),
  }));
  const documents: ProjectDocumentRef[] = docs.map((d) => ({
    fileId: d.fileId,
    name: d.name,
    visibility: d.visibility,
  }));

  return {
    ...EMPTY,
    values: {
      title: p.title,
      theme: p.theme,
      province: p.province,
      city: p.city ?? "",
      summary: p.summary,
      needs: needs.map((n) => n.role),
      capitalNeeded: fromNumber(p.capitalNeeded),
      ownFunds: p.ownFunds ? String(p.ownFunds) : "",
      stage: p.stage,
      description: p.description ?? "",
      impactCo2: fromNumber(p.impactCo2Tonnes),
      impactMwh: fromNumber(p.impactMwh),
      impactJobs: fromNumber(p.impactJobs),
      impactWater: fromNumber(p.impactWaterM3),
      expectedStart: p.expectedStart ? p.expectedStart.slice(0, 7) : "",
      photos,
      documents,
    },
    projectId: p.id,
    status: p.status,
    reviewNote: p.status === "changes_requested" ? p.reviewNote : null,
    mode: "edit",
  };
}

export type MyProjectRow = {
  kind: "project" | "draft";
  id: string;
  title: string;
  slug: string | null;
  status: ProjectStatus;
  theme: string | null;
  stage: string | null;
  province: string | null;
  capitalNeeded: number | null;
  raised: number;
  coverUrl: string | null;
  needs: string[];
  reviewNote: string | null;
  photos: number;
  documents: number;
  hasImpact: boolean;
  /** ISO: submitted, listed or last saved */
  updatedAt: string;
  step: number | null;
};

/** Every project and unfinished draft of an organisation, newest first. */
export async function listMyProjects(orgId: string): Promise<MyProjectRow[]> {
  const [rows, drafts] = await Promise.all([
    db.select().from(projects).where(eq(projects.orgId, orgId)).orderBy(desc(projects.updatedAt)),
    db
      .select()
      .from(projectDrafts)
      .where(eq(projectDrafts.orgId, orgId))
      .orderBy(desc(projectDrafts.updatedAt)),
  ]);
  const ids = rows.map((r) => r.id);
  const [media, needs, docs] = ids.length
    ? await Promise.all([
        db
          .select({
            projectId: projectMedia.projectId,
            path: files.path,
            isCover: projectMedia.isCover,
          })
          .from(projectMedia)
          .innerJoin(files, eq(files.id, projectMedia.fileId))
          .where(inArray(projectMedia.projectId, ids)),
        db
          .select({ projectId: projectNeeds.projectId, role: projectNeeds.role })
          .from(projectNeeds)
          .where(inArray(projectNeeds.projectId, ids)),
        db
          .select({ projectId: projectDocuments.projectId })
          .from(projectDocuments)
          .where(inArray(projectDocuments.projectId, ids)),
      ])
    : [[], [], []];

  const list: MyProjectRow[] = rows.map((p) => {
    const mine = media.filter((m) => m.projectId === p.id);
    const cover = mine.find((m) => m.isCover) ?? mine[0];
    return {
      kind: "project",
      id: p.id,
      title: p.title,
      slug: p.slug,
      status: p.status,
      theme: p.theme,
      stage: p.stage,
      province: p.province,
      capitalNeeded: p.capitalNeeded,
      raised: p.capitalRaised + p.ownFunds,
      coverUrl: cover ? publicImageUrl(cover.path) : null,
      needs: needs.filter((n) => n.projectId === p.id).map((n) => n.role),
      reviewNote: p.status === "changes_requested" ? p.reviewNote : null,
      photos: mine.length,
      documents: docs.filter((d) => d.projectId === p.id).length,
      hasImpact: Boolean(p.impactCo2Tonnes || p.impactMwh || p.impactJobs || p.impactWaterM3),
      updatedAt: (p.listedAt ?? p.submittedAt ?? p.updatedAt).toISOString(),
      step: null,
    };
  });
  for (const d of drafts) {
    const v = projectDraftSchema.safeParse(d.data);
    const data = v.success ? v.data : {};
    const cover = data.photos?.[0]?.url ?? null;
    list.push({
      kind: "draft",
      id: d.id,
      title: d.title || "Untitled project",
      slug: null,
      status: "draft",
      theme: data.theme ?? null,
      stage: data.stage ?? null,
      province: data.province ?? null,
      capitalNeeded: data.capitalNeeded ? Number(data.capitalNeeded.replace(/[\s,]/g, "")) : null,
      raised: 0,
      coverUrl: cover,
      needs: data.needs ?? [],
      reviewNote: null,
      photos: data.photos?.length ?? 0,
      documents: data.documents?.length ?? 0,
      hasImpact: Boolean(data.impactCo2 || data.impactMwh || data.impactJobs || data.impactWater),
      updatedAt: d.updatedAt.toISOString(),
      step: d.step,
    });
  }
  return list;
}

/** Name of an organisation (for notifications). */
export async function orgName(orgId: string) {
  const [o] = await db
    .select({ name: organisations.name })
    .from(organisations)
    .where(eq(organisations.id, orgId));
  return o?.name ?? "An organisation";
}
