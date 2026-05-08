"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { profile } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  ensureBucketExists,
  getPublicUrl,
  buildFilePath,
  uploadToStorage,
  removeFromStorage,
} from "@/lib/supabase-admin";
import { blurImage } from "@/lib/image-blur";
import crypto from "crypto";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 2 * 1024 * 1024;

function extractStoragePath(url: string): string | null {
  const match = url.match(/profile-photos\/(.+)/);
  return match ? match[1] : null;
}

async function deletePhotoFromStorage(photoUrl: string | null) {
  if (!photoUrl) return;
  const path = extractStoragePath(photoUrl);
  if (path) await removeFromStorage(path);
}

export async function uploadPhoto(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return { error: "Sesi tidak ditemukan." };

  const userId = session.user.id;
  const file = formData.get("photo") as File | null;
  if (!file) return { error: "Tidak ada file yang dipilih." };

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "Format file tidak didukung. Gunakan JPEG, PNG, atau WebP." };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { error: "Ukuran file maksimal 2MB." };
  }

  const bucketError = await ensureBucketExists();
  if (bucketError) return { error: bucketError };

  const ext = "jpg";
  const originalFileName = `${crypto.randomUUID()}-original.${ext}`;
  const blurredFileName = `${crypto.randomUUID()}-blurred.${ext}`;
  const originalPath = buildFilePath(userId, originalFileName);
  const blurredPath = buildFilePath(userId, blurredFileName);

  const buffer = Buffer.from(await file.arrayBuffer());

  let blurredBuffer: Buffer;
  try {
    blurredBuffer = await blurImage(buffer);
  } catch {
    return { error: "Gagal memproses gambar." };
  }

  const { error: uploadOriginalError } = await uploadToStorage(
    originalPath,
    buffer,
    "image/jpeg"
  );
  if (uploadOriginalError) {
    return { error: `Gagal mengunggah: ${uploadOriginalError.message}` };
  }

  const { error: uploadBlurredError } = await uploadToStorage(
    blurredPath,
    blurredBuffer,
    "image/jpeg"
  );
  if (uploadBlurredError) {
    await removeFromStorage(originalPath);
    return { error: `Gagal mengunggah: ${uploadBlurredError.message}` };
  }

  const photoUrl = getPublicUrl(originalPath);
  const photoBlurredUrl = getPublicUrl(blurredPath);

  try {
    const existing = await db.query.profile.findFirst({
      where: (profile, { eq }) => eq(profile.userId, userId),
    });

    if (existing) {
      await deletePhotoFromStorage(existing.photoUrl);
      await deletePhotoFromStorage(existing.photoBlurredUrl);

      await db
        .update(profile)
        .set({
          photoUrl,
          photoBlurredUrl,
          photoBlurred: true,
          updatedAt: new Date(),
        })
        .where(eq(profile.userId, userId));
    } else {
      await db.insert(profile).values({
        id: crypto.randomUUID(),
        userId,
        photoUrl,
        photoBlurredUrl,
        photoBlurred: true,
      });
    }

    return { success: true, photoUrl, photoBlurredUrl };
  } catch {
    await removeFromStorage(originalPath);
    await removeFromStorage(blurredPath);
    return { error: "Gagal menyimpan data profil." };
  }
}

export async function deletePhoto() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return { error: "Sesi tidak ditemukan." };

  const userId = session.user.id;
  const existing = await db.query.profile.findFirst({
    where: (profile, { eq }) => eq(profile.userId, userId),
  });

  if (existing) {
    await deletePhotoFromStorage(existing.photoUrl);
    await deletePhotoFromStorage(existing.photoBlurredUrl);
  }

  await db
    .update(profile)
    .set({
      photoUrl: null,
      photoBlurredUrl: null,
      photoBlurred: true,
      updatedAt: new Date(),
    })
    .where(eq(profile.userId, userId));

  return { success: true };
}
