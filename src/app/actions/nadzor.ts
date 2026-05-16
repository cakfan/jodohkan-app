"use server";

import { getServerSession } from "@/lib/get-server-session";
import { db } from "@/db";
import { taarufRequest } from "@/db/schema/taaruf-schema";
import { nadzorSession, nadzorSessionAgreement, moderatorAuditLog } from "@/db/schema/nadzor-schema";
import { user } from "@/db/schema/auth-schema";
import { eq, and, or, desc } from "drizzle-orm";
import { createNotification } from "./notification";
import { revalidatePath } from "next/cache";
import { getStreamClient } from "@/lib/stream";
import { getStreamVideoClient } from "@/lib/stream-video";

export interface NadzorSessionWithAgreements {
  id: string;
  channelId: string;
  requestedBy: string;
  mediatorId: string;
  senderId: string;
  recipientId: string;
  maxDurationMinutes: number;
  scheduledAt: Date;
  status: string;
  feedbackIkhwan: string | null;
  feedbackAkhwat: string | null;
  mediatorNotes: string | null;
  decisionIkhwan: string | null;
  decisionAkhwat: string | null;
  decisionTimer: Date | null;
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

  const requestId = channelId.replace("taaruf-", "");
  const taaruf = await db.query.taarufRequest.findFirst({
    where: eq(taarufRequest.id, requestId),
    columns: { senderId: true, recipientId: true, mediatorId: true, decisionTimer: true },
  });

  if (!taaruf) return { error: "Ta'aruf tidak ditemukan." };

  const uid = session.user.id;
  const isParticipant = uid === taaruf.senderId || uid === taaruf.recipientId;
  const isAssignedMediator = uid === taaruf.mediatorId;
  if (!isParticipant && !isAssignedMediator) return { error: "Anda tidak memiliki akses." };

