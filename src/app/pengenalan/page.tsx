import { Suspense } from "react";
import { getServerSession } from "@/lib/get-server-session";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { OnboardingForm } from "./onboarding-form";

function OnboardingPageContent() {
  return null;
}

async function OnboardingLoader() {
  const session = await getServerSession();

  if (!session?.user?.username) {
    redirect("/masuk");
  }

  const existingProfile = session.user.id
    ? await db.query.profile.findFirst({
        where: (profile, { eq }) => eq(profile.userId, session.user.id),
      })
    : null;

  if (existingProfile?.onboardingCompleted) {
    redirect("/beranda");
  }

  return <OnboardingForm userName={session.user.name} />;
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<OnboardingPageContent />}>
      <OnboardingLoader />
    </Suspense>
  );
}
