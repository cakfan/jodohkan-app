import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { notification, user } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { sendEmail } from "@/lib/email";
import { getDigestEmailHtml } from "@/lib/email-templates/notification";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const unreadRows = await db
      .select({
        userId: notification.userId,
        userEmail: user.email,
        emailVerified: user.emailVerified,
        notificationId: notification.id,
        notificationTitle: notification.title,
        notificationBody: notification.body,
        notificationType: notification.type,
      })
      .from(notification)
      .innerJoin(user, eq(notification.userId, user.id))
      .where(eq(notification.read, false))
      .orderBy(desc(notification.createdAt));

    const grouped = new Map<
      string,
      {
        email: string;
        emailVerified: boolean;
        items: { title: string; body: string }[];
      }
    >();

    for (const row of unreadRows) {
      if (!grouped.has(row.userId)) {
        grouped.set(row.userId, {
          email: row.userEmail,
          emailVerified: row.emailVerified,
          items: [],
        });
      }
      grouped.get(row.userId)!.items.push({
        title: row.notificationTitle,
        body: row.notificationBody,
      });
    }

    const sent: string[] = [];
    const skipped: string[] = [];

    for (const [uid, group] of grouped) {
      if (!group.emailVerified || group.items.length === 0) {
        skipped.push(uid);
        continue;
      }

      await sendEmail(
        group.email,
        "Ringkasan Aktivitas - Jodohkan",
        getDigestEmailHtml(group.items, group.items.length)
      );

      sent.push(uid);
    }

    return NextResponse.json({
      sent: sent.length,
      skipped: skipped.length,
      totalUsers: grouped.size,
    });
  } catch (error) {
    console.error("Digest cron error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
