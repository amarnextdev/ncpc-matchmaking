"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import {
  auditLog,
  conversationReads,
  conversations,
  enquiries,
  messages,
  notifications,
  organisationMembers,
  organisations,
  projectNeeds,
  projects,
} from "@/db/schema";
import { routes } from "@/config/routes";
import { getMembershipOrg } from "@/features/onboarding/queries";
import { getSessionUser } from "@/lib/auth/session";
import { LOOKING_FOR, labelFor, type LookingFor } from "@/lib/constants";
import { ENQUIRY_EXPIRY_DAYS, NOTE_MAX, canPlay } from "./constants";

const ROLE_VALUES = LOOKING_FOR.map((r) => r.value) as [LookingFor, ...LookingFor[]];

const sendSchema = z.object({
  toOrgSlug: z.string().min(1).max(120),
  /** From a project page: the target organisation's live project */
  projectSlug: z.string().max(160).nullable(),
  role: z.enum(ROLE_VALUES),
  note: z.string().trim().max(NOTE_MAX).optional().default(""),
});

export type SendEnquiryResult =
  { ok: true; expiresAt: string; demo?: boolean } | { ok: false; error: string };

const causeOf = (e: unknown) =>
  e instanceof Error && e.cause instanceof Error ? e.cause.message : String(e);

/**
 * Sends an enquiry to another organisation (optionally about one of its live projects).
 * Checks: signed in, sender approved, target approved and not yourself, the role is one the
 * project is looking for and the sender's category can take, and no pending duplicate.
 * Notifies the target organisation's team.
 */
export async function sendEnquiryAction(
  input: z.input<typeof sendSchema>,
): Promise<SendEnquiryResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Your session has ended. Sign in again." };
  const parsed = sendSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form." };
  const { toOrgSlug, projectSlug, role, note } = parsed.data;

  const membership = await getMembershipOrg(user.id);
  if (!membership || membership.org.status !== "approved") {
    return { ok: false, error: "Only verified organisations can send enquiries." };
  }
  const from = membership.org;

  const [to] = await db
    .select({ id: organisations.id, name: organisations.name, status: organisations.status })
    .from(organisations)
    .where(eq(organisations.slug, toOrgSlug));
  const expiresAt = new Date(Date.now() + ENQUIRY_EXPIRY_DAYS * 86_400_000);
  // Demo organisations only exist in mock data: keep the demo flow working.
  if (!to) return { ok: true, expiresAt: expiresAt.toISOString(), demo: true };
  if (to.status !== "approved") return { ok: false, error: "This organisation is not available." };
  if (to.id === from.id) return { ok: false, error: "You can't send an enquiry to yourself." };

  if (!canPlay(from.category, role)) {
    return {
      ok: false,
      error: `Your organisation can't take the ${labelFor(LOOKING_FOR, role).toLowerCase()} role.`,
    };
  }

  let projectId: string | null = null;
  let projectTitle: string | null = null;
  if (projectSlug) {
    const [p] = await db
      .select({ id: projects.id, title: projects.title })
      .from(projects)
      .where(
        and(eq(projects.slug, projectSlug), eq(projects.orgId, to.id), eq(projects.status, "live")),
      );
    if (!p) return { ok: false, error: "This project is no longer open for enquiries." };
    const [need] = await db
      .select({ status: projectNeeds.status })
      .from(projectNeeds)
      .where(and(eq(projectNeeds.projectId, p.id), eq(projectNeeds.role, role)));
    if (!need || need.status !== "open") {
      return { ok: false, error: "The project is no longer looking for this role." };
    }
    projectId = p.id;
    projectTitle = p.title;
  }

  // One pending enquiry per sender, project and role (also enforced by a unique index).
  const [dup] = await db
    .select({ id: enquiries.id })
    .from(enquiries)
    .where(
      and(
        eq(enquiries.fromOrgId, from.id),
        eq(enquiries.toOrgId, to.id),
        eq(enquiries.role, role),
        eq(enquiries.status, "pending"),
        ...(projectId ? [eq(enquiries.projectId, projectId)] : []),
      ),
    );
  if (dup) return { ok: false, error: "You already sent this enquiry. It is waiting for a reply." };

  try {
    await db.transaction(async (tx) => {
      const [row] = await tx
        .insert(enquiries)
        .values({
          fromOrgId: from.id,
          toOrgId: to.id,
          projectId,
          role,
          note: note || null,
          createdBy: user.id,
          expiresAt,
        })
        .returning({ id: enquiries.id });
      await tx.insert(auditLog).values({
        actorId: user.id,
        action: "enquiry.sent",
        entity: "enquiry",
        entityId: row!.id,
      });
      const team = await tx
        .select({ userId: organisationMembers.userId })
        .from(organisationMembers)
        .where(eq(organisationMembers.orgId, to.id));
      if (team.length) {
        await tx.insert(notifications).values(
          team.map((m) => ({
            userId: m.userId,
            kind: "enquiry_received",
            title: projectTitle
              ? `${from.name} sent an enquiry about “${projectTitle}”`
              : `${from.name} sent you an enquiry`,
            body: note ? `“${note}”` : `As ${labelFor(LOOKING_FOR, role).toLowerCase()}`,
            link: routes.workspace.network,
          })),
        );
      }
    });
  } catch (error) {
    const cause = causeOf(error);
    console.error("[enquiries] could not send:", cause);
    if (cause.includes("enquiries_one_pending")) {
      return { ok: false, error: "You already sent this enquiry. It is waiting for a reply." };
    }
    return { ok: false, error: "We could not send the enquiry. Please try again." };
  }

  revalidatePath(routes.workspace.network);
  return { ok: true, expiresAt: expiresAt.toISOString() };
}

