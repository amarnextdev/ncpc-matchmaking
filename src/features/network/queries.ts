import "server-only";
import { and, desc, eq, gt, inArray, or } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "@/db";
import { conversations, enquiries, files, organisations, projects } from "@/db/schema";
import { ORGANISATION_CATEGORIES, PROVINCES, labelFor, type LookingFor } from "@/lib/constants";
import { publicImageUrl } from "@/lib/storage/url";
import { initials } from "@/lib/utils";

export type NetworkOrg = {
  slug: string;
  name: string;
  initials: string;
  logoUrl: string | null;
  meta: string;
  verified: boolean;
};

export type Invitation = {
  id: string;
  org: NetworkOrg;
  role: LookingFor;
  project: string | null;
  note: string | null;
  createdAt: string;
  expiresAt: string;
};

export type Connection = {
  conversationId: string;
  org: NetworkOrg;
  since: string;
  via: string | null;
};

export type HistoryItem = {
  id: string;
  org: NetworkOrg;
  role: LookingFor;
  project: string | null;
  status: "declined" | "expired" | "withdrawn";
  sentByMe: boolean;
  at: string;
};

export type NetworkData = {
  received: Invitation[];
  sent: Invitation[];
  connections: Connection[];
  history: HistoryItem[];
};

type OrgRow = typeof organisations.$inferSelect;

async function logos(orgs: OrgRow[]) {
  const ids = orgs.map((o) => o.logoFileId).filter((v): v is string => Boolean(v));
  if (!ids.length) return new Map<string, string>();
  const rows = await db
    .select({ id: files.id, path: files.path })
    .from(files)
    .where(inArray(files.id, ids));
  return new Map(rows.map((r) => [r.id, publicImageUrl(r.path)]));
}

function toOrg(o: OrgRow, logo: Map<string, string>): NetworkOrg {
  return {
    slug: o.slug,
    name: o.name,
    initials: initials(o.name),
    logoUrl: o.logoFileId ? (logo.get(o.logoFileId) ?? null) : null,
    meta: [
      labelFor(ORGANISATION_CATEGORIES, o.category),
      [o.city, o.province ? labelFor(PROVINCES, o.province) : null].filter(Boolean).join(", "),
    ]
      .filter(Boolean)
      .join(" · "),
    verified: o.status === "approved",
  };
}

/** Everything on the Network page for one organisation. */
export async function getNetwork(orgId: string): Promise<NetworkData> {
  const other = alias(organisations, "other");
  const now = new Date();

  const [rows, convs] = await Promise.all([
    db
      .select({ e: enquiries, from: organisations, to: other, projectTitle: projects.title })
      .from(enquiries)
      .innerJoin(organisations, eq(organisations.id, enquiries.fromOrgId))
      .innerJoin(other, eq(other.id, enquiries.toOrgId))
      .leftJoin(projects, eq(projects.id, enquiries.projectId))
      .where(or(eq(enquiries.fromOrgId, orgId), eq(enquiries.toOrgId, orgId)))
      .orderBy(desc(enquiries.createdAt))
      .limit(200),
    db
      .select({ c: conversations, org: organisations })
      .from(conversations)
      .innerJoin(
        organisations,
        or(
          and(eq(conversations.orgAId, orgId), eq(organisations.id, conversations.orgBId)),
          and(eq(conversations.orgBId, orgId), eq(organisations.id, conversations.orgAId)),
        ),
      )
      .orderBy(desc(conversations.createdAt)),
  ]);

  const logo = await logos([...rows.flatMap((r) => [r.from, r.to]), ...convs.map((c) => c.org)]);
  const received: Invitation[] = [];
  const sent: Invitation[] = [];
  const history: HistoryItem[] = [];

  for (const { e, from, to, projectTitle } of rows) {
    const mine = e.fromOrgId === orgId;
    const otherOrg = toOrg(mine ? to : from, logo);
    const expired = e.status === "expired" || (e.status === "pending" && e.expiresAt <= now);
    if (e.status === "pending" && !expired) {
      (mine ? sent : received).push({
        id: e.id,
        org: otherOrg,
        role: e.role,
        project: projectTitle,
        note: e.note,
        createdAt: e.createdAt.toISOString(),
        expiresAt: e.expiresAt.toISOString(),
      });
    } else if (expired || e.status === "declined" || e.status === "withdrawn") {
      history.push({
        id: e.id,
        org: otherOrg,
        role: e.role,
        project: projectTitle,
        status: expired ? "expired" : (e.status as "declined" | "withdrawn"),
        sentByMe: mine,
        at: (e.respondedAt ?? (expired ? e.expiresAt : e.createdAt)).toISOString(),
      });
    }
  }

  const accepted = rows.filter((r) => r.e.status === "accepted");
  const connections: Connection[] = convs.map(({ c, org }) => {
    const via = accepted.find(
      (r) => (r.e.fromOrgId === org.id || r.e.toOrgId === org.id) && r.projectTitle,
    )?.projectTitle;
    return {
      conversationId: c.id,
      org: toOrg(org, logo),
      since: c.createdAt.toISOString(),
      via: via ?? null,
    };
  });

  return { received, sent, connections, history };
}

/** Pending, not expired invitations this organisation received (header badge). */
export async function countReceived(orgId: string) {
  const rows = await db
    .select({ id: enquiries.id })
    .from(enquiries)
    .where(
      and(
        eq(enquiries.toOrgId, orgId),
        eq(enquiries.status, "pending"),
        gt(enquiries.expiresAt, new Date()),
      ),
    );
  return rows.length;
}
