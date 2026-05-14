import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/get-server-session";
import { getPendingReviews } from "@/app/actions/candidates";
import { ReviewClient } from "./review-client";
import { Spinner } from "@/components/ui/spinner";

export default function AdminReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Spinner className="h-8 w-8" />
        </div>
      }
    >
      <AdminReviewContent />
    </Suspense>
  );
}

async function AdminReviewContent() {
  const session = await getServerSession();

  if (!session?.user?.id || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const result = await getPendingReviews();

  return <ReviewClient initialData={result.data ?? []} />;
}
