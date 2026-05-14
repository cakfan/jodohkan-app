"use server";

import { getServerSession } from "@/lib/get-server-session";
import { db } from "@/db";
import { taarufRequest } from "@/db/schema/taaruf-schema";
import { nadzorSession, nadzorSessionAgreement } from "@/db/schema/nadzor-schema";
import { user } from "@/db/schema/auth-schema";
import { eq, and } from "drizzle-orm";
import { createNotification } from "./notification";
import { revalidatePath } from "next/cache";

export interface NadzorSessionWithAgreements {
  id: string;
  channelId: string;
  requestedBy: string;
  mediatorId: string;
  maxDurationMinutes: number;
  scheduledAt: Date;
  status: string;
  feedbackIkhwan: string | null;
  feedbackAkhwat: string | null;
  mediatorNotes: string | null;
  createdAt: Date;
  agreements: {
    id: string;
    userId: string;
    agreed: boolean;
    respondedAt: Date | null;
  }[];
}

export async function proposeNadzorSchedule(
  channelId: string,
  scheduledAt: Date
) {
  const session = await getServerSession();
  if (!session?.user?.id) return { error: "Sesi tidak ditemukan." };

  const requestId = channelId.replace("taaruf-", "");
  const request = await db.query.taarufRequest.findFirst({
    where: eq(taarufRequest.id, requestId),
    columns: {
      id: true,
      phase: true,
      senderId: true,
      recipientId: true,
      mediatorId: true,
    },
  });

  if (!request) return { error: "Ta'aruf tidak ditemukan." };
  if (request.phase !== "nadzor") return { error: "Fase nadzor belum aktif." };

  const hour = scheduledAt.getHours();
  if (hour < 9 || hour >= 15) {
    return { error: "Waktu sesi nadzor harus antara pukul 09:00 - 15:00." };
  }

  const existing = await db.query.nadzorSession.findFirst({
    where: and(
      eq(nadzorSession.channelId, channelId),
      eq(nadzorSession.status, "scheduled")
    ),
    columns: { id: true },
  });

  if (existing) return { error: "Sudah ada jadwal yang menunggu persetujuan." };

  const mediatorUser = !request.mediatorId
    ? await db.query.user.findFirst({
        where: eq(user.role, "mediator"),
        columns: { id: true },
      })
    : await db.query.user.findFirst({
        where: eq(user.id, request.mediatorId),
        columns: { id: true },
      });

  const mediatorId = request.mediatorId ?? mediatorUser?.id;
  if (!mediatorId) return { error: "Mediator tidak ditemukan." };

  const proposerIsMediator = session.user.id === mediatorId;
  const partyIds: string[] = [request.senderId, request.recipientId];

  const id = crypto.randomUUID();
  await db.insert(nadzorSession).values({
    id,
    channelId,
    requestedBy: session.user.id,
    mediatorId,
    scheduledAt,
    status: "scheduled",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  for (const userId of partyIds) {
    const isProposer = userId === session.user.id;
    await db.insert(nadzorSessionAgreement).values({
      id: crypto.randomUUID(),
      sessionId: id,
      userId,
      agreed: isProposer,
      respondedAt: isProposer ? new Date() : null,
      requestedAt: new Date(),
    });
  }

  const otherPartyId = partyIds.find((id) => id !== session.user.id);
  if (otherPartyId) {
    const proposer = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
      columns: { name: true },
    });
    const label = proposerIsMediator
      ? "Mediator"
      : proposer?.name ?? "Salah satu pihak";
    await createNotification(
      otherPartyId,
      "nadzor_scheduled",
      "Jadwal Nadzor Diajukan",
      `${label} mengajukan jadwal sesi nadzor. Silakan konfirmasi ketersediaan Anda.`,
      {
        sessionId: id,
        channelId,
        scheduledAt: scheduledAt.toISOString(),
      }
    );
  }

  if (proposerIsMediator) {
    await createNotification(
      mediatorId,
      "nadzor_scheduled",
      "Jadwal Nadzor Diajukan",
      "Anda telah mengajukan jadwal nadzor. Menunggu persetujuan kedua pihak.",
      { sessionId: id, channelId, scheduledAt: scheduledAt.toISOString() }
    );
  }

  revalidatePath("/", "layout");
  return { success: true, sessionId: id };
}

