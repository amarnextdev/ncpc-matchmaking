"use server";

import { revalidatePath } from "next/cache";
import { and, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import {
  auditLog,
  collaborationRequestVersions,
  collaborationRequests,
  conversations,
  dealNotes,
  deals,
  enquiries,
  notifications,
  organisationMembers,
  partnerships,
  projectNeeds,
  projects,
} from "@/db/schema";
import { routes } from "@/config/routes";
import { getMembershipOrg } from "@/features/onboarding/queries";
import { getSessionUser } from "@/lib/auth/session";
import { LOOKING_FOR, labelFor } from "@/lib/constants";
import { CAPITAL_OFFER_ROLES, moneyValue, offerSchema } from "./forms";

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

const UUID = z.string().uuid();
const causeOf = (e: unknown) =>
  e instanceof Error && e.cause instanceof Error ? e.cause.message : String(e);

async function me() {
  const user = await getSessionUser();
  if (!user) return null;
  const m = await getMembershipOrg(user.id);
  if (!m || m.org.status !== "approved") return null;
  return { user, org: m.org };
}

async function notifyOrg(
  tx: Tx,
  orgId: string,
  n: { kind: string; title: string; body?: string | null; link: string },
) {
  const team = await tx
    .select({ userId: organisationMembers.userId })
    .from(organisationMembers)
    .where(eq(organisationMembers.orgId, orgId));
  if (team.length) {
    await tx
      .insert(notifications)
      .values(team.map((t) => ({ userId: t.userId, ...n, body: n.body ?? null })));
  }
}

async function audit(
  tx: Tx,
  actorId: string,
  action: string,
  entity: string,
  entityId: string,
  details?: object,
) {
  await tx.insert(auditLog).values({ actorId, action, entity, entityId, details: details ?? null });
}

/** The deal if the person's organisation is its owner or partner. */
async function myDeal(orgId: string, dealId: string) {
  const [d] = await db.select().from(deals).where(eq(deals.id, dealId));
  if (!d || (d.ownerOrgId !== orgId && d.partnerOrgId !== orgId)) return null;
  return d;
}

function done(conversationId?: string) {
  revalidatePath(routes.workspace.network);
  revalidatePath(routes.workspace.projects);
  void conversationId;
}

// ── 1. Start a deal (from an accepted enquiry about a project) ───────────────

export async function startDealAction(enquiryId: string): Promise<Result<{ dealId: string }>> {
  const ctx = await me();
  if (!ctx) return { ok: false, error: "Sign in with a verified organisation." };
  if (!UUID.safeParse(enquiryId).success) return { ok: false, error: "Deal not found." };
  const [e] = await db.select().from(enquiries).where(eq(enquiries.id, enquiryId));
  if (!e || e.status !== "accepted" || (e.fromOrgId !== ctx.org.id && e.toOrgId !== ctx.org.id)) {
    return { ok: false, error: "This enquiry can't start a deal." };
  }
  if (!e.projectId)
    return { ok: false, error: "Deals are about a project. This was a general enquiry." };
  const [p] = await db
    .select({ orgId: projects.orgId, title: projects.title })
    .from(projects)
    .where(eq(projects.id, e.projectId));
  if (!p) return { ok: false, error: "The project no longer exists." };
  const [a, b] = [e.fromOrgId, e.toOrgId].sort();
  const [c] = await db
    .select({ id: conversations.id })
    .from(conversations)
    .where(and(eq(conversations.orgAId, a!), eq(conversations.orgBId, b!)));
  if (!c) return { ok: false, error: "Connect first, then start the deal." };
  const ownerOrgId = p.orgId;
  const partnerOrgId = ownerOrgId === e.fromOrgId ? e.toOrgId : e.fromOrgId;

  try {
    const dealId = await db.transaction(async (tx) => {
      const [row] = await tx
        .insert(deals)
        .values({
          conversationId: c.id,
          projectId: e.projectId!,
          ownerOrgId,
          partnerOrgId,
          role: e.role,
          stage: "in_discussion",
          createdBy: ctx.user.id,
        })
        .onConflictDoNothing({ target: [deals.conversationId, deals.projectId] })
        .returning({ id: deals.id });
      const id =
        row?.id ??
        (
          await tx
            .select({ id: deals.id })
            .from(deals)
            .where(and(eq(deals.conversationId, c.id), eq(deals.projectId, e.projectId!)))
        )[0]?.id;
      if (!id) throw new Error("deal not created");
      if (row) {
        await audit(tx, ctx.user.id, "deal.started", "deal", id);
        const other = ctx.org.id === ownerOrgId ? partnerOrgId : ownerOrgId;
        await notifyOrg(tx, other, {
          kind: "deal_started",
          title: `${ctx.org.name} started a deal on “${p.title}”`,
          link: routes.workspace.chat(c.id),
        });
      }
      return id;
    });
    done(c.id);
    return { ok: true, dealId };
  } catch (error) {
    console.error("[deals] could not start:", causeOf(error));
    return { ok: false, error: "We could not start the deal. Please try again." };
  }
}

// ── 2. Stage (owner only; "active partner" comes from both confirming) ───────

const STAGE_ORDER = ["in_discussion", "due_diligence", "agreement"] as const;

export async function setDealStageAction(input: {
  dealId: string;
  stage: string;
}): Promise<Result> {
  const ctx = await me();
  if (!ctx) return { ok: false, error: "Sign in with a verified organisation." };
  const parsed = z.object({ dealId: UUID, stage: z.enum(STAGE_ORDER) }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "Choose a stage." };
  const d = await myDeal(ctx.org.id, parsed.data.dealId);
  if (!d) return { ok: false, error: "Deal not found." };
  if (d.ownerOrgId !== ctx.org.id)
    return { ok: false, error: "Only the project owner can change the stage." };
  if (d.stage === "active_partner" || d.stage === "closed")
    return { ok: false, error: "This deal is already finished." };
  await db.transaction(async (tx) => {
    await tx
      .update(deals)
      .set({ stage: parsed.data.stage, updatedAt: new Date() })
      .where(eq(deals.id, d.id));
    await audit(tx, ctx.user.id, "deal.stage", "deal", d.id, { stage: parsed.data.stage });
    await notifyOrg(tx, d.partnerOrgId, {
      kind: "deal_stage",
      title: `${ctx.org.name} moved your deal to ${parsed.data.stage.replace("_", " ")}`,
      link: routes.workspace.dealChat(d.conversationId),
    });
  });
  done();
  return { ok: true };
}

// ── 3. Private notes (one per organisation per deal) ─────────────────────────

export async function saveDealNoteAction(input: { dealId: string; body: string }): Promise<Result> {
  const ctx = await me();
  if (!ctx) return { ok: false, error: "Sign in again." };
  const parsed = z.object({ dealId: UUID, body: z.string().max(4000) }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "Use 4000 characters or fewer." };
  const d = await myDeal(ctx.org.id, parsed.data.dealId);
  if (!d) return { ok: false, error: "Deal not found." };
  await db.transaction(async (tx) => {
    await tx
      .delete(dealNotes)
      .where(and(eq(dealNotes.dealId, d.id), eq(dealNotes.orgId, ctx.org.id)));
    if (parsed.data.body.trim()) {
      await tx.insert(dealNotes).values({
        dealId: d.id,
        orgId: ctx.org.id,
        body: parsed.data.body.trim(),
        createdBy: ctx.user.id,
      });
    }
  });
  return { ok: true };
}

// ── 4. Collaboration request (owner → partner) ───────────────────────────────

export async function sendCollabRequestAction(input: {
  dealId: string;
  message: string;
}): Promise<Result> {
  const ctx = await me();
  if (!ctx) return { ok: false, error: "Sign in with a verified organisation." };
  const parsed = z.object({ dealId: UUID, message: z.string().trim().max(1000) }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "Use 1000 characters or fewer." };
  const d = await myDeal(ctx.org.id, parsed.data.dealId);
  if (!d) return { ok: false, error: "Deal not found." };
  if (d.ownerOrgId !== ctx.org.id)
    return { ok: false, error: "Only the project owner sends the request." };
  const [partner] = await db
    .select({ id: partnerships.id })
    .from(partnerships)
    .where(eq(partnerships.dealId, d.id));
  if (partner) return { ok: false, error: "This deal already has a partnership." };
  try {
    await db.transaction(async (tx) => {
      const [row] = await tx
        .insert(collaborationRequests)
        .values({
          dealId: d.id,
          role: d.role,
          status: "requested",
          ownerNote: parsed.data.message || null,
          sentBy: ctx.user.id,
        })
        .returning({ id: collaborationRequests.id });
      await audit(tx, ctx.user.id, "collab.requested", "collaboration_request", row!.id);
      await notifyOrg(tx, d.partnerOrgId, {
        kind: "collab_requested",
        title: `${ctx.org.name} sent you a collaboration request`,
        body: parsed.data.message
          ? `“${parsed.data.message}”`
          : `Fill in your offer as ${labelFor(LOOKING_FOR, d.role).toLowerCase()}.`,
        link: routes.workspace.dealChat(d.conversationId),
      });
    });
  } catch (error) {
    const cause = causeOf(error);
    if (cause.includes("collab_requests_one_open"))
      return { ok: false, error: "A request is already open for this deal." };
    console.error("[collab] could not request:", cause);
    return { ok: false, error: "We could not send the request. Please try again." };
  }
  done();
  return { ok: true };
}

// ── 5. Partner submits the offer (new version each time) ─────────────────────

export async function submitOfferAction(input: {
  requestId: string;
  form: unknown;
}): Promise<Result> {
  const ctx = await me();
  if (!ctx) return { ok: false, error: "Sign in with a verified organisation." };
  if (!UUID.safeParse(input.requestId).success) return { ok: false, error: "Request not found." };
  const [r] = await db
    .select()
    .from(collaborationRequests)
    .where(eq(collaborationRequests.id, input.requestId));
  if (!r) return { ok: false, error: "Request not found." };
  const d = await myDeal(ctx.org.id, r.dealId);
  if (!d || d.partnerOrgId !== ctx.org.id)
    return { ok: false, error: "Only the partner fills in the offer." };
  if (r.status !== "requested" && r.status !== "changes_requested")
    return { ok: false, error: "This offer can't be changed now." };
  const form = offerSchema(r.role).safeParse(input.form);
  if (!form.success)
    return { ok: false, error: form.error.issues[0]?.message ?? "Check the form." };
  const version = r.version + 1;
  const now = new Date();
  await db.transaction(async (tx) => {
    await tx
      .update(collaborationRequests)
      .set({
        status: "submitted",
        form: form.data,
        version,
        submittedBy: ctx.user.id,
        submittedAt: now,
      })
      .where(eq(collaborationRequests.id, r.id));
    await tx
      .insert(collaborationRequestVersions)
      .values({ requestId: r.id, version, form: form.data, submittedBy: ctx.user.id });
    await audit(tx, ctx.user.id, "collab.submitted", "collaboration_request", r.id, { version });
    await notifyOrg(tx, d.ownerOrgId, {
      kind: "collab_submitted",
      title: `${ctx.org.name} sent their offer${version > 1 ? ` (version ${version})` : ""}`,
      body: "Review it and accept or ask for changes.",
      link: routes.workspace.dealChat(d.conversationId),
    });
  });
  done();
  return { ok: true };
}

// ── 6. Owner reviews: accept (→ partnership awaiting confirmation) or changes ─

export async function reviewOfferAction(input: {
  requestId: string;
  decision: "accept" | "changes";
  note?: string;
}): Promise<Result> {
  const ctx = await me();
  if (!ctx) return { ok: false, error: "Sign in with a verified organisation." };
  const parsed = z
    .object({
      requestId: UUID,
      decision: z.enum(["accept", "changes"]),
      note: z.string().trim().max(1000).optional().default(""),
    })
    .refine((v) => v.decision === "accept" || v.note.length >= 5, {
      message: "Tell them what to change.",
    })
    .safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form." };
  const [r] = await db
    .select()
    .from(collaborationRequests)
    .where(eq(collaborationRequests.id, parsed.data.requestId));
  if (!r) return { ok: false, error: "Request not found." };
  const d = await myDeal(ctx.org.id, r.dealId);
  if (!d || d.ownerOrgId !== ctx.org.id)
    return { ok: false, error: "Only the project owner reviews the offer." };
  if (r.status !== "submitted") return { ok: false, error: "This offer was already reviewed." };
  const now = new Date();
  const form = (r.form ?? {}) as Record<string, string | string[]>;
  await db.transaction(async (tx) => {
    if (parsed.data.decision === "changes") {
      await tx
        .update(collaborationRequests)
        .set({ status: "changes_requested", ownerNote: parsed.data.note, reviewedAt: now })
        .where(eq(collaborationRequests.id, r.id));
      await audit(tx, ctx.user.id, "collab.changes", "collaboration_request", r.id);
      await notifyOrg(tx, d.partnerOrgId, {
        kind: "collab_changes",
        title: `${ctx.org.name} asked for changes to your offer`,
        body: `“${parsed.data.note}”`,
        link: routes.workspace.dealChat(d.conversationId),
      });
      return;
    }
    await tx
      .update(collaborationRequests)
      .set({ status: "accepted", reviewedAt: now })
      .where(eq(collaborationRequests.id, r.id));
    const amount = CAPITAL_OFFER_ROLES.includes(r.role) ? moneyValue(form.amount) : null;
    await tx.insert(partnerships).values({
      dealId: d.id,
      requestId: r.id,
      projectId: d.projectId,
      ownerOrgId: d.ownerOrgId,
      partnerOrgId: d.partnerOrgId,
      role: r.role,
      amount,
      status: "awaiting_confirmation",
    });
    await tx.update(deals).set({ stage: "agreement", updatedAt: now }).where(eq(deals.id, d.id));
    await audit(tx, ctx.user.id, "collab.accepted", "collaboration_request", r.id);
    await notifyOrg(tx, d.partnerOrgId, {
      kind: "collab_accepted",
      title: `${ctx.org.name} accepted your offer`,
      body: "Sign your agreement, then confirm the partnership.",
      link: routes.workspace.dealChat(d.conversationId),
    });
  });
  done();
  return { ok: true };
}

// ── 7. Both confirm → partnership active ─────────────────────────────────────

export async function confirmPartnershipAction(input: {
  partnershipId: string;
  amountPublic?: boolean;
}): Promise<Result<{ active: boolean }>> {
  const ctx = await me();
  if (!ctx) return { ok: false, error: "Sign in with a verified organisation." };
  if (!UUID.safeParse(input.partnershipId).success)
    return { ok: false, error: "Partnership not found." };
  const [p] = await db.select().from(partnerships).where(eq(partnerships.id, input.partnershipId));
  if (!p || (p.ownerOrgId !== ctx.org.id && p.partnerOrgId !== ctx.org.id))
    return { ok: false, error: "Partnership not found." };
  if (p.status !== "awaiting_confirmation")
    return { ok: false, error: "This partnership is already confirmed." };
  const isOwner = p.ownerOrgId === ctx.org.id;
  const now = new Date();

  const active = await db.transaction(async (tx) => {
    const set = isOwner
      ? {
          ownerConfirmedAt: now,
          ownerConfirmedBy: ctx.user.id,
          ...(typeof input.amountPublic === "boolean" ? { amountPublic: input.amountPublic } : {}),
        }
      : { partnerConfirmedAt: now, partnerConfirmedBy: ctx.user.id };
    const [u] = await tx.update(partnerships).set(set).where(eq(partnerships.id, p.id)).returning();
    const bothConfirmed = Boolean(u?.ownerConfirmedAt && u?.partnerConfirmedAt);
    const [d] = await tx.select().from(deals).where(eq(deals.id, p.dealId));
    const other = isOwner ? p.partnerOrgId : p.ownerOrgId;

    if (!bothConfirmed) {
      await audit(tx, ctx.user.id, "partnership.confirmed", "partnership", p.id);
      await notifyOrg(tx, other, {
        kind: "partnership_confirm",
        title: `${ctx.org.name} confirmed the partnership`,
        body: "Confirm on your side to make it live.",
        link: d ? routes.workspace.dealChat(d.conversationId) : routes.workspace.network,
      });
      return false;
    }

    await tx
      .update(partnerships)
      .set({ status: "active", activatedAt: now })
      .where(eq(partnerships.id, p.id));
    await tx
      .update(deals)
      .set({ stage: "active_partner", updatedAt: now })
      .where(eq(deals.id, p.dealId));
    // Capital: add the amount to the project's raised total.
    if (p.amount && CAPITAL_OFFER_ROLES.includes(p.role)) {
      await tx
        .update(projects)
        .set({ capitalRaised: sql`${projects.capitalRaised} + ${p.amount}`, updatedAt: now })
        .where(eq(projects.id, p.projectId));
    }
    // "Found" on Looking for: capital roles only when the target is reached.
    const [proj] = await tx
      .select({
        needed: projects.capitalNeeded,
        raised: projects.capitalRaised,
        own: projects.ownFunds,
        title: projects.title,
      })
      .from(projects)
      .where(eq(projects.id, p.projectId));
    const capitalDone = !proj?.needed || proj.raised + proj.own >= proj.needed;
    const roles = CAPITAL_OFFER_ROLES.includes(p.role)
      ? capitalDone
        ? CAPITAL_OFFER_ROLES
        : []
      : [p.role];
    if (roles.length) {
      await tx
        .update(projectNeeds)
        .set({ status: "found", foundAt: now })
        .where(and(eq(projectNeeds.projectId, p.projectId), inArray(projectNeeds.role, roles)));
    }
    await audit(tx, ctx.user.id, "partnership.active", "partnership", p.id);
    for (const orgId of [p.ownerOrgId, p.partnerOrgId]) {
      await notifyOrg(tx, orgId, {
        kind: "partnership_active",
        title: `Partnership is live: “${proj?.title ?? "your project"}”`,
        body: "It now shows on the project page and both profiles.",
        link: d ? routes.workspace.dealChat(d.conversationId) : routes.workspace.network,
      });
    }
    return true;
  });
  done();
  return { ok: true, active };
}
