"use client";

import Link from "next/link";
import { ArrowRight, Heart, Shield, Users } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  session: {
    user: {
      name: string;
      username?: string | null;
    };
  } | null;
}

const trustIndicators = [
  {
    icon: Shield,
    label: "Terjaga Syar&apos;i",
    delay: 700,
  },
  {
    icon: Users,
    label: "Didampingi Mediator",
    delay: 900,
  },
  {
    icon: Heart,
    label: "Tujuan Menikah",
    delay: 1100,
  },
];

export function HeroSection({ session }: HeroSectionProps) {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-24 text-center">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden select-none">
        <div className="bg-primary/15 absolute top-[-10%] right-[-10%] h-[60%] w-[60%] animate-pulse rounded-full opacity-70 blur-[120px]" />
        <div
          className="bg-primary/10 absolute bottom-[-10%] left-[-10%] h-[60%] w-[60%] animate-pulse rounded-full opacity-60 blur-[120px]"
          style={{ animationDelay: "3s" }}
        />
      </div>

      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-4">
          <div className="mx-auto flex w-fit animate-fade-in-up items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary dark:text-accent [animation-delay:0ms]">
            <Heart className="h-4 w-4 animate-pulse" />
            Platform Ta&apos;aruf Islami Terpercaya
          </div>

          <h1 className="font-heading text-4xl font-medium tracking-tight leading-none animate-fade-in-up [animation-delay:150ms] md:text-6xl lg:text-7xl">
            Jodohmu Bukan Kebetulan.
          </h1>

          <p className="text-foreground/80 mx-auto max-w-2xl text-lg leading-relaxed animate-fade-in-up [animation-delay:300ms] md:text-xl">
            Capek kenalan yang tidak jelas arahnya? Jodohkan hadir untuk kamu
            yang serius menuju pernikahan — dengan proses yang terjaga,
            berpendamping, dan sesuai syariah.
          </p>
        </div>

        <div className="flex animate-fade-in-up flex-col items-center justify-center gap-4 [animation-delay:500ms] sm:flex-row">
          {session ? (
            <Link
              href="/beranda"
              className={cn(
                buttonVariants({ size: "lg" }),
                "group gap-2 rounded-full px-8 text-base font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
              )}
            >
              Lihat Dashboard
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          ) : (
            <>
              <Link
                href="/daftar"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "group gap-2 rounded-full px-8 text-base font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                )}
              >
                Daftar Sebagai Member Awal
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/masuk"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "group rounded-full px-8 text-base font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                )}
              >
                Sudah Punya Akun
              </Link>
            </>
          )}
        </div>

        {!session && (
          <p className="animate-fade-in-up text-[11px] text-foreground/60 text-center [animation-delay:600ms]">
            Gratis · Tanpa kartu kredit · Proses diverifikasi manual
          </p>
        )}

        <div className="mx-auto grid max-w-2xl gap-8 pt-8 sm:grid-cols-3">
          {trustIndicators.map((indicator) => (
            <div
              key={indicator.label}
              className="group flex cursor-default animate-fade-in-up flex-col items-center gap-2"
              style={{ animationDelay: `${indicator.delay}ms` }}
            >
              <div className="bg-primary/10 group-hover:bg-primary/20 group-hover:shadow-md flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300">
                <indicator.icon className="text-primary dark:text-accent h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <span className="text-sm font-semibold group-hover:text-primary dark:group-hover:text-accent transition-colors duration-300">
                {indicator.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
