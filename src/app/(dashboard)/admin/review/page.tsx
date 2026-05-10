import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/get-server-session";
import { getPendingReviews } from "@/app/actions/candidates";
import { ReviewClient } from "./review-client";

export default async function AdminReviewPage() {
  const session = await getServerSession();

  if (!session?.user?.id || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const result = await getPendingReviews();

  return <ReviewClient initialData={result.data ?? []} />;
}
