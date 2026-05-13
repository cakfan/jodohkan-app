import { Suspense } from "react";
import { getCandidates, type CandidateFilters } from "@/app/actions/candidates";
import { FindClient } from "./find-client";
import { Spinner } from "@/components/ui/spinner";

export const dynamic = "force-dynamic";

export default async function FindPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; education?: string; ethnicity?: string; occupation?: string; ageMin?: string; ageMax?: string; username?: string }>;
}) {
  const params = await searchParams;
  const filters: CandidateFilters = {
    city: params.city || undefined,
    education: params.education || undefined,
    ethnicity: params.ethnicity || undefined,
    occupation: params.occupation || undefined,
    ageMin: params.ageMin ? Number(params.ageMin) : undefined,
    ageMax: params.ageMax ? Number(params.ageMax) : undefined,
    username: params.username || undefined,
  };

  const result = await getCandidates(filters);

  return (
    <div className="p-4 md:p-6">
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <Spinner className="h-8 w-8" />
          </div>
        }
      >
        <FindClient
          initialCandidates={result.data ?? []}
          initialError={result.error}
        />
      </Suspense>
    </div>
  );
}
