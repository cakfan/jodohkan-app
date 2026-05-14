"use server";

import { getServerSession } from "@/lib/get-server-session";
import { db } from "@/db";
import { taarufRequest, profile, user } from "@/db/schema";
import { eq, and, lt, inArray, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createTaarufChannel } from "./stream";
import { createNotification } from "./notification";

export async function isUserInActiveTaaruf(userId: string): Promise<boolean> {
  const rows = await db
    .select({ id: taarufRequest.id })
    .from(taarufRequest)
    .where(
      and(
        or(
          eq(taarufRequest.senderId, userId),
          eq(taarufRequest.recipientId, userId)
        ),
        eq(taarufRequest.status, "accepted")
      )
    )
    .limit(1);
  return rows.length > 0;
}

export async function getActiveTaarufPhase(
  userId: string
): Promise<{ active: boolean; phase: string | null }> {
  const row = await db
    .select({ phase: taarufRequest.phase })
    .from(taarufRequest)
    .where(
      and(
        or(
          eq(taarufRequest.senderId, userId),
          eq(taarufRequest.recipientId, userId)
        ),
        eq(taarufRequest.status, "accepted")
      )
    )
    .limit(1);
  if (row.length === 0) return { active: false, phase: null };
  return { active: true, phase: row[0].phase ?? "chat" };
}

export async function getActiveTaarufUserIds(): Promise<string[]> {
  const rows = await db
    .select({ userId: taarufRequest.senderId })
    .from(taarufRequest)
    .where(eq(taarufRequest.status, "accepted"));

  const recipientRows = await db
    .select({ userId: taarufRequest.recipientId })
    .from(taarufRequest)
    .where(eq(taarufRequest.status, "accepted"));

  const ids = new Set<string>();
  for (const r of rows) ids.add(r.userId);
  for (const r of recipientRows) ids.add(r.userId);
  return Array.from(ids);
}

async function expireStaleRequests() {
  await db
    .update(taarufRequest)
    .set({ status: "expired", updatedAt: new Date() })
    .where(
      and(
        eq(taarufRequest.status, "pending"),
        lt(taarufRequest.expiresAt, new Date())
      )
    );
}

export interface TaarufRequestData {
  id: string;
  senderId: string;
  recipientId: string;
  status: string;
  message: string | null;
  senderRead: boolean;
  recipientRead: boolean;
  createdAt: Date;
  expiresAt: Date;
  respondedAt: Date | null;
  senderName: string;
  senderUsername: string | null;
  recipientName: string;
  recipientUsername: string | null;
}

export async function sendTaarufRequest(recipientUserId: string, message?: string) {
  const session = await getServerSession();
  if (!session?.user?.id) return { error: "Sesi tidak ditemukan." };

  const senderId = session.user.id;

  if (senderId === recipientUserId) {
    return { error: "Tidak dapat mengirim ta'aruf ke diri sendiri." };
  }

  const myProfile = await db.query.profile.findFirst({
    where: eq(profile.userId, senderId),
    columns: { published: true, cvStatus: true },
  });

  if (!myProfile || myProfile.cvStatus !== "approved" || !myProfile.published) {
    return { error: "CV Anda harus sudah disetujui dan dipublikasikan untuk mengirim ta'aruf." };
  }

  const existingPending = await db.query.taarufRequest.findFirst({
    where: and(
      eq(taarufRequest.senderId, senderId),
      eq(taarufRequest.recipientId, recipientUserId),
      eq(taarufRequest.status, "pending")
    ),
  });

  if (existingPending) {
    return { error: "Anda sudah memiliki permintaan ta'aruf yang menunggu ke kandidat ini." };
  }

  if (await isUserInActiveTaaruf(senderId)) {
    return { error: "Anda sedang dalam proses ta'aruf aktif dengan user lain." };
  }

  if (await isUserInActiveTaaruf(recipientUserId)) {
    return { error: "Kandidat ini sedang dalam proses ta'aruf dengan user lain." };
  }

  await expireStaleRequests();

  const id = crypto.randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  await db.insert(taarufRequest).values({
    id,
    senderId,
    recipientId: recipientUserId,
    status: "pending",
    message: message ?? null,
    createdAt: now,
    expiresAt,
    updatedAt: now,
  });

  const sender = await db.query.user.findFirst({
    where: eq(user.id, senderId),
    columns: { name: true, username: true },
  });
  await createNotification(
    recipientUserId,
    "taaruf_request_received",
    "Permintaan Ta'aruf Baru",
    `@${sender?.username ?? senderId} mengirimkan permintaan ta'aruf untuk Anda.`,
    { requestId: id, senderId }
  );

  revalidatePath("/", "layout");
  return { success: true, id };
}

