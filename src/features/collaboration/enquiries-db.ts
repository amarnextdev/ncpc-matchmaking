import "server-only";
import { cache } from "react";
import { and, desc, eq, gt } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "@/db";
import { enquiries, organisations, projects } from "@/db/schema";
import { PROVINCES, labelFor } from "@/lib/constants";
import { initials } from "@/lib/utils";
import type { EnquiryRequest } from "./types";

function ago(d: Date) {
  const mins = Math.max(0, Math.floor((Date.now() - d.getTime()) / 60_000));
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h} h ago`;
  const days = Math.floor(h / 24);
  return days === 1 ? "Yesterday" : `${days} days ago`;
}

/**
 * Pending, not expired enquiries to an organisation (by slug). Returns null when the slug is not
 * a database organisation (demo data), [] when there are none.
 */
export const getReceivedEnquiries = cache(
  async (orgSlug: string): Promise<EnquiryRequest[] | null> => {
    if (!process.env.DATABASE_URL) return null;
    try {
      const [me] = await db
        .select({ id: organisations.id })
        .from(organisations)
        .where(eq(organisations.slug, orgSlug));
      if (!me) return null;
      const sender = alias(organisations, "sender");
      const rows = await db
        .select({
          e: enquiries,
          from: sender,
          projectTitle: projects.title,
        })
        .from(enquiries)
        .innerJoin(sender, eq(sender.id, enquiries.fromOrgId))
        .leftJoin(projects, eq(projects.id, enquiries.projectId))
        .where(
          and(
            eq(enquiries.toOrgId, me.id),
            eq(enquiries.status, "pending"),
            gt(enquiries.expiresAt, new Date()),
          ),
        )
        .orderBy(desc(enquiries.createdAt))
        .limit(50);
      return rows.map(({ e, from, projectTitle }) => ({
        id: e.id,
        from: {
          slug: from.slug,
          name: from.name,
          initials: initials(from.name),
          tint: "#13336B",
          category: from.category,
          location: [from.city, from.province ? labelFor(PROVINCES, from.province) : null]
            .filter(Boolean)
            .join(", "),
          verified: from.status === "approved",
          contact: { name: "", role: "", email: "", phone: "" },
        },
        project: projectTitle ?? "General enquiry",
        role: e.role,
        note: e.note ?? "",
        sentAgo: ago(e.createdAt),
        match: e.matchScore ?? 0,
      }));
    } catch (error) {
      console.error(
        "[enquiries] could not load received:",
        error instanceof Error && error.cause instanceof Error ? error.cause.message : error,
      );
      return null;
    }
  },
);
