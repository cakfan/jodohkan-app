"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="bg-primary py-24 px-4 text-center">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tight text-primary-foreground md:text-4xl">
            Siap Memulai Perjalanan?
          </h2>
          <p className="text-primary-foreground/80 mx-auto max-w-2xl text-lg">
            Bergabunglah dengan muslim dan muslimah yang mencari pasangan hidup
            melalui proses yang terjaga dan penuh berkah.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/daftar"
            className="inline-flex items-center gap-2 rounded-full px-8 py-3 text-base font-semibold transition-all duration-200 ease-in-out bg-primary-foreground text-primary hover:bg-accent hover:text-accent-foreground"
          >
            Daftar Sekarang
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="space-y-1">
          <p className="text-[12px] text-primary-foreground/80">
            Bergabunglah dengan 312 member yang sudah mendaftar lebih awal
          </p>
          <p className="text-[11px] tracking-wider text-primary-foreground/70">
            Gratis · Tanpa kartu kredit · Slot terbatas
          </p>
        </div>
      </div>
    </section>
  );
}
