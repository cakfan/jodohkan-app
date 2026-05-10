"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { BlurredPhoto } from "@/components/blurred-photo";
import { computeAge } from "@/lib/utils";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  GraduationCap,
  Heart,
  User,
  Ruler,
  Target,
  Sparkles,
  BookHeart,
  MessageCircleQuestion,
  Quote,
  QrCode,
  Copy,
  Check,
  HeartHandshake,
  Puzzle,
} from "lucide-react";

export interface CandidateDetail {
  id: string;
  userId: string;
  gender: string | null;
  birthDate: string | null;
  birthPlace: string | null;
  ethnicity: string | null;
  city: string | null;
  occupation: string | null;
  education: string | null;
  maritalStatus: string | null;
  skinColor: string | null;
  height: number | null;
  weight: number | null;
  childCount: number | null;
  hairColor: string | null;
  hairType: string | null;
  hijabStatus: string | null;
  faceAppearance: string | null;
  otherPhysicalTraits: string | null;
  marriageTarget: string | null;
  polygamyView: string | null;
  parentsInvolvement: string | null;
  smokingStatus: string | null;
  personalityTraits: string | null;
  interests: string | null;
  bio: string | null;
  vision: string | null;
  mission: string | null;
  qa: { question: string; answer: string }[] | null;
  partnerCriteria: string | null;
  partnerCity: string | null;
  partnerOccupation: string | null;
  partnerAgeMin: number | null;
  partnerAgeMax: number | null;
  religiousUnderstanding: string | null;
  manhaj: string | null;
  memorization: string | null;
  dailyWorship: string | null;
  photoUrl: string | null;
  photoBlurredUrl: string | null;
  photoBlurred: boolean | null;
  username: string | null;
  name: string;
  createdAt: Date;
}

interface CandidateDetailClientProps {
  candidate: CandidateDetail;
}

const maritalLabels: Record<string, string> = {
  single: "Belum Menikah",
  divorced: "Pernah Menikah",
  widowed: "Cerai Meninggal",
};

const getMaritalLabel = (status: string | null | undefined): string => {
  if (!status) return "-";
  return maritalLabels[status] || status;
};

function getDisplayName(name: string, username: string | null, showFull: boolean): string {
  if (showFull) return name;
  const initials = name
    .split(" ")
    .map((p) => p.charAt(0).toUpperCase())
    .join("");
  return username ? `${initials} (${username})` : initials;
}

const isFallback = (v: string) => v === "-" || v.startsWith("Belum") || v === "Tidak mempersyaratkan";

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className={`text-base font-medium leading-snug${isFallback(value) ? " text-muted-foreground" : ""}`}>{value}</p>
    </div>
  );
}

