import { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Reset Password | Jodohkan",
  description: "Buat password baru untuk akun Jodohkan Anda.",
};

export const dynamic = "force-dynamic";

function ResetPasswordFallback() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <p className="text-muted-foreground">Memuat...</p>
    </div>
  );
}

export default function ResetPasswordPage() {
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

      <nav className="absolute top-4 right-4 left-4 z-50 flex items-center justify-between md:top-8 md:right-8 md:left-8">
        <Link
          href="/signin"
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

      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden select-none">
        <div className="bg-primary/15 absolute top-[-10%] right-[-5%] h-[50%] w-[50%] animate-pulse rounded-full opacity-70 blur-[120px]" />
        <div
          className="bg-primary/10 absolute bottom-[-10%] left-[-5%] h-[50%] w-[50%] animate-pulse rounded-full opacity-60 blur-[120px]"
          style={{ animationDelay: "3s" }}
        />
      </div>

      <main className="relative w-full max-w-[500px] space-y-10 py-12 max-[480px]:px-0">
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
              Reset <span className="text-primary drop-shadow-sm">Password</span>
            </h1>

            {/* Decorative line */}
            <div className="flex items-center justify-center gap-2">
              <span className="bg-secondary/60 block h-px w-12" />
              <span className="bg-secondary/60 block h-px w-2" />
              <span className="bg-secondary/60 block h-px w-12" />
            </div>

            <p className="text-foreground/80 mx-auto max-w-[340px] text-lg leading-relaxed font-semibold">
              Buat password baru untuk akun Anda.
            </p>
          </div>
        </header>

        <div className="animate-fade-in-up opacity-0 [animation-delay:300ms]">
          <Card className="border-border/60 bg-card/70 dark:bg-card/80 overflow-hidden py-0 shadow-[0_20px_50px_color-mix(in_oklch,var(--color-primary)_8%,transparent)] backdrop-blur-3xl dark:border-border dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
            <CardContent className="p-8">
              <Suspense fallback={<ResetPasswordFallback />}>
                <ResetPasswordForm />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
