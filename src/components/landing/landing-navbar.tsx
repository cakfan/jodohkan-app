import Link from "next/link";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { BrandLogo } from "@/components/brand-logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LandingNavbarProps {
  session: {
    user: {
      name: string;
      username?: string | null;
    };
  } | null;
}

export function LandingNavbar({ session }: LandingNavbarProps) {
  return (
    <nav className="absolute top-[54px] right-4 left-4 z-50 flex items-center justify-between md:top-[58px] md:right-8 md:left-8">
      <BrandLogo size="md" />
      <div className="flex items-center gap-4">
        {session ? (
          <Link
            href="/beranda"
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "hidden rounded-full md:inline-flex"
            )}
          >
            Dashboard
          </Link>
        ) : (
          <Link
            href="/masuk"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "hidden items-center rounded-full md:inline-flex"
            )}
          >
            Masuk
          </Link>
        )}
        <ThemeToggle />
      </div>
    </nav>
  );
}