export function CandidateDetailClient({ candidate }: CandidateDetailClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("personal");

  const age = computeAge(candidate.birthDate);
  const isOwnProfile = session?.user?.id === candidate.userId;
  const canRequestTaaruf = !isOwnProfile;
  const [qrOpen, setQrOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const profileUrl = typeof window !== "undefined" ? `${window.location.origin}/cv/${candidate.username}` : "";

  const copyLink = async () => {
    await navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Back */}
      <button
        onClick={() => router.push("/dashboard/temukan")}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </button>

      {/* Header */}
      <section className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
        <div className="shrink-0">
          <BlurredPhoto
            blurredSrc={candidate.photoBlurredUrl}
            originalSrc={candidate.photoUrl}
            alt={getDisplayName(candidate.name, candidate.username, isOwnProfile)}
            size="lg"
            canToggle={isOwnProfile}
          />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{getDisplayName(candidate.name, candidate.username, isOwnProfile)}</h1>
            <button
              onClick={() => setQrOpen(true)}
              className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg p-1.5 transition-colors"
              title="Tampilkan QR Code"
            >
              <QrCode className="h-4 w-4" />
            </button>
          </div>
            <p className="text-muted-foreground mt-0.5 text-sm">
              {[age !== null && `${age} tahun`, isOwnProfile && candidate.gender === "male" ? "Laki-laki" : isOwnProfile && candidate.gender === "female" ? "Perempuan" : null]
                .filter(Boolean)
                .join(" • ")}
            </p>
            <p className="text-muted-foreground flex items-center justify-center gap-1.5 text-sm sm:justify-start">
              <MapPin className="h-3.5 w-3.5" />
              {candidate.city}
            </p>
          <div className="flex flex-wrap justify-center gap-2 pt-1 sm:justify-start">
            {candidate.education && (
              <Badge variant="secondary" className="gap-1.5 rounded-full text-xs font-normal">
                <GraduationCap className="h-3 w-3" />
                {candidate.education}
              </Badge>
            )}
            {candidate.occupation && (
              <Badge variant="secondary" className="gap-1.5 rounded-full text-xs font-normal">
                <Briefcase className="h-3 w-3" />
                {candidate.occupation}
              </Badge>
            )}
            {candidate.maritalStatus && (
              <Badge variant="secondary" className="gap-1.5 rounded-full text-xs font-normal">
                {getMaritalLabel(candidate.maritalStatus)}
              </Badge>
            )}
          </div>
        </div>
        {canRequestTaaruf && (
          <Button className="shrink-0 gap-2 rounded-xl px-5">
            <Heart className="h-4 w-4" />
            Ajak Ta&apos;aruf
          </Button>
        )}
      </section>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 gap-1 bg-transparent p-0">
          <TabsTrigger value="personal" className="rounded-lg py-2 text-sm font-medium text-muted-foreground transition-colors data-active:bg-primary/10 data-active:text-primary">
            Data Diri
          </TabsTrigger>
          <TabsTrigger value="vision" className="rounded-lg py-2 text-sm font-medium text-muted-foreground transition-colors data-active:bg-primary/10 data-active:text-primary">
            Visi & Misi
          </TabsTrigger>
          <TabsTrigger value="criteria" className="rounded-lg py-2 text-sm font-medium text-muted-foreground transition-colors data-active:bg-primary/10 data-active:text-primary">
            Kriteria
          </TabsTrigger>
          <TabsTrigger value="spiritual" className="rounded-lg py-2 text-sm font-medium text-muted-foreground transition-colors data-active:bg-primary/10 data-active:text-primary">
            Spiritual
          </TabsTrigger>
        </TabsList>

        {/* Data Diri */}
        <TabsContent value="personal" className="mt-8 space-y-8">
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-base font-semibold text-muted-foreground">
              <User className="h-4 w-4" />
              Profil Pribadi
            </h2>
            <div className="rounded-xl border border-border/50 bg-card p-5 shadow-sm">
              <div className="grid gap-6 sm:grid-cols-2">
                {isOwnProfile && (
                  <InfoItem label="Jenis Kelamin" value={candidate.gender === "male" ? "Laki-laki" : candidate.gender === "female" ? "Perempuan" : "-"} />
                )}
                {isOwnProfile && (
                  <InfoItem
                    label="Tempat, Tanggal Lahir"
                    value={candidate.birthPlace && candidate.birthDate ? `${candidate.birthPlace}, ${candidate.birthDate}` : "-"}
                  />
                )}
                <InfoItem label="Suku / Etnis" value={candidate.ethnicity || "-"} />
                <InfoItem label="Status Perkawinan" value={getMaritalLabel(candidate.maritalStatus)} />
                {candidate.childCount !== null && candidate.childCount !== undefined && (
                  <InfoItem label="Jumlah Anak" value={String(candidate.childCount)} />
                )}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-base font-semibold text-muted-foreground">
              <Ruler className="h-4 w-4" />
              Data Fisik
            </h2>
            <div className="flex flex-wrap gap-3">
              {candidate.height && (
                <div className="rounded-xl border border-border/50 bg-card p-5 shadow-sm text-center min-w-[100px]">
                  <p className="text-xl font-semibold tracking-tight">{candidate.height}</p>
                  <p className="text-muted-foreground text-xs">cm</p>
                </div>
              )}
              {candidate.weight && (
                <div className="rounded-xl border border-border/50 bg-card p-5 shadow-sm text-center min-w-[100px]">
                  <p className="text-xl font-semibold tracking-tight">{candidate.weight}</p>
                  <p className="text-muted-foreground text-xs">kg</p>
                </div>
              )}
              {candidate.skinColor && (
                <div className="rounded-xl border border-border/50 bg-card p-5 shadow-sm text-center min-w-[100px]">
                  <p className="text-xl font-semibold tracking-tight capitalize">{candidate.skinColor}</p>
                  <p className="text-muted-foreground text-xs">Warna Kulit</p>
                </div>
              )}
            </div>
            <div className="rounded-xl border border-border/50 bg-card p-5 shadow-sm">
              <div className="grid gap-6 sm:grid-cols-2">
                <InfoItem label="Warna Rambut" value={candidate.hairColor || "-"} />
                <InfoItem label="Tipe Rambut" value={candidate.hairType || "-"} />
                {candidate.gender === "female" && <InfoItem label="Hijab" value={candidate.hijabStatus || "-"} />}
                <InfoItem label="Penampilan Wajah" value={candidate.faceAppearance || "-"} />
              </div>
              {candidate.otherPhysicalTraits && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <p className="text-muted-foreground text-xs mb-1.5">Ciri Fisik Lainnya</p>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/85">{candidate.otherPhysicalTraits}</p>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-base font-semibold text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              Pendidikan & Pekerjaan
            </h2>
            <div className="rounded-xl border border-border/50 bg-card p-5 shadow-sm space-y-4">
              <div className="grid gap-6 sm:grid-cols-2">
                <InfoItem label="Pendidikan Terakhir" value={candidate.education || "-"} />
                <InfoItem label="Pekerjaan" value={candidate.occupation || "-"} />
              </div>
              <InfoItem label="Domisili" value={candidate.city || "-"} />
            </div>
          </section>
        </TabsContent>

        {/* Visi & Misi */}
        <TabsContent value="vision" className="mt-8 space-y-8">
          {candidate.bio && (
            <section className="space-y-4">
              <h2 className="flex items-center gap-2 text-base font-semibold text-muted-foreground">
                <Quote className="h-4 w-4" />
                Bio Singkat
              </h2>
              <div className="rounded-xl border border-border/50 bg-card p-5 shadow-sm">
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/85">{candidate.bio}</p>
              </div>
            </section>
          )}

          {(candidate.personalityTraits || candidate.interests) && (
            <section className="space-y-4">
              <h2 className="flex items-center gap-2 text-base font-semibold text-muted-foreground">
                <Puzzle className="h-4 w-4" />
                Kepribadian & Minat
              </h2>
              <div className="space-y-4">
                {candidate.personalityTraits && (
                  <div className="rounded-xl border border-border/50 bg-card p-5 shadow-sm">
                    <h3 className="mb-3 text-base font-semibold">Sifat & Karakter</h3>
                    <p className={`text-sm leading-relaxed whitespace-pre-wrap${!candidate.personalityTraits ? " text-muted-foreground" : " text-foreground/85"}`}>
                      {candidate.personalityTraits}
                    </p>
                  </div>
                )}
                {candidate.interests && (
                  <div className="rounded-xl border border-border/50 bg-card p-5 shadow-sm">
                    <h3 className="mb-3 text-base font-semibold">Minat & Hobi</h3>
                    <p className={`text-sm leading-relaxed whitespace-pre-wrap${!candidate.interests ? " text-muted-foreground" : " text-foreground/85"}`}>
                      {candidate.interests}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-base font-semibold text-muted-foreground">
              <Target className="h-4 w-4" />
              Visi & Misi Hidup
            </h2>
            <p className="text-muted-foreground/80 text-sm">Pandangan dan tujuan dalam membina rumah tangga Islami</p>
            <div className="space-y-6">
              <div className="rounded-xl border border-border/50 bg-card p-5 shadow-sm">
                <h3 className="mb-3 text-base font-semibold">Visi Hidup</h3>
                <p className={`text-sm leading-relaxed whitespace-pre-wrap${!candidate.vision ? " text-muted-foreground" : " text-foreground/85"}`}>
                  {candidate.vision || "Belum mengisi visi hidup."}
                </p>
              </div>
              <div className="rounded-xl border border-border/50 bg-card p-5 shadow-sm">
                <h3 className="mb-3 text-base font-semibold">Misi Rumah Tangga</h3>
                <p className={`text-sm leading-relaxed whitespace-pre-wrap${!candidate.mission ? " text-muted-foreground" : " text-foreground/85"}`}>
                  {candidate.mission || "Belum mengisi misi rumah tangga."}
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-base font-semibold text-muted-foreground">
              <HeartHandshake className="h-4 w-4" />
              Pandangan & Kesiapan
            </h2>
            <p className="text-muted-foreground/80 text-sm">Pandangan tentang pernikahan dan kesiapan membina rumah tangga</p>
            <div className="space-y-4">
              {candidate.marriageTarget && (
                <div className="rounded-xl border border-border/50 bg-card p-5 shadow-sm">
                  <h3 className="mb-3 text-base font-semibold">Target Pernikahan</h3>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/85">{candidate.marriageTarget}</p>
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                {candidate.gender === "female" && candidate.polygamyView && (
                  <div className="rounded-xl border border-border/50 bg-card p-5 shadow-sm">
                    <h3 className="mb-2 text-base font-semibold">Pandangan Poligami</h3>
                    <p className="text-sm leading-relaxed text-foreground/85 capitalize">
                      {candidate.polygamyView}
                    </p>
                  </div>
                )}
                {candidate.gender === "female" && candidate.parentsInvolvement && (
                  <div className="rounded-xl border border-border/50 bg-card p-5 shadow-sm">
                    <h3 className="mb-2 text-base font-semibold">Sepengetahuan Orang Tua</h3>
                    <p className="text-sm leading-relaxed text-foreground/85 capitalize">
                      {candidate.parentsInvolvement === "ya" ? "Ya, orang tua tahu" : candidate.parentsInvolvement === "tidak" ? "Tidak, orang tua tidak tahu" : "Via wali saja"}
                    </p>
                  </div>
                )}
                {candidate.smokingStatus && (
                  <div className="rounded-xl border border-border/50 bg-card p-5 shadow-sm">
                    <h3 className="mb-2 text-base font-semibold">Status Merokok</h3>
                    <p className="text-sm leading-relaxed text-foreground/85 capitalize">
                      {candidate.smokingStatus === "ya" ? "Ya, merokok" : candidate.smokingStatus === "tidak" ? "Tidak, tidak merokok" : "Proses berhenti"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </TabsContent>

        {/* Kriteria */}
        <TabsContent value="criteria" className="mt-8 space-y-8">
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-base font-semibold text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              Kriteria Calon Pasangan
            </h2>
            <p className="text-muted-foreground/80 text-sm">Gambaran pasangan yang diharapkan</p>
            <div className="rounded-xl border border-border/50 bg-card p-5 shadow-sm">
              <div className="grid gap-6 sm:grid-cols-3">
                <InfoItem label="Domisili" value={candidate.partnerCity || "Tidak mempersyaratkan"} />
                <InfoItem
                  label="Usia"
                  value={candidate.partnerAgeMin && candidate.partnerAgeMax ? `${candidate.partnerAgeMin} - ${candidate.partnerAgeMax} tahun` : "Tidak mempersyaratkan"}
                />
                <InfoItem label="Pekerjaan" value={candidate.partnerOccupation || "Tidak mempersyaratkan"} />
              </div>
            </div>
            <div className="rounded-xl border border-border/50 bg-card p-5 shadow-sm space-y-3">
              <p className="text-muted-foreground/80 text-sm">Kriteria Pasangan</p>
              <p className={`text-sm leading-relaxed whitespace-pre-wrap${!candidate.partnerCriteria ? " text-muted-foreground" : ""}`}>
                {candidate.partnerCriteria || "Tidak mempersyaratkan"}
              </p>
            </div>
          </section>
        </TabsContent>

        {/* Spiritual */}
        <TabsContent value="spiritual" className="mt-8 space-y-8">
          <section className="space-y-6">
            <h2 className="flex items-center gap-2 text-base font-semibold text-muted-foreground">
              <BookHeart className="h-4 w-4" />
              Pemahaman Agama
            </h2>
            <p className="text-muted-foreground/80 text-sm">Landasan dan praktik keagamaan sehari-hari</p>
            <div className="space-y-6">
              <div className="rounded-xl border border-border/50 bg-card p-5 shadow-sm">
                <h3 className="mb-3 text-base font-semibold">Pemahaman Ilmu Agama</h3>
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/85">
                  {candidate.religiousUnderstanding || "-"}
                </p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-xl border border-border/50 bg-card p-5 shadow-sm">
                  <h3 className="mb-2 text-base font-semibold">Manhaj</h3>
                  <p className="text-sm leading-relaxed text-foreground/85">{candidate.manhaj || "-"}</p>
                </div>
                <div className="rounded-xl border border-border/50 bg-card p-5 shadow-sm">
                  <h3 className="mb-2 text-base font-semibold">Hafalan Al-Qur&apos;an</h3>
                  <p className="text-sm leading-relaxed text-foreground/85">{candidate.memorization || "-"}</p>
                </div>
              </div>
              <div className="rounded-xl border border-border/50 bg-card p-5 shadow-sm">
                <h3 className="mb-3 text-base font-semibold">Kebiasaan Ibadah</h3>
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/85">
                  {candidate.dailyWorship || "-"}
                </p>
              </div>
            </div>
          </section>

          {candidate.qa && candidate.qa.length > 0 && (
            <>
              <Separator />
              <section className="space-y-6">
                <div className="flex items-center gap-2">
                  <MessageCircleQuestion className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-base font-semibold text-muted-foreground">Tanya Jawab</h2>
                </div>
                <p className="text-muted-foreground/80 text-sm">Pertanyaan dan jawaban seputar pandangan ta&apos;aruf</p>
                <div className="space-y-4">
                  {candidate.qa.map((item, index) => (
                    <div key={index} className="rounded-xl border border-border/50 bg-card p-5 shadow-sm">
                      <p className="mb-2 text-sm font-semibold">
                        <span className="text-muted-foreground">{index + 1}.</span> {item.question}
                      </p>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/85">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </TabsContent>
      </Tabs>

      <Separator />

      {/* Footer */}
      <div className="flex items-center justify-between pb-8">
    <div className="space-y-1.5">
          <p className="text-muted-foreground text-xs">Terdaftar sejak</p>
          <p className="text-sm font-medium">
            {new Date(candidate.createdAt).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="space-y-0.5 text-right">
          <p className="text-muted-foreground text-xs">Username</p>
          <p className="text-sm font-medium">@{candidate.username || "-"}</p>
        </div>
      </div>

      {/* QR Code Sheet */}
      <Sheet open={qrOpen} onOpenChange={setQrOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader className="items-center pb-2">
            <SheetTitle>Bagikan Profil</SheetTitle>
            <SheetDescription>Scan QR Code untuk melihat profil {getDisplayName(candidate.name, candidate.username, isOwnProfile)}</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col items-center gap-5 py-6">
            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <QRCodeSVG value={profileUrl} size={180} level="M" />
            </div>
            <div className="space-y-1 text-center">
              <p className="text-sm font-medium">{getDisplayName(candidate.name, candidate.username, isOwnProfile)}</p>
              <p className="text-muted-foreground text-xs">{profileUrl}</p>
            </div>
            <Button variant="outline" className="gap-2 rounded-xl" onClick={copyLink}>
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              {copied ? "Tersalin" : "Salin tautan"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
