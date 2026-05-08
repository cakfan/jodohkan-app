"use server";

import { db } from "@/db";
import { profile, user } from "@/db/schema";
import { eq, and, like, gte, lte, ne } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export interface CandidateFilters {
  city?: string;
  education?: string;
  ageMin?: number;
  ageMax?: number;
  username?: string;
}

export async function getCandidates(filters: CandidateFilters = {}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return { error: "Sesi tidak ditemukan." };

  const myProfile = await db.query.profile.findFirst({
    where: eq(profile.userId, session.user.id),
    columns: { gender: true },
  });

  const conditions: ReturnType<typeof eq>[] = [
    eq(profile.cvStatus, "approved"),
    ne(profile.userId, session.user.id),
  ];

  if (myProfile?.gender === "male") {
    conditions.push(eq(profile.gender, "female"));
  } else if (myProfile?.gender === "female") {
    conditions.push(eq(profile.gender, "male"));
  }

  if (filters.city) {
    conditions.push(like(profile.city, `%${filters.city}%`));
  }
  if (filters.education) {
    conditions.push(like(profile.education, `%${filters.education}%`));
  }
  if (filters.ageMin) {
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - filters.ageMin);
    conditions.push(lte(profile.birthDate, minDate.toISOString().split("T")[0]));
  }
  if (filters.ageMax) {
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() - filters.ageMax - 1);
    conditions.push(gte(profile.birthDate, maxDate.toISOString().split("T")[0]));
  }
  if (filters.username) {
    conditions.push(like(user.username, `%${filters.username}%`));
  }

  const rows = await db
    .select({
      id: profile.id,
      userId: profile.userId,
      gender: profile.gender,
      birthDate: profile.birthDate,
      birthPlace: profile.birthPlace,
      city: profile.city,
      occupation: profile.occupation,
      education: profile.education,
      maritalStatus: profile.maritalStatus,
      skinColor: profile.skinColor,
      height: profile.height,
      weight: profile.weight,
      bio: profile.bio,
      vision: profile.vision,
      mission: profile.mission,
      photoBlurredUrl: profile.photoBlurredUrl,
      username: user.username,
      religiousUnderstanding: profile.religiousUnderstanding,
      manhaj: profile.manhaj,
      memorization: profile.memorization,
      dailyWorship: profile.dailyWorship,
      createdAt: profile.createdAt,
      name: user.name,
    })
    .from(profile)
    .innerJoin(user, eq(profile.userId, user.id))
    .where(and(...conditions));

  return { data: rows };
}
