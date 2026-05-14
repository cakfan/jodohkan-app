"use server";

import { getServerSession } from "@/lib/get-server-session";
import { db } from "@/db";
import { user } from "@/db/schema/auth-schema";
import { taarufRequest } from "@/db/schema/taaruf-schema";
import { eq, inArray } from "drizzle-orm";
import { getStreamClient } from "@/lib/stream";
import type { Channel } from "stream-chat";

async function withTaarufChannel<T>(
  channelId: string,
  fn: (channel: Channel) => Promise<T>
): Promise<T> {
  const client = getStreamClient();
  return await fn(client.channel("messaging", channelId));
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

    // mediator → Stream "moderator", semua lainnya → "user"
    const streamRole = dbUser?.role === "mediator" ? "moderator" : "user";

    await client.upsertUsers([
      {
        id: userId,
        name,
        image: dbUser?.image ?? undefined,
        username: dbUser?.username ?? undefined,
        role: streamRole,
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

    const memberIds: string[] = [senderId, recipientId];
    const membersConfig: { user_id: string; role: "owner" | "member" }[] = [
      { user_id: senderId, role: "member" },
      { user_id: recipientId, role: "member" },
    ];

    const mediators = await db.query.user.findMany({
      where: eq(user.role, "mediator"),
      columns: { id: true, name: true, username: true, image: true },
    });
    const mediator =
      mediators.length > 0 ? mediators[Math.floor(Math.random() * mediators.length)] : null;

    const allUserIds = mediator ? [senderId, recipientId, mediator.id] : [senderId, recipientId];
    const userRows = await db.query.user.findMany({
      where: inArray(user.id, allUserIds),
      columns: { id: true, username: true, image: true },
    });
    const userMap = new Map(
      userRows.map((r) => [
        r.id,
        { username: r.username ?? undefined, image: r.image ?? undefined },
      ])
    );

    if (mediator) {
      memberIds.push(mediator.id);
      membersConfig.push({ user_id: mediator.id, role: "owner" });
      const m = userMap.get(mediator.id);
      await client.upsertUsers([
        {
          id: mediator.id,
          name: mediator.name ?? mediator.id,
          role: "moderator", // Stream global role untuk mediator
          ...m,
        },
      ]);
    }

    await client.upsertUsers([
      {
        id: senderId,
        name: senderName,
        role: "user",
        ...(userMap.get(senderId) ?? {}),
      },
      {
        id: recipientId,
        name: recipientName,
        role: "user",
        ...(userMap.get(recipientId) ?? {}),
      },
    ]);

    const ownerId = mediator?.id ?? session.user.id;
    const channel = client.channel("messaging", channelId, {
      name: `Ta'aruf: ${getInitials(senderName)} & ${getInitials(recipientName)}`,
      members: membersConfig,
      created_by_id: ownerId,
    });

    await channel.create();

    const stateMembers = Object.keys(channel.state?.members ?? {});
    const missingIds = memberIds.filter((id) => !stateMembers.includes(id));
    if (missingIds.length > 0) {
      await channel.addMembers(missingIds);
    }

    // Kirim pesan selamat datang dari mediator
    const welcomeUserId = mediator?.id ?? session.user.id;
    const sender = senderName;
    const recipient = recipientName;
    const welcomeText =
      'Assalamu\'alaikum warahmatullahi wabarakatuh,\n' +
      '\n' +
      'Selamat datang di ruang ta\'aruf antara\n' +
      '*' + sender + '* dan *' + recipient + '*.\n' +
      '\n' +
      'Berikut adalah aturan yang perlu diperhatikan bersama:\n' +
      '\n' +
      '1. **Jaga adab dan akhlak** dalam setiap percakapan.\n' +
      '2. **Fokus pada pembahasan** yang bermanfaat untuk proses ta\'aruf.\n' +
      '3. **Hindari pembahasan** yang bersifat pribadi sebelum waktunya.\n' +
      '4. Jika ada pertanyaan atau masalah, silakan **hubungi mediator**.\n' +
      '\n' +
      'Barakallahu lakuma.';
    await channel.sendMessage({
      text: welcomeText,
      user_id: welcomeUserId,
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
    await withTaarufChannel(channelId, (channel) =>
      channel.banUser(targetUserId, {
        reason: "Diblokir oleh mediator",
        banned_by_id: session.user.id,
      })
    );
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
    await withTaarufChannel(channelId, (channel) => channel.unbanUser(targetUserId));
    return { success: true };
  } catch {
    return { error: "Gagal membuka blokir peserta." };
  }
}

export async function freezeTaarufChannel(channelId: string, frozen: boolean, reason?: string) {
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
    if (frozen) {
      await withTaarufChannel(channelId, (channel) =>
        channel.updatePartial({
          set: {
            frozen: true,
            freeze_reason: reason ?? null,
          },
        })
      );
      const requestId = channelId.replace("taaruf-", "");
      await db
        .update(taarufRequest)
        .set({ status: "ended" })
        .where(eq(taarufRequest.id, requestId));
    } else {
      await withTaarufChannel(channelId, (channel) =>
        channel.updatePartial({
          set: { frozen: false },
          unset: ["freeze_reason"],
        })
      );
    }
    return { success: true };
  } catch {
    return { error: "Gagal mengubah status ta'aruf." };
  }
}

export async function getUnreadMessageCount() {
  const session = await getServerSession();
  if (!session?.user?.id) return 0;

  try {
    const client = getStreamClient();
    const { total_unread_count } = await client.getUnreadCount(session.user.id);
    return total_unread_count ?? 0;
  } catch {
    return 0;
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
    await withTaarufChannel(channelId, (channel) => channel.delete());
    return { success: true };
  } catch {
    return { error: "Gagal menghapus channel." };
  }
}

export async function unpinMessage(channelId: string, messageId: string) {
  const session = await getServerSession();
  if (!session?.user?.id) return { error: "Sesi tidak ditemukan." };

  const dbUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
    columns: { role: true },
  });

  if (dbUser?.role !== "mediator") {
    return { error: "Hanya mediator yang bisa melepas pin pesan." };
  }

  try {
    const client = getStreamClient();
    await client.updateMessage({
      id: messageId,
      pinned: false,
      pinned_at: null,
    });
    return { success: true };
  } catch {
    return { error: "Gagal melepas pin pesan." };
  }
}

export async function fixExistingTaarufChannel(channelId: string) {
  const session = await getServerSession();
  if (!session?.user?.id) return { error: "Not authenticated" };

  try {
    await withTaarufChannel(channelId, async (channel) => {
      await channel.watch();
      await channel.updatePartial({
        set: {
          config_overrides: {
            replies: false,
          },
        },
      });
    });
    return { success: true };
  } catch (e) {
    return { error: String(e) };
  }
}

export async function getChannelOwner(channelId: string) {
  const session = await getServerSession();
  if (!session?.user?.id) return { error: "Not authenticated" };

  try {
    let ownerId: string | undefined;

    await withTaarufChannel(channelId, async (channel) => {
      await channel.watch();
      const d = channel.data as Record<string, unknown>;
      ownerId = (d?.created_by_id ?? (d?.created_by as { id?: string })?.id) as string | undefined;
    });

    return { ownerId };
  } catch (e) {
    return { error: String(e) };
  }
}

export async function debugChannelGrants(channelId: string) {
  const session = await getServerSession();
  if (!session?.user?.id) return { error: "Not authenticated" };

  try {
    let grants: unknown;
    let config: unknown;
    let ownCapabilities: string[] | undefined;
    let members: Record<string, { role: string | undefined; name: string | undefined }> = {};

    await withTaarufChannel(channelId, async (channel) => {
      await channel.watch();
      grants = (channel.data as Record<string, unknown>)?.grants;
      config = channel.data?.config;
      ownCapabilities = channel.data?.own_capabilities;
      members = channel.state?.members
        ? Object.fromEntries(
            Object.entries(
              channel.state.members as Record<string, { user?: { role?: string; name?: string } }>
            ).map(([id, m]) => [id, { role: m.user?.role, name: m.user?.name }])
          )
        : {};
    });

    return {
      grants,
      config_overrides_replies: (config as Record<string, unknown>)?.replies,
      ownCapabilities,
      members,
      rawConfig: config,
    };
  } catch (e) {
    return { error: String(e) };
  }
}
