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
    <div className="p-4 md:p-6">
      <CVEditorForm initialData={existingProfile} />
    </div>
  );
}
