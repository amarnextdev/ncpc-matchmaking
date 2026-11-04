"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import {
  auditLog,
  files,
  notifications,
  profiles,
  projectDocuments,
  projectDrafts,
  projectMedia,
  projectNeeds,
  projects,
} from "@/db/schema";
import { routes } from "@/config/routes";
import { ownsFiles } from "@/features/onboarding/queries";
import { getSessionUser } from "@/lib/auth/session";
import { slugify } from "@/lib/utils";
import { CAPITAL_ROLES } from "./constants";
import { EDITABLE_STATUSES, getListingOrg, getProjectDraft } from "./queries";
import { projectDraftSchema, projectSchema, toNumber, type ProjectValues } from "./schema";

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

const SIGNED_OUT = { ok: false as const, error: "Your session has ended. Sign in again." };
const NOT_ALLOWED = {
  ok: false as const,
  error: "Your organisation can't list projects right now.",
};

async function context() {
  const user = await getSessionUser();
  if (!user) return null;
  const { org } = await getListingOrg(user.id);
  return { user, org };
}

function causeOf(error: unknown) {
  return error instanceof Error && error.cause instanceof Error
    ? error.cause.message
    : String(error);
}

// ── Draft ────────────────────────────────────────────────────────────────────

const saveSchema = z.object({
  draftId: z.string().uuid().nullable(),
  data: z.unknown(),
  step: z.number().int().min(0).max(4),
});

/**
 * Saves the unfinished form. The first save creates the draft and returns its id,
 * so the page can put it in the URL (?draft=…) and the person can come back to it.
 */
export async function saveProjectDraftAction(
  input: z.input<typeof saveSchema>,
): Promise<Result<{ draftId: string; savedAt: string }>> {
  const ctx = await context();
  if (!ctx) return SIGNED_OUT;
  if (!ctx.org) return NOT_ALLOWED;
  const parsed = saveSchema.safeParse(input);
  const data = projectDraftSchema.safeParse(parsed.success ? parsed.data.data : null);
  if (!parsed.success || !data.success)
    return { ok: false, error: "We could not save this draft." };

  const now = new Date();
  const title = data.data.title?.trim() || null;
  try {
    if (parsed.data.draftId) {
      const [row] = await db
        .update(projectDrafts)
        .set({ data: data.data, step: parsed.data.step, title, updatedAt: now })
        .where(and(eq(projectDrafts.id, parsed.data.draftId), eq(projectDrafts.orgId, ctx.org.id)))
        .returning({ id: projectDrafts.id });
      if (!row) return { ok: false, error: "This draft no longer exists." };
      return { ok: true, draftId: row.id, savedAt: now.toISOString() };
    }
    const [row] = await db
      .insert(projectDrafts)
      .values({
        orgId: ctx.org.id,
        createdBy: ctx.user.id,
        data: data.data,
        step: parsed.data.step,
        title,
        updatedAt: now,
      })
      .returning({ id: projectDrafts.id });
    return { ok: true, draftId: row!.id, savedAt: now.toISOString() };
  } catch (error) {
    console.error("[projects] could not save draft:", causeOf(error));
    return { ok: false, error: "We could not save your draft. We will try again in a moment." };
  }
}

/** Removes an unfinished draft (from My projects). */
export async function deleteProjectDraftAction(draftId: string): Promise<Result> {
  const ctx = await context();
  if (!ctx) return SIGNED_OUT;
  if (!ctx.org) return NOT_ALLOWED;
  if (!z.string().uuid().safeParse(draftId).success)
    return { ok: false, error: "Draft not found." };
  await db
    .delete(projectDrafts)
    .where(and(eq(projectDrafts.id, draftId), eq(projectDrafts.orgId, ctx.org.id)));
  revalidatePath(routes.workspace.projects);
  return { ok: true };
}

// ── Submit ───────────────────────────────────────────────────────────────────

function uniqueSlug(title: string) {
  return `${slugify(title).slice(0, 60) || "project"}-${randomBytes(3).toString("hex")}`;
}

const submitSchema = z.object({
  draftId: z.string().uuid().nullable(),
  projectId: z.string().uuid().nullable(),
});

