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
        birthPlace: raw.birthPlace,
        ethnicity: raw.ethnicity,
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
        partnerCity: raw.partnerCity,
        partnerOccupation: raw.partnerOccupation,
        partnerAgeMin: raw.partnerAgeMin,
        partnerAgeMax: raw.partnerAgeMax,
        religiousUnderstanding: raw.religiousUnderstanding,
        manhaj: raw.manhaj,
        memorization: raw.memorization,
        dailyWorship: raw.dailyWorship,
        qa: raw.qa as ProfileData["qa"],
        photoUrl: raw.photoUrl,
        photoBlurredUrl: raw.photoBlurredUrl,
        photoBlurred: raw.photoBlurred,
        ktpUrl: raw.ktpUrl,
        cvStatus: raw.cvStatus,
      }
    : null;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-10 space-y-1.5">
        <h1 className="text-2xl font-black tracking-tight md:text-3xl">CV Ta&apos;aruf</h1>
        <p className="text-muted-foreground max-w-xl text-sm leading-relaxed md:text-base">
          Lengkapi profil ta&apos;aruf Anda agar calon pasangan dan mediator dapat mengenal Anda
          lebih baik.
        </p>
      </div>
      <CVEditorForm initialData={existingProfile} />
    </div>
  );
}
