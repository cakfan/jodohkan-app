import { Suspense } from "react";
import { getServerSession } from "@/lib/get-server-session";
import { db } from "@/db";
import type { ProfileData } from "@/app/actions/profile";
import { CVEditorForm } from "./cv-editor-form";
import { isUserInActiveTaaruf } from "@/app/actions/taaruf";
import { Skeleton } from "@/components/ui/skeleton";

function CVEditSkeleton() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <Skeleton className="h-10 w-40" />
      <Skeleton className="h-96 w-full rounded-2xl" />
      <Skeleton className="h-96 w-full rounded-2xl" />
    </div>
  );
}

export default function CVEditPage() {
  return (
    <Suspense fallback={<CVEditSkeleton />}>
      <CVEditContent />
    </Suspense>
  );
}

async function CVEditContent() {
  const session = await getServerSession();
  const userId = session?.user?.id;

  const [raw, activeTaaruf] = await Promise.all([
    userId
      ? db.query.profile.findFirst({
          where: (profile, { eq }) => eq(profile.userId, userId),
        })
      : null,
    userId ? isUserInActiveTaaruf(userId) : false,
  ]);

  const existingProfile: ProfileData | null = raw
    ? {
        name: session?.user?.name,
        gender: session?.user?.gender ?? raw.gender,
        birthDate: raw.birthDate,
        birthPlace: raw.birthPlace,
        ethnicity: raw.ethnicity,
        height: raw.height,
        weight: raw.weight,
        skinColor: raw.skinColor,
        maritalStatus: raw.maritalStatus,
        childCount: raw.childCount,
        hairColor: raw.hairColor,
        hairType: raw.hairType,
        hijabStatus: raw.hijabStatus,
        faceAppearance: raw.faceAppearance,
        otherPhysicalTraits: raw.otherPhysicalTraits,
        marriageTarget: raw.marriageTarget,
        polygamyView: raw.polygamyView,
        parentsInvolvement: raw.parentsInvolvement,
        smokingStatus: raw.smokingStatus,
        personalityTraits: raw.personalityTraits,
        interests: raw.interests,
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
        published: raw.published,
      }
    : null;

  return (
    <div className="p-4 md:p-6">
      <CVEditorForm initialData={existingProfile} isInActiveTaaruf={activeTaaruf} />
    </div>
  );
}
