"use server";

import { getServerSession } from "@/lib/get-server-session";
import { db } from "@/db";
import { profile } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  getPublicUrl,
  uploadToStorage,
  removeFromStorage,
} from "@/lib/supabase-admin";
import crypto from "crypto";
import { validateImageFile } from "@/lib/constants/upload";
import { extractStoragePath, buildFilePath } from "@/lib/supabase-admin";

export async function uploadKtp(formData: FormData) {
  const session = await getServerSession();
  if (!session?.user?.id) return { error: "Sesi tidak ditemukan." };

  const userId = session.user.id;
  const file = formData.get("ktp") as File | null;
  if (!file) return { error: "Tidak ada file yang dipilih." };

  const validationError = validateImageFile(file);
  if (validationError) return { error: validationError };

  const ext = "jpg";
  const fileName = `${crypto.randomUUID()}.${ext}`;
  const storagePath = buildFilePath(userId, fileName, "ktp");

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
  const session = await getServerSession();
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
