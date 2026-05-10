import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getPendingReviews } from "@/app/actions/candidates";
import { ReviewClient } from "./review-client";

export default async function AdminReviewPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const result = await getPendingReviews();

  return <ReviewClient initialData={result.data ?? []} />;
}
