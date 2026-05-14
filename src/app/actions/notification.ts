"use server";

import { getServerSession } from "@/lib/get-server-session";
import { db } from "@/db";
import { notification } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type NotificationType =
  | "taaruf_request_received"
  | "taaruf_request_accepted"
  | "taaruf_request_declined"
  | "taaruf_request_expired"
  | "taaruf_ended"
  | "cv_approved"
  | "cv_rejected";

export interface NotificationData {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  read: boolean;
  createdAt: Date;
}

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  body: string,
  data?: Record<string, unknown>
) {
  const id = crypto.randomUUID();
  await db.insert(notification).values({
    id,
    userId,
    type,
    title,
    body,
    data: data ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return id;
}

export async function getNotifications(
  limit = 50,
  offset = 0
): Promise<{ data?: NotificationData[]; error?: string }> {
  const session = await getServerSession();
  if (!session?.user?.id) return { error: "Sesi tidak ditemukan." };

  const rows = await db
    .select()
    .from(notification)
    .where(eq(notification.userId, session.user.id))
    .orderBy(desc(notification.createdAt))
    .limit(limit)
    .offset(offset);

  return { data: rows as NotificationData[] };
}

export async function getUnreadNotificationCount(): Promise<number> {
  const session = await getServerSession();
  if (!session?.user?.id) return 0;

  const row = await db
    .select({ count: db.$count(notification, and(
      eq(notification.userId, session.user.id),
      eq(notification.read, false)
    )) })
    .from(notification);

  return row[0]?.count ?? 0;
}

export async function markNotificationRead(notificationId: string) {
  const session = await getServerSession();
  if (!session?.user?.id) return { error: "Sesi tidak ditemukan." };

  await db
    .update(notification)
    .set({ read: true, updatedAt: new Date() })
    .where(
      and(
        eq(notification.id, notificationId),
        eq(notification.userId, session.user.id)
      )
    );

  revalidatePath("/notifications");
  return { success: true };
}

export async function markAllNotificationsRead() {
  const session = await getServerSession();
  if (!session?.user?.id) return { error: "Sesi tidak ditemukan." };

  await db
    .update(notification)
    .set({ read: true, updatedAt: new Date() })
    .where(
      and(
        eq(notification.userId, session.user.id),
        eq(notification.read, false)
      )
    );

  revalidatePath("/notifications");
  return { success: true };
}
