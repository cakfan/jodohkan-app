import { getServerSession } from "@/lib/get-server-session";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HowItWorksSection } from "@/components/landing/how-it-works";
import { CTASection } from "@/components/landing/cta-section";

export default async function Home() {
  const session = await getServerSession();

  if (session?.user.id && session.user.username) {
    const existingProfile = await db.query.profile.findFirst({
      where: (profile, { eq }) => eq(profile.userId, session.user.id),
    });

    if (!existingProfile?.onboardingCompleted) {
      redirect("/onboarding");
    }

    redirect("/dashboard");
  }

  return (
    <div className="relative min-h-screen bg-background">
      <LandingNavbar session={session} />
      <HeroSection session={session} />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />

      <footer className="bg-muted/30 border-t px-4 py-12 text-center">
        <div className="mx-auto max-w-6xl space-y-4">
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} Pethuk Jodoh. Semua hak dilindungi.
          </p>
          <p className="text-muted-foreground/70 text-xs max-w-lg mx-auto leading-relaxed">
            Platform Ta&apos;aruf Islami yang aman, terjaga, dan mengikuti kaidah syar&apos;i
          </p>
        </div>
      </footer>
    </div>
  );
}
