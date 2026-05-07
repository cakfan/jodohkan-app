import { getServerSession } from "@/lib/get-server-session";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  const session = await getServerSession();

  if (!session?.user?.username) {
    redirect("/signin");
  }

  const existingProfile = session.user.id
    ? await db.query.profile.findFirst({
        where: (profile, { eq }) => eq(profile.userId, session.user.id),
      })
    : null;

  if (existingProfile?.onboardingCompleted) {
    redirect("/dashboard");
  }

  return <OnboardingForm />;
}
