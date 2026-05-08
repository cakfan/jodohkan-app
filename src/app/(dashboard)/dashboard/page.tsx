import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { profile } from "@/db/schema";

const statusLabels: Record<string, { label: string; class: string }> = {
  draft: { label: "Draft", class: "text-muted-foreground" },
  pending: { label: "Menunggu Review", class: "text-amber-600" },
  approved: { label: "Disetujui", class: "text-emerald-600" },
  rejected: { label: "Ditolak", class: "text-red-600" },
};

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
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
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-card text-card-foreground rounded-xl border p-6 shadow-sm">
          <div className="text-muted-foreground text-sm font-medium">Status CV</div>
          <div className={`text-2xl font-bold ${status.class}`}>{status.label}</div>
          {cvStatus === "rejected" && (
            <p className="text-muted-foreground mt-1 text-xs">Silakan perbaiki CV dan kirim ulang.</p>
          )}
        </div>
        <div className="bg-card text-card-foreground rounded-xl border p-6 shadow-sm">
          <div className="text-muted-foreground text-sm font-medium">Request Ta&apos;aruf</div>
          <div className="text-2xl font-bold">0</div>
        </div>
        <div className="bg-card text-card-foreground rounded-xl border p-6 shadow-sm">
          <div className="text-muted-foreground text-sm font-medium">Proses Berjalan</div>
          <div className="text-2xl font-bold">0</div>
        </div>
        <div className="bg-card text-card-foreground rounded-xl border p-6 shadow-sm">
          <div className="text-muted-foreground text-sm font-medium">Mediator</div>
          <div className="text-2xl font-bold">Belum Ada</div>
        </div>
      </div>
    </div>
  );
}
