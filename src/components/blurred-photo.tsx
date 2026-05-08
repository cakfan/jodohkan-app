"use client";

import { useState } from "react";
import Image from "next/image";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BlurredPhotoProps {
  blurredSrc: string | null | undefined;
  originalSrc?: string | null;
  alt?: string;
  size?: "sm" | "md" | "lg";
  canToggle?: boolean;
}

const sizeMap = {
  sm: "h-16 w-16 md:h-20 md:w-20",
  md: "h-32 w-32 md:h-40 md:w-40",
  lg: "h-48 w-48 md:h-56 md:w-56",
};

export function BlurredPhoto({
  blurredSrc,
  originalSrc,
  alt = "Foto profil",
  size = "md",
  canToggle = false,
}: BlurredPhotoProps) {
  const [showOriginal, setShowOriginal] = useState(false);

  if (!blurredSrc) {
    return (
      <div
        className={`bg-muted flex items-center justify-center rounded-2xl ${sizeMap[size]}`}
      >
        <Lock className="text-muted-foreground h-6 w-6 md:h-8 md:w-8" />
      </div>
    );
  }

  const dims = size === "sm" ? 80 : size === "md" ? 160 : 224;
  const src = showOriginal && originalSrc ? originalSrc : blurredSrc;

  return (
    <div className="relative inline-block">
      <div className="relative overflow-hidden rounded-2xl">
        <Image
          src={src}
          alt={alt}
          width={dims}
          height={dims}
          className={`${sizeMap[size]} object-cover`}
          unoptimized
        />
        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/5" />
        {!showOriginal && (
          <div className="bg-background/60 absolute inset-x-0 bottom-0 px-3 py-1.5 text-center text-[10px] font-semibold tracking-wider uppercase backdrop-blur-sm">
            Tersamarkan
          </div>
        )}
      </div>

      {canToggle && originalSrc && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-2 right-2 h-7 w-7 rounded-full shadow-sm"
          onClick={() => setShowOriginal(!showOriginal)}
          title={showOriginal ? "Samarkan foto" : "Lihat foto asli"}
        >
          {showOriginal ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </Button>
      )}
    </div>
  );
}
