import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getCandidateByUsername } from "@/app/actions/candidates";
import { CandidateDetailClient, type CandidateDetail } from "./candidate-detail-client";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft, UserX } from "lucide-react";
import { cn } from "@/lib/utils";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty";

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `Profil ${username} - Jodohkan`,
    description: "Profil ta'aruf Islami",
  };
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
      <Skeleton className="h-4 w-48" />
      <div className="flex flex-col items-center gap-6 rounded-3xl border border-border/50 bg-card p-6 shadow-sm md:flex-row">
        <Skeleton className="h-48 w-48 rounded-2xl" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-40" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>
        </div>
      </div>
      <Skeleton className="h-10 w-full rounded-2xl" />
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );
}

export default async function CandidateDetailPage({ params }: PageProps) {
  const { username } = await params;
  const result = await getCandidateByUsername(username);

  return (
    <div className="p-4 md:p-6">
      <Suspense fallback={<DetailSkeleton />}>
        {result.error ? (
          <div className="flex min-h-[60vh] items-center justify-center p-4">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <UserX />
                </EmptyMedia>
                <EmptyTitle>Profil Tidak Ditemukan</EmptyTitle>
                <EmptyDescription>{result.error}</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Link href="/temukan" className={cn(buttonVariants({ variant: "outline" }), "inline-flex items-center gap-1.5")}>
                  <ArrowLeft className="h-4 w-4" />
                  Kembali ke daftar kandidat
                </Link>
              </EmptyContent>
            </Empty>
          </div>
        ) : (
          <CandidateDetailClient candidate={{ ...result.data!, qa: result.data!.qa as CandidateDetail["qa"] }} />
        )}
      </Suspense>
    </div>
  );
}
