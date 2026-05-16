"use client";

import { useEffect, useState } from "react";

const TOTAL_SLOTS = 500;
const FILLED = 312;

export function EarlyAccessBanner() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const steps = 60;
    const increment = FILLED / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= FILLED) {
        setCount(FILLED);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, []);

  const progressPercent = (count / TOTAL_SLOTS) * 100;

  return (
    <div className="flex min-h-[40px] w-full items-center bg-accent px-4 py-[10px]">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-1.5">
        <span className="text-[12px] font-medium text-accent-foreground">
          ✦ Akses Awal Terbuka — Hanya 500 Slot Pertama &nbsp;·&nbsp; {count} / {TOTAL_SLOTS} terisi
        </span>
        <div className="bg-accent-foreground/20 h-[3px] w-full max-w-[260px] overflow-hidden rounded-full">
          <div
            className="h-full rounded-full transition-all duration-300 ease-out bg-accent-foreground"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
