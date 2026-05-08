import { getServerSession } from "@/lib/get-server-session";
import { db } from "@/db";
import type { ProfileData } from "@/app/actions/profile";
import { CVEditorForm } from "./cv-editor-form";

export default async function CVEditPage() {
  const session = await getServerSession();
  const userId = session?.user?.id;

  const raw = userId
    ? await db.query.profile.findFirst({
        where: (profile, { eq }) => eq(profile.userId, userId),
      })
    : null;

  const existingProfile: ProfileData | null = raw
    ? {
        gender: raw.gender,
        birthDate: raw.birthDate,
        height: raw.height,
        weight: raw.weight,
        skinColor: raw.skinColor,
        maritalStatus: raw.maritalStatus,
        country: raw.country,
        city: raw.city,
        occupation: raw.occupation,
        education: raw.education,
        bio: raw.bio,
        vision: raw.vision,
        mission: raw.mission,
        partnerCriteria: raw.partnerCriteria,
        religiousUnderstanding: raw.religiousUnderstanding,
        manhaj: raw.manhaj,
        memorization: raw.memorization,
        dailyWorship: raw.dailyWorship,
        qa: raw.qa as ProfileData["qa"],
        photoUrl: raw.photoUrl,
        photoBlurredUrl: raw.photoBlurredUrl,
        photoBlurred: raw.photoBlurred,
      }
    : null;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">CV Ta&apos;aruf</h1>
        <p className="text-muted-foreground mt-1">
          Lengkapi profil ta&apos;aruf Anda agar calon pasangan dan mediator dapat mengenal Anda
          lebih baik.
        </p>
      </div>
      <CVEditorForm initialData={existingProfile} />
    </div>
  );
}
