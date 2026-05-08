"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { profile } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface ProfileData {
  gender?: string | null;
  birthDate?: string | null;
  birthPlace?: string | null;
  ethnicity?: string | null;
  height?: number | null;
  weight?: number | null;
  skinColor?: string | null;
  maritalStatus?: string | null;
  country?: string | null;
  city?: string | null;
  occupation?: string | null;
  education?: string | null;
  bio?: string | null;
  vision?: string | null;
  mission?: string | null;
  partnerCriteria?: string | null;
  religiousUnderstanding?: string | null;
  manhaj?: string | null;
  memorization?: string | null;
  dailyWorship?: string | null;
  qa?: { question: string; answer: string }[] | null;
  photoUrl?: string | null;
  photoBlurredUrl?: string | null;
  photoBlurred?: boolean | null;
  ktpUrl?: string | null;
  cvStatus?: string | null;
}

export async function getProfile() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { error: "Sesi tidak ditemukan." };
  }

  const existing = await db.query.profile.findFirst({
    where: (profile, { eq }) => eq(profile.userId, session.user.id),
  });

  return { data: existing ?? null };
}

export async function saveProfile(formData: ProfileData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { error: "Sesi tidak ditemukan." };
  }

  const userId = session.user.id;

  try {
    const existing = await db.query.profile.findFirst({
      where: (profile, { eq }) => eq(profile.userId, userId),
    });

    if (existing) {
      await db
        .update(profile)
        .set({ ...formData, updatedAt: new Date() })
        .where(eq(profile.userId, userId));
    } else {
      await db.insert(profile).values({
        id: crypto.randomUUID(),
        userId,
        ...formData,
      });
    }

    return { success: true };
  } catch {
    return { error: "Gagal menyimpan profil. Silakan coba lagi." };
  }
}
