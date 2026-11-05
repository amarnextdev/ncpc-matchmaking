import "server-only";
import { cache } from "react";
import { and, asc, desc, eq, inArray, isNull, or } from "drizzle-orm";
import { authUsers } from "drizzle-orm/supabase";
import { db } from "@/db";
import {
  collaborationRequests,
  conversationReads,
  conversations,
  dealNotes,
  deals as dealsTable,
  enquiries,
  messages,
  organisationMembers,
  organisations,
  partnerships,
  profiles,
  projects,
} from "@/db/schema";
import { PROVINCES, labelFor } from "@/lib/constants";
import { initials } from "@/lib/utils";
import type { Conversation, Deal, DealLive, Message, Party } from "./types";

const timeFmt = new Intl.DateTimeFormat("en-ZA", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Africa/Johannesburg",
});
const dayFmt = new Intl.DateTimeFormat("en-ZA", {
  day: "numeric",
  month: "short",
  timeZone: "Africa/Johannesburg",
});

/** "14:20" today, "Yesterday", else "3 Nov". */
export function shortWhen(d: Date) {
  const today = new Date();
  const same = (a: Date, b: Date) => dayFmt.format(a) === dayFmt.format(b);
  if (same(d, today)) return timeFmt.format(d);
  const y = new Date(today.getTime() - 86_400_000);
  if (same(d, y)) return "Yesterday";
  return dayFmt.format(d);
}

/** "Today", "Yesterday" or "3 Nov" (divider labels). */
function dayLabel(d: Date) {
  const w = shortWhen(d);
  return /^\d{2}:\d{2}$/.test(w) ? "Today" : w;
}

type OrgRow = typeof organisations.$inferSelect;

async function partiesFor(orgs: OrgRow[]): Promise<Map<string, Party>> {
  const ids = orgs.map((o) => o.id);
  // Contact: the organisation owner (first member).
  const contacts = ids.length
    ? await db
        .select({
          orgId: organisationMembers.orgId,
          role: organisationMembers.role,
          name: profiles.fullName,
          jobTitle: profiles.jobTitle,
          phone: profiles.phone,
          email: authUsers.email,
        })
        .from(organisationMembers)
        .innerJoin(profiles, eq(profiles.id, organisationMembers.userId))
        .innerJoin(authUsers, eq(authUsers.id, organisationMembers.userId))
        .where(inArray(organisationMembers.orgId, ids))
        .orderBy(asc(organisationMembers.createdAt))
    : [];
  return new Map(
    orgs.map((o) => {
      const c =
        contacts.find((x) => x.orgId === o.id && x.role === "owner") ??
        contacts.find((x) => x.orgId === o.id);
      return [
        o.id,
        {
          orgId: o.id,
          slug: o.slug,
          name: o.name,
          initials: initials(o.name),
          tint: "#13336B",
          category: o.category,
          location: [o.city, o.province ? labelFor(PROVINCES, o.province) : null]
            .filter(Boolean)
            .join(", "),
          verified: o.status === "approved",
          contact: {
            name: c?.name ?? "",
            role: c?.jobTitle ?? "",
            email: c?.email ?? "",
            phone: c?.phone ?? "",
          },
        } satisfies Party,
      ];
    }),
  );
}

/**
 * Conversations of a database organisation (by slug), shaped like the demo data so the
 * Messages page and the dock render them unchanged. null = not a database organisation.
 */
