"use server";

import { getServerSession } from "@/lib/get-server-session";
import { db } from "@/db";
import { profile, user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { step1Schema, step2Schema, step3Schema, step4Schema, step5Schema } from "@/lib/validations/profile";
import { revalidatePath } from "next/cache";
import type { InferProfileData } from "@/lib/types";

export type ProfileData = InferProfileData;

export async function getProfile() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return { error: "Sesi tidak ditemukan." };
  }

  const existing = await db.query.profile.findFirst({
    where: (profile, { eq }) => eq(profile.userId, session.user.id),
  });

  return { data: existing ?? null };
}

const stepSchemas = [step1Schema, step2Schema, step3Schema, step4Schema, step5Schema];

export async function saveProfile(formData: ProfileData, step?: number) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return { error: "Sesi tidak ditemukan." };
  }

  const userId = session.user.id;

  const currentProfile = await db.query.profile.findFirst({
    where: (profile, { eq }) => eq(profile.userId, userId),
    columns: { cvStatus: true },
  });

  if (formData.cvStatus === "approved" && currentProfile?.cvStatus !== "approved") {
    return { error: "Tidak dapat mengatur status sendiri. Hubungi admin." };
  }

  if (step !== undefined && step >= 1 && step <= 5) {
    const schema = stepSchemas[step - 1];
    const result = schema.safeParse(formData);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      return { error: messages.join(". ") };
    }
  }

  try {
    const [currentUser] = await db
      .select({ gender: user.gender })
      .from(user)
      .where(eq(user.id, userId));

    const existing = await db.query.profile.findFirst({
      where: (profile, { eq }) => eq(profile.userId, userId),
    });

    if (formData.name) {
      await db
        .update(user)
        .set({ name: formData.name, updatedAt: new Date() })
        .where(eq(user.id, userId));
    }

    const { name: _unused, ...profileFields } = formData;
    void _unused;

    if (currentUser?.gender) {
      (profileFields as Record<string, unknown>).gender = currentUser.gender;
    }

    if (profileFields.published === null) {
      profileFields.published = undefined;
    }

    if (existing) {
      if (existing.cvStatus === "approved") {
        (profileFields as Record<string, unknown>).cvStatus = "pending";
      }

      await db
        .update(profile)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .set({ ...profileFields, updatedAt: new Date() } as any)
        .where(eq(profile.userId, userId));
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const values: any = {
        id: crypto.randomUUID(),
        userId,
        ...profileFields,
      };
      await db.insert(profile).values(values);
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch {
    return { error: "Gagal menyimpan profil. Silakan coba lagi." };
  }
}

export async function reviewCv(
  candidateUserId: string,
  action: "approve" | "reject",
  rejectionReason?: string
) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return { error: "Sesi tidak ditemukan." };
  }

  if (session.user.role !== "admin") {
    return { error: "Hanya admin yang dapat melakukan review." };
  }

  try {
    if (action === "approve") {
      await db
        .update(profile)
        .set({ cvStatus: "approved", rejectionReason: null, updatedAt: new Date() })
        .where(eq(profile.userId, candidateUserId));
    } else {
      await db
        .update(profile)
        .set({
          cvStatus: "rejected",
          published: false,
          rejectionReason: rejectionReason ?? null,
          updatedAt: new Date(),
        })
        .where(eq(profile.userId, candidateUserId));
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch {
    return { error: "Gagal melakukan review." };
  }
}

export async function togglePublished() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return { error: "Sesi tidak ditemukan." };
  }

  try {
    const existing = await db.query.profile.findFirst({
      where: eq(profile.userId, session.user.id),
      columns: { published: true, cvStatus: true },
    });

    const newValue = !existing?.published;

    const updateData: Record<string, unknown> = { published: newValue, updatedAt: new Date() };

    if (newValue === false) {
      updateData.cvStatus = "pending";
    }

    await db
      .update(profile)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .set(updateData as any)
      .where(eq(profile.userId, session.user.id));

    revalidatePath("/", "layout");
    return { success: true, published: newValue };
  } catch {
    return { error: "Gagal mengubah status publikasi." };
  }
}
