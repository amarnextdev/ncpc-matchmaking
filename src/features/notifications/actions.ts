"use server";

import { and, eq, inArray, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { getSessionUser } from "@/lib/auth/session";

/** Marks some (ids) or all of the person's notifications as read. */
export async function markNotificationsReadAction(ids?: string[]): Promise<{ ok: boolean }> {
  const user = await getSessionUser();
  if (!user) return { ok: false };
  const list = z
    .array(z.string().uuid())
    .max(100)
    .safeParse(ids ?? []);
  if (!list.success) return { ok: false };
  try {
    await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(notifications.userId, user.id),
          isNull(notifications.readAt),
          ...(list.data.length ? [inArray(notifications.id, list.data)] : []),
        ),
      );
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