const respondSchema = z.object({
  enquiryId: z.string().uuid(),
  decision: z.enum(["accept", "decline"]),
});

/**
 * Accept or decline an enquiry your organisation received.
 * Accept: connects the two organisations (one conversation per pair) and posts the enquiry note
 * as the first message. Both sides are notified.
 */
export async function respondEnquiryAction(
  input: z.input<typeof respondSchema>,
): Promise<{ ok: true; conversationId: string | null } | { ok: false; error: string }> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Your session has ended. Sign in again." };
  const parsed = respondSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "This enquiry could not be found." };
  const { enquiryId, decision } = parsed.data;

  const membership = await getMembershipOrg(user.id);
  if (!membership || membership.org.status !== "approved") {
    return { ok: false, error: "Only verified organisations can answer enquiries." };
  }
  const me = membership.org;
  const now = new Date();

  try {
    const result = await db.transaction(async (tx) => {
      const [e] = await tx
        .update(enquiries)
        .set({
          status: decision === "accept" ? "accepted" : "declined",
          respondedBy: user.id,
          respondedAt: now,
        })
        .where(
          and(
            eq(enquiries.id, enquiryId),
            eq(enquiries.toOrgId, me.id),
            eq(enquiries.status, "pending"),
          ),
        )
        .returning();
      if (!e) return null;

      let conversationId: string | null = null;
      if (decision === "accept") {
        const [a, b] = [e.fromOrgId, e.toOrgId].sort();
        await tx
          .insert(conversations)
          .values({ orgAId: a!, orgBId: b!, openedByEnquiryId: e.id, lastMessageAt: now })
          .onConflictDoNothing({ target: [conversations.orgAId, conversations.orgBId] });
        const [c] = await tx
          .select({ id: conversations.id })
          .from(conversations)
          .where(and(eq(conversations.orgAId, a!), eq(conversations.orgBId, b!)));
        conversationId = c?.id ?? null;
        if (conversationId) {
          await tx.insert(messages).values({
            conversationId,
            senderUserId: e.createdBy,
            senderOrgId: e.fromOrgId,
            body: e.note?.trim() || `Enquiry as ${labelFor(LOOKING_FOR, e.role).toLowerCase()}`,
            createdAt: e.createdAt,
          });
          await tx
            .update(conversations)
            .set({ lastMessageAt: now })
            .where(eq(conversations.id, conversationId));
        }
      }

      await tx.insert(auditLog).values({
        actorId: user.id,
        action: `enquiry.${decision === "accept" ? "accepted" : "declined"}`,
        entity: "enquiry",
        entityId: e.id,
      });
      const team = await tx
        .select({ userId: organisationMembers.userId })
        .from(organisationMembers)
        .where(eq(organisationMembers.orgId, e.fromOrgId));
      if (team.length) {
        await tx.insert(notifications).values(
          team.map((m) => ({
            userId: m.userId,
            kind: decision === "accept" ? "enquiry_accepted" : "enquiry_declined",
            title:
              decision === "accept"
                ? `${me.name} accepted your enquiry`
                : `${me.name} declined your enquiry`,
            body:
              decision === "accept" ? "You are now connected and can message each other." : null,
            link:
              decision === "accept" && conversationId
                ? routes.workspace.chat(conversationId)
                : `${routes.workspace.network}?tab=history`,
          })),
        );
      }
      return { conversationId };
    });
    if (!result) return { ok: false, error: "This enquiry was already answered." };
    revalidatePath(routes.workspace.network);

    return { ok: true, conversationId: result.conversationId };
  } catch (error) {
    console.error("[enquiries] could not respond:", causeOf(error));
    return { ok: false, error: "We could not save your answer. Please try again." };
  }
}

