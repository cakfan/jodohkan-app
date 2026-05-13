/* eslint-disable @next/next/no-img-element */
"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const wrapperSizes = {
  sm: "size-8",
  md: "size-10",
  lg: "size-14",
  xl: "size-16",
};

function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function BrandLogo({ className, size = "md" }: BrandLogoProps) {
  const mounted = useHydrated();
  const { resolvedTheme } = useTheme();

  if (!mounted) {
    return <div className={cn("shrink-0", wrapperSizes[size], className)} />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div className={cn("shrink-0", wrapperSizes[size], className)}>
      <img
        src={isDark ? "/brand/dark.svg" : "/brand/light.svg"}
        alt="Jodohkan"
        className="size-full origin-center scale-[1.8]"
      />
    </div>
  );
}
