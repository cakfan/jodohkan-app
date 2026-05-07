"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { SetupUsernameForm } from "@/components/auth/setup-username-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { ArrowLeft, UserPlus, Loader2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";

export default function SetupUsernamePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const checkSession = async () => {
      const { data } = await authClient.getSession();

      if (!data) {
        router.push("/signin");
        return;
      }

      if (data.user.username) {
        router.push("/");
        return;
      }

      setIsLoading(false);
    };

    checkSession();
  }, [router]);

  if (isLoading) {
    return (
      <div className="bg-background relative flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-background selection:bg-primary/20 relative flex min-h-screen flex-col items-center justify-center p-4 transition-colors duration-500 md:p-8">
      <nav className="absolute top-4 right-4 left-4 z-50 flex items-center justify-between md:top-8 md:right-8 md:left-8">
        <a
          href="/signin"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "group text-foreground/70 hover:text-primary hover:bg-primary/5 rounded-full pl-2 transition-all"
          )}
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span className="font-semibold">Kembali</span>
        </a>
        <ThemeToggle />
      </nav>

      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden select-none">
        <div className="bg-primary/15 absolute top-[-10%] right-[-5%] h-[50%] w-[50%] animate-pulse rounded-full opacity-70 blur-[120px]" />
        <div
          className="bg-primary/10 absolute bottom-[-10%] left-[-5%] h-[50%] w-[50%] animate-pulse rounded-full opacity-60 blur-[120px]"
          style={{ animationDelay: "3s" }}
        />
      </div>

      <main className="relative w-full max-w-[500px] space-y-8 py-12">
        <header className="flex flex-col items-center space-y-6 text-center">
          <div className="group relative">
            <div className="bg-primary/30 group-hover:bg-primary/40 absolute inset-0 rounded-full blur-2xl transition-all duration-500" />
            <div className="bg-card border-border/60 relative rounded-3xl border p-2 shadow-2xl">
              <BrandLogo size="lg" />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl font-black tracking-tighter lg:text-5xl">
              Pilih <span className="text-primary drop-shadow-sm">Username</span>
            </h1>
            <p className="text-foreground/80 mx-auto max-w-[340px] text-lg leading-relaxed font-semibold">
              Lengkapi username untuk melanjutkan ke dashboard.
            </p>
          </div>
        </header>

        <Card className="border-border/60 bg-card/70 dark:bg-card/80 overflow-hidden py-0 shadow-[0_20px_50px_rgba(0,0,0,0.1)] ring-1 ring-white/20 backdrop-blur-3xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] dark:ring-white/5">
          <CardHeader className="border-border/50 bg-muted/40 space-y-2 border-b px-8 pt-10 pb-8 text-center">
            <CardTitle className="text-foreground flex items-center justify-center gap-2 text-2xl font-bold tracking-tight">
              <UserPlus className="text-primary h-5 w-5" />
              Setup Username
            </CardTitle>
            <CardDescription className="text-foreground/70 text-base font-semibold">
              Username ini akan digunakan untuk login dan profil Anda
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8 pt-10">
            <SetupUsernameForm />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
