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
    <nav className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between md:top-8 md:left-8 md:right-8">
      <BrandLogo size="md" />
      <div className="flex items-center gap-4">
        {session ? (
          <Link
            href="/dashboard"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "rounded-full hidden md:inline-flex"
            )}
          >
            Dashboard
          </Link>
        ) : (
          <Link
            href="/signin"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "rounded-full hidden md:inline-flex"
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
