"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Briefcase,
  GraduationCap,
  Heart,
  User,
  Calendar,
} from "lucide-react";
import { getCandidates, type CandidateFilters } from "@/app/actions/candidates";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { computeAge } from "@/lib/utils";
import { getMaritalLabel } from "@/lib/constants/profile";
import { Spinner } from "@/components/ui/spinner";

interface Candidate {
  id: string;
  userId: string;
  gender: string | null;
  birthDate: string | null;
  birthPlace: string | null;
  city: string | null;
  ethnicity: string | null;
  occupation: string | null;
  education: string | null;
  maritalStatus: string | null;
  skinColor: string | null;
  height: number | null;
  weight: number | null;
  bio: string | null;
  vision: string | null;
  mission: string | null;
  photoBlurredUrl: string | null;
  username: string | null;
  religiousUnderstanding: string | null;
  manhaj: string | null;
  memorization: string | null;
  dailyWorship: string | null;
  createdAt: Date;
  name: string;
}

function getDisplayName(name: string, username: string | null): string {
  const initials = name
    .split(" ")
    .map((p) => p.charAt(0).toUpperCase())
    .join("");
  return username ? `${initials} (${username})` : initials;
}

export function FindClient({
  initialCandidates,
  initialError,
}: {
  initialCandidates: Candidate[];
  initialError?: string;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<CandidateFilters>(() => ({
    city: searchParams.get("city") ?? "",
    education: searchParams.get("education") ?? "",
    ethnicity: searchParams.get("ethnicity") ?? "",
    occupation: searchParams.get("occupation") ?? "",
    ageMin: searchParams.get("ageMin") ? Number(searchParams.get("ageMin")) : undefined,
    ageMax: searchParams.get("ageMax") ? Number(searchParams.get("ageMax")) : undefined,
    username: searchParams.get("username") ?? "",
  }));

  useEffect(() => {
    const onPopState = () => {
      const sp = new URLSearchParams(window.location.search);
      setFilters({
        city: sp.get("city") ?? "",
        education: sp.get("education") ?? "",
        ethnicity: sp.get("ethnicity") ?? "",
        occupation: sp.get("occupation") ?? "",
        ageMin: sp.get("ageMin") ? Number(sp.get("ageMin")) : undefined,
        ageMax: sp.get("ageMax") ? Number(sp.get("ageMax")) : undefined,
        username: sp.get("username") ?? "",
      });
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const hasActiveFilters =
    filters.city ||
    filters.education ||
    filters.ethnicity ||
    filters.occupation ||
    filters.ageMin ||
    filters.ageMax ||
    filters.username;

  const applyFilters = useCallback(async () => {
    setLoading(true);
    setError(undefined);

    const params = new URLSearchParams();
    if (filters.city) params.set("city", filters.city);
    if (filters.education) params.set("education", filters.education);
    if (filters.ethnicity) params.set("ethnicity", filters.ethnicity);
    if (filters.occupation) params.set("occupation", filters.occupation);
    if (filters.ageMin) params.set("ageMin", String(filters.ageMin));
    if (filters.ageMax) params.set("ageMax", String(filters.ageMax));
    if (filters.username) params.set("username", filters.username);
    const qs = params.toString();
    router.replace(`/find${qs ? `?${qs}` : ""}`, { scroll: false });

    const result = await getCandidates(filters);
    if (result.error) {
      setError(result.error);
    } else {
      setCandidates(result.data ?? []);
    }
    setLoading(false);
  }, [filters, router]);

  const resetFilters = useCallback(async () => {
    const empty: CandidateFilters = {
      city: "",
      education: "",
      ethnicity: "",
      occupation: "",
      ageMin: undefined,
      ageMax: undefined,
      username: "",
    };
    setFilters(empty);
    router.replace("/find", { scroll: false });
    setLoading(true);
    setError(undefined);
    const result = await getCandidates(empty);
    if (result.error) {
      setError(result.error);
    } else {
      setCandidates(result.data ?? []);
    }
    setLoading(false);
  }, [router]);

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Candidate Grid */}
      <div className="flex-1">
        {/* Mobile filter toggle */}
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <p className="text-muted-foreground text-sm">{candidates.length} kandidat ditemukan</p>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-xl text-sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </Button>
        </div>

        {/* Desktop count */}
        <p className="text-muted-foreground mb-6 hidden text-right text-sm lg:block">
          {candidates.length} kandidat ditemukan
        </p>

        {error && (
          <div className="border-destructive/30 bg-destructive/5 text-destructive mb-6 rounded-xl border p-4 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner className="h-8 w-8" />
          </div>
        ) : candidates.length === 0 ? (
          <div className="bg-card border-border/50 flex flex-col items-center gap-4 rounded-2xl border p-12 text-center shadow-sm">
            <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-2xl">
              <Heart className="text-muted-foreground h-8 w-8" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-semibold">Belum ada kandidat</p>
              <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
                Belum ada kandidat yang sesuai dengan kriteria Anda. Coba ubah filter atau tunggu
                hingga ada kandidat baru.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {candidates.map((candidate) => (
              <div key={candidate.id} className="cursor-pointer">
                <Link href={`/cv/${candidate.username ?? candidate.id}`}>
                  <CandidateCard candidate={candidate} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter Sidebar */}
      <div
        className={`lg:sticky lg:top-24 lg:w-72 lg:shrink-0 lg:self-start ${showFilters ? "block" : "hidden lg:block"}`}
      >
        <div className="bg-card border-border/50 space-y-5 rounded-2xl border p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="text-muted-foreground h-4 w-4" />
              <span className="text-sm font-semibold">Filter</span>
            </div>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                Reset
              </button>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold">Username</label>
            <Input
              placeholder="Cari username..."
              className="h-10 rounded-xl text-sm"
              value={filters.username ?? ""}
              onChange={(e) => setFilters((f) => ({ ...f, username: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold">Kota / Domisili</label>
            <Input
              placeholder="Cari kota..."
              className="h-10 rounded-xl text-sm"
              value={filters.city ?? ""}
              onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold">Pendidikan</label>
            <Input
              placeholder="Cari pendidikan..."
              className="h-10 rounded-xl text-sm"
              value={filters.education ?? ""}
              onChange={(e) => setFilters((f) => ({ ...f, education: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold">Suku</label>
            <Input
              placeholder="Cari suku..."
              className="h-10 rounded-xl text-sm"
              value={filters.ethnicity ?? ""}
              onChange={(e) => setFilters((f) => ({ ...f, ethnicity: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold">Pekerjaan</label>
            <Input
              placeholder="Cari pekerjaan..."
              className="h-10 rounded-xl text-sm"
              value={filters.occupation ?? ""}
              onChange={(e) => setFilters((f) => ({ ...f, occupation: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold">Usia Minimal</label>
            <Input
              type="number"
              placeholder="17"
              min={17}
              className="h-10 rounded-xl text-sm"
              value={filters.ageMin ?? ""}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  ageMin: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold">Usia Maksimal</label>
            <Input
              type="number"
              placeholder="50"
              max={70}
              className="h-10 rounded-xl text-sm"
              value={filters.ageMax ?? ""}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  ageMax: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
            />
          </div>

          <Button
            className="h-11 w-full gap-2 rounded-xl text-sm font-semibold"
            onClick={applyFilters}
            disabled={loading}
          >
            {loading ? <Spinner /> : <Search className="h-4 w-4" />}
            Cari
          </Button>
        </div>
      </div>
    </div>
  );
}

function CandidateCard({ candidate }: { candidate: Candidate }) {
  const age = computeAge(candidate.birthDate);

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm transition-all duration-300 hover:shadow-md">
      {/* Photo */}
      <div className="relative aspect-4/3 overflow-hidden bg-muted">
        {candidate.photoBlurredUrl ? (
          <>
            <Image
              src={candidate.photoBlurredUrl}
              alt={getDisplayName(candidate.name, candidate.username)}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              loading="eager"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <h3 className="truncate text-sm font-bold text-white drop-shadow-sm">
                {getDisplayName(candidate.name, candidate.username)}
              </h3>
              {age !== null && (
                <p className="text-xs font-medium text-white/80 drop-shadow-sm">{age} tahun</p>
              )}
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1.5">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted-foreground/10">
              <User className="size-7 text-muted-foreground/60" />
            </div>
            <h3 className="truncate px-3 text-sm font-semibold text-foreground/80">
              {getDisplayName(candidate.name, candidate.username)}
            </h3>
            {age !== null && (
              <p className="text-xs text-muted-foreground">{age} tahun</p>
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="space-y-2.5 p-3.5">
        <div className="flex flex-wrap gap-1.5">
          {candidate.city && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-secondary/50 px-2 py-1 text-[11px] font-medium text-secondary-foreground/80">
              <MapPin className="size-3 shrink-0" />
              {candidate.city}
            </span>
          )}
          {candidate.occupation && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-secondary/50 px-2 py-1 text-[11px] font-medium text-secondary-foreground/80">
              <Briefcase className="size-3 shrink-0" />
              {candidate.occupation}
            </span>
          )}
          {candidate.education && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-secondary/50 px-2 py-1 text-[11px] font-medium text-secondary-foreground/80">
              <GraduationCap className="size-3 shrink-0" />
              {candidate.education}
            </span>
          )}
          {candidate.maritalStatus && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-secondary/50 px-2 py-1 text-[11px] font-medium text-secondary-foreground/80">
              <Calendar className="size-3 shrink-0" />
              {getMaritalLabel(candidate.maritalStatus)}
            </span>
          )}
        </div>

        {candidate.bio && (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {candidate.bio}
          </p>
        )}
      </div>
    </div>
  );
}
