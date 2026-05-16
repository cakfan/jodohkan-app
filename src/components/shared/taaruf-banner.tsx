"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Video, HeartHandshake, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BannerProps {
  active: boolean;
  phase: string | null;
}

export function TaarufBanner({ active, phase }: BannerProps) {
  const pathname = usePathname();

  if (!active || !phase) return null;

  switch (phase) {
    case "chat":
      return null;
    case "nadzor":
      return (
        <div className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 flex items-center justify-between border-b px-4 py-2 text-xs text-amber-800 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <Video className="size-3.5 shrink-0" />
            <span><strong>Fase Nadzor</strong> &mdash; Atur jadwal sesi video call</span>
          </div>
          {pathname !== "/pesan" && (
            <Link
              href="/pesan"
              className={cn(
                buttonVariants({ variant: "ghost", size: "xs" }),
                "text-xs"
              )}
            >
              Buka Halaman Nadzor
            </Link>
          )}
        </div>
      );
    case "khitbah":
      return (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 flex items-center gap-2 border-b px-4 py-2 text-xs text-emerald-800 dark:text-emerald-200">
          <HeartHandshake className="size-3.5 shrink-0" />
          <span><strong>Tahap Khitbah</strong> &mdash; Barakallahu lakuma</span>
        </div>
      );
    case "completed":
      return (
        <div className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 flex items-center gap-2 border-b px-4 py-2 text-xs text-blue-800 dark:text-blue-200">
          <Sparkles className="size-3.5 shrink-0" />
          <span><strong>Ta&apos;aruf Selesai</strong> &mdash; Alhamdulillah</span>
        </div>
      );
    default:
      return null;
  }
}
