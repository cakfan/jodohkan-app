"use server";

import { getServerSession } from "@/lib/get-server-session";
import { db } from "@/db";
import { notification, user } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email";
import { getNotificationEmailHtml } from "@/lib/email-templates/notification";

export type NotificationType =
  | "taaruf_request_received"
  | "taaruf_request_accepted"
  | "taaruf_request_declined"
  | "taaruf_request_expired"
  | "taaruf_ended"
  | "cv_approved"
  | "cv_rejected"
  | "nadzor_activated"
  | "nadzor_scheduled"
  | "nadzor_reminder"
  | "nadzor_feedback";

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

const notificationActionUrls: Record<NotificationType, string | null> = {
  taaruf_request_received: "/taaruf",
  taaruf_request_accepted: "/taaruf",
  taaruf_request_declined: "/taaruf",
  taaruf_request_expired: "/taaruf",
  taaruf_ended: "/taaruf",
  cv_approved: "/profile",
  cv_rejected: "/profile",
  nadzor_activated: "/messages",
  nadzor_scheduled: "/messages",
  nadzor_reminder: "/messages",
  nadzor_feedback: "/messages",
};

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

  const [targetUser] = await db
    .select({ email: user.email, emailVerified: user.emailVerified })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (targetUser?.emailVerified) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://jodohkan.app";
    const actionPath = notificationActionUrls[type];
    const actionUrl = actionPath ? `${appUrl}${actionPath}` : null;
    const actionLabel = actionUrl ? "Buka Notifikasi" : null;

    await sendEmail(
      targetUser.email,
      `Jodohkan - ${title}`,
      getNotificationEmailHtml(title, body, actionLabel, actionUrl)
    );
  }

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
