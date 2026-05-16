import { Suspense } from "react";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { EarlyAccessBanner } from "@/components/landing/early-banner";
import { HeroSection } from "@/components/landing/hero-section";
import { EarlyBenefitsSection } from "@/components/landing/early-benefits";
import { FeaturesSection } from "@/components/landing/features-section";
import { HowItWorksSection } from "@/components/landing/how-it-works";
import { TrustSection } from "@/components/landing/trust-section";
import { CTASection } from "@/components/landing/cta-section";
import { CopyrightYear } from "./copyright-year";

function SectionDivider() {
  return (
    <div className="flex items-center justify-center py-2">
      <div className="h-px w-16 bg-primary/20" />
      <div className="mx-3 text-xs text-primary/40">✦</div>
      <div className="h-px w-16 bg-primary/20" />
    </div>
  );
}

export default function Home() {
  return (
    <div className="bg-background relative min-h-screen">
      <LandingNavbar session={null} />
      <EarlyAccessBanner />
      <HeroSection session={null} />
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
            &copy; <Suspense fallback={null}><CopyrightYear /></Suspense> Jodohkan. Semua hak dilindungi.
          </p>
          <p className="text-muted-foreground/70 mx-auto max-w-lg text-xs leading-relaxed">
            Platform Ta&apos;aruf Islami yang aman, terjaga, dan mengikuti kaidah syar&apos;i
          </p>
        </div>
      </footer>
    </div>
  );
}
