"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { profile, wallet } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function completeOnboarding() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { error: "Sesi tidak ditemukan. Silakan masuk kembali." };
  }

  const userId = session.user.id;

  try {
    const existingProfile = await db.query.profile.findFirst({
      where: (profile, { eq }) => eq(profile.userId, userId),
    });

    if (!existingProfile) {
      await db.insert(profile).values({
        id: crypto.randomUUID(),
        userId,
        onboardingCompleted: true,
      });
    } else if (!existingProfile.onboardingCompleted) {
      await db
        .update(profile)
        .set({ onboardingCompleted: true })
        .where(eq(profile.userId, userId));
    }

    const existingWallet = await db.query.wallet.findFirst({
      where: (wallet, { eq }) => eq(wallet.userId, userId),
    });

    if (!existingWallet) {
      await db.insert(wallet).values({
        id: crypto.randomUUID(),
        userId,
        balance: 1,
      });
    }
  } catch {
    return { error: "Gagal menyimpan data. Silakan coba lagi." };
  }

  return { success: true };
}