/** Saves the project as "in review", links photos and documents, and tells NCPC. */
export async function submitProjectAction(
  ids: z.input<typeof submitSchema>,
  input: ProjectValues,
): Promise<Result> {
  const ctx = await context();
  if (!ctx) return SIGNED_OUT;
  if (!ctx.org) return NOT_ALLOWED;
  const org = ctx.org;
  const parsedIds = submitSchema.safeParse(ids);
  const parsed = projectSchema.safeParse(input);
  if (!parsedIds.success) return { ok: false, error: "This project could not be found." };
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the highlighted fields." };
  }
  const v = parsed.data;
  const { draftId, projectId } = parsedIds.data;

  // Editing: the project must be this organisation's and still editable.
  let existing: { id: string; status: (typeof EDITABLE_STATUSES)[number] } | null = null;
  if (projectId) {
    const [row] = await db
      .select({ id: projects.id, status: projects.status })
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.orgId, org.id)));
    if (!row || !EDITABLE_STATUSES.includes(row.status)) {
      return { ok: false, error: "This project can't be edited any more." };
    }
    existing = row;
  }
  if (draftId && !(await getProjectDraft(org.id, draftId))) {
    return { ok: false, error: "This draft no longer exists." };
  }

  const refs = [
    ...v.photos.map((p) => ({ fileId: p.fileId, kind: "project-photo" })),
    ...v.documents.map((d) => ({ fileId: d.fileId, kind: "project-doc" })),
  ];
  if (!(await ownsFiles(ctx.user.id, org.id, refs))) {
    return { ok: false, error: "One of the files could not be checked. Upload it again." };
  }

  const now = new Date();
  const capitalNeeded = toNumber(v.capitalNeeded);
  const fields = {
    title: v.title,
    summary: v.summary,
    description: v.description,
    theme: v.theme,
    province: v.province,
    city: v.city,
    stage: v.stage,
    capitalNeeded,
    ownFunds: toNumber(v.ownFunds) ?? 0,
    impactCo2Tonnes: toNumber(v.impactCo2),
    impactMwh: toNumber(v.impactMwh),
    impactJobs: toNumber(v.impactJobs),
    impactWaterM3: toNumber(v.impactWater),
    expectedStart: v.expectedStart ? `${v.expectedStart}-01` : null,
    status: "in_review" as const,
    submittedAt: now,
    reviewNote: null,
    updatedAt: now,
  };

  let id = existing?.id ?? "";
  try {
    await db.transaction(async (tx) => {
      if (existing) {
        await tx.update(projects).set(fields).where(eq(projects.id, existing.id));
      } else {
        const [created] = await tx
          .insert(projects)
          .values({ ...fields, orgId: org.id, slug: uniqueSlug(v.title), createdBy: ctx.user.id })
          .returning({ id: projects.id });
        id = created!.id;
      }

      // Needs: one row per role. Capital roles share the amount still to raise.
      await tx.delete(projectNeeds).where(eq(projectNeeds.projectId, id));
      await tx.insert(projectNeeds).values(
        v.needs.map((role) => ({
          projectId: id,
          role,
          amount: CAPITAL_ROLES.includes(role) ? capitalNeeded : null,
        })),
      );

      // Photos (first = cover) and documents.
      await tx.delete(projectMedia).where(eq(projectMedia.projectId, id));
      await tx.insert(projectMedia).values(
        v.photos.map((p, i) => ({
          projectId: id,
          fileId: p.fileId,
          isCover: i === 0,
          sortOrder: i,
        })),
      );
      await tx.delete(projectDocuments).where(eq(projectDocuments.projectId, id));
      if (v.documents.length) {
        await tx.insert(projectDocuments).values(
          v.documents.map((d) => ({
            projectId: id,
            fileId: d.fileId,
            name: d.name,
            visibility: d.visibility,
          })),
        );
      }
      if (refs.length) {
        await tx
          .update(files)
          .set({ ownerOrgId: org.id })
          .where(
            inArray(
              files.id,
              refs.map((r) => r.fileId),
            ),
          );
      }

      if (draftId) await tx.delete(projectDrafts).where(eq(projectDrafts.id, draftId));
      await tx.insert(auditLog).values({
        actorId: ctx.user.id,
        action: existing ? "project.resubmitted" : "project.submitted",
        entity: "project",
        entityId: id,
      });

      const admins = await tx
        .select({ id: profiles.id })
        .from(profiles)
        .where(eq(profiles.platformRole, "ncpc_admin"));
      if (admins.length) {
        await tx.insert(notifications).values(
          admins.map((a) => ({
            userId: a.id,
            kind: "project_submitted",
            title: `${org.name}: “${v.title}” is waiting for review`,
            link: routes.admin.project(id),
          })),
        );
      }
    });
  } catch (error) {
    console.error("[projects] could not submit project:", causeOf(error));
    return { ok: false, error: "We could not send the project. Please try again." };
  }

  revalidatePath(routes.workspace.projects);
  redirect(`${routes.workspace.projects}?submitted=1`);
}
