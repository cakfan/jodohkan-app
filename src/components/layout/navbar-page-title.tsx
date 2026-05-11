"use client";

import { usePathname } from "next/navigation";

const pageInfo: Record<string, { title: string; description: string }> = {
  "/dashboard": { title: "Dashboard", description: "Overview aktivitas ta'aruf Anda" },
  "/cv/edit": { title: "CV Ta'aruf", description: "Lengkapi profil ta'aruf Anda" },
  "/temukan": { title: "Temukan Pasangan", description: "Cari calon pasangan sesuai kriteria Anda" },
  "/taaruf": { title: "Ta'aruf", description: "Kelola permintaan ta'aruf masuk dan keluar" },
  "/topup": { title: "Top-Up Token", description: "Beli token untuk fitur premium" },
};

export function NavbarPageTitle() {
  const pathname = usePathname();
  const info = pageInfo[pathname] ?? { title: "", description: "" };

  return (
    <div className="flex flex-col">
      <span className="text-sm font-semibold md:text-base">{info.title}</span>
      <span className="text-muted-foreground hidden text-xs md:block">{info.description}</span>
    </div>
  );
}