// ── Messages ─────────────────────────────────────────────────────────────────

/** The conversation if the person's organisation is one of its two sides. */
async function myConversation(userId: string, conversationId: string) {
  const membership = await getMembershipOrg(userId);
  if (!membership || membership.org.status !== "approved") return null;
  const [c] = await db.select().from(conversations).where(eq(conversations.id, conversationId));
  if (!c || (c.orgAId !== membership.org.id && c.orgBId !== membership.org.id)) return null;
  return { c, orgId: membership.org.id };
}

const messageSchema = z.object({
  conversationId: z.string().uuid(),
  body: z.string().trim().min(1, "Write a message first.").max(4000),
});

/** Sends a chat message. The other side sees it live (Realtime on `messages`). */
export async function sendMessageAction(
  input: z.input<typeof messageSchema>,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Your session has ended. Sign in again." };
  const parsed = messageSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the message." };
  const mine = await myConversation(user.id, parsed.data.conversationId);
  if (!mine) return { ok: false, error: "This conversation is not available." };
  const now = new Date();
  try {
    const [m] = await db
      .insert(messages)
      .values({
        conversationId: mine.c.id,
        senderUserId: user.id,
        senderOrgId: mine.orgId,
        body: parsed.data.body,
        createdAt: now,
      })
      .returning({ id: messages.id });
    await db
      .update(conversations)
      .set({ lastMessageAt: now })
      .where(eq(conversations.id, mine.c.id));
    await db
      .insert(conversationReads)
      .values({ conversationId: mine.c.id, userId: user.id, lastReadAt: now })
      .onConflictDoUpdate({
        target: [conversationReads.conversationId, conversationReads.userId],
        set: { lastReadAt: now },
      });
    return { ok: true, id: m!.id };
  } catch (error) {
    console.error("[messages] could not send:", causeOf(error));
    return { ok: false, error: "We could not send the message. Please try again." };
  }
}

/** Marks a conversation as read for this person (clears its unread badge). */
export async function markConversationReadAction(conversationId: string): Promise<{ ok: boolean }> {
  const user = await getSessionUser();
  if (!user || !z.string().uuid().safeParse(conversationId).success) return { ok: false };
  const mine = await myConversation(user.id, conversationId);
  if (!mine) return { ok: false };
  const now = new Date();
  await db
    .insert(conversationReads)
    .values({ conversationId, userId: user.id, lastReadAt: now })
    .onConflictDoUpdate({
      target: [conversationReads.conversationId, conversationReads.userId],
      set: { lastReadAt: now },
    });
  return { ok: true };
}

/** Withdraw an enquiry your organisation sent that is still waiting. */
export async function withdrawEnquiryAction(
  enquiryId: string,
): Promise<{ ok: boolean; error?: string }> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Your session has ended. Sign in again." };
  if (!z.string().uuid().safeParse(enquiryId).success)
    return { ok: false, error: "Enquiry not found." };
  const membership = await getMembershipOrg(user.id);
  if (!membership) return { ok: false, error: "Enquiry not found." };
  const [row] = await db
    .update(enquiries)
    .set({ status: "withdrawn", respondedAt: new Date(), respondedBy: user.id })
    .where(
      and(
        eq(enquiries.id, enquiryId),
        eq(enquiries.fromOrgId, membership.org.id),
        eq(enquiries.status, "pending"),
      ),
    )
    .returning({ id: enquiries.id });
  if (!row) return { ok: false, error: "This enquiry was already answered." };
  await db.insert(auditLog).values({
    actorId: user.id,
    action: "enquiry.withdrawn",
    entity: "enquiry",
    entityId: row.id,
  });
  revalidatePath(routes.workspace.network);
  return { ok: true };
}
