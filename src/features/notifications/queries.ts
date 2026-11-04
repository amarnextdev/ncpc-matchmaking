import "server-only";
import { and, count, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { notifications } from "@/db/schema";

export type BellItem = {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
};

export type BellData = { items: BellItem[]; unread: number };

/** Latest notifications + unread count for the header bell. Never breaks the page. */
export async function getBellData(userId: string, limit = 8): Promise<BellData> {
  if (!process.env.DATABASE_URL) return { items: [], unread: 0 };
  try {
    const [rows, [unread]] = await Promise.all([
      db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt))
        .limit(limit),
      db
        .select({ n: count() })
        .from(notifications)
        .where(and(eq(notifications.userId, userId), isNull(notifications.readAt))),
    ]);
    return {
      items: rows.map((r) => ({
        id: r.id,
        kind: r.kind,
        title: r.title,
        body: r.body,
        link: r.link,
        read: r.readAt !== null,
        createdAt: r.createdAt.toISOString(),
      })),
      unread: unread?.n ?? 0,
    };
  } catch (error) {
    console.error(
      "[notifications] could not load:",
      error instanceof Error && error.cause instanceof Error ? error.cause.message : error,
    );
    return { items: [], unread: 0 };
  }
}