export async function respondToTaarufRequest(
  requestId: string,
  action: "accept" | "decline"
) {
  const session = await getServerSession();
  if (!session?.user?.id) return { error: "Sesi tidak ditemukan." };

  const request = await db.query.taarufRequest.findFirst({
    where: eq(taarufRequest.id, requestId),
  });

  if (!request) return { error: "Permintaan ta'aruf tidak ditemukan." };

  if (request.recipientId !== session.user.id) {
    return { error: "Anda bukan penerima permintaan ta'aruf ini." };
  }

  if (request.status !== "pending") {
    return { error: "Permintaan ta'aruf ini sudah direspons." };
  }

  const now = new Date();
  if (request.expiresAt < now) {
    await db
      .update(taarufRequest)
      .set({ status: "expired", updatedAt: now })
      .where(eq(taarufRequest.id, requestId));

    return { error: "Permintaan ta'aruf telah kadaluwarsa." };
  }

  if (action === "accept") {
    if (await isUserInActiveTaaruf(request.senderId)) {
      return { error: "Pengirim sudah dalam proses ta'aruf dengan user lain." };
    }
    if (await isUserInActiveTaaruf(request.recipientId)) {
      return { error: "Anda sudah dalam proses ta'aruf dengan user lain." };
    }
  }

  const newStatus = action === "accept" ? "accepted" : "declined";

  await db
    .update(taarufRequest)
    .set({
      status: newStatus,
      respondedAt: now,
      updatedAt: now,
    })
    .where(eq(taarufRequest.id, requestId));

  const users = await db
    .select({ id: user.id, name: user.name, username: user.username })
    .from(user)
    .where(inArray(user.id, [request.senderId, request.recipientId]));

  const userMap = new Map(users.map((u) => [u.id, u]));

  const recipient = userMap.get(request.recipientId);
  const recipientNotifName = recipient?.username
    ? `@${recipient.username}`
    : recipient?.name ?? request.recipientId;

  if (action === "accept") {
    const sender = userMap.get(request.senderId);
    const senderName = sender?.name ?? request.senderId;
    const recipientName = recipient?.name ?? request.recipientId;

    const channelResult = await createTaarufChannel(
      request.id,
      request.senderId,
      request.recipientId,
      senderName,
      recipientName
    );

    if (channelResult.error) {
      return { error: channelResult.error };
    }

    await createNotification(
      request.senderId,
      "taaruf_request_accepted",
      "Ta'aruf Diterima",
      `${recipientNotifName} telah menerima permintaan ta'aruf Anda.`,
      { requestId, recipientId: request.recipientId }
    );
  } else {
    await createNotification(
      request.senderId,
      "taaruf_request_declined",
      "Ta'aruf Ditolak",
      `${recipientNotifName} menolak permintaan ta'aruf Anda.`,
      { requestId }
    );
  }

  revalidatePath("/", "layout");
  return { success: true, status: newStatus };
}

