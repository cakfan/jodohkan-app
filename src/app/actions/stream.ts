"use server";

import { getServerSession } from "@/lib/get-server-session";
import { db } from "@/db";
import { user } from "@/db/schema/auth-schema";
import { eq, inArray } from "drizzle-orm";
import { getStreamClient } from "@/lib/stream";

const TAARUF_ROLE = "taaruf_user";

let ensureTaarufRolePromise: Promise<void> | null = null;

async function ensureTaarufRole() {
  if (!ensureTaarufRolePromise) {
    ensureTaarufRolePromise = (async () => {
      const client = getStreamClient();
      try {
        await client.createRole(TAARUF_ROLE);
      } catch {
        // Role already exists
      }
      await client.updateAppSettings({
        grants: {
          [TAARUF_ROLE]: ["search-user", "update-user-owner", "flag-user"],
        },
      });
    })();
  }
  return ensureTaarufRolePromise;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export async function getStreamToken() {
  const session = await getServerSession();
  if (!session?.user?.id) return null;

  try {
    const client = getStreamClient();
    const userId = session.user.id;
    const name = session.user.name ?? userId;

    const dbUser = await db.query.user.findFirst({
      where: eq(user.id, userId),
      columns: { username: true, image: true, role: true },
    });

    await client.upsertUsers([
      {
        id: userId,
        name,
        image: dbUser?.image ?? undefined,
        username: dbUser?.username ?? undefined,
      },
    ]);

    return {
      chatToken: client.createToken(userId),
      apiKey: process.env.STREAM_API_KEY!,
      userId,
      name,
      role: dbUser?.role ?? null,
    };
  } catch {
    return null;
  }
}

export async function createTaarufChannel(
  requestId: string,
  senderId: string,
  recipientId: string,
  senderName: string,
  recipientName: string
) {
  const session = await getServerSession();
  if (!session?.user?.id) return { error: "Sesi tidak ditemukan." };

  if (session.user.id !== senderId && session.user.id !== recipientId) {
    return { error: "Unauthorized" };
  }

  try {
    const client = getStreamClient();
    const channelId = `taaruf-${requestId}`;

    await ensureTaarufRole();

    const memberIds: string[] = [senderId, recipientId];

    const mediators = await db.query.user.findMany({
      where: eq(user.role, "mediator"),
      columns: { id: true, name: true, username: true, image: true },
    });
    const mediator = mediators.length > 0 ? mediators[Math.floor(Math.random() * mediators.length)] : null;

    const allUserIds = mediator ? [senderId, recipientId, mediator.id] : [senderId, recipientId];
    const userRows = await db.query.user.findMany({
      where: inArray(user.id, allUserIds),
      columns: { id: true, username: true, image: true },
    });
    const userMap = new Map(userRows.map((r) => [r.id, { username: r.username ?? undefined, image: r.image ?? undefined }]));

    if (mediator) {
      memberIds.push(mediator.id);
      const m = userMap.get(mediator.id);
      await client.upsertUsers([
        { id: mediator.id, name: mediator.name ?? mediator.id, role: "user", ...m },
      ]);
    }

    await client.upsertUsers([
      { id: senderId, name: senderName, role: TAARUF_ROLE, ...(userMap.get(senderId) ?? {}) },
      { id: recipientId, name: recipientName, role: TAARUF_ROLE, ...(userMap.get(recipientId) ?? {}) },
    ]);

    const channel = client.channel("messaging", channelId, {
      name: `Ta'aruf: ${getInitials(senderName)} & ${getInitials(recipientName)}`,
      members: memberIds,
      created_by_id: mediator?.id ?? session.user.id,
    });

    await channel.create();

    const stateMembers = Object.keys(channel.state?.members ?? {});
    const missingIds = memberIds.filter((id) => !stateMembers.includes(id));
    if (missingIds.length > 0) {
      await channel.addMembers(missingIds);
    }

    if (mediator) {
      await channel.assignRoles([
        { user_id: mediator.id, channel_role: "channel_moderator" },
      ]);
    }

    await channel.updatePartial({
      set: {
        config_overrides: {
          grants: {
            channel_member: ["!remove-own-channel-membership"],
            user: ["!remove-own-channel-membership-owner"],
          },
        } as Record<string, unknown>,
      },
    });

    return { success: true, channelId };
  } catch (error) {
    console.error("createTaarufChannel error:", error);
    return { error: "Gagal membuat ruang chat." };
  }
}

export async function banTaarufUser(channelId: string, targetUserId: string) {
  const session = await getServerSession();
  if (!session?.user?.id) return { error: "Sesi tidak ditemukan." };

  const dbUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
    columns: { role: true },
  });

  if (dbUser?.role !== "mediator") {
    return { error: "Hanya mediator yang bisa memblokir peserta." };
  }

  try {
    const client = getStreamClient();
    const channel = client.channel("messaging", channelId);
    await channel.banUser(targetUserId, {
      reason: "Diblokir oleh mediator",
      banned_by_id: session.user.id,
    });
    return { success: true };
  } catch {
    return { error: "Gagal memblokir peserta." };
  }
}

export async function unbanTaarufUser(channelId: string, targetUserId: string) {
  const session = await getServerSession();
  if (!session?.user?.id) return { error: "Sesi tidak ditemukan." };

  const dbUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
    columns: { role: true },
  });

  if (dbUser?.role !== "mediator") {
    return { error: "Hanya mediator yang bisa membuka blokir peserta." };
  }

  try {
    const client = getStreamClient();
    const channel = client.channel("messaging", channelId);
    await channel.unbanUser(targetUserId);
    return { success: true };
  } catch {
    return { error: "Gagal membuka blokir peserta." };
  }
}

export async function freezeTaarufChannel(channelId: string, frozen: boolean) {
  const session = await getServerSession();
  if (!session?.user?.id) return { error: "Sesi tidak ditemukan." };

  const dbUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
    columns: { role: true },
  });

  if (dbUser?.role !== "mediator") {
    return { error: "Hanya mediator yang bisa mengakhiri ta'aruf." };
  }

  try {
    const client = getStreamClient();
    const channel = client.channel("messaging", channelId);
    await channel.updatePartial({ set: { frozen } });
    return { success: true };
  } catch {
    return { error: "Gagal mengubah status ta'aruf." };
  }
}

export async function deleteTaarufChannel(channelId: string) {
  const session = await getServerSession();
  if (!session?.user?.id) return { error: "Sesi tidak ditemukan." };

  const dbUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
    columns: { role: true },
  });

  if (dbUser?.role !== "mediator") {
    return { error: "Hanya mediator yang bisa menghapus channel." };
  }

  try {
    const client = getStreamClient();
    const channel = client.channel("messaging", channelId);
    await channel.delete();
    return { success: true };
  } catch {
    return { error: "Gagal menghapus channel." };
  }
}
