"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { profile, user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { step1Schema, step2Schema, step3Schema, step4Schema, step5Schema } from "@/lib/validations/profile";
import { revalidatePath } from "next/cache";

export interface ProfileData {
  name?: string | null;
  gender?: string | null;
  birthDate?: string | null;
  birthPlace?: string | null;
  ethnicity?: string | null;
  height?: number | null;
  weight?: number | null;
  skinColor?: string | null;
  maritalStatus?: string | null;
  childCount?: number | null;
  hairColor?: string | null;
  hairType?: string | null;
  hijabStatus?: string | null;
  faceAppearance?: string | null;
  otherPhysicalTraits?: string | null;
  marriageTarget?: string | null;
  polygamyView?: string | null;
  parentsInvolvement?: string | null;
  smokingStatus?: string | null;
  personalityTraits?: string | null;
  interests?: string | null;
  country?: string | null;
  city?: string | null;
  occupation?: string | null;
  education?: string | null;
  bio?: string | null;
  vision?: string | null;
  mission?: string | null;
  partnerCriteria?: string | null;
  partnerCity?: string | null;
  partnerOccupation?: string | null;
  partnerAgeMin?: number | null;
  partnerAgeMax?: number | null;
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
  published?: boolean | null;
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

const stepSchemas = [step1Schema, step2Schema, step3Schema, step4Schema, step5Schema];

export async function saveProfile(formData: ProfileData, step?: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { error: "Sesi tidak ditemukan." };
  }

  const userId = session.user.id;

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

export async function togglePublished() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { error: "Sesi tidak ditemukan." };
  }

  try {
    const existing = await db.query.profile.findFirst({
      where: eq(profile.userId, session.user.id),
      columns: { published: true },
    });

    const newValue = !existing?.published;

    await db
      .update(profile)
      .set({ published: newValue, updatedAt: new Date() })
      .where(eq(profile.userId, session.user.id));

    return { success: true, published: newValue };
  } catch {
    return { error: "Gagal mengubah status publikasi." };
  }
}
