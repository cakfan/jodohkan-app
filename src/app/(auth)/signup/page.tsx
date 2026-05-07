import { Metadata } from "next";
import Link from "next/link";
import { UserSignUpForm } from "@/components/auth/user-sign-up-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Daftar | Pethuk Jodoh",
  description: "Daftar akun Pethuk Jodoh Anda untuk memulai proses Ta'aruf.",
};

export default function SignUpPage() {
  return (
    <div className="bg-background selection:bg-primary/20 relative flex min-h-screen flex-col items-center justify-center p-4 transition-colors duration-500 md:p-8">
      {/* Navigation Layer */}
      <nav className="absolute top-4 right-4 left-4 z-50 flex items-center justify-between md:top-8 md:right-8 md:left-8">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "group text-foreground/70 hover:text-primary hover:bg-primary/5 rounded-full pl-2 transition-all"
          )}
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span className="font-semibold">Kembali</span>
        </Link>
        <ThemeToggle />
      </nav>

      {/* Atmospheric Background - Subtle Opacity */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden select-none">
        <div className="bg-primary/15 absolute top-[-10%] right-[-5%] h-[50%] w-[50%] animate-pulse rounded-full opacity-70 blur-[120px]" />
        <div
          className="bg-primary/10 absolute bottom-[-10%] left-[-5%] h-[50%] w-[50%] animate-pulse rounded-full opacity-60 blur-[120px]"
          style={{ animationDelay: "3s" }}
        />
      </div>

      <main className="relative w-full max-w-[520px] space-y-8 py-12">
        {/* Identity & Message */}
        <header className="flex flex-col items-center space-y-6 text-center">
          <div className="group relative">
            <div className="bg-primary/30 group-hover:bg-primary/40 absolute inset-0 rounded-full blur-2xl transition-all duration-500" />
            <div className="bg-card border-border/60 relative rounded-3xl border p-2 shadow-2xl">
              <BrandLogo size="lg" />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl font-black tracking-tighter lg:text-5xl">
              Mulai Ikhtiar <span className="text-primary drop-shadow-sm">Mulia</span>
            </h1>
            <p className="text-foreground/80 mx-auto max-w-[340px] text-lg leading-relaxed font-semibold">
              Daftar sekarang untuk menemukan pasangan hidup yang sevisi dan seiman.
            </p>
          </div>
        </header>

        {/* Enrollment Card - Increased Contrast */}
        <Card className="border-border/60 bg-card/70 dark:bg-card/80 overflow-hidden py-0 shadow-[0_20px_50px_rgba(0,0,0,0.1)] ring-1 ring-white/20 backdrop-blur-3xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] dark:ring-white/5">
          <CardHeader className="border-border/50 bg-muted/40 space-y-2 border-b px-8 pt-10 pb-8 text-center">
            <CardTitle className="text-foreground text-2xl font-bold tracking-tight">
              Registrasi Akun
            </CardTitle>
            <CardDescription className="text-foreground/70 text-base font-semibold">
              Data Anda aman dan terenkripsi sesuai syariat
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8 pt-10">
            <UserSignUpForm />
          </CardContent>

          <CardFooter className="bg-muted/20 flex flex-col space-y-8 px-8 pb-10">
            <div className="text-foreground/70 border-border/40 flex w-full flex-wrap items-center justify-center gap-2 border-t pt-6 text-sm font-medium">
              <span>Sudah punya akun?</span>
              <Link
                href="/signin"
                className="text-primary hover:text-primary/80 font-bold decoration-2 underline-offset-4 transition-colors hover:underline"
              >
                Masuk di sini
              </Link>
            </div>

            <div className="flex w-full flex-col items-center space-y-4">
              <div className="bg-primary/10 border-primary/20 flex items-center gap-2 rounded-full border px-4 py-1.5 shadow-sm">
                <ShieldCheck className="text-primary h-4 w-4" />
                <span className="text-primary text-[10px] font-black tracking-[0.25em] uppercase">
                  Verified Security
                </span>
              </div>

              <p className="text-foreground/60 max-w-[360px] text-center text-[12px] leading-relaxed font-medium">
                Dengan mendaftar, Anda menyetujui seluruh{" "}
                <Link
                  href="/terms"
                  className="text-foreground hover:text-primary font-bold underline-offset-2 transition-colors hover:underline"
                >
                  Ketentuan Layanan
                </Link>{" "}
                dan{" "}
                <Link
                  href="/privacy"
                  className="text-foreground hover:text-primary font-bold underline-offset-2 transition-colors hover:underline"
                >
                  Kebijakan Privasi
                </Link>{" "}
                Pethuk Jodoh.
              </p>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
