"use server";

import { db } from "@/db";
import { profile, user } from "@/db/schema";
import { eq, and, like, gte, lte, ne, notInArray } from "drizzle-orm";
import { getServerSession } from "@/lib/get-server-session";
import { candidateFullSelect, candidateListSelect } from "@/db/selects";
import { getActiveTaarufUserIds, isUserInActiveTaaruf } from "@/app/actions/taaruf";

export interface CandidateFilters {
  city?: string;
  education?: string;
  ethnicity?: string;
  occupation?: string;
  ageMin?: number;
  ageMax?: number;
  username?: string;
}

import { ROLES } from "@/lib/constants/auth";
import { computeAgeDateBoundary } from "@/lib/utils";

export async function getPendingReviews() {
  const session = await getServerSession();
  if (!session?.user?.id || session.user.role !== ROLES.ADMIN) {
    return { error: "Unauthorized." };
  }

  const rows = await db
    .select({
      id: profile.id,
      userId: profile.userId,
      cvStatus: profile.cvStatus,
      createdAt: profile.createdAt,
      rejectionReason: profile.rejectionReason,
      name: user.name,
      username: user.username,
      email: user.email,
    })
    .from(profile)
    .innerJoin(user, eq(profile.userId, user.id))
    .where(ne(profile.cvStatus, "approved"))
    .orderBy(profile.createdAt);

  return { data: rows };
}

export async function getCandidates(filters: CandidateFilters = {}) {
  const session = await getServerSession();
  if (!session?.user?.id) return { error: "Sesi tidak ditemukan." };

  if (await isUserInActiveTaaruf(session.user.id)) {
    return { data: [] };
  }

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

  const activeUserIds = await getActiveTaarufUserIds();
  if (activeUserIds.length > 0) {
    conditions.push(notInArray(profile.userId, activeUserIds));
  }

  const rows = await db
    .select(candidateListSelect)
    .from(profile)
    .innerJoin(user, eq(profile.userId, user.id))
    .where(and(...conditions));

  return { data: rows };
}

export async function getCandidateById(id: string) {
  const session = await getServerSession();
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
    .select(candidateFullSelect)
    .from(profile)
    .innerJoin(user, eq(profile.userId, user.id))
    .where(and(...conditions))
    .execute()
    .then((rows) => rows[0]);

  if (!row) return { error: "Profil tidak ditemukan atau tidak tersedia." };

  return { data: row };
}

export async function getCandidateByUsername(username: string) {
  const session = await getServerSession();

  const targetUser = await db.query.user.findFirst({
    where: eq(user.username, username),
    columns: { id: true },
  });

  if (!targetUser) return { error: "Profil tidak ditemukan atau tidak tersedia." };

  const isOwnProfile = session?.user?.id === targetUser.id;
  const isAdmin = session?.user?.role === "admin";

  const conditions: ReturnType<typeof eq>[] = [
    eq(user.username, username),
  ];

  if (!isOwnProfile && !isAdmin) {
    conditions.push(eq(profile.cvStatus, "approved"));
  }

  if (!isOwnProfile && !isAdmin && session?.user?.id) {
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
    .select(candidateFullSelect)
    .from(profile)
    .innerJoin(user, eq(profile.userId, user.id))
    .where(and(...conditions))
    .execute()
    .then((rows) => rows[0]);

  if (!row) return { error: "Profil tidak ditemukan atau tidak tersedia." };

  if (!isOwnProfile && !isAdmin) {
    row.photoUrl = null;
    row.ktpUrl = null;
  }

  return { data: row };
}
