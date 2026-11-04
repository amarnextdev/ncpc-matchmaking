"use server";

import { revalidatePath } from "next/cache";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { auditLog, notifications, organisationMembers, projects } from "@/db/schema";
import { routes } from "@/config/routes";
import { requireAdmin } from "@/lib/auth/guards";

const decisionSchema = z
  .object({
    projectId: z.string().uuid(),
    decision: z.enum(["approve", "changes", "reject"]),
    note: z.string().trim().max(1000).optional().default(""),
  })
  .refine((v) => v.decision === "approve" || v.note.length >= 10, {
    path: ["note"],
    message: "Tell the owner what to fix (at least 10 characters).",
  });

const NEXT_STATUS = {
  approve: "live",
  changes: "changes_requested",
  reject: "rejected",
} as const;

/** Approve (goes live), ask for changes or reject a project that is in review. */
export async function decideProjectAction(
  input: z.input<typeof decisionSchema>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = await requireAdmin(routes.admin.projects);
  const parsed = decisionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form." };
  }
  const { projectId, decision, note } = parsed.data;
  const now = new Date();

  const done = await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(projects)
      .set({
        status: NEXT_STATUS[decision],
        reviewNote: decision === "approve" ? null : note,
        reviewedBy: admin.id,
        reviewedAt: now,
        ...(decision === "approve" ? { listedAt: now } : {}),
        updatedAt: now,
      })
      .where(and(eq(projects.id, projectId), inArray(projects.status, ["in_review"])))
      .returning({
        id: projects.id,
        title: projects.title,
        slug: projects.slug,
        orgId: projects.orgId,
      });
    if (!updated) return false;

    await tx.insert(auditLog).values({
      actorId: admin.id,
      action: `project.${decision}`,
      entity: "project",
      entityId: projectId,
      details: note ? { note } : null,
    });

    const members = await tx
      .select({ userId: organisationMembers.userId })
      .from(organisationMembers)
      .where(eq(organisationMembers.orgId, updated.orgId));
    if (members.length) {
      const msg =
        decision === "approve"
          ? {
              title: `“${updated.title}” is live`,
              body: "NCPC approved your project. Members can now find it and send enquiries.",
              link: routes.opportunities.detail(updated.slug),
            }
          : decision === "changes"
            ? {
                title: `NCPC asked for changes to “${updated.title}”`,
                body: `NCPC: “${note}”`,
                link: routes.workspace.editProject(updated.id),
              }
            : {
                title: `“${updated.title}” was not approved`,
                body: `NCPC: “${note}”`,
                link: routes.workspace.projects,
              };
      await tx.insert(notifications).values(
        members.map((m) => ({
          userId: m.userId,
          kind: `project_${NEXT_STATUS[decision]}`,
          ...msg,
        })),
      );
    }
    return true;
  });

  if (!done) return { ok: false, error: "This project was already reviewed. Refresh the page." };
  revalidatePath(routes.admin.projects);
  revalidatePath(routes.admin.project(projectId));
  revalidatePath(routes.workspace.projects);
  return { ok: true };
}
