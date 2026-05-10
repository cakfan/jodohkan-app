import { getServerSession } from "@/lib/get-server-session";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { profile } from "@/db/schema";
import { CV_STATUS_LABELS } from "@/lib/constants/profile";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { NavbarPageTitle } from "./navbar-page-title";

export async function Navbar() {
  const session = await getServerSession();
  const userId = session?.user?.id;

  let cvStatus = "draft";
  let published = false;
  if (userId) {
    const existing = await db.query.profile.findFirst({
      where: eq(profile.userId, userId),
      columns: { cvStatus: true, published: true },
    });
    cvStatus = existing?.cvStatus ?? "draft";
    published = existing?.published ?? false;
  }

  const badgeKey = cvStatus === "approved" && published ? "published" : cvStatus;
  const status = CV_STATUS_LABELS[badgeKey] ?? CV_STATUS_LABELS.draft;

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
