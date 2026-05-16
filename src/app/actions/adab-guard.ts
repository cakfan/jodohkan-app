"use server";

import { getServerSession } from "@/lib/get-server-session";
import { db } from "@/db";
import { adabViolation } from "@/db/schema/adab-schema";
import { user } from "@/db/schema/auth-schema";
import { taarufRequest } from "@/db/schema/taaruf-schema";
import { checkMessageContent, getAdabFreezeMs, getAdabTierLabel } from "@/lib/adab-guard";
import { getStreamClient } from "@/lib/stream";
import crypto from "crypto";
import { count, eq, and, ne, desc } from "drizzle-orm";

export async function validateMessage(text: string) {
  const session = await getServerSession();
  if (!session?.user?.id) return { error: "Sesi tidak ditemukan." };
  return checkMessageContent(text);
}

function toDbViolationType(
  category: string
): "bad_word" | "inappropriate_image" | "spam" {
  if (category === "bad_word") return "bad_word";
  return "spam";
}

export async function freezeForAdab(params: {
  channelId: string;
  userId: string;
  messageText: string;
  reason: string;
  violationCategory: string;
}) {
  const session = await getServerSession();
  if (!session?.user?.id) return { error: "Sesi tidak ditemukan." };

  try {
    const [result] = await db
      .select({ count: count() })
      .from(adabViolation)
      .where(
        and(
          eq(adabViolation.channelId, params.channelId),
          ne(adabViolation.status, "overturned")
        )
      );
    const violationCount = result.count;

    const tierLabels = ["pertama", "kedua", "ketiga"];
    const tierIdx = Math.min(violationCount, tierLabels.length - 1);
    const tierLabel = getAdabTierLabel(violationCount);
    const duration = getAdabFreezeMs(violationCount);

    const client = getStreamClient();
    const channel = client.channel("messaging", params.channelId);

    if (duration === null) {
      const adabReason = `Pelanggaran adab ke-${tierLabels[tierIdx]}. Ta'aruf diakhiri karena pelanggaran berulang.`;
      await channel.updatePartial({
        set: {
          frozen: true,
          adab_freeze_reason: adabReason,
          adab_freeze_permanent: true,
        },
      });

      await db.insert(adabViolation).values({
        id: crypto.randomUUID(),
        channelId: params.channelId,
        userId: params.userId,
        messageText: params.messageText,
        violationType: toDbViolationType(params.violationCategory),
        reason: adabReason,
      });

      const requestId = params.channelId.replace("taaruf-", "");
      await db
        .update(taarufRequest)
        .set({ status: "ended" })
        .where(eq(taarufRequest.id, requestId));

      return { success: true, permanent: true };
    }

    const expiresAt = new Date(Date.now() + duration);
    const adabReason = `Pelanggaran adab ke-${tierLabels[tierIdx]}: ${params.reason} Chat dibekukan ${tierLabel}.`;

    await channel.updatePartial({
      set: {
        frozen: true,
        adab_freeze_reason: adabReason,
        adab_freeze_expires_at: expiresAt.toISOString(),
      },
    });

    await db.insert(adabViolation).values({
      id: crypto.randomUUID(),
      channelId: params.channelId,
      userId: params.userId,
      messageText: params.messageText,
      violationType: toDbViolationType(params.violationCategory),
      reason: adabReason,
    });

    return { success: true, expiresAt: expiresAt.toISOString() };
  } catch {
    return { error: "Gagal membekukan chat." };
  }
}

export async function checkAdabFreeze(channelId: string) {
  const session = await getServerSession();
  if (!session?.user?.id) return { frozen: false };

  try {
    const client = getStreamClient();
    const channel = client.channel("messaging", channelId);
    await channel.watch();

    const data = channel.data as Record<string, unknown> | undefined;
    const isFrozen = data?.frozen === true;
    const adabFreezeReason = data?.adab_freeze_reason as string | undefined;
    const expiresAtStr = data?.adab_freeze_expires_at as string | undefined;

    if (!isFrozen) return { frozen: false };

    if (adabFreezeReason && !expiresAtStr) {
      return {
        frozen: true,
        reason: adabFreezeReason,
        permanent: true,
      };
    }

    if (!expiresAtStr || !adabFreezeReason) {
      return { frozen: true };
    }

    const expiresAt = new Date(expiresAtStr);
    const now = new Date();

    if (now >= expiresAt) {
      await channel.updatePartial({
        set: { frozen: false },
        unset: ["adab_freeze_reason", "adab_freeze_expires_at", "adab_freeze_permanent"],
      });
      return { frozen: false };
    }

    return {
      frozen: true,
      reason: adabFreezeReason,
      expiresAt: expiresAtStr,
    };
  } catch {
    return { frozen: false };
  }
}

