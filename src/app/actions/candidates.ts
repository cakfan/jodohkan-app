"use server";

import { db } from "@/db";
import { profile, user } from "@/db/schema";
import { eq, and, like, gte, lte, ne } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export interface CandidateFilters {
  city?: string;
  education?: string;
  ethnicity?: string;
  occupation?: string;
  ageMin?: number;
  ageMax?: number;
  username?: string;
}

import { computeAgeDateBoundary } from "@/lib/utils";

export async function getCandidates(filters: CandidateFilters = {}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return { error: "Sesi tidak ditemukan." };

  const myProfile = await db.query.profile.findFirst({
    where: eq(profile.userId, session.user.id),
    columns: { gender: true },
  });

  const conditions: ReturnType<typeof eq>[] = [
    eq(profile.cvStatus, "approved"),
    eq(profile.published, true),
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
    conditions.push(lte(profile.birthDate, computeAgeDateBoundary(filters.ageMin, "min")));
  }
  if (filters.ageMax) {
    conditions.push(gte(profile.birthDate, computeAgeDateBoundary(filters.ageMax, "max")));
  }
  if (filters.username) {
    conditions.push(like(user.username, `%${filters.username}%`));
  }
  if (filters.ethnicity) {
    conditions.push(like(profile.ethnicity, `%${filters.ethnicity}%`));
  }
  if (filters.occupation) {
    conditions.push(like(profile.occupation, `%${filters.occupation}%`));
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
      ethnicity: profile.ethnicity,
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

export async function getCandidateById(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return { error: "Sesi tidak ditemukan." };

  const myProfile = await db.query.profile.findFirst({
    where: eq(profile.userId, session.user.id),
    columns: { gender: true },
  });

  const conditions: ReturnType<typeof eq>[] = [
    eq(profile.id, id),
    eq(profile.cvStatus, "approved"),
    ne(profile.userId, session.user.id),
  ];

  if (myProfile?.gender === "male") {
    conditions.push(eq(profile.gender, "female"));
  } else if (myProfile?.gender === "female") {
    conditions.push(eq(profile.gender, "male"));
  }

  const row = await db
    .select({
      id: profile.id,
      userId: profile.userId,
      gender: profile.gender,
      birthDate: profile.birthDate,
      birthPlace: profile.birthPlace,
      ethnicity: profile.ethnicity,
      city: profile.city,
      occupation: profile.occupation,
      education: profile.education,
      maritalStatus: profile.maritalStatus,
      skinColor: profile.skinColor,
      height: profile.height,
      weight: profile.weight,
      childCount: profile.childCount,
      hairColor: profile.hairColor,
      hairType: profile.hairType,
      hijabStatus: profile.hijabStatus,
      faceAppearance: profile.faceAppearance,
      otherPhysicalTraits: profile.otherPhysicalTraits,
      marriageTarget: profile.marriageTarget,
      polygamyView: profile.polygamyView,
      parentsInvolvement: profile.parentsInvolvement,
      smokingStatus: profile.smokingStatus,
      personalityTraits: profile.personalityTraits,
      interests: profile.interests,
      bio: profile.bio,
      vision: profile.vision,
      mission: profile.mission,
      qa: profile.qa,
      partnerCriteria: profile.partnerCriteria,
      partnerCity: profile.partnerCity,
      partnerOccupation: profile.partnerOccupation,
      partnerAgeMin: profile.partnerAgeMin,
      partnerAgeMax: profile.partnerAgeMax,
      religiousUnderstanding: profile.religiousUnderstanding,
      manhaj: profile.manhaj,
      memorization: profile.memorization,
      dailyWorship: profile.dailyWorship,
      photoUrl: profile.photoUrl,
      photoBlurredUrl: profile.photoBlurredUrl,
      photoBlurred: profile.photoBlurred,
      ktpUrl: profile.ktpUrl,
      username: user.username,
      name: user.name,
      createdAt: profile.createdAt,
    })
    .from(profile)
    .innerJoin(user, eq(profile.userId, user.id))
    .where(and(...conditions))
    .execute()
    .then((rows) => rows[0]);

  if (!row) return { error: "Profil tidak ditemukan atau tidak tersedia." };

  return { data: row };
}

export async function getCandidateByUsername(username: string) {
  const session = await auth.api.getSession({ headers: await headers() });

  const targetUser = await db.query.user.findFirst({
    where: eq(user.username, username),
    columns: { id: true },
  });

  if (!targetUser) return { error: "Profil tidak ditemukan atau tidak tersedia." };

  const isOwnProfile = session?.user?.id === targetUser.id;

  const conditions: ReturnType<typeof eq>[] = [
    eq(user.username, username),
  ];

  if (!isOwnProfile) {
    conditions.push(eq(profile.cvStatus, "approved"));
  }

  if (!isOwnProfile && session?.user?.id) {
    const myProfile = await db.query.profile.findFirst({
      where: eq(profile.userId, session.user.id),
      columns: { gender: true },
    });
    if (myProfile?.gender === "male") {
      conditions.push(eq(profile.gender, "female"));
    } else if (myProfile?.gender === "female") {
      conditions.push(eq(profile.gender, "male"));
    }
  }

  const row = await db
    .select({
      id: profile.id,
      userId: profile.userId,
      gender: profile.gender,
      birthDate: profile.birthDate,
      birthPlace: profile.birthPlace,
      ethnicity: profile.ethnicity,
      city: profile.city,
      occupation: profile.occupation,
      education: profile.education,
      maritalStatus: profile.maritalStatus,
      skinColor: profile.skinColor,
      height: profile.height,
      weight: profile.weight,
      childCount: profile.childCount,
      hairColor: profile.hairColor,
      hairType: profile.hairType,
      hijabStatus: profile.hijabStatus,
      faceAppearance: profile.faceAppearance,
      otherPhysicalTraits: profile.otherPhysicalTraits,
      marriageTarget: profile.marriageTarget,
      polygamyView: profile.polygamyView,
      parentsInvolvement: profile.parentsInvolvement,
      smokingStatus: profile.smokingStatus,
      personalityTraits: profile.personalityTraits,
      interests: profile.interests,
      bio: profile.bio,
      vision: profile.vision,
      mission: profile.mission,
      qa: profile.qa,
      partnerCriteria: profile.partnerCriteria,
      partnerCity: profile.partnerCity,
      partnerOccupation: profile.partnerOccupation,
      partnerAgeMin: profile.partnerAgeMin,
      partnerAgeMax: profile.partnerAgeMax,
      religiousUnderstanding: profile.religiousUnderstanding,
      manhaj: profile.manhaj,
      memorization: profile.memorization,
      dailyWorship: profile.dailyWorship,
      photoUrl: profile.photoUrl,
      photoBlurredUrl: profile.photoBlurredUrl,
      photoBlurred: profile.photoBlurred,
      ktpUrl: profile.ktpUrl,
      username: user.username,
      name: user.name,
      createdAt: profile.createdAt,
    })
    .from(profile)
    .innerJoin(user, eq(profile.userId, user.id))
    .where(and(...conditions))
    .execute()
    .then((rows) => rows[0]);

  if (!row) return { error: "Profil tidak ditemukan atau tidak tersedia." };

  return { data: row };
}