async function enrichRequests(rows: Array<Record<string, unknown>>): Promise<TaarufRequestData[]> {
  const userIds = new Set<string>();
  for (const r of rows) {
    userIds.add(r.senderId as string);
    userIds.add(r.recipientId as string);
  }

  const users = await db
    .select({ id: user.id, name: user.name, username: user.username })
    .from(user)
    .where(inArray(user.id, Array.from(userIds)));

  const userMap = new Map(users.map((u) => [u.id, u]));

  return rows.map((r) => {
    const sender = userMap.get(r.senderId as string);
    const recipient = userMap.get(r.recipientId as string);
    return {
      id: r.id as string,
      senderId: r.senderId as string,
      recipientId: r.recipientId as string,
      status: r.status as string,
      message: r.message as string | null,
      senderRead: r.senderRead as boolean,
      recipientRead: r.recipientRead as boolean,
      createdAt: r.createdAt as Date,
      expiresAt: r.expiresAt as Date,
      respondedAt: r.respondedAt as Date | null,
      senderName: sender?.name ?? "",
      senderUsername: sender?.username ?? null,
      recipientName: recipient?.name ?? "",
      recipientUsername: recipient?.username ?? null,
    };
  });
}

export async function getMySentRequests(): Promise<{ data?: TaarufRequestData[]; error?: string }> {
  const session = await getServerSession();
  if (!session?.user?.id) return { error: "Sesi tidak ditemukan." };

  await expireStaleRequests();

  const rows = await db
    .select()
    .from(taarufRequest)
    .where(eq(taarufRequest.senderId, session.user.id))
    .orderBy(taarufRequest.createdAt);

  const data = await enrichRequests(rows as Array<Record<string, unknown>>);
  return { data };
}

export async function getMyIncomingRequests(): Promise<{ data?: TaarufRequestData[]; error?: string }> {
  const session = await getServerSession();
  if (!session?.user?.id) return { error: "Sesi tidak ditemukan." };

  await expireStaleRequests();

  const rows = await db
    .select()
    .from(taarufRequest)
    .where(eq(taarufRequest.recipientId, session.user.id))
    .orderBy(taarufRequest.createdAt);

  const data = await enrichRequests(rows as Array<Record<string, unknown>>);
  return { data };
}

export async function getPendingTaarufRequestFromSource(
  sourceUserId: string
): Promise<{ id: string; expiresAt: Date } | null> {
  const session = await getServerSession();
  if (!session?.user?.id) return null;
  await expireStaleRequests();
  const existing = await db.query.taarufRequest.findFirst({
    where: and(
      eq(taarufRequest.senderId, sourceUserId),
      eq(taarufRequest.recipientId, session.user.id),
      eq(taarufRequest.status, "pending")
    ),
    columns: { id: true, expiresAt: true },
  });
  return existing ?? null;
}

export async function isInActiveTaarufWith(otherUserId: string): Promise<boolean> {
  const session = await getServerSession();
  if (!session?.user?.id) return false;
  const existing = await db.query.taarufRequest.findFirst({
    where: and(
      or(
        and(eq(taarufRequest.senderId, session.user.id), eq(taarufRequest.recipientId, otherUserId)),
        and(eq(taarufRequest.senderId, otherUserId), eq(taarufRequest.recipientId, session.user.id))
      ),
      eq(taarufRequest.status, "accepted")
    ),
    columns: { id: true },
  });
  return !!existing;
}

export async function hasSentTaarufRequest(recipientUserId: string): Promise<boolean> {
  const session = await getServerSession();
  if (!session?.user?.id) return false;
  const existing = await db.query.taarufRequest.findFirst({
    where: and(
      eq(taarufRequest.senderId, session.user.id),
      eq(taarufRequest.recipientId, recipientUserId),
      or(
        eq(taarufRequest.status, "pending"),
        eq(taarufRequest.status, "accepted")
      )
    ),
    columns: { id: true },
  });
  return !!existing;
}

export async function getTaarufRequestCounts() {
  const session = await getServerSession();
  if (!session?.user?.id) return null;

  await expireStaleRequests();

  const pendingIncoming = await db.query.taarufRequest.findFirst({
    where: and(
      eq(taarufRequest.recipientId, session.user.id),
      eq(taarufRequest.status, "pending")
    ),
    columns: { id: true },
  });

  return { pendingIncoming: pendingIncoming ? 1 : 0 };
}
