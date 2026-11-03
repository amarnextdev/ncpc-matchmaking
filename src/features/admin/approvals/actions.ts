"use server";

import { revalidatePath } from "next/cache";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { auditLog, notifications, organisationMembers, organisations } from "@/db/schema";
import { routes } from "@/config/routes";
import { requireAdmin } from "@/lib/auth/guards";

const decisionSchema = z
  .object({
    orgId: z.string().uuid(),
    decision: z.enum(["approve", "changes", "reject"]),
    note: z.string().trim().max(1000).optional().default(""),
  })
  .refine((v) => v.decision === "approve" || v.note.length >= 10, {
    path: ["note"],
    message: "Tell the organisation what to fix (at least 10 characters).",
  });

export type DecisionInput = z.input<typeof decisionSchema>;
export type DecisionResult = { ok: true } | { ok: false; error: string };

const NEXT_STATUS = {
  approve: "approved",
  changes: "changes_requested",
  reject: "rejected",
} as const;

const MESSAGE = {
  approve: {
    title: "Your organisation is verified",
    body: "NCPC approved your organisation. You now have full access and the verified badge.",
    link: routes.workspace.root,
  },
  changes: {
    title: "NCPC asked for changes",
    body: "Please update your organisation details and send them again.",
    link: routes.onboarding.root,
  },
  reject: {
    title: "Your registration was not approved",
    body: "NCPC could not approve your organisation. See the reason in your registration status.",
    link: routes.onboarding.pending,
  },
} as const;

/** Approve, ask for changes or reject one organisation that is waiting for review. */
export async function decideOrganisationAction(input: DecisionInput): Promise<DecisionResult> {
  const admin = await requireAdmin(routes.admin.approvals);
  const parsed = decisionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form." };
  }
  const { orgId, decision, note } = parsed.data;
  const status = NEXT_STATUS[decision];
  const now = new Date();

  const done = await db.transaction(async (tx) => {
    // Only organisations that are still waiting can be decided (no double decisions).
    const [updated] = await tx
      .update(organisations)
      .set({
        status,
        reviewNote: decision === "approve" ? null : note,
        reviewedBy: admin.id,
        approvedAt: decision === "approve" ? now : null,
        updatedAt: now,
      })
      .where(and(eq(organisations.id, orgId), inArray(organisations.status, ["pending"])))
      .returning({ id: organisations.id, name: organisations.name });
    if (!updated) return false;

    await tx.insert(auditLog).values({
      actorId: admin.id,
      action: `organisation.${decision}`,
      entity: "organisation",
      entityId: orgId,
      details: note ? { note } : null,
    });

    const members = await tx
      .select({ userId: organisationMembers.userId })
      .from(organisationMembers)
      .where(eq(organisationMembers.orgId, orgId));
    if (members.length) {
      const msg = MESSAGE[decision];
      await tx.insert(notifications).values(
        members.map((m) => ({
          userId: m.userId,
          kind: `organisation_${status}`,
          title: msg.title,
          body: decision === "approve" ? msg.body : `${msg.body} NCPC: “${note}”`,
          link: msg.link,
        })),
      );
    }
    return true;
  });

  if (!done) {
    return { ok: false, error: "This organisation was already reviewed. Refresh the page." };
  }
  revalidatePath(routes.admin.approvals);
  revalidatePath(routes.admin.approval(orgId));
  return { ok: true };
}
