import { getCandidates, getMyProfileGender } from "@/app/actions/candidates";
import { KatalogClient } from "./katalog-client";

export const dynamic = "force-dynamic";

export default async function KatalogPage() {
  const [initialResult, myGender] = await Promise.all([
    getCandidates({}),
    getMyProfileGender(),
  ]);

  const oppositeGender =
    myGender === "male" ? "female" : myGender === "female" ? "male" : "";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tight md:text-3xl">Katalog Kandidat</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Temukan calon pasangan yang sesuai dengan kriteria Anda.
        </p>
      </div>

      <KatalogClient
        initialCandidates={initialResult.data ?? []}
        initialError={initialResult.error}
        defaultGender={oppositeGender}
      />
    </div>
  );
}
