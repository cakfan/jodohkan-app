"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Target,
  HeartHandshake,
  BookOpen,
  MessageCircle,
  Check,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  Save,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
} from "@/lib/validations/profile";
import { saveProfile, type ProfileData } from "@/app/actions/profile";
import { toast } from "sonner";

const steps = [
  { number: 1, icon: User, title: "Data Diri" },
  { number: 2, icon: Target, title: "Visi & Misi" },
  { number: 3, icon: HeartHandshake, title: "Kriteria Pasangan" },
  { number: 4, icon: BookOpen, title: "Pemahaman Agama" },
  { number: 5, icon: MessageCircle, title: "Q&A" },
];

function StepIndicator({
  currentStep,
  completedSteps,
}: {
  currentStep: number;
  completedSteps: Set<number>;
}) {
  return (
    <div className="mb-12 flex items-center justify-center gap-2 md:gap-4">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const isActive = currentStep === step.number;
        const isCompleted = completedSteps.has(step.number);

        return (
          <div key={step.number} className="flex items-center gap-2 md:gap-4">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 md:h-12 md:w-12 ${
                  isCompleted
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : isActive
                      ? "bg-primary text-primary-foreground ring-primary/25 shadow-sm ring-4"
                      : "bg-muted text-muted-foreground/60"
                }`}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : isActive ? (
                  <Icon className="h-5 w-5" />
                ) : (
                  <span className="text-xs font-bold md:text-sm">{step.number}</span>
                )}
              </div>
              <span
                className={`text-center text-[11px] font-semibold tracking-wider whitespace-nowrap uppercase md:text-xs ${
                  isActive || isCompleted ? "text-foreground" : "text-muted-foreground/60"
                }`}
              >
                {step.title}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`mb-7 h-0.5 w-8 rounded-full transition-colors md:w-12 ${
                  isCompleted ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-3 text-center">
      <div className="space-y-2">
        <h2 className="text-2xl font-black tracking-tighter md:text-3xl">{title}</h2>
        <p className="text-muted-foreground mx-auto max-w-lg text-sm leading-relaxed md:text-base">
          {description}
        </p>
      </div>
    </div>
  );
}

function FormCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`border-border/50 bg-card rounded-2xl border p-6 shadow-sm md:p-8 ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

function NavButtons({
  onBack,
  onNext,
  nextLabel = "Simpan & Lanjut",
  isLoading,
  showBack = true,
}: {
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  isLoading: boolean;
  showBack?: boolean;
}) {
  return (
    <div className="flex items-center justify-between pt-4">
      {showBack && onBack ? (
        <Button
          variant="ghost"
          className="text-muted-foreground hover:text-foreground gap-1.5 rounded-full px-5"
          onClick={onBack}
          disabled={isLoading}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden md:inline">Kembali</span>
        </Button>
      ) : (
        <div />
      )}
      <Button
        size="lg"
        className="h-12 gap-2 rounded-full px-8 text-base font-semibold shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md"
        onClick={onNext}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            {nextLabel}
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string | null) => void;
  options: { value: string; label: string }[];
  error?: string;
}) {
  const placeholder = options.find((o) => o.value === "")?.label ?? "Pilih...";
  const realOptions = options.filter((o) => o.value !== "");
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-semibold">
        {label}
      </Label>
      <Select value={value} onValueChange={(val) => onChange(val)}>
        <SelectTrigger
          id={id}
          className={`border-border/60 focus-visible:ring-primary/30 h-12! w-full rounded-xl px-4 text-sm shadow-sm transition-shadow focus-visible:ring-2 focus-visible:ring-offset-2 ${
            error ? "border-destructive" : ""
          }`}
        >
          <SelectValue placeholder={placeholder}>
            {realOptions.find((o) => o.value === value)?.label}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          {realOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}

function InputField({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string | number | null | undefined;
  onChange: (value: string) => void;
  error?: string;
}) {
  const hasValue = value !== null && value !== "";
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-semibold">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        className={`border-border/60 focus-visible:ring-primary/30 h-12 rounded-xl px-4 text-sm shadow-sm transition-shadow focus-visible:ring-2 focus-visible:ring-offset-2 ${
          hasValue ? "border-primary/30" : ""
        } ${error ? "border-destructive" : ""}`}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}

function TextareaField({
  id,
  label,
  placeholder,
  value,
  onChange,
  rows = 5,
  error,
}: {
  id: string;
  label: string;
  placeholder?: string;
  value: string | null;
  onChange: (value: string) => void;
  rows?: number;
  error?: string;
}) {
  const hasValue = value !== null && value !== "";
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-semibold">
        {label}
      </Label>
      <Textarea
        id={id}
        placeholder={placeholder}
        className={`border-border/60 focus-visible:ring-primary/30 min-h-[120px] resize-y rounded-xl px-4 py-3 text-sm leading-relaxed shadow-sm transition-shadow focus-visible:ring-2 focus-visible:ring-offset-2 ${
          hasValue ? "border-primary/30" : ""
        } ${error ? "border-destructive" : ""}`}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
      />
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}

interface CVEditorFormProps {
  initialData: ProfileData | null;
}

export function CVEditorForm({ initialData }: CVEditorFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  function validateStep(step: number): boolean {
    const schemas = [step1Schema, step2Schema, step3Schema, step4Schema, step5Schema];
    const schema = schemas[step - 1];
    const result = schema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as string;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  }

  const [form, setForm] = useState<ProfileData>({
    gender: initialData?.gender ?? "",
    birthDate: initialData?.birthDate ?? "",
    height: initialData?.height ?? null,
    weight: initialData?.weight ?? null,
    skinColor: initialData?.skinColor ?? "",
    maritalStatus: initialData?.maritalStatus ?? "",
    country: initialData?.country ?? "",
    city: initialData?.city ?? "",
    occupation: initialData?.occupation ?? "",
    education: initialData?.education ?? "",
    bio: initialData?.bio ?? "",
    vision: initialData?.vision ?? "",
    mission: initialData?.mission ?? "",
    partnerCriteria: initialData?.partnerCriteria ?? "",
    religiousUnderstanding: initialData?.religiousUnderstanding ?? "",
    manhaj: initialData?.manhaj ?? "",
    memorization: initialData?.memorization ?? "",
    dailyWorship: initialData?.dailyWorship ?? "",
    qa: initialData?.qa ?? [],
  });

  const updateField = useCallback(<K extends keyof ProfileData>(key: K, value: ProfileData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  async function handleSave() {
    if (!validateStep(step)) {
      toast.error("Lengkapi semua field yang wajib diisi");
      return false;
    }
    setIsLoading(true);
    const result = await saveProfile(form);
    if (result?.error) {
      toast.error(result.error);
      setIsLoading(false);
      return false;
    }
    return true;
  }

  async function handleSaveAndContinue(nextStep: number) {
    if (!validateStep(step)) {
      toast.error("Lengkapi semua field yang wajib diisi");
      return;
    }
    setIsLoading(true);
    const result = await saveProfile(form);
    if (result?.error) {
      toast.error(result.error);
      setIsLoading(false);
      return;
    }
    setCompletedSteps((prev) => new Set(prev).add(step));
    setStep(nextStep);
    setIsLoading(false);
    toast.success("Data berhasil disimpan");
  }

  function handleQAChange(index: number, field: "question" | "answer", value: string) {
    const items = [...(form.qa || [])];
    items[index] = { ...items[index], [field]: value };
    updateField("qa", items);
  }

  function addQA() {
    updateField("qa", [...(form.qa || []), { question: "", answer: "" }]);
  }

  function removeQA(index: number) {
    const items = [...(form.qa || [])];
    items.splice(index, 1);
    updateField("qa", items);
  }

  return (
    <div className="space-y-10 pb-16">
      <StepIndicator currentStep={step} completedSteps={completedSteps} />

      {step === 1 && (
        <div className="animate-fade-in-up space-y-8">
          <SectionHeading
            title="Data Diri"
            description="Informasi dasar tentang diri Anda untuk diperkenalkan kepada calon pasangan."
          />

          <FormCard>
            <div className="grid gap-6 md:grid-cols-2">
              <SelectField
                id="gender"
                label="Jenis Kelamin"
                value={form.gender ?? ""}
                onChange={(v) => updateField("gender", v)}
                error={errors.gender}
                options={[
                  { value: "", label: "Pilih jenis kelamin" },
                  { value: "male", label: "Laki-laki" },
                  { value: "female", label: "Perempuan" },
                ]}
              />
              <SelectField
                id="maritalStatus"
                label="Status Pernikahan"
                value={form.maritalStatus ?? ""}
                onChange={(v) => updateField("maritalStatus", v)}
                error={errors.maritalStatus}
                options={[
                  { value: "", label: "Pilih status" },
                  { value: "single", label: "Belum Menikah" },
                  { value: "divorced", label: "Pernah Menikah (Duda/Janda)" },
                  { value: "widowed", label: "Cerai Meninggal" },
                ]}
              />
              <InputField
                id="birthDate"
                label="Tanggal Lahir"
                type="date"
                value={form.birthDate ?? ""}
                onChange={(v) => updateField("birthDate", v)}
                error={errors.birthDate}
              />
              <InputField
                id="height"
                label="Tinggi Badan (cm)"
                type="number"
                placeholder="Contoh: 170"
                value={form.height}
                onChange={(v) => updateField("height", v ? Number(v) : null)}
              />
              <InputField
                id="weight"
                label="Berat Badan (kg)"
                type="number"
                placeholder="Contoh: 65"
                value={form.weight}
                onChange={(v) => updateField("weight", v ? Number(v) : null)}
              />
              <SelectField
                id="skinColor"
                label="Warna Kulit"
                value={form.skinColor ?? ""}
                onChange={(v) => updateField("skinColor", v)}
                options={[
                  { value: "", label: "Pilih warna kulit" },
                  { value: "white", label: "Putih" },
                  { value: "fair", label: "Kuning Langsat" },
                  { value: "tan", label: "Sawo Matang" },
                  { value: "brown", label: "Coklat" },
                  { value: "dark", label: "Hitam" },
                ]}
              />
              <InputField
                id="occupation"
                label="Pekerjaan"
                placeholder="Contoh: Software Engineer"
                value={form.occupation ?? ""}
                onChange={(v) => updateField("occupation", v)}
                error={errors.occupation}
              />
              <InputField
                id="education"
                label="Pendidikan Terakhir"
                placeholder="Contoh: S1 Teknik Informatika"
                value={form.education ?? ""}
                onChange={(v) => updateField("education", v)}
                error={errors.education}
              />
              <InputField
                id="country"
                label="Negara"
                placeholder="Contoh: Indonesia"
                value={form.country ?? ""}
                onChange={(v) => updateField("country", v)}
                error={errors.country}
              />
              <InputField
                id="city"
                label="Kota / Domisili"
                placeholder="Contoh: Jakarta"
                value={form.city ?? ""}
                onChange={(v) => updateField("city", v)}
                error={errors.city}
              />
            </div>
          </FormCard>

          <NavButtons
            onNext={() => handleSaveAndContinue(2)}
            isLoading={isLoading}
            showBack={false}
          />
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade-in-up space-y-8">
          <SectionHeading
            title="Visi & Misi"
            description="Ceritakan visi hidup dan tujuan Anda dalam membangun rumah tangga."
          />

          <FormCard className="space-y-6">
            <TextareaField
              id="bio"
              label="Latar Belakang Singkat"
              placeholder="Ceritakan tentang diri Anda, latar belakang keluarga, dan hal-hal yang membentuk kepribadian Anda..."
              value={form.bio ?? ""}
              onChange={(v) => updateField("bio", v)}
              rows={4}
              error={errors.bio}
            />
            <TextareaField
              id="vision"
              label="Visi Hidup"
              placeholder="Apa visi hidup Anda? Bagaimana Anda memandang masa depan dalam berumah tangga?"
              value={form.vision ?? ""}
              onChange={(v) => updateField("vision", v)}
              rows={4}
              error={errors.vision}
            />
            <TextareaField
              id="mission"
              label="Misi dalam Rumah Tangga"
              placeholder="Apa misi yang ingin Anda wujudukan dalam pernikahan nanti?"
              value={form.mission ?? ""}
              onChange={(v) => updateField("mission", v)}
              rows={4}
              error={errors.mission}
            />
          </FormCard>

          <NavButtons
            onBack={() => setStep(1)}
            onNext={() => handleSaveAndContinue(3)}
            isLoading={isLoading}
          />
        </div>
      )}

      {step === 3 && (
        <div className="animate-fade-in-up space-y-8">
          <SectionHeading
            title="Kriteria Pasangan"
            description="Jelaskan kriteria pasangan yang Anda harapkan secara jelas dan realistis."
          />

          <FormCard>
            <TextareaField
              id="partnerCriteria"
              label="Kriteria Pasangan Idaman"
              placeholder="Sebutkan kriteria pasangan idaman Anda: kepribadian, pemahaman agama, pendidikan, visi hidup, dan hal-hal lain yang menurut Anda penting."
              value={form.partnerCriteria ?? ""}
              onChange={(v) => updateField("partnerCriteria", v)}
              rows={10}
              error={errors.partnerCriteria}
            />
          </FormCard>

          <NavButtons
            onBack={() => setStep(2)}
            onNext={() => handleSaveAndContinue(4)}
            isLoading={isLoading}
          />
        </div>
      )}

      {step === 4 && (
        <div className="animate-fade-in-up space-y-8">
          <SectionHeading
            title="Pemahaman Agama"
            description="Informasi tentang pemahaman dan praktik keagamaan Anda sehari-hari."
          />

          <FormCard className="space-y-6">
            <TextareaField
              id="religiousUnderstanding"
              label="Pemahaman Agama"
              placeholder="Ceritakan sejauh mana pemahaman agama Anda, bagaimana Anda mempelajarinya, dan apa yang Anda yakini..."
              value={form.religiousUnderstanding ?? ""}
              onChange={(v) => updateField("religiousUnderstanding", v)}
              error={errors.religiousUnderstanding}
            />
            <TextareaField
              id="manhaj"
              label="Manhaj"
              placeholder="Manhaj / metodologi beragama yang Anda anut dalam memahami Islam..."
              value={form.manhaj ?? ""}
              onChange={(v) => updateField("manhaj", v)}
              error={errors.manhaj}
            />
            <TextareaField
              id="memorization"
              label="Hafalan Al-Qur'an"
              placeholder="Sebutkan jumlah hafalan Al-Qur'an dan hadits yang Anda miliki, serta usaha yang dilakukan untuk menjaganya..."
              value={form.memorization ?? ""}
              onChange={(v) => updateField("memorization", v)}
              error={errors.memorization}
            />
            <TextareaField
              id="dailyWorship"
              label="Kebiasaan Ibadah"
              placeholder="Ceritakan kebiasaan ibadah harian Anda: shalat malam, puasa sunnah, dzikir, kajian, dll..."
              value={form.dailyWorship ?? ""}
              onChange={(v) => updateField("dailyWorship", v)}
              error={errors.dailyWorship}
            />
          </FormCard>

          <NavButtons
            onBack={() => setStep(3)}
            onNext={() => handleSaveAndContinue(5)}
            isLoading={isLoading}
          />
        </div>
      )}

      {step === 5 && (
        <div className="animate-fade-in-up space-y-8">
          <SectionHeading
            title="Pertanyaan & Jawaban"
            description="Buat pertanyaan dan jawaban untuk membantu calon pasangan mengenal pemikiran Anda lebih dalam."
          />

          <div className="space-y-4">
            {(form.qa ?? []).length === 0 && (
              <FormCard>
                <div className="flex flex-col items-center gap-4 py-8 text-center">
                  <div className="bg-muted flex h-14 w-14 items-center justify-center rounded-2xl">
                    <MessageCircle className="text-muted-foreground h-7 w-7" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">Belum ada pertanyaan</p>
                    <p className="text-muted-foreground max-w-xs text-xs leading-relaxed">
                      Tambahkan pertanyaan yang sering diajukan atau hal-hal yang ingin calon
                      pasangan ketahui tentang Anda.
                    </p>
                  </div>
                </div>
              </FormCard>
            )}

            {(form.qa ?? []).map((item, index) => (
              <FormCard key={index}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                      <MessageCircle className="text-primary h-4 w-4" />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive h-8 w-8 rounded-lg p-0"
                      onClick={() => removeQA(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                      Pertanyaan {index + 1}
                    </Label>
                    <Input
                      placeholder="Tulis pertanyaan..."
                      className="border-border/60 focus-visible:ring-primary/30 h-12 rounded-xl px-4 text-sm shadow-sm transition-shadow focus-visible:ring-2 focus-visible:ring-offset-2"
                      value={item.question}
                      onChange={(e) => handleQAChange(index, "question", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                      Jawaban
                    </Label>
                    <Textarea
                      placeholder="Tulis jawaban Anda..."
                      className="border-border/60 focus-visible:ring-primary/30 min-h-[100px] resize-y rounded-xl px-4 py-3 text-sm leading-relaxed shadow-sm transition-shadow focus-visible:ring-2 focus-visible:ring-offset-2"
                      value={item.answer}
                      onChange={(e) => handleQAChange(index, "answer", e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </FormCard>
            ))}

            {errors.qa && (
              <p className="text-destructive text-xs">{errors.qa}</p>
            )}
            <Button
              variant="outline"
              className="hover:border-primary/50 hover:bg-primary/5 h-12 w-full gap-2 rounded-2xl border-2 border-dashed text-sm font-semibold transition-all duration-300"
              onClick={addQA}
            >
              <Plus className="h-5 w-5" />
              Tambah Pertanyaan Baru
            </Button>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground gap-1.5 rounded-full px-5"
              onClick={() => setStep(4)}
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden md:inline">Kembali</span>
            </Button>
            <div className="flex gap-3">
              <Button
                size="lg"
                variant="outline"
                className="h-12 gap-2 rounded-full px-6 text-sm font-semibold transition-all duration-300 hover:scale-105 hover:shadow-sm"
                onClick={async () => {
                  const ok = await handleSave();
                  if (ok) {
                    toast.success("CV Ta'aruf berhasil disimpan!");
                    setCompletedSteps((prev) => new Set(prev).add(5));
                  }
                  setIsLoading(false);
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Simpan
                  </>
                )}
              </Button>
              <Button
                size="lg"
                className="h-12 gap-2 rounded-full px-6 text-sm font-semibold shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md"
                onClick={async () => {
                  const ok = await handleSave();
                  if (ok) {
                    toast.success("CV berhasil disimpan!");
                    setCompletedSteps((prev) => new Set(prev).add(5));
                    router.push("/dashboard");
                  }
                  setIsLoading(false);
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    Selesai
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
