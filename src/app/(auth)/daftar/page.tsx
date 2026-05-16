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
  title: "Daftar | Jodohkan",
  description: "Daftar akun Jodohkan Anda untuk memulai proses Ta'aruf.",
};

export default function SignUpPage() {
  return (
    <div className="bg-background selection:bg-primary/20 relative flex min-h-screen flex-col items-center justify-center p-4 transition-colors duration-500 md:p-8">
      {/* Noise Texture Overlay */}
      <div
        className="pointer-events-none fixed inset-0 -z-20 hidden opacity-[0.025] dark:hidden"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
      />

      {/* Navigation Layer */}
      <nav className="absolute top-4 right-4 left-4 z-50 flex items-center justify-between md:top-8 md:right-8 md:left-8">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "group hover:text-accent rounded-full pl-2 transition-all"
          )}
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span className="font-semibold">Kembali</span>
        </Link>
        <ThemeToggle />
      </nav>

      {/* Atmospheric Background */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden select-none">
        <div className="bg-primary/15 absolute top-[-10%] right-[-5%] h-[50%] w-[50%] animate-pulse rounded-full opacity-70 blur-[120px]" />
        <div
          className="bg-primary/10 absolute bottom-[-10%] left-[-5%] h-[50%] w-[50%] animate-pulse rounded-full opacity-60 blur-[120px]"
          style={{ animationDelay: "3s" }}
        />
      </div>

      <main className="relative w-full max-w-[520px] space-y-10 py-12 max-[480px]:px-0">
        {/* Identity & Message */}
        <header className="flex flex-col items-center space-y-6 text-center">
          {/* Logo */}
          <div className="animate-fade-in-up group relative opacity-0 [animation-delay:0ms]">
            {/* Dark mode radial glow */}
            <div className="absolute inset-[-20px] rounded-full bg-[radial-gradient(ellipse_at_center,color-mix(in_oklch,var(--color-primary)_8%,transparent),transparent_70%)] opacity-0 transition-opacity dark:opacity-100" />
            <div className="bg-primary/30 group-hover:bg-primary/40 absolute inset-0 rounded-full blur-2xl transition-all duration-500" />
            <BrandLogo size="lg" />
          </div>

          {/* Heading */}
          <div className="animate-fade-in-up space-y-4 opacity-0 [animation-delay:150ms]">
            <h1 className="text-4xl font-black tracking-tighter lg:text-5xl">
              Mulai Ikhtiar <span className="text-accent drop-shadow-sm">Mulia</span>
            </h1>

            {/* Decorative line */}
            <div className="flex items-center justify-center gap-2">
              <span className="bg-secondary/60 block h-px w-12" />
              <span className="bg-secondary/60 block h-px w-2" />
              <span className="bg-secondary/60 block h-px w-12" />
            </div>

            <p className="text-foreground/80 mx-auto max-w-md text-lg leading-relaxed font-semibold">
              Daftar sekarang untuk menemukan pasangan hidup yang sevisi dan seiman.
            </p>
          </div>
        </header>

        {/* Registration Card */}
        <div className="animate-fade-in-up opacity-0 [animation-delay:300ms]">
          <Card className="border-border/60 bg-card/70 dark:bg-card/80 dark:border-border overflow-hidden py-0 shadow-xl backdrop-blur-3xl">
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
                  href="/masuk"
                  className="text-primary font-bold decoration-2 underline-offset-4 transition-all duration-200 hover:underline"
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
                  Jodohkan.
                </p>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
