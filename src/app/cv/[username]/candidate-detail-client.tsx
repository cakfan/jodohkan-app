"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { BlurredPhoto } from "@/components/blurred-photo";
import { computeAge } from "@/lib/utils";
import { QRCodeSVG } from "qrcode.react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import {
  sendTaarufRequest,
  hasSentTaarufRequest,
  getPendingTaarufRequestFromSource,
  respondToTaarufRequest,
  isInActiveTaarufWith,
} from "@/app/actions/taaruf";
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
  Send,
  CheckCircle2,
  XCircle,
  Clock,
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

const isFallback = (v: string) =>
  v === "-" || v.startsWith("Belum") || v === "Tidak mempersyaratkan";

function ExpiryCountdown({ expiresAt }: { expiresAt: Date | null }) {
  const [remaining, setRemaining] = useState("");
  useEffect(() => {
    if (!expiresAt) return;
    const update = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) return setRemaining("Kadaluwarsa");
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setRemaining(`${h}j ${m}m`);
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [expiresAt]);
  if (!remaining) return null;
  return (
    <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
      <Clock className="h-3 w-3" />
      {remaining === "Kadaluwarsa" ? "Permintaan telah kadaluwarsa" : `Batas respons: ${remaining}`}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  const fallback = isFallback(value);
  return (
    <div className="space-y-1">
      <p className="text-muted-foreground/90 text-[11px] font-medium tracking-wider uppercase">
        {label}
      </p>
      <p
        className={`text-sm font-medium leading-snug${fallback ? "text-muted-foreground/50 italic" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

function SectionHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
}) {
  return (
    <div className="space-y-0.5">
      <h2 className="text-muted-foreground flex items-center gap-2 text-sm font-semibold tracking-wider uppercase">
        <Icon className="h-3.5 w-3.5" />
        {title}
      </h2>
      {description && <p className="text-muted-foreground pl-5.5 text-xs">{description}</p>}
    </div>
  );
}

function StatCard({ value, unit }: { value: string | number; unit: string }) {
  return (
    <div className="border-border/40 bg-card flex min-w-[90px] flex-col items-center justify-center gap-0.5 rounded-2xl border px-5 py-4 shadow-sm">
      <p className="text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
      <p className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
        {unit}
      </p>
    </div>
  );
}

export function CandidateDetailClient({ candidate }: CandidateDetailClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("personal");

  const age = computeAge(candidate.birthDate);
  const isOwnProfile = session?.user?.id === candidate.userId;
  const isAdmin = session?.user?.role === "admin";
  const showFullProfile = isOwnProfile || isAdmin;
  const canRequestTaaruf = !isOwnProfile;
  const [qrOpen, setQrOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [taarufOpen, setTaarufOpen] = useState(false);
  const [taarufMessage, setTaarufMessage] = useState("");
  const [sendingTaaruf, setSendingTaaruf] = useState(false);
  const [taarufSent, setTaarufSent] = useState(false);
  const [incomingRequestId, setIncomingRequestId] = useState<string | null>(null);
  const [incomingExpiresAt, setIncomingExpiresAt] = useState<Date | null>(null);
  const [activeTaaruf, setActiveTaaruf] = useState(false);
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    if (canRequestTaaruf) {
      hasSentTaarufRequest(candidate.userId).then(setTaarufSent);
      getPendingTaarufRequestFromSource(candidate.userId).then((r) => {
        setIncomingRequestId(r?.id ?? null);
        setIncomingExpiresAt(r?.expiresAt ?? null);
      });
      isInActiveTaarufWith(candidate.userId).then(setActiveTaaruf);
    }
  }, [canRequestTaaruf, candidate.userId]);

  const handleTaarufResponse = async (action: "accept" | "decline") => {
    if (!incomingRequestId) return;
    setResponding(true);
    const result = await respondToTaarufRequest(incomingRequestId, action);
    setResponding(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(action === "accept" ? "Ta'aruf diterima!" : "Ta'aruf ditolak.");
      setIncomingRequestId(null);
    }
  };

  const profileUrl =
    typeof window !== "undefined" ? `${window.location.origin}/cv/${candidate.username}` : "";

  const copyLink = async () => {
    await navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayName = getDisplayName(candidate.name, candidate.username, showFullProfile);

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-16">
      {/* Back */}
      <button
        onClick={() => router.push("/find")}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </button>

      {/* ── Header Card ─────────────────────────────────────────── */}
      <section className="border-border/40 bg-card overflow-hidden rounded-2xl border shadow-sm">
        {/* Subtle top accent strip */}
        <div className="from-primary/60 via-primary to-accent/70 h-1 w-full bg-linear-to-r" />

        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-start">
          {/* Photo */}
          <div className="shrink-0 self-center sm:self-start">
            <BlurredPhoto
              blurredSrc={candidate.photoBlurredUrl}
              originalSrc={candidate.photoUrl}
              alt={displayName}
              size="lg"
              canToggle={showFullProfile}
            />
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1 space-y-3 text-center sm:text-left">
            {/* Name + QR */}
            <div className="flex items-center justify-center gap-2 sm:justify-start">
              <h1 className="truncate text-xl font-semibold tracking-tight">{displayName}</h1>
              <button
                onClick={() => setQrOpen(true)}
                className="text-muted-foreground hover:text-foreground hover:bg-muted shrink-0 rounded-lg p-1.5 transition-colors"
                title="Bagikan profil"
              >
                <QrCode className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Age + city */}
            <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm sm:justify-start">
              {age !== null && <span>{age} tahun</span>}
              {showFullProfile && candidate.gender && (
                <>
                  <span className="text-border">·</span>
                  <span>{candidate.gender === "male" ? "Laki-laki" : "Perempuan"}</span>
                </>
              )}
              <span className="text-border">·</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {candidate.city}
              </span>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap justify-center gap-1.5 sm:justify-start">
              {candidate.education && (
                <Badge
                  variant="secondary"
                  className="gap-1 rounded-full py-0.5 text-xs font-normal"
                >
                  <GraduationCap className="h-3 w-3" />
                  {candidate.education}
                </Badge>
              )}
              {candidate.occupation && (
                <Badge
                  variant="secondary"
                  className="gap-1 rounded-full py-0.5 text-xs font-normal"
                >
                  <Briefcase className="h-3 w-3" />
                  {candidate.occupation}
                </Badge>
              )}
              {candidate.maritalStatus && (
                <Badge variant="secondary" className="rounded-full py-0.5 text-xs font-normal">
                  {getMaritalLabel(candidate.maritalStatus)}
                </Badge>
              )}
            </div>
          </div>

          {/* CTA — right-aligned on desktop, below on mobile */}
          {canRequestTaaruf && (
            <div className="flex flex-col items-center gap-2 sm:shrink-0 sm:items-end">
              {activeTaaruf && (
                <Button size="sm" className="cursor-default gap-2 rounded-xl opacity-80" disabled>
                  <HeartHandshake className="h-4 w-4" />
                  Sedang berjalan
                </Button>
              )}

              {!activeTaaruf && incomingRequestId && (
                <>
                  <p className="text-muted-foreground text-xs font-medium">
                    Mengajakmu ta&apos;aruf
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 rounded-xl"
                      onClick={() => handleTaarufResponse("decline")}
                      disabled={responding}
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Tolak
                    </Button>
                    <Button
                      size="sm"
                      className="gap-1.5 rounded-xl"
                      onClick={() => handleTaarufResponse("accept")}
                      disabled={responding}
                    >
                      {responding ? (
                        <Spinner className="h-3.5 w-3.5" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      )}
                      Terima
                    </Button>
                  </div>
                  <ExpiryCountdown expiresAt={incomingExpiresAt} />
                </>
              )}

              {!activeTaaruf && !incomingRequestId && (
                <Button
                  size="sm"
                  className="gap-2 rounded-xl px-5"
                  onClick={() => setTaarufOpen(true)}
                  disabled={taarufSent}
                  variant={taarufSent ? "secondary" : "default"}
                >
                  {taarufSent ? (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      Terkirim
                    </>
                  ) : (
                    <>
                      <Heart className="h-3.5 w-3.5" />
                      Ajak Ta&apos;aruf
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Tabs ─────────────────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Tab bar — pill style */}
        <TabsList className="border-border/40 bg-muted/40 flex w-full gap-0.5 rounded-xl border p-1">
          {[
            { value: "personal", label: "Data Diri" },
            { value: "vision", label: "Visi & Misi" },
            { value: "criteria", label: "Kriteria" },
            { value: "spiritual", label: "Spiritual" },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground flex-1 rounded-lg py-4 text-xs font-medium transition-all data-[state=active]:font-semibold data-[state=active]:shadow-sm"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── DATA DIRI ─────────────────────────────────────────── */}
        <TabsContent value="personal" className="mt-8 space-y-10">
          {/* Profil Pribadi */}
          <section className="space-y-4">
            <SectionHeading icon={User} title="Profil Pribadi" />
            <div className="border-border/40 bg-card divide-border/30 divide-y rounded-2xl border shadow-sm">
              <div className="divide-border/30 grid gap-0 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                {showFullProfile && (
                  <div className="p-5">
                    <InfoItem
                      label="Jenis Kelamin"
                      value={
                        candidate.gender === "male"
                          ? "Laki-laki"
                          : candidate.gender === "female"
                            ? "Perempuan"
                            : "-"
                      }
                    />
                  </div>
                )}
                {showFullProfile && (
                  <div className="p-5">
                    <InfoItem
                      label="Tempat, Tanggal Lahir"
                      value={
                        candidate.birthPlace && candidate.birthDate
                          ? `${candidate.birthPlace}, ${candidate.birthDate}`
                          : "-"
                      }
                    />
                  </div>
                )}
              </div>
              <div className="divide-border/30 grid gap-0 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                <div className="p-5">
                  <InfoItem label="Suku / Etnis" value={candidate.ethnicity || "-"} />
                </div>
                <div className="p-5">
                  <InfoItem
                    label="Status Perkawinan"
                    value={getMaritalLabel(candidate.maritalStatus)}
                  />
                </div>
              </div>
              {candidate.childCount !== null && candidate.childCount !== undefined && (
                <div className="p-5">
                  <InfoItem label="Jumlah Anak" value={String(candidate.childCount)} />
                </div>
              )}
            </div>
          </section>

          {/* Data Fisik */}
          <section className="space-y-4">
            <SectionHeading icon={Ruler} title="Data Fisik" />
            {/* Stat chips */}
            <div className="flex flex-wrap gap-3">
              {candidate.height && <StatCard value={candidate.height} unit="cm" />}
              {candidate.weight && <StatCard value={candidate.weight} unit="kg" />}
              {candidate.skinColor && <StatCard value={candidate.skinColor} unit="Warna Kulit" />}
            </div>
            {/* Grid info */}
            <div className="border-border/40 bg-card divide-border/30 divide-y rounded-2xl border shadow-sm">
              <div className="divide-border/30 grid divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                <div className="p-5">
                  <InfoItem label="Warna Rambut" value={candidate.hairColor || "-"} />
                </div>
                <div className="p-5">
                  <InfoItem label="Tipe Rambut" value={candidate.hairType || "-"} />
                </div>
              </div>
              <div className="divide-border/30 grid divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                {candidate.gender === "female" && (
                  <div className="p-5">
                    <InfoItem label="Hijab" value={candidate.hijabStatus || "-"} />
                  </div>
                )}
                <div className="p-5">
                  <InfoItem label="Penampilan Wajah" value={candidate.faceAppearance || "-"} />
                </div>
              </div>
              {candidate.otherPhysicalTraits && (
                <div className="space-y-2 p-5">
                  <p className="text-muted-foreground/90 text-[11px] font-medium tracking-wider uppercase">
                    Ciri Fisik Lainnya
                  </p>
                  <p className="text-foreground/85 text-sm leading-relaxed whitespace-pre-wrap">
                    {candidate.otherPhysicalTraits}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Pendidikan & Pekerjaan */}
          <section className="space-y-4">
            <SectionHeading icon={Briefcase} title="Pendidikan & Pekerjaan" />
            <div className="border-border/40 bg-card divide-border/30 divide-y rounded-2xl border shadow-sm">
              <div className="divide-border/30 grid divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                <div className="p-5">
                  <InfoItem label="Pendidikan Terakhir" value={candidate.education || "-"} />
                </div>
                <div className="p-5">
                  <InfoItem label="Pekerjaan" value={candidate.occupation || "-"} />
                </div>
              </div>
              <div className="p-5">
                <InfoItem label="Domisili" value={candidate.city || "-"} />
              </div>
            </div>
          </section>
        </TabsContent>

        {/* ── VISI & MISI ───────────────────────────────────────── */}
        <TabsContent value="vision" className="mt-8 space-y-10">
          {candidate.bio && (
            <section className="space-y-4">
              <SectionHeading icon={Quote} title="Bio Singkat" />
              <div className="border-border/40 bg-card rounded-2xl border p-5 shadow-sm">
                <p className="text-foreground/85 text-sm leading-relaxed whitespace-pre-wrap">
                  {candidate.bio}
                </p>
              </div>
            </section>
          )}

          {(candidate.personalityTraits || candidate.interests) && (
            <section className="space-y-4">
              <SectionHeading icon={Puzzle} title="Kepribadian & Minat" />
              <div className="space-y-3">
                {candidate.personalityTraits && (
                  <div className="border-border/40 bg-card space-y-2 rounded-2xl border p-5 shadow-sm">
                    <p className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
                      Sifat & Karakter
                    </p>
                    <p className="text-foreground/85 text-sm leading-relaxed whitespace-pre-wrap">
                      {candidate.personalityTraits}
                    </p>
                  </div>
                )}
                {candidate.interests && (
                  <div className="border-border/40 bg-card space-y-2 rounded-2xl border p-5 shadow-sm">
                    <p className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
                      Minat & Hobi
                    </p>
                    <p className="text-foreground/85 text-sm leading-relaxed whitespace-pre-wrap">
                      {candidate.interests}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          <section className="space-y-4">
            <SectionHeading
              icon={Target}
              title="Visi & Misi Hidup"
              description="Pandangan dan tujuan dalam membina rumah tangga Islami"
            />
            <div className="border-border/40 bg-card divide-border/30 divide-y rounded-2xl border shadow-sm">
              <div className="space-y-2 p-5">
                <p className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
                  Visi Hidup
                </p>
                <p
                  className={`text-sm leading-relaxed whitespace-pre-wrap${!candidate.vision ? "text-muted-foreground/50 italic" : "text-foreground/85"}`}
                >
                  {candidate.vision || "Belum mengisi visi hidup."}
                </p>
              </div>
              <div className="space-y-2 p-5">
                <p className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
                  Misi Rumah Tangga
                </p>
                <p
                  className={`text-sm leading-relaxed whitespace-pre-wrap${!candidate.mission ? "text-muted-foreground/50 italic" : "text-foreground/85"}`}
                >
                  {candidate.mission || "Belum mengisi misi rumah tangga."}
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <SectionHeading
              icon={HeartHandshake}
              title="Pandangan & Kesiapan"
              description="Pandangan tentang pernikahan dan kesiapan membina rumah tangga"
            />
            <div className="space-y-3">
              {candidate.marriageTarget && (
                <div className="border-border/40 bg-card space-y-2 rounded-2xl border p-5 shadow-sm">
                  <p className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
                    Target Pernikahan
                  </p>
                  <p className="text-foreground/85 text-sm leading-relaxed whitespace-pre-wrap">
                    {candidate.marriageTarget}
                  </p>
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                {candidate.gender === "female" && candidate.polygamyView && (
                  <div className="border-border/40 bg-card space-y-2 rounded-2xl border p-5 shadow-sm">
                    <p className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
                      Pandangan Poligami
                    </p>
                    <p className="text-foreground/85 text-sm leading-relaxed capitalize">
                      {candidate.polygamyView}
                    </p>
                  </div>
                )}
                {candidate.gender === "female" && candidate.parentsInvolvement && (
                  <div className="border-border/40 bg-card space-y-2 rounded-2xl border p-5 shadow-sm">
                    <p className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
                      Sepengetahuan Orang Tua
                    </p>
                    <p className="text-foreground/85 text-sm leading-relaxed capitalize">
                      {candidate.parentsInvolvement === "ya"
                        ? "Ya, orang tua tahu"
                        : candidate.parentsInvolvement === "tidak"
                          ? "Tidak, orang tua tidak tahu"
                          : "Via wali saja"}
                    </p>
                  </div>
                )}
                {candidate.smokingStatus && (
                  <div className="border-border/40 bg-card space-y-2 rounded-2xl border p-5 shadow-sm">
                    <p className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
                      Status Merokok
                    </p>
                    <p className="text-foreground/85 text-sm leading-relaxed capitalize">
                      {candidate.smokingStatus === "ya"
                        ? "Ya, merokok"
                        : candidate.smokingStatus === "tidak"
                          ? "Tidak, tidak merokok"
                          : "Proses berhenti"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </TabsContent>

        {/* ── KRITERIA ──────────────────────────────────────────── */}
        <TabsContent value="criteria" className="mt-8 space-y-10">
          <section className="space-y-4">
            <SectionHeading
              icon={Sparkles}
              title="Kriteria Calon Pasangan"
              description="Gambaran pasangan yang diharapkan"
            />
            {/* Three stat-style chips */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Domisili", value: candidate.partnerCity || "Tidak mempersyaratkan" },
                {
                  label: "Usia",
                  value:
                    candidate.partnerAgeMin && candidate.partnerAgeMax
                      ? `${candidate.partnerAgeMin}–${candidate.partnerAgeMax} th`
                      : "Bebas",
                },
                { label: "Pekerjaan", value: candidate.partnerOccupation || "Bebas" },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="border-border/40 bg-card space-y-1 rounded-2xl border p-4 text-center shadow-sm"
                >
                  <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                    {label}
                  </p>
                  <p
                    className={`text-xs font-semibold leading-snug${isFallback(value) ? "text-muted-foreground/50" : ""}`}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-border/40 bg-card space-y-2 rounded-2xl border p-5 shadow-sm">
              <p className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
                Kriteria Pasangan
              </p>
              <p
                className={`text-sm leading-relaxed whitespace-pre-wrap${!candidate.partnerCriteria ? "text-muted-foreground/50 italic" : "text-foreground/85"}`}
              >
                {candidate.partnerCriteria || "Tidak mempersyaratkan"}
              </p>
            </div>
          </section>
        </TabsContent>

        {/* ── SPIRITUAL ─────────────────────────────────────────── */}
        <TabsContent value="spiritual" className="mt-8 space-y-10">
          <section className="space-y-4">
            <SectionHeading
              icon={BookHeart}
              title="Pemahaman Agama"
              description="Landasan dan praktik keagamaan sehari-hari"
            />
            <div className="space-y-3">
              <div className="border-border/40 bg-card space-y-2 rounded-2xl border p-5 shadow-sm">
                <p className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
                  Pemahaman Ilmu Agama
                </p>
                <p className="text-foreground/85 text-sm leading-relaxed whitespace-pre-wrap">
                  {candidate.religiousUnderstanding || "-"}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="border-border/40 bg-card space-y-2 rounded-2xl border p-5 shadow-sm">
                  <p className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
                    Manhaj
                  </p>
                  <p className="text-foreground/85 text-sm leading-relaxed">
                    {candidate.manhaj || "-"}
                  </p>
                </div>
                <div className="border-border/40 bg-card space-y-2 rounded-2xl border p-5 shadow-sm">
                  <p className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
                    Hafalan Al-Qur&apos;an
                  </p>
                  <p className="text-foreground/85 text-sm leading-relaxed">
                    {candidate.memorization || "-"}
                  </p>
                </div>
              </div>
              <div className="border-border/40 bg-card space-y-2 rounded-2xl border p-5 shadow-sm">
                <p className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
                  Kebiasaan Ibadah
                </p>
                <p className="text-foreground/85 text-sm leading-relaxed whitespace-pre-wrap">
                  {candidate.dailyWorship || "-"}
                </p>
              </div>
            </div>
          </section>

          {candidate.qa && candidate.qa.length > 0 && (
            <>
              <Separator />
              <section className="space-y-4">
                <SectionHeading
                  icon={MessageCircleQuestion}
                  title="Tanya Jawab"
                  description="Pertanyaan dan jawaban seputar pandangan ta'aruf"
                />
                <div className="space-y-3">
                  {candidate.qa.map((item, index) => (
                    <div
                      key={index}
                      className="border-border/40 bg-card space-y-2 rounded-2xl border p-5 shadow-sm"
                    >
                      <p className="text-sm leading-snug font-semibold">
                        <span className="text-muted-foreground mr-1.5">{index + 1}.</span>
                        {item.question}
                      </p>
                      <p className="text-foreground/80 border-primary/30 border-l-2 pl-4 text-sm leading-relaxed whitespace-pre-wrap">
                        {item.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <div className="border-border/30 flex items-center justify-between border-t pt-2">
        <div className="space-y-0.5">
          <p className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
            Terdaftar sejak
          </p>
          <p className="text-sm font-medium">
            {new Date(candidate.createdAt).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="space-y-0.5 text-right">
          <p className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
            Username
          </p>
          <p className="text-sm font-medium">@{candidate.username || "-"}</p>
        </div>
      </div>

      {/* ── QR Code Sheet ────────────────────────────────────────── */}
      <Sheet open={qrOpen} onOpenChange={setQrOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader className="items-center pb-2">
            <SheetTitle>Bagikan Profil</SheetTitle>
            <SheetDescription>Scan QR Code untuk melihat profil {displayName}</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col items-center gap-5 py-6">
            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <QRCodeSVG value={profileUrl} size={180} level="M" />
            </div>
            <div className="space-y-1 text-center">
              <p className="text-sm font-medium">{displayName}</p>
              <p className="text-muted-foreground text-xs">{profileUrl}</p>
            </div>
            <Button variant="outline" className="gap-2 rounded-xl" onClick={copyLink}>
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              {copied ? "Tersalin" : "Salin tautan"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Ta'aruf Request Sheet ────────────────────────────────── */}
      <Sheet open={taarufOpen} onOpenChange={setTaarufOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader className="items-center pb-2">
            <SheetTitle>Ajukan Ta&apos;aruf</SheetTitle>
            <SheetDescription>Kirim permintaan ta&apos;aruf ke {displayName}</SheetDescription>
          </SheetHeader>
          <div className="space-y-5 py-6">
            <textarea
              placeholder="Tulis pesan singkat (opsional)..."
              className="border-border/50 bg-background focus:ring-primary/30 min-h-[120px] w-full resize-none rounded-xl border p-4 text-sm focus:ring-2 focus:outline-none"
              value={taarufMessage}
              onChange={(e) => setTaarufMessage(e.target.value)}
              disabled={sendingTaaruf}
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => {
                  setTaarufOpen(false);
                  setTaarufMessage("");
                }}
                disabled={sendingTaaruf}
              >
                Batal
              </Button>
              <Button
                className="flex-1 gap-2 rounded-xl"
                onClick={async () => {
                  setSendingTaaruf(true);
                  const result = await sendTaarufRequest(
                    candidate.userId,
                    taarufMessage || undefined
                  );
                  setSendingTaaruf(false);
                  if (result.error) {
                    toast.error(result.error);
                  } else {
                    toast.success("Permintaan ta'aruf berhasil dikirim!");
                    setTaarufOpen(false);
                    setTaarufMessage("");
                  }
                }}
                disabled={sendingTaaruf}
              >
                {sendingTaaruf ? <Spinner className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                Kirim
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