export const getDbConversations = cache(
  async (orgSlug: string, userId: string | null): Promise<Conversation[] | null> => {
    if (!process.env.DATABASE_URL) return null;
    try {
      const [me] = await db.select().from(organisations).where(eq(organisations.slug, orgSlug));
      if (!me) return null;

      const convs = await db
        .select()
        .from(conversations)
        .where(or(eq(conversations.orgAId, me.id), eq(conversations.orgBId, me.id)))
        .orderBy(desc(conversations.lastMessageAt));
      if (!convs.length) return [];

      const ids = convs.map((c) => c.id);
      const otherIds = convs.map((c) => (c.orgAId === me.id ? c.orgBId : c.orgAId));
      const [others, msgs, opened, reads] = await Promise.all([
        db.select().from(organisations).where(inArray(organisations.id, otherIds)),
        db
          .select({ m: messages, person: profiles.fullName })
          .from(messages)
          .leftJoin(profiles, eq(profiles.id, messages.senderUserId))
          .where(and(inArray(messages.conversationId, ids), isNull(messages.removedAt)))
          .orderBy(asc(messages.createdAt)),
        db
          .select({ e: enquiries, projectTitle: projects.title, projectSlug: projects.slug })
          .from(enquiries)
          .leftJoin(projects, eq(projects.id, enquiries.projectId))
          .where(
            and(
              eq(enquiries.status, "accepted"),
              or(eq(enquiries.fromOrgId, me.id), eq(enquiries.toOrgId, me.id)),
            ),
          ),
        db
          .select({
            conversationId: conversationReads.conversationId,
            userId: conversationReads.userId,
            orgId: organisationMembers.orgId,
            lastReadAt: conversationReads.lastReadAt,
          })
          .from(conversationReads)
          .innerJoin(organisationMembers, eq(organisationMembers.userId, conversationReads.userId))
          .where(inArray(conversationReads.conversationId, ids)),
      ]);
      const parties = await partiesFor([me, ...others]);

      // Collaboration state per deal.
      const dealRows = await db
        .select()
        .from(dealsTable)
        .where(inArray(dealsTable.conversationId, ids));
      const dealIds = dealRows.map((d) => d.id);
      const [reqRows, partRows, noteRows] = dealIds.length
        ? await Promise.all([
            db
              .select()
              .from(collaborationRequests)
              .where(inArray(collaborationRequests.dealId, dealIds))
              .orderBy(desc(collaborationRequests.createdAt)),
            db.select().from(partnerships).where(inArray(partnerships.dealId, dealIds)),
            db
              .select()
              .from(dealNotes)
              .where(and(inArray(dealNotes.dealId, dealIds), eq(dealNotes.orgId, me.id))),
          ])
        : [[], [], []];
      const mine = parties.get(me.id)!;

      return convs.flatMap((c): Conversation[] => {
        const otherId = c.orgAId === me.id ? c.orgBId : c.orgAId;
        const them = parties.get(otherId);
        if (!them) return [];
        const list = msgs.filter((x) => x.m.conversationId === c.id);
        const lastRead =
          reads.find((r) => r.conversationId === c.id && r.userId === userId)?.lastReadAt ??
          new Date(0);
        // When anyone on the other side last opened this chat (→ "Seen").
        const theirRead = reads
          .filter((r) => r.conversationId === c.id && r.orgId === otherId)
          .reduce<Date | null>((max, r) => (!max || r.lastReadAt > max ? r.lastReadAt : max), null);
        const unread = list.filter(
          (x) => x.m.senderOrgId !== me.id && x.m.createdAt > lastRead,
        ).length;

        // Posts with day dividers, plus the "connected" event when the enquiry was accepted.
        const opener = opened.find((o) => o.e.id === c.openedByEnquiryId)?.e;
        type Item = { at: Date; msg: Message };
        const items: Item[] = list.map(({ m, person }) => {
          const isMine = m.senderOrgId === me.id;
          const seen = Boolean(theirRead && theirRead >= m.createdAt);
          return {
            at: m.createdAt,
            msg: {
              id: m.id,
              kind: "post",
              from: isMine ? mine.slug : them.slug,
              person: person ?? "",
              time: timeFmt.format(m.createdAt),
              text: m.body,
              ...(isMine ? { status: seen ? ("seen" as const) : ("sent" as const) } : {}),
            },
          };
        });
        if (opener?.respondedAt) {
          const acceptedBy = opener.toOrgId === me.id ? "You" : them.name;
          items.push({
            at: opener.respondedAt,
            msg: {
              id: `connected-${c.id}`,
              kind: "event",
              icon: "link",
              tone: "green",
              title: `${acceptedBy} accepted the enquiry.`,
              text: "You are now connected.",
            },
          });
        }
        for (const d of dealRows.filter((x) => x.conversationId === c.id)) {
          const title =
            opened.find((o) => o.e.projectId === d.projectId)?.projectTitle ?? "the project";
          const ev = (
            id: string,
            at: Date | null | undefined,
            text: string,
            tone: "green" | "blue" = "blue",
          ) => {
            if (at)
              items.push({
                at,
                msg: { id, kind: "event", icon: "check", tone, title: text, text: "" },
              });
          };
          ev(`ds-${d.id}`, d.createdAt, `Deal started on ${title}.`);
          for (const r of reqRows.filter((x) => x.dealId === d.id)) {
            ev(`rq-${r.id}`, r.createdAt, "Collaboration request sent.");
            if (r.submittedAt)
              ev(
                `rs-${r.id}`,
                r.submittedAt,
                `Offer sent${r.version > 1 ? ` (version ${r.version})` : ""}.`,
              );
            if (r.reviewedAt)
              ev(
                `rr-${r.id}`,
                r.reviewedAt,
                r.status === "accepted" ? "Offer accepted." : "Changes requested.",
                r.status === "accepted" ? "green" : "blue",
              );
          }
          const part = partRows.find((x) => x.dealId === d.id);
          if (part?.activatedAt)
            ev(`pa-${part.id}`, part.activatedAt, "Partnership is live.", "green");
        }
        items.sort((a, b) => a.at.getTime() - b.at.getTime());
        const msgView: Message[] = [];
        let lastDay = "";
        for (const it of items) {
          const day = dayLabel(it.at);
          if (day !== lastDay) {
            msgView.push({ id: `d-${c.id}-${it.at.getTime()}`, kind: "divider", text: day });
            lastDay = day;
          }
          msgView.push(it.msg);
        }

        // One deal per accepted enquiry between the two (about a project, or general).
        const deals: Deal[] = opened
          .filter(
            ({ e }) =>
              (e.fromOrgId === me.id && e.toOrgId === otherId) ||
              (e.toOrgId === me.id && e.fromOrgId === otherId),
          )
          .map(({ e, projectTitle, projectSlug }): Deal => {
            const row = e.projectId
              ? dealRows.find((d) => d.conversationId === c.id && d.projectId === e.projectId)
              : undefined;
            // Owner = the organisation whose project it is (falls back to the enquiry's target).
            const ownerIsMe = row ? row.ownerOrgId === me.id : e.toOrgId === me.id;
            const ownerSlug = ownerIsMe ? mine.slug : them.slug;
            const partnerSlug = ownerIsMe ? them.slug : mine.slug;
            const req = row ? reqRows.find((r) => r.dealId === row.id) : undefined;
            const part = row ? partRows.find((x) => x.dealId === row.id) : undefined;
            const live: DealLive = {
              enquiryId: e.id,
              dealId: row?.id ?? null,
              projectId: e.projectId,
              isOwner: ownerIsMe,
              myNote: row ? (noteRows.find((n) => n.dealId === row.id)?.body ?? "") : "",
              request: req
                ? {
                    id: req.id,
                    status: req.status,
                    ownerNote: req.ownerNote,
                    version: req.version,
                    form: (req.form as Record<string, string | string[]> | null) ?? null,
                    submittedAt: req.submittedAt?.toISOString() ?? null,
                  }
                : null,
              partnership: part
                ? {
                    id: part.id,
                    status: part.status,
                    amount: part.amount,
                    amountPublic: part.amountPublic,
                    ownerConfirmedAt: part.ownerConfirmedAt?.toISOString() ?? null,
                    partnerConfirmedAt: part.partnerConfirmedAt?.toISOString() ?? null,
                  }
                : null,
            };
            const stage: Deal["stage"] = !row
              ? "not_started"
              : row.stage === "active_partner" || row.stage === "closed"
                ? "active"
                : row.stage;
            return {
              id: row?.id ?? `enq-${e.id}`,
              projectTitle: projectTitle ?? "General enquiry",
              projectSlug: projectSlug ?? null,
              ownerSlug,
              partnerSlug,
              role: e.role,
              stage,
              documents: [],
              meetings: [],
              terms: [],
              termsNote: "",
              notes: {},
              live,
            };
          });
        if (!deals.length) {
          deals.push({
            id: `general-${c.id}`,
            projectTitle: "General enquiry",
            projectSlug: null,
            ownerSlug: them.slug,
            partnerSlug: mine.slug,
            role: "investor",
            stage: "not_started",
            documents: [],
            meetings: [],
            terms: [],
            termsNote: "",
            notes: {},
          });
        }

        return [
          {
            id: c.id,
            parties: [mine, them],
            lastAt: c.lastMessageAt ? shortWhen(c.lastMessageAt) : shortWhen(c.createdAt),
            unread: { [mine.slug]: unread },
            messages: msgView,
            deals,
          },
        ];
      });
    } catch (error) {
      console.error(
        "[messages] could not load conversations:",
        error instanceof Error && error.cause instanceof Error ? error.cause.message : error,
      );
      return null;
    }
  },
);
