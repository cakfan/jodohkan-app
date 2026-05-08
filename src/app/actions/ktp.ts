"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { profile } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  getPublicUrl,
  uploadToStorage,
  removeFromStorage,
} from "@/lib/supabase-admin";
import crypto from "crypto";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 2 * 1024 * 1024;

function extractStoragePath(url: string): string | null {
  const match = url.match(/profile-photos\/(.+)/);
  return match ? match[1] : null;
}

function buildKtpPath(userId: string, fileName: string): string {
  return `ktp/${userId}/${fileName}`;
}

export async function uploadKtp(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return { error: "Sesi tidak ditemukan." };

  const userId = session.user.id;
  const file = formData.get("ktp") as File | null;
  if (!file) return { error: "Tidak ada file yang dipilih." };

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "Format file tidak didukung. Gunakan JPEG, PNG, atau WebP." };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { error: "Ukuran file maksimal 2MB." };
  }

  const ext = "jpg";
  const fileName = `${crypto.randomUUID()}.${ext}`;
  const storagePath = buildKtpPath(userId, fileName);

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await uploadToStorage(
    storagePath,
    buffer,
    "image/jpeg"
  );
  if (uploadError) {
    return { error: `Gagal mengunggah: ${uploadError.message}` };
  }

  const ktpUrl = getPublicUrl(storagePath);

  try {
    const existing = await db.query.profile.findFirst({
      where: (profile, { eq }) => eq(profile.userId, userId),
    });

    if (existing) {
      if (existing.ktpUrl) {
        const oldPath = extractStoragePath(existing.ktpUrl);
        if (oldPath) await removeFromStorage(oldPath);
      }

      await db
        .update(profile)
        .set({
          ktpUrl,
          updatedAt: new Date(),
        })
        .where(eq(profile.userId, userId));
    } else {
      await db.insert(profile).values({
        id: crypto.randomUUID(),
        userId,
        ktpUrl,
      });
    }

    return { success: true, ktpUrl };
  } catch {
    await removeFromStorage(storagePath);
    return { error: "Gagal menyimpan data profil." };
  }
}

export async function deleteKtp() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return { error: "Sesi tidak ditemukan." };

  const userId = session.user.id;
  const existing = await db.query.profile.findFirst({
    where: (profile, { eq }) => eq(profile.userId, userId),
  });

  if (existing?.ktpUrl) {
    const path = extractStoragePath(existing.ktpUrl);
    if (path) await removeFromStorage(path);
  }

  await db
    .update(profile)
    .set({
      ktpUrl: null,
      updatedAt: new Date(),
    })
    .where(eq(profile.userId, userId));

  return { success: true };
}