export type ViolationWithUser = {
  id: string;
  channelId: string;
  userId: string;
  messageText: string | null;
  violationType: string;
  reason: string;
  status: string;
  appealReason: string | null;
  appealedAt: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  createdAt: string | null;
  userName: string | null;
};

export async function getViolationsForChannel(channelId: string) {
  const session = await getServerSession();
  if (!session?.user?.id) return { error: "Sesi tidak ditemukan." };

  const requestId = channelId.replace("taaruf-", "");
  const request = await db.query.taarufRequest.findFirst({
    where: eq(taarufRequest.id, requestId),
    columns: { senderId: true, recipientId: true, mediatorId: true },
  });

  if (!request) return { error: "Ta'aruf tidak ditemukan." };

  const uid = session.user.id;
  const isAuthorized = uid === request.senderId || uid === request.recipientId || uid === request.mediatorId;
  if (!isAuthorized) return { error: "Anda tidak memiliki akses ke channel ini." };

  try {
    const rows = await db
      .select({
        id: adabViolation.id,
        channelId: adabViolation.channelId,
        userId: adabViolation.userId,
        messageText: adabViolation.messageText,
        violationType: adabViolation.violationType,
        reason: adabViolation.reason,
        status: adabViolation.status,
        appealReason: adabViolation.appealReason,
        appealedAt: adabViolation.appealedAt,
        reviewedBy: adabViolation.reviewedBy,
        reviewedAt: adabViolation.reviewedAt,
        reviewNotes: adabViolation.reviewNotes,
        createdAt: adabViolation.createdAt,
        userName: user.name,
      })
      .from(adabViolation)
      .leftJoin(user, eq(adabViolation.userId, user.id))
      .where(eq(adabViolation.channelId, channelId))
      .orderBy(desc(adabViolation.createdAt));

    return { violations: rows as unknown as ViolationWithUser[] };
  } catch {
    return { error: "Gagal mengambil data pelanggaran." };
  }
}

export async function submitAppeal(
  violationId: string,
  appealReason: string
) {
  const session = await getServerSession();
  if (!session?.user?.id) return { error: "Sesi tidak ditemukan." };

  try {
    await db
      .update(adabViolation)
      .set({
        status: "appealed",
        appealReason,
        appealedAt: new Date(),
      })
      .where(
        and(
          eq(adabViolation.id, violationId),
          eq(adabViolation.userId, session.user.id)
        )
      );

    return { success: true };
  } catch {
    return { error: "Gagal mengirim banding." };
  }
}

export async function reviewAppeal(params: {
  violationId: string;
  action: "overturn" | "uphold";
  notes: string;
}) {
  const session = await getServerSession();
  if (!session?.user?.id) return { error: "Sesi tidak ditemukan." };

  try {
    const [violation] = await db
      .select({
        id: adabViolation.id,
        channelId: adabViolation.channelId,
      })
      .from(adabViolation)
      .where(
        and(
          eq(adabViolation.id, params.violationId),
          eq(adabViolation.status, "appealed")
        )
      );

    if (!violation) return { error: "Banding tidak ditemukan." };

    const newStatus = params.action === "overturn" ? "overturned" : "upheld";

    await db
      .update(adabViolation)
      .set({
        status: newStatus,
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
        reviewNotes: params.notes,
      })
      .where(eq(adabViolation.id, params.violationId));

    if (params.action === "overturn") {
      const [active] = await db
        .select({ count: count() })
        .from(adabViolation)
        .where(
          and(
            eq(adabViolation.channelId, violation.channelId),
            ne(adabViolation.status, "overturned")
          )
        );

      if (active.count === 0) {
        const client = getStreamClient();
        const channel = client.channel("messaging", violation.channelId);
        await channel.updatePartial({
          set: { frozen: false },
          unset: [
            "adab_freeze_reason",
            "adab_freeze_expires_at",
            "adab_freeze_permanent",
          ],
        });
      }
    }

    return { success: true };
  } catch {
    return { error: "Gagal mereview banding." };
  }
}
