import { Suspense } from "react";
import { getServerSession } from "@/lib/get-server-session";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { profile, wallet } from "@/db/schema";
import { CV_STATUS_LABELS } from "@/lib/constants/profile";
import { Skeleton } from "@/components/ui/skeleton";

function StatCardSkeleton() {
  return (
    <div className="bg-card text-card-foreground rounded-xl border p-6 shadow-sm">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="mt-2 h-8 w-16" />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  const session = await getServerSession();
  const userId = session?.user?.id;

  let cvStatus = "draft";
  let walletBalance = 0;
  if (userId) {
    const existing = await db.query.profile.findFirst({
      where: eq(profile.userId, userId),
      columns: { cvStatus: true },
    });
    cvStatus = existing?.cvStatus ?? "draft";

    const existingWallet = await db.query.wallet.findFirst({
      where: eq(wallet.userId, userId),
      columns: { balance: true },
    });
    walletBalance = existingWallet?.balance ?? 0;
  }

  const status = CV_STATUS_LABELS[cvStatus] ?? CV_STATUS_LABELS.draft;

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-card text-card-foreground rounded-xl border p-6 shadow-sm">
          <div className="text-muted-foreground text-sm font-medium">Status CV</div>
          <div className={`text-2xl font-bold ${status.class}`}>{status.label}</div>
          {cvStatus === "rejected" && (
            <p className="text-muted-foreground mt-1 text-xs">Silakan perbaiki CV dan kirim ulang.</p>
          )}
        </div>
        <div className="bg-card text-card-foreground rounded-xl border p-6 shadow-sm">
          <div className="text-muted-foreground text-sm font-medium">Saldo Token</div>
          <div className="text-2xl font-bold">{walletBalance}</div>
        </div>
        <div className="bg-card text-card-foreground rounded-xl border p-6 shadow-sm">
          <div className="text-muted-foreground text-sm font-medium">Request Ta&apos;aruf</div>
          <div className="text-2xl font-bold">0</div>
        </div>
        <div className="bg-card text-card-foreground rounded-xl border p-6 shadow-sm">
          <div className="text-muted-foreground text-sm font-medium">Proses Berjalan</div>
          <div className="text-2xl font-bold">0</div>
        </div>
      </div>
    </div>
  );
}
