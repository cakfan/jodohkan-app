"use client";

import { Users } from "lucide-react";

export function WaliBanner() {
  return (
    <div className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 flex items-center gap-2 border-b px-4 py-1.5 text-xs text-amber-800 dark:text-amber-200">
      <Users className="size-3.5 shrink-0" />
      <span>
        <strong>Pengingat:</strong> Pastikan akhwat didampingi wali/keluarga
        terpercaya selama sesi nadzor.
      </span>
    </div>
  );
}
