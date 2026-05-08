"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  Eye,
  Users,
  BookText,
  Check,
  ArrowRight,
  ArrowLeft,
  ScrollText,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { completeOnboarding } from "@/app/actions/onboarding";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";

const adabList = [
  {
    number: 1,
    icon: Heart,
    title: "Niat yang Lurus",
    description:
      "Memulai ta'aruf dengan niat karena Allah سُبْحَانَهُ وَتَعَالَىٰ, bukan karena faktor fisik atau duniawi semata. Niat yang ikhlas menjadi fondasi keberkahan di setiap langkah.",
  },
  {
    number: 2,
    icon: Eye,
    title: "Menjaga Pandangan",
    description:
      "Tidak melihat calon pasangan secara berlebihan. Foto akan diburamkan secara default dan hanya dapat dibuka saat tahap Nazhar dengan persetujuan bersama.",
  },
  {
    number: 3,
    icon: Users,
    title: "Didampingi Mediator",
    description:
      "Setiap komunikasi selalu melibatkan mediator (murabbi/wali/ustadz) untuk menjaga adab, memberikan nasihat, dan memastikan proses berjalan sesuai syariat.",
  },
  {
    number: 4,
    icon: BookText,
    title: "Fokus pada Visi Hidup",
    description:
      "Pertukaran informasi difokuskan pada visi berumah tangga, pemahaman agama, dan kesiapan mental. Bukan pada hal-hal duniawi yang tidak esensial.",
  },
];

const commitmentText =
  "Saya berkomitmen untuk mengikuti aturan syar'i dalam proses ta'aruf di platform ini. Saya memahami bahwa Pethuk Jodoh adalah wasilah (perantara) dan keberhasilannya kembali kepada Allah سُبْحَانَهُ وَتَعَالَىٰ. Saya akan menjaga adab, kejujuran, dan keseriusan dalam setiap tahapan.";

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-10 flex items-center justify-center gap-3">
      <div className="flex items-center gap-2">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
            currentStep >= 1
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {currentStep > 1 ? <Check className="h-4 w-4" /> : 1}
        </div>
        <span
          className={`text-sm font-medium transition-colors ${
            currentStep >= 1 ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          Panduan
        </span>
      </div>
      <div
        className={`h-px w-12 transition-colors ${currentStep >= 2 ? "bg-primary" : "bg-border"}`}
      />
      <div className="flex items-center gap-2">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
            currentStep >= 2
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          2
        </div>
        <span
          className={`text-sm font-medium transition-colors ${
            currentStep >= 2 ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          Komitmen
        </span>
      </div>
    </div>
  );
}

export function OnboardingForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const [step, setStep] = useState(1);
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const userName = session?.user?.name || "Pengguna";

  async function handleCommit() {
    if (!agreed) {
      toast.error("Anda harus menyetujui pernyataan komitmen untuk melanjutkan.");
      return;
    }

    setIsLoading(true);

    const result = await completeOnboarding();

    if (result?.error) {
      toast.error(result.error);
      setIsLoading(false);
      return;
    }

    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <StepIndicator currentStep={step} />

      {step === 1 && (
        <div className="animate-fade-in-up space-y-10">
          <div className="space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="animate-fade-in-up text-4xl leading-none font-black tracking-tighter [animation-delay:150ms] md:text-5xl lg:text-6xl">
                Selamat Datang, <span className="text-primary">{userName}</span>
              </h1>
              <p className="text-muted-foreground animate-fade-in-up mx-auto max-w-xl text-lg leading-relaxed [animation-delay:300ms] md:text-xl">
                Sebelum memulai, pahami panduan adab ta&apos;aruf berikut. Proses yang berkah
                dimulai dari niat dan cara yang benar.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {adabList.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="group border-border/50 bg-card hover:border-primary/30 relative overflow-hidden rounded-xl border p-5 shadow-sm transition-all duration-300 hover:shadow-md"
                >
                  <div className="absolute top-0 right-0 flex h-12 w-12 items-start justify-end pt-2 pr-2">
                    <span className="text-muted-foreground/10 font-mono text-4xl font-black">
                      {String(item.number).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="relative space-y-3">
                    <div className="bg-primary/10 group-hover:bg-primary/15 flex h-10 w-10 items-center justify-center rounded-lg transition-colors">
                      <Icon className="text-primary h-5 w-5" />
                    </div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center pt-2">
            <Button
              size="lg"
              className="h-12 gap-2 rounded-full px-10 text-base font-semibold shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md"
              onClick={() => setStep(2)}
            >
              Lanjut ke Komitmen
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade-in-up space-y-10">
          <div className="space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="animate-fade-in-up text-4xl leading-none font-black tracking-tighter [animation-delay:150ms] md:text-5xl lg:text-6xl">
                Pernyataan <span className="text-primary">Komitmen</span>
              </h1>
              <p className="text-muted-foreground animate-fade-in-up mx-auto max-w-xl text-lg leading-relaxed [animation-delay:300ms] md:text-xl">
                Bacalah pernyataan berikut dengan seksama. Komitmen ini adalah fondasi perjalanan
                ta&apos;aruf Anda.
              </p>
            </div>
          </div>

          <div className="border-primary/20 from-card via-card to-primary/5 relative overflow-hidden rounded-2xl border-2 bg-linear-to-br p-6 shadow-sm md:p-8">
            <div className="pointer-events-none absolute top-0 right-0 opacity-5 select-none">
              <span className="font-arabic text-[120px] leading-none font-black md:text-[180px]">
                ﷽
              </span>
            </div>
            <div className="relative space-y-4">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
                  <ScrollText className="text-primary h-4 w-4" />
                </div>
                <span className="text-primary text-sm font-semibold tracking-wider uppercase">
                  Ikrar Ta&apos;aruf
                </span>
              </div>
              <blockquote className="text-card-foreground/90 relative text-base leading-relaxed md:text-lg">
                &ldquo;{commitmentText}&rdquo;
              </blockquote>
              <div className="bg-primary/5 border-primary/10 flex items-start gap-3 rounded-xl border p-4">
                <Checkbox
                  id="commitment"
                  checked={agreed}
                  onCheckedChange={(checked) => setAgreed(checked === true)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground mt-0.5 h-5 w-5 rounded-md border-2"
                  disabled={isLoading}
                />
                <Label htmlFor="commitment" className="text-sm leading-relaxed font-medium">
                  Saya menyetujui dan berkomitmen pada pernyataan di atas
                </Label>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <Button
              size="lg"
              className="h-12 gap-2 rounded-full px-10 text-base font-semibold shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md disabled:hover:scale-100 disabled:hover:shadow-none"
              disabled={!agreed || isLoading}
              onClick={handleCommit}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Spinner />
                  Memproses...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Mulai Perjalanan Ta&apos;aruf
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground gap-1 text-sm"
                onClick={() => setStep(1)}
                disabled={isLoading}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Kembali ke Panduan
              </Button>
            </div>
            <p className="text-muted-foreground text-xs">
              Dengan melanjutkan, Anda menyetujui{" "}
              <span className="hover:text-foreground cursor-pointer underline underline-offset-2 transition-colors">
                Syarat & Ketentuan
              </span>{" "}
              dan{" "}
              <span className="hover:text-foreground cursor-pointer underline underline-offset-2 transition-colors">
                Kebijakan Privasi
              </span>{" "}
              Pethuk Jodoh
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
