import { getServerSession } from "@/lib/get-server-session";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { EarlyAccessBanner } from "@/components/landing/early-banner";
import { HeroSection } from "@/components/landing/hero-section";
import { EarlyBenefitsSection } from "@/components/landing/early-benefits";
import { FeaturesSection } from "@/components/landing/features-section";
import { HowItWorksSection } from "@/components/landing/how-it-works";
import { TrustSection } from "@/components/landing/trust-section";
import { CTASection } from "@/components/landing/cta-section";

function SectionDivider() {
  return (
    <div className="flex items-center justify-center py-2">
      <div className="h-px w-16 bg-[#E8C4B8]" />
      <div className="mx-3 text-xs text-[#E8C4B8]">✦</div>
      <div className="h-px w-16 bg-[#E8C4B8]" />
    </div>
  );
}

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
    <div className="bg-background relative min-h-screen">
      <LandingNavbar session={session} />
      <EarlyAccessBanner />
      <HeroSection session={session} />
      <SectionDivider />
      <EarlyBenefitsSection />
      <SectionDivider />
      <FeaturesSection />
      <SectionDivider />
      <HowItWorksSection />
      <SectionDivider />
      <TrustSection />
      <CTASection />

      <footer className="bg-muted/30 border-t px-4 py-12 text-center">
        <div className="mx-auto max-w-6xl space-y-4">
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} Jodohkan. Semua hak dilindungi.
          </p>
          <p className="text-muted-foreground/70 mx-auto max-w-lg text-xs leading-relaxed">
            Platform Ta&apos;aruf Islami yang aman, terjaga, dan mengikuti kaidah syar&apos;i
          </p>
        </div>
      </footer>
    </div>
  );
}