export async function respondToScheduleProposal(
  sessionId: string,
  agree: boolean
) {
  const session = await getServerSession();
  if (!session?.user?.id) return { error: "Sesi tidak ditemukan." };

  const nadzor = await db.query.nadzorSession.findFirst({
    where: eq(nadzorSession.id, sessionId),
    columns: {
      id: true,
      channelId: true,
      requestedBy: true,
      mediatorId: true,
      status: true,
    },
  });

  if (!nadzor) return { error: "Sesi nadzor tidak ditemukan." };
  if (nadzor.status !== "scheduled") return { error: "Sesi ini sudah tidak dapat direspons." };

  const agreement = await db.query.nadzorSessionAgreement.findFirst({
    where: and(
      eq(nadzorSessionAgreement.sessionId, sessionId),
      eq(nadzorSessionAgreement.userId, session.user.id)
    ),
  });

  if (!agreement) return { error: "Anda tidak diundang dalam sesi ini." };
  if (agreement.agreed) return { error: "Anda sudah memberikan persetujuan." };

  await db
    .update(nadzorSessionAgreement)
    .set({ agreed: agree, respondedAt: new Date() })
    .where(eq(nadzorSessionAgreement.id, agreement.id));

  if (agree) {
    const allAgreements = await db
      .select()
      .from(nadzorSessionAgreement)
      .where(eq(nadzorSessionAgreement.sessionId, sessionId));

    const bothAgreed = allAgreements.every((a) => a.agreed);

    if (bothAgreed) {
      const requestId = nadzor.channelId.replace("taaruf-", "");
      const taaruf = await db.query.taarufRequest.findFirst({
        where: eq(taarufRequest.id, requestId),
        columns: { senderId: true, recipientId: true },
      });

      const proposerIsMediator = nadzor.requestedBy === nadzor.mediatorId;

      if (proposerIsMediator) {
        for (const pid of [taaruf!.senderId, taaruf!.recipientId]) {
          await createNotification(
            pid,
            "nadzor_scheduled",
            "Jadwal Nadzor Dikonfirmasi",
            "Jadwal sesi nadzor telah dikonfirmasi. Sesi video call akan aktif 15 menit sebelum jadwal.",
            { sessionId, channelId: nadzor.channelId }
          );
        }
      } else {
        await createNotification(
          nadzor.mediatorId,
          "nadzor_scheduled",
          "Kedua Pihak Setuju",
          "Kedua pihak telah menyetujui jadwal nadzor. Silakan konfirmasi ketersediaan Anda sebagai mediator.",
          { sessionId, channelId: nadzor.channelId }
        );

        if (taaruf) {
          for (const pid of [taaruf.senderId, taaruf.recipientId]) {
            if (pid !== session.user.id) {
              await createNotification(
                pid,
                "nadzor_scheduled",
                "Jadwal Disetujui",
                "Pihak lainnya telah menyetujui jadwal nadzor. Menunggu konfirmasi mediator.",
                { sessionId, channelId: nadzor.channelId }
              );
            }
          }
        }
      }
    }
  } else {
    await db
      .update(nadzorSession)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(nadzorSession.id, sessionId));

    await createNotification(
      nadzor.requestedBy,
      "nadzor_feedback",
      "Jadwal Ditolak",
      "Pihak lain menolak jadwal nadzor yang diajukan. Silakan ajukan jadwal baru.",
      { sessionId, channelId: nadzor.channelId }
    );
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function confirmNadzorSchedule(sessionId: string) {
  const session = await getServerSession();
  if (!session?.user?.id) return { error: "Sesi tidak ditemukan." };

  const dbUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
    columns: { role: true },
  });

  if (dbUser?.role !== "mediator") {
    return { error: "Hanya mediator yang bisa mengkonfirmasi jadwal." };
  }

  const nadzor = await db.query.nadzorSession.findFirst({
    where: eq(nadzorSession.id, sessionId),
    columns: { id: true, channelId: true, mediatorId: true, status: true },
  });

  if (!nadzor) return { error: "Sesi nadzor tidak ditemukan." };
  if (nadzor.mediatorId !== session.user.id) {
    return { error: "Anda bukan mediator sesi ini." };
  }
  if (nadzor.status !== "scheduled") return { error: "Sesi ini sudah tidak dapat dikonfirmasi." };

  const allAgreements = await db
    .select()
    .from(nadzorSessionAgreement)
    .where(eq(nadzorSessionAgreement.sessionId, sessionId));

  if (allAgreements.length < 2 || !allAgreements.every((a) => a.agreed)) {
    return { error: "Kedua pihak belum menyetujui jadwal ini." };
  }

  const requestId = nadzor.channelId.replace("taaruf-", "");
  const taaruf = await db.query.taarufRequest.findFirst({
    where: eq(taarufRequest.id, requestId),
    columns: { senderId: true, recipientId: true },
  });

  if (taaruf) {
    for (const pid of [taaruf.senderId, taaruf.recipientId]) {
      await createNotification(
        pid,
        "nadzor_scheduled",
        "Jadwal Nadzor Dikonfirmasi",
        "Mediator telah mengkonfirmasi jadwal sesi nadzor. Sesi video call akan aktif 15 menit sebelum jadwal.",
        { sessionId, channelId: nadzor.channelId }
      );
    }
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function getNadzorSessionForChannel(channelId: string) {
  const session = await getServerSession();
  if (!session?.user?.id) return { error: "Sesi tidak ditemukan." };

  const rows = await db
    .select()
    .from(nadzorSession)
    .where(
      and(
        eq(nadzorSession.channelId, channelId),
        eq(nadzorSession.status, "scheduled")
      )
    )
    .orderBy(nadzorSession.createdAt)
    .limit(1);

  if (rows.length === 0) return { session: null };

  const s = rows[0];
  const agreements = await db
    .select()
    .from(nadzorSessionAgreement)
    .where(eq(nadzorSessionAgreement.sessionId, s.id));

  const nadzor: NadzorSessionWithAgreements = {
    id: s.id,
    channelId: s.channelId,
    requestedBy: s.requestedBy,
    mediatorId: s.mediatorId,
    maxDurationMinutes: s.maxDurationMinutes ?? 30,
    scheduledAt: s.scheduledAt,
    status: s.status,
    feedbackIkhwan: s.feedbackIkhwan,
    feedbackAkhwat: s.feedbackAkhwat,
    mediatorNotes: s.mediatorNotes,
    createdAt: s.createdAt,
    agreements: agreements.map((a) => ({
      id: a.id,
      userId: a.userId,
      agreed: a.agreed,
      respondedAt: a.respondedAt,
    })),
  };

  return { session: nadzor };
}

export async function cancelNadzorSession(sessionId: string) {
  const session = await getServerSession();
  if (!session?.user?.id) return { error: "Sesi tidak ditemukan." };

  const nadzor = await db.query.nadzorSession.findFirst({
    where: eq(nadzorSession.id, sessionId),
    columns: { id: true, channelId: true, requestedBy: true, mediatorId: true, status: true },
  });

  if (!nadzor) return { error: "Sesi tidak ditemukan." };
  if (nadzor.status !== "scheduled") return { error: "Sesi sudah tidak aktif." };

  const dbUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
    columns: { role: true },
  });

  const isMediator = dbUser?.role === "mediator" && nadzor.mediatorId === session.user.id;
  const isRequester = nadzor.requestedBy === session.user.id;

  if (!isMediator && !isRequester) {
    return { error: "Anda tidak berhak membatalkan sesi ini." };
  }

  await db
    .update(nadzorSession)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(nadzorSession.id, sessionId));

  const requestId = nadzor.channelId.replace("taaruf-", "");
  const taaruf = await db.query.taarufRequest.findFirst({
    where: eq(taarufRequest.id, requestId),
    columns: { senderId: true, recipientId: true },
  });

  if (taaruf) {
    for (const pid of [taaruf.senderId, taaruf.recipientId, nadzor.mediatorId]) {
      if (pid !== session.user.id) {
        await createNotification(
          pid,
          "nadzor_feedback",
          "Jadwal Dibatalkan",
          "Jadwal sesi nadzor telah dibatalkan.",
          { sessionId, channelId: nadzor.channelId }
        );
      }
    }
  }

  revalidatePath("/", "layout");
  return { success: true };
}
