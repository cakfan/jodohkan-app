"use client";

import { useState, useCallback } from "react";
import { Search, SlidersHorizontal, MapPin, Briefcase, GraduationCap, Heart, User, Calendar } from "lucide-react";
import { getCandidates, type CandidateFilters } from "@/app/actions/candidates";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { computeAge } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

interface Candidate {
  id: string;
  userId: string;
  gender: string | null;
  birthDate: string | null;
  birthPlace: string | null;
  city: string | null;
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
  religiousUnderstanding: string | null;
  manhaj: string | null;
  memorization: string | null;
  dailyWorship: string | null;
  createdAt: Date;
  name: string;
}

const maritalLabels: Record<string, string> = {
  single: "Belum Menikah",
  divorced: "Pernah Menikah",
  widowed: "Cerai Meninggal",
};

export function KatalogClient({
  initialCandidates,
  initialError,
  defaultGender,
}: {
  initialCandidates: Candidate[];
  initialError?: string;
  defaultGender: string;
}) {
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<CandidateFilters>({
    gender: defaultGender,
    city: "",
    education: "",
    ageMin: undefined,
    ageMax: undefined,
  });

  const hasActiveFilters = filters.gender || filters.city || filters.education || filters.ageMin || filters.ageMax;

  const applyFilters = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    const result = await getCandidates(filters);
    if (result.error) {
      setError(result.error);
    } else {
      setCandidates(result.data ?? []);
    }
    setLoading(false);
  }, [filters]);

  const resetFilters = useCallback(async () => {
    const empty: CandidateFilters = { gender: "", city: "", education: "", ageMin: undefined, ageMax: undefined };
    setFilters(empty);
    setLoading(true);
    setError(undefined);
    const result = await getCandidates(empty);
    if (result.error) {
      setError(result.error);
    } else {
      setCandidates(result.data ?? []);
    }
    setLoading(false);
  }, []);

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Filter Sidebar */}
      <div className={`lg:w-72 lg:shrink-0 ${showFilters ? "block" : "hidden lg:block"}`}>
        <div className="bg-card border-border/50 sticky top-24 space-y-5 rounded-2xl border p-5 shadow-sm">
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
            <label className="text-xs font-semibold">Jenis Kelamin</label>
              <Select
                value={filters.gender ?? ""}
                onValueChange={(v) => setFilters((f) => ({ ...f, gender: v || "" }))}
              >
                <SelectTrigger className="h-10 rounded-xl text-sm">
                  <SelectValue placeholder="Semua" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="male">Laki-laki</SelectItem>
                  <SelectItem value="female">Perempuan</SelectItem>
                </SelectContent>
              </Select>
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
            <label className="text-xs font-semibold">Usia Minimal</label>
            <Input
              type="number"
              placeholder="17"
              min={17}
              className="h-10 rounded-xl text-sm"
              value={filters.ageMin ?? ""}
              onChange={(e) =>
                setFilters((f) => ({ ...f, ageMin: e.target.value ? Number(e.target.value) : undefined }))
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
                setFilters((f) => ({ ...f, ageMax: e.target.value ? Number(e.target.value) : undefined }))
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

      {/* Candidate Grid */}
      <div className="flex-1">
        {/* Mobile filter toggle */}
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <p className="text-muted-foreground text-sm">
            {candidates.length} kandidat ditemukan
          </p>
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
        <p className="text-muted-foreground mb-6 hidden text-sm lg:block">
          {candidates.length} kandidat ditemukan
        </p>

        {error && (
          <div className="border-destructive/30 bg-destructive/5 mb-6 rounded-xl border p-4 text-sm text-destructive">
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
                Belum ada kandidat yang sesuai dengan kriteria Anda. Coba ubah filter atau
                tunggu hingga ada kandidat baru.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {candidates.map((candidate) => (
              <CandidateCard key={candidate.id} candidate={candidate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CandidateCard({ candidate }: { candidate: Candidate }) {
  const age = computeAge(candidate.birthDate);

  return (
    <div className="bg-card border-border/50 group relative overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 hover:shadow-md">
      {/* Photo */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {candidate.photoBlurredUrl ? (
          <img
            src={candidate.photoBlurredUrl}
            alt={candidate.name}
            className="h-full w-full object-cover"
            loading="eager"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <User className="text-muted-foreground h-12 w-12" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="space-y-3 p-4">
        <div>
          <h3 className="text-base font-bold tracking-tight">{candidate.name}</h3>
          {age !== null && (
            <p className="text-muted-foreground text-sm">{age} tahun</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {candidate.city && (
            <span className="bg-secondary/50 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium">
              <MapPin className="h-3 w-3" />
              {candidate.city}
            </span>
          )}
          {candidate.occupation && (
            <span className="bg-secondary/50 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium">
              <Briefcase className="h-3 w-3" />
              {candidate.occupation}
            </span>
          )}
          {candidate.education && (
            <span className="bg-secondary/50 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium">
              <GraduationCap className="h-3 w-3" />
              {candidate.education}
            </span>
          )}
          {candidate.maritalStatus && (
            <span className="bg-secondary/50 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium">
              <Calendar className="h-3 w-3" />
              {maritalLabels[candidate.maritalStatus] ?? candidate.maritalStatus}
            </span>
          )}
        </div>

        {candidate.bio && (
          <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
            {candidate.bio}
          </p>
        )}
      </div>
    </div>
  );
}
