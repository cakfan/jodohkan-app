import { Suspense } from "react";
import { getCandidates, type CandidateFilters } from "@/app/actions/candidates";
import { FindClient } from "./find-client";
import { Spinner } from "@/components/ui/spinner";
import { getServerSession } from "@/lib/get-server-session";
import { isUserInActiveTaaruf } from "@/app/actions/taaruf";

export const dynamic = "force-dynamic";

export default async function FindPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; education?: string; ethnicity?: string; occupation?: string; ageMin?: string; ageMax?: string; username?: string }>;
}) {
  const session = await getServerSession();
  const inActiveTaaruf = session?.user?.id
    ? await isUserInActiveTaaruf(session.user.id)
    : false;

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
          inActiveTaaruf={inActiveTaaruf}
        />
      </Suspense>
    </div>
  );
}
