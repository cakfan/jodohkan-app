import { Metadata } from "next";
import Link from "next/link";
import { UserAuthForm } from "@/components/auth/user-auth-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Masuk | Pethuk Jodoh",
  description: "Masuk ke akun Pethuk Jodoh Anda untuk melanjutkan proses Ta'aruf.",
};

export default function SignInPage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-background selection:bg-primary/20 transition-colors duration-500">
      {/* Navigation Layer */}
      <nav className="absolute top-4 left-4 right-4 md:top-8 md:left-8 md:right-8 flex justify-between items-center z-50">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "group text-foreground/70 hover:text-primary transition-all rounded-full pl-2 hover:bg-primary/5"
          )}
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span className="font-semibold">Kembali</span>
        </Link>
        <ThemeToggle />
      </nav>

      {/* Atmospheric Background - Subtle Opacity */}
      <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none select-none">
        <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-primary/15 blur-[120px] animate-pulse opacity-70" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] animate-pulse opacity-60" style={{ animationDelay: '3s' }} />
      </div>

      <main className="w-full max-w-[500px] space-y-8 py-12 relative">
        {/* Identity & Message */}
        <header className="flex flex-col items-center space-y-6 text-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full group-hover:bg-primary/40 transition-all duration-500" />
            <div className="relative p-2 rounded-3xl bg-card border border-border/60 shadow-2xl">
              <BrandLogo size="lg" />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl font-black tracking-tighter lg:text-5xl">
              Selamat <span className="text-primary drop-shadow-sm">Datang</span>
            </h1>
            <p className="text-foreground/80 text-lg max-w-[340px] mx-auto leading-relaxed font-semibold">
              Masuk untuk melanjutkan ikhtiar menemukan pasangan impian.
            </p>
          </div>
        </header>

        {/* Auth Card */}
        <Card className="border-border/60 py-0 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-card/70 dark:bg-card/80 backdrop-blur-3xl overflow-hidden ring-1 ring-white/20 dark:ring-white/5">
          <CardHeader className="space-y-2 pb-8 pt-10 px-8 text-center border-b border-border/50 bg-muted/40">
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Masuk Akun</CardTitle>
            <CardDescription className="text-base font-semibold text-foreground/70">
              Gunakan username dan password Anda
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8 pt-10">
            <UserAuthForm />
          </CardContent>

          <CardFooter className="flex flex-col space-y-8 pb-10 px-8 bg-muted/20">
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-foreground/70 pt-6 border-t border-border/40 w-full font-medium">
              <span>Belum punya akun?</span>
              <Link
                href="/signup"
                className="font-bold text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline decoration-2"
              >
                Daftar sekarang
              </Link>
            </div>

            <div className="flex flex-col items-center space-y-4 w-full">
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span className="text-[10px] uppercase tracking-[0.25em] text-primary font-black">
                  Verified Security
                </span>
              </div>

              <p className="text-center text-[12px] text-foreground/60 leading-relaxed max-w-[360px] font-medium">
                Data Anda terenkripsi aman. Jika ada masalah silakan hubungi{" "}
                <Link href="/support" className="text-foreground font-bold hover:text-primary transition-colors hover:underline underline-offset-2">Layanan Bantuan</Link>.
              </p>
            </div>
          </CardFooter>
        </Card>

        <div className="text-center pt-4">
          <p className="text-sm text-foreground/60 italic leading-relaxed max-w-[400px] mx-auto font-medium">
            "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu isteri-isteri dari jenismu sendiri..."
          </p>
        </div>
      </main>
    </div>
  );
}
