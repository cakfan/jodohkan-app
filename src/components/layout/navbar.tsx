import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { profile } from "@/db/schema";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { NavbarPageTitle } from "./navbar-page-title";

const statusLabels: Record<string, { label: string; class: string; dot: string }> = {
  draft: { label: "Draft", class: "text-muted-foreground", dot: "bg-muted-foreground" },
  pending: { label: "Menunggu Review", class: "text-amber-600", dot: "bg-amber-600" },
  approved: { label: "Disetujui", class: "text-emerald-600", dot: "bg-emerald-600" },
  rejected: { label: "Ditolak", class: "text-red-600", dot: "bg-red-600" },
};

export async function Navbar() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;

  let cvStatus = "draft";
  if (userId) {
    const existing = await db.query.profile.findFirst({
      where: eq(profile.userId, userId),
      columns: { cvStatus: true },
    });
    cvStatus = existing?.cvStatus ?? "draft";
  }

  const status = statusLabels[cvStatus] ?? statusLabels.draft;

  return (
    <header className="bg-background/80 supports-backdrop-blur:bg-background/60 sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b px-4 text-sm backdrop-blur-sm md:text-base">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <NavbarPageTitle />
      <div className="flex flex-1 items-center justify-end gap-3">
        <div className="flex items-center gap-1.5 rounded-full border px-3 py-1">
          <span className={`size-1.5 rounded-full ${status.dot}`} />
          <span className={`text-xs font-medium ${status.class}`}>{status.label}</span>
        </div>
      </div>
    </header>
  );
}
