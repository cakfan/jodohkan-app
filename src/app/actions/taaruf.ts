"use server";

import { getServerSession } from "@/lib/get-server-session";
import { db } from "@/db";
import { taarufRequest, profile, user } from "@/db/schema";
import { eq, and, lt, inArray, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createTaarufChannel } from "./stream";
import { getStreamClient } from "@/lib/stream";
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

  const recipientUser = await db
    .select({ gender: user.gender })
    .from(user)
    .where(eq(user.id, recipientUserId))
    .then((rows) => rows[0]);

  if (recipientUser && session.user.gender === recipientUser.gender) {
    return { error: "Tidak dapat mengirim ta'aruf ke sesama jenis." };
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

export async function getTaarufRequestStatus(requestId: string) {
  const session = await getServerSession();
  if (!session?.user?.id) return null;
  const request = await db.query.taarufRequest.findFirst({
    where: eq(taarufRequest.id, requestId),
    columns: { status: true, phase: true },
  });
  return request ?? null;
}

export async function declareNadzorReadiness(requestId: string) {
  const session = await getServerSession();
  if (!session?.user?.id) return { error: "Sesi tidak ditemukan." };

  const request = await db.query.taarufRequest.findFirst({
    where: eq(taarufRequest.id, requestId),
    columns: {
      id: true, phase: true, status: true,
      senderId: true, recipientId: true, mediatorId: true,
      readinessIkhwan: true, readinessAkhwat: true, readinessTimer: true,
    },
  });

  if (!request) return { error: "Ta'aruf tidak ditemukan." };
  if (request.status !== "accepted") return { error: "Ta'aruf tidak aktif." };
  if (request.phase !== "chat") return { error: "Fase chat sudah selesai." };

  const userId = session.user.id;
  const isIkhwan = userId === request.senderId;
  const isAkhwat = userId === request.recipientId;
  if (!isIkhwan && !isAkhwat) return { error: "Anda bukan peserta ta'aruf ini." };

  const field = isIkhwan ? "readinessIkhwan" : "readinessAkhwat";

  if (isIkhwan && request.readinessIkhwan) return { error: "Anda sudah menyatakan siap." };
  if (isAkhwat && request.readinessAkhwat) return { error: "Anda sudah menyatakan siap." };

  const now = new Date();

  const existingReady = isIkhwan ? request.readinessAkhwat : request.readinessIkhwan;
  const isFirst = !existingReady;

  const updateData: Record<string, unknown> = {
    [field]: now,
    updatedAt: now,
  };

  if (isFirst) {
    const timerEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    updateData.readinessTimer = timerEnd;
  }

  await db
    .update(taarufRequest)
    .set(updateData as typeof taarufRequest.$inferInsert)
    .where(eq(taarufRequest.id, requestId));

  if (isFirst) {
    const otherId = isIkhwan ? request.recipientId : request.senderId;
    const timerEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    await createNotification(
      otherId,
      "nadzor_readiness_partner_ready",
      "Pasangan Siap untuk Nadzor",
      `Pasangan Anda sudah menyatakan siap untuk lanjut ke sesi nadzor. Anda memiliki waktu 7 hari untuk menyatakan siap juga.`,
      { requestId, timerEnd: timerEnd.toISOString() }
    );
  }

  const otherReady = isIkhwan ? request.readinessAkhwat : request.readinessIkhwan;

  if (otherReady) {
    const mediatorId = request.mediatorId;
    if (mediatorId) {
      await createNotification(
        mediatorId,
        "nadzor_readiness_both_ready",
        "Kedua Pihak Siap Nadzor",
        "Kedua pihak sudah menyatakan siap untuk nadzor. Silakan aktivasi fase nadzor.",
        { requestId }
      );
    }
    await createNotification(
      isIkhwan ? request.recipientId : request.senderId,
      "nadzor_readiness_both_ready",
      "Pasangan Juga Siap",
      "Pasangan Anda juga sudah siap. Menunggu mediator mengaktifkan sesi nadzor.",
      { requestId }
    );
  }

  revalidatePath("/", "layout");
  return { success: true, bothReady: !!otherReady, isFirst };
}

export async function cancelNadzorReadiness(requestId: string) {
  const session = await getServerSession();
  if (!session?.user?.id) return { error: "Sesi tidak ditemukan." };

  const request = await db.query.taarufRequest.findFirst({
    where: eq(taarufRequest.id, requestId),
    columns: {
      id: true, phase: true, status: true,
      senderId: true, recipientId: true, mediatorId: true,
      readinessIkhwan: true, readinessAkhwat: true,
    },
  });

  if (!request) return { error: "Ta'aruf tidak ditemukan." };
  if (request.status !== "accepted") return { error: "Ta'aruf tidak aktif." };
  if (request.phase !== "chat") return { error: "Fase chat sudah selesai." };

  const userId = session.user.id;
  const isIkhwan = userId === request.senderId;
  const isAkhwat = userId === request.recipientId;
  if (!isIkhwan && !isAkhwat) return { error: "Anda bukan peserta ta'aruf ini." };

  const otherReady = isIkhwan ? request.readinessAkhwat : request.readinessIkhwan;
  if (!otherReady) return { error: "Pasangan belum menyatakan siap." };

  const now = new Date();
  await db
    .update(taarufRequest)
    .set({
      status: "ended",
      phaseUpdatedAt: now,
      updatedAt: now,
    })
    .where(eq(taarufRequest.id, requestId));

  const channelId = `taaruf-${requestId}`;
  try {
    const streamClient = getStreamClient();
    const channel = streamClient.channel("messaging", channelId);
    await channel.updatePartial({
      set: {
        frozen: true,
        freeze_reason: "Salah satu pihak tidak siap untuk nadzor.",
      },
    });
  } catch (e) {
    console.error("Failed to freeze channel:", e);
  }

  for (const pid of [request.senderId, request.recipientId]) {
    await createNotification(
      pid,
      "taaruf_ended",
      "Proses Ta'aruf Dihentikan",
      userId === pid
        ? "Anda memilih untuk tidak melanjutkan ke sesi nadzor."
        : "Pasangan Anda tidak siap untuk nadzor. Proses ta'aruf dihentikan.",
      { requestId }
    );
  }

  if (request.mediatorId) {
    await createNotification(
      request.mediatorId,
      "taaruf_ended",
      "Ta'aruf Dihentikan",
      "Salah satu pihak tidak siap untuk nadzor. Proses ta'aruf dihentikan.",
      { requestId }
    );
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function getNadzorReadinessStatus(requestId: string) {
  const session = await getServerSession();
  if (!session?.user?.id) return { error: "Sesi tidak ditemukan." };

  const request = await db.query.taarufRequest.findFirst({
    where: eq(taarufRequest.id, requestId),
    columns: {
      id: true, phase: true, status: true,
      senderId: true, recipientId: true,
      readinessIkhwan: true, readinessAkhwat: true, readinessTimer: true,
    },
  });

  if (!request) return { error: "Ta'aruf tidak ditemukan." };
  if (request.status !== "accepted") {
    return { ready: false, status: request.status, phase: null, ikhwanReady: false, akhwatReady: false, timerEnd: null };
  }

  const ikhwanReady = !!request.readinessIkhwan;
  const akhwatReady = !!request.readinessAkhwat;
  const timerEnd = request.readinessTimer;

  const now = new Date();
  if (timerEnd && now > timerEnd) {
    const otherReady = session.user.id === request.senderId ? request.readinessAkhwat : request.readinessIkhwan;
    const selfReady = session.user.id === request.senderId ? request.readinessIkhwan : request.readinessAkhwat;
    if (otherReady && !selfReady) {
      await db
        .update(taarufRequest)
        .set({ status: "ended", phaseUpdatedAt: now, updatedAt: now })
        .where(eq(taarufRequest.id, requestId));

      const channelId = `taaruf-${requestId}`;
      try {
        const streamClient = getStreamClient();
        const channel = streamClient.channel("messaging", channelId);
        await channel.updatePartial({
          set: { frozen: true, freeze_reason: "Batas waktu 7 hari untuk menyatakan siap telah habis." },
        });
      } catch (e) {
        console.error("Failed to freeze channel:", e);
      }

      for (const pid of [request.senderId, request.recipientId]) {
        await createNotification(
          pid,
          "taaruf_ended",
          "Batas Waktu Habis",
          "Batas waktu 7 hari untuk menyatakan siap telah habis. Proses ta'aruf dihentikan.",
          { requestId }
        );
      }

      revalidatePath("/", "layout");
      return {
        ready: false,
        status: "ended",
        phase: null,
        ikhwanReady,
        akhwatReady,
        timerEnd: null,
        expired: true,
      };
    }
  }

  return {
    ready: ikhwanReady && akhwatReady,
    status: request.status,
    phase: request.phase,
    ikhwanReady,
    akhwatReady,
    timerEnd,
    isIkhwan: session.user.id === request.senderId,
    isAkhwat: session.user.id === request.recipientId,
  };
}