  const rows = await db
    .select()
    .from(nadzorSession)
    .where(
      and(
        eq(nadzorSession.channelId, channelId),
        or(
          eq(nadzorSession.status, "scheduled"),
          eq(nadzorSession.status, "ongoing"),
          eq(nadzorSession.status, "completed"),
          eq(nadzorSession.status, "terminated")
        )
      )
    )
    .orderBy(desc(nadzorSession.createdAt))
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
    senderId: taaruf?.senderId ?? "",
    recipientId: taaruf?.recipientId ?? "",
    maxDurationMinutes: s.maxDurationMinutes ?? 30,
    scheduledAt: s.scheduledAt,
    status: s.status,
    feedbackIkhwan: s.feedbackIkhwan,
    feedbackAkhwat: s.feedbackAkhwat,
    mediatorNotes: s.mediatorNotes,
    decisionIkhwan: s.decisionIkhwan,
    decisionAkhwat: s.decisionAkhwat,
    decisionTimer: taaruf?.decisionTimer ?? null,
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

export async function startNadzorCall(sessionId: string) {
  const session = await getServerSession();
  if (!session?.user?.id) return { error: "Sesi tidak ditemukan." };

  const nadzor = await db.query.nadzorSession.findFirst({
    where: eq(nadzorSession.id, sessionId),
    columns: {
      id: true, status: true, scheduledAt: true,
      mediatorId: true, channelId: true, maxDurationMinutes: true,
    },
  });

  if (!nadzor) return { error: "Sesi nadzor tidak ditemukan." };
  if (nadzor.status !== "scheduled" && nadzor.status !== "ongoing") {
    return { error: "Sesi sudah tidak aktif." };
  }

  if (nadzor.status !== "ongoing") {
    await db
      .update(nadzorSession)
      .set({ status: "ongoing", startedAt: new Date(), updatedAt: new Date() })
      .where(eq(nadzorSession.id, sessionId));
  }

  const requestId = nadzor.channelId.replace("taaruf-", "");
  const taaruf = await db.query.taarufRequest.findFirst({
    where: eq(taarufRequest.id, requestId),
    columns: { senderId: true, recipientId: true },
  });
  if (!taaruf) return { error: "Ta'aruf tidak ditemukan." };

  const callId = `nadzor-${sessionId}`;
  const memberIds = [taaruf.senderId, taaruf.recipientId, nadzor.mediatorId];

  try {
    const streamClient = getStreamVideoClient();
    const call = streamClient.video.call("nadzor", callId);
    await call.getOrCreate({
      data: { created_by_id: session.user.id },
    });
  } catch (e) {
    console.error("Failed getOrCreate:", e);
    return { error: "Gagal membuat sesi video call (create)." };
  }

  try {
    const streamClient = getStreamVideoClient();
    const call = streamClient.video.call("nadzor", callId);
    await call.updateCallMembers({
      update_members: memberIds.map((id) => ({ user_id: id })),
    });
  } catch (e) {
    console.error("Failed updateCallMembers:", e);
    return { error: "Gagal membuat sesi video call (members)." };
  }

  return {
    success: true,
    channelId: nadzor.channelId,
    callId,
    maxDurationMinutes: nadzor.maxDurationMinutes ?? 30,
    memberIds,
  };
}

export async function endNadzorCall(
  sessionId: string,
  endReason: "completed" | "timeout" | "violation" | "cancelled" = "completed"
) {
  const session = await getServerSession();
  if (!session?.user?.id) return { error: "Sesi tidak ditemukan." };

  const nadzor = await db.query.nadzorSession.findFirst({
    where: eq(nadzorSession.id, sessionId),
    columns: { id: true, status: true, channelId: true, mediatorId: true },
  });

  if (!nadzor) return { error: "Sesi tidak ditemukan." };
  if (nadzor.status !== "ongoing") return { error: "Sesi tidak sedang berlangsung." };

  const dbUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
    columns: { role: true },
  });

  const isMediator = dbUser?.role === "mediator" || nadzor.mediatorId === session.user.id;
  if (!isMediator) return { error: "Hanya mediator yang bisa mengakhiri sesi." };

  const newStatus = endReason === "violation" ? "terminated" as const : "completed" as const;

  await db
    .update(nadzorSession)
    .set({
      status: newStatus,
      endedAt: new Date(),
      endedBy: session.user.id,
      endReason,
      updatedAt: new Date(),
    })
    .where(eq(nadzorSession.id, sessionId));

  const requestId = nadzor.channelId.replace("taaruf-", "");
  const taaruf = await db.query.taarufRequest.findFirst({
    where: eq(taarufRequest.id, requestId),
    columns: { senderId: true, recipientId: true },
  });

  if (taaruf) {
    for (const pid of [taaruf.senderId, taaruf.recipientId]) {
      await createNotification(
        pid,
        "nadzor_feedback",
        "Sesi Nadzor Berakhir",
        endReason === "completed"
          ? "Sesi nadzor telah berakhir. Silakan isi feedback."
          : "Sesi nadzor diakhiri oleh mediator.",
        { sessionId, channelId: nadzor.channelId }
      );
    }
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function logModeratorAction(
  nadzorSessionId: string,
  action: string,
  details?: Record<string, unknown>
) {
  const session = await getServerSession();
  if (!session?.user?.id) return { error: "Sesi tidak ditemukan." };

  const nadzor = await db.query.nadzorSession.findFirst({
    where: eq(nadzorSession.id, nadzorSessionId),
    columns: { mediatorId: true },
  });

  if (!nadzor) return { error: "Sesi tidak ditemukan." };
  if (nadzor.mediatorId !== session.user.id) return { error: "Anda bukan mediator sesi ini." };

  await db.insert(moderatorAuditLog).values({
    id: crypto.randomUUID(),
    nadzorSessionId,
    moderatorId: session.user.id,
    action,
    details: (details ?? null) as Record<string, unknown> | null,
    createdAt: new Date(),
  });

  return { success: true };
}

export async function submitNadzorFeedback(
  sessionId: string,
  feedback: string
) {
  const session = await getServerSession();
  if (!session?.user?.id) return { error: "Sesi tidak ditemukan." };

  const nadzor = await db.query.nadzorSession.findFirst({
    where: eq(nadzorSession.id, sessionId),
    columns: { id: true, channelId: true, status: true, mediatorId: true },
  });

  if (!nadzor) return { error: "Sesi tidak ditemukan." };

  const requestId = nadzor.channelId.replace("taaruf-", "");
  const taaruf = await db.query.taarufRequest.findFirst({
    where: eq(taarufRequest.id, requestId),
    columns: { senderId: true, recipientId: true },
  });

  if (!taaruf) return { error: "Ta'aruf tidak ditemukan." };

  if (session.user.id !== taaruf.senderId && session.user.id !== taaruf.recipientId) {
    return { error: "Anda bukan peserta sesi ini." };
  }

  const field = session.user.id === taaruf.senderId ? "feedbackIkhwan" as const : "feedbackAkhwat" as const;

  await db
    .update(nadzorSession)
    .set({ [field]: feedback, updatedAt: new Date() })
    .where(eq(nadzorSession.id, sessionId));

  revalidatePath("/", "layout");
  return { success: true };
}

export async function submitMediatorNotes(sessionId: string, notes: string) {
  const session = await getServerSession();
  if (!session?.user?.id) return { error: "Sesi tidak ditemukan." };

  const nadzor = await db.query.nadzorSession.findFirst({
    where: eq(nadzorSession.id, sessionId),
    columns: { mediatorId: true },
  });

  if (!nadzor) return { error: "Sesi tidak ditemukan." };
  if (nadzor.mediatorId !== session.user.id) return { error: "Anda bukan mediator sesi ini." };

  await db
    .update(nadzorSession)
    .set({ mediatorNotes: notes, updatedAt: new Date() })
    .where(eq(nadzorSession.id, sessionId));

  revalidatePath("/", "layout");
  return { success: true };
}

export async function submitNadzorDecision(
  sessionId: string,
  channelId: string,
  decision: "continue" | "stop"
) {
  const session = await getServerSession();
  if (!session?.user?.id) return { error: "Sesi tidak ditemukan." };

  const requestId = channelId.replace("taaruf-", "");
  const request = await db.query.taarufRequest.findFirst({
    where: eq(taarufRequest.id, requestId),
    columns: { id: true, phase: true, senderId: true, recipientId: true, decisionTimer: true },
  });

  if (!request) return { error: "Ta'aruf tidak ditemukan." };
  if (request.phase !== "nadzor") return { error: "Fase nadzor belum selesai." };

  const userId = session.user.id;
  const isIkhwan = userId === request.senderId;
  const isAkhwat = userId === request.recipientId;
  if (!isIkhwan && !isAkhwat) return { error: "Anda bukan peserta ta'aruf ini." };

  const dbField = isIkhwan ? "decision_ikhwan" as const : "decision_akhwat" as const;

  const existing = await db.query.nadzorSession.findFirst({
    where: eq(nadzorSession.id, sessionId),
    columns: { decisionIkhwan: true, decisionAkhwat: true },
  });

  if (!existing) return { error: "Sesi nadzor tidak ditemukan." };
  if (isIkhwan ? existing.decisionIkhwan : existing.decisionAkhwat) {
    return { error: "Anda sudah memberikan keputusan." };
  }

  await db
    .update(nadzorSession)
    .set({ [dbField]: decision, updatedAt: new Date() })
    .where(eq(nadzorSession.id, sessionId));

  const now = new Date();

  if (decision === "stop") {
    await db
      .update(taarufRequest)
      .set({ status: "ended", phaseUpdatedAt: now, updatedAt: now })
      .where(eq(taarufRequest.id, requestId));

    try {
      const streamClient = getStreamClient();
      const channel = streamClient.channel("messaging", channelId);
      await channel.updatePartial({
        set: { frozen: true, freeze_reason: "Salah satu pihak memilih berhenti setelah nadzor." },
      });
    } catch (e) {
      console.error("Failed to freeze channel:", e);
    }

    for (const pid of [request.senderId, request.recipientId]) {
      await createNotification(
        pid,
        "nadzor_feedback",
        "Proses Ta'aruf Dihentikan",
        pid === userId
          ? "Anda memilih untuk menghentikan proses ta'aruf."
          : "Pasangan Anda memilih untuk menghentikan proses ta'aruf.",
        { requestId }
      );
    }

    revalidatePath("/", "layout");
    return { success: true, outcome: "stopped" as const };
  }

  const updated = await db.query.nadzorSession.findFirst({
    where: eq(nadzorSession.id, sessionId),
    columns: { decisionIkhwan: true, decisionAkhwat: true },
  });

  if (isIkhwan ? updated?.decisionAkhwat === "continue" : updated?.decisionIkhwan === "continue") {
    await db
      .update(taarufRequest)
      .set({ phase: "khitbah", phaseUpdatedAt: now, updatedAt: now, decisionTimer: null })
      .where(eq(taarufRequest.id, requestId));

    for (const pid of [request.senderId, request.recipientId]) {
      await createNotification(
        pid,
        "nadzor_to_khitbah",
        "Tahap Khitbah",
        "Selamat! Ta'aruf Anda telah lanjut ke tahap khitbah. Silakan lanjutkan ke sesi tatap muka dengan wali.",
        { requestId }
      );
    }

    revalidatePath("/", "layout");
    return { success: true, outcome: "khitbah" as const };
  }

  if (!request.decisionTimer) {
    const timerEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    await db
      .update(taarufRequest)
      .set({ decisionTimer: timerEnd, updatedAt: now })
      .where(eq(taarufRequest.id, requestId));

    const otherId = isIkhwan ? request.recipientId : request.senderId;
    await createNotification(
      otherId,
      "nadzor_decision_pending",
      "Keputusan Nadzor",
      "Pasangan Anda sudah memberikan keputusan. Silakan tentukan keputusan Anda dalam 7 hari.",
      { requestId, timerEnd: timerEnd.toISOString() }
    );
  }

  revalidatePath("/", "layout");
  return { success: true, outcome: "pending_other" as const };
}

export async function transitionToCompleted(channelId: string) {
  const session = await getServerSession();
  if (!session?.user?.id) return { error: "Sesi tidak ditemukan." };

  const requestId = channelId.replace("taaruf-", "");
  const request = await db.query.taarufRequest.findFirst({
    where: eq(taarufRequest.id, requestId),
    columns: { id: true, phase: true, senderId: true, recipientId: true, mediatorId: true },
  });

  if (!request) return { error: "Ta'aruf tidak ditemukan." };
  if (request.phase !== "khitbah") return { error: "Fase khitbah belum selesai." };

  if (request.mediatorId !== session.user.id) {
    return { error: "Anda bukan mediator ta'aruf ini." };
  }

  const now = new Date();
  await db
    .update(taarufRequest)
    .set({ phase: "completed", status: "ended", phaseUpdatedAt: now, updatedAt: now })
    .where(eq(taarufRequest.id, requestId));

  for (const pid of [request.senderId, request.recipientId]) {
    await createNotification(
      pid,
      "taaruf_completed",
      "Ta'aruf Selesai",
      "Alhamdulillah, proses ta'aruf Anda telah selesai. Barakallahu lakuma.",
      { requestId }
    );
  }

  revalidatePath("/", "layout");
  return { success: true };
}
