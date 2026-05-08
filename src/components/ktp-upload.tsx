"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Upload, X, RefreshCw, IdCard, CheckCircle2, AlertCircle } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { uploadKtp, deleteKtp } from "@/app/actions/ktp";
import { extractKtpInfo, validateKtpImage, type KtpExtractedData } from "@/lib/ktp-ocr";
import { toast } from "sonner";

interface KtpChangeValue {
  ktpUrl: string | null;
}

interface KtpUploadProps {
  ktpUrl: string | null | undefined;
  onKtpChange: (value: KtpChangeValue) => void;
  onExtracted?: (data: KtpExtractedData) => void;
}

export function KtpUpload({ ktpUrl, onKtpChange, onExtracted }: KtpUploadProps) {
  const [preview, setPreview] = useState<string | null>(ktpUrl ?? null);
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [extracted, setExtracted] = useState<KtpExtractedData | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const hasAutoFilledRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (localFile && preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [localFile, preview]);

  const isLocalPreview = localFile !== null;

  function validateFile(file: File): string | null {
    if (file.size > 2 * 1024 * 1024) {
      return "Ukuran file maksimal 2MB";
    }
    if (!["image/jpeg", "image/png", "image.webp"].includes(file.type)) {
      return "Format file tidak didukung. Gunakan JPEG, PNG, atau WebP.";
    }
    return null;
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    if (localFile && preview?.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setLocalFile(file);
    setExtracted(null);
    setOcrError(null);
    hasAutoFilledRef.current = false;
    setUploadError(null);
    setIsProcessing(true);

    await extractAndUpload(file, objectUrl);

    if (inputRef.current) inputRef.current.value = "";
  }

  async function extractAndUpload(file: File, objectUrl: string) {
    let shouldUpload = true;

    try {
      const result = await extractKtpInfo(file);
      const validation = validateKtpImage(result);

      if (!validation.valid) {
        setOcrError(validation.reason ?? "Foto tidak dikenali sebagai KTP.");
        shouldUpload = false;
      } else {
        setExtracted(result);

        if (onExtracted && !hasAutoFilledRef.current) {
          hasAutoFilledRef.current = true;
          onExtracted(result);
          const filledFields: string[] = [];
          if (result.birthPlace) filledFields.push("Tempat Lahir");
          if (result.birthDate) filledFields.push("Tanggal Lahir");
          if (result.gender) filledFields.push("Jenis Kelamin");
          if (result.maritalStatus) filledFields.push("Status Perkawinan");
          if (result.occupation) filledFields.push("Pekerjaan");
          if (filledFields.length > 0) {
            toast.success(`Data terisi otomatis: ${filledFields.join(", ")}`);
          }
        }

        if (validation.reason) {
          toast.warning(validation.reason);
        }
      }
    } catch {
      setOcrError("Gagal membaca KTP. Silakan upload foto yang lebih jelas.");
      shouldUpload = false;
    }

    if (!shouldUpload) {
      setIsProcessing(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("ktp", file);

      const uploadResult = await uploadKtp(formData);

      if (uploadResult.error) {
        setUploadError(uploadResult.error);
        return;
      }

      if (uploadResult.ktpUrl) {
        URL.revokeObjectURL(objectUrl);
        setPreview(uploadResult.ktpUrl);
        setLocalFile(null);
        setUploadError(null);
        onKtpChange({ ktpUrl: uploadResult.ktpUrl });
      }
    } catch {
      setUploadError("Koneksi terputus. Periksa internet Anda dan coba lagi.");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleRetry() {
    if (!localFile) return;

    setOcrError(null);
    setUploadError(null);
    setExtracted(null);
    hasAutoFilledRef.current = false;
    setIsProcessing(true);

    const objectUrl = preview?.startsWith("blob:") ? preview : URL.createObjectURL(localFile);
    if (preview?.startsWith("blob:") && preview !== objectUrl) {
      URL.revokeObjectURL(preview);
    }
    setPreview(objectUrl);

    await extractAndUpload(localFile, objectUrl);

    if (inputRef.current) inputRef.current.value = "";
  }

  function handleSelectNew() {
    if (localFile && preview?.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }
    setLocalFile(null);
    setExtracted(null);
    setOcrError(null);
    hasAutoFilledRef.current = false;
    setUploadError(null);
    setPreview(ktpUrl ?? null);
    inputRef.current?.click();
  }

  async function handleDelete() {
    setIsDeleting(true);

    try {
      const result = await deleteKtp();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setPreview(null);
      setLocalFile(null);
      setExtracted(null);
      setOcrError(null);
      hasAutoFilledRef.current = false;
      setUploadError(null);
      onKtpChange({ ktpUrl: null });
    } catch {
      toast.error("Koneksi terputus. Periksa internet Anda dan coba lagi.");
    } finally {
      setIsDeleting(false);
    }
  }

  const hasUploadedKtp = !!ktpUrl && !isLocalPreview;

  const extractedFields: { label: string; value?: string }[] = [
    { label: "NIK", value: extracted?.nik },
    { label: "Nama", value: extracted?.name },
    { label: "Tempat Lahir", value: extracted?.birthPlace },
    { label: "Tanggal Lahir", value: extracted?.birthDate?.split("-").reverse().join("-") },
    { label: "Jenis Kelamin", value: extracted?.gender === "male" ? "Laki-laki" : extracted?.gender === "female" ? "Perempuan" : extracted?.gender },
    { label: "Status Perkawinan", value: extracted?.maritalStatus === "single" ? "Belum Kawin" : extracted?.maritalStatus === "married" ? "Kawin" : extracted?.maritalStatus === "divorced" ? "Cerai Hidup" : extracted?.maritalStatus === "widowed" ? "Cerai Mati" : extracted?.maritalStatus },
    { label: "Pekerjaan", value: extracted?.occupation },
  ];

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-center">
        <div className="relative">
          {preview ? (
            <div className="relative overflow-hidden rounded-2xl">
              <Image
                src={preview}
                alt="Foto KTP"
                width={320}
                height={200}
                className="h-40 w-64 object-cover md:h-44 md:w-72"
                loading="eager"
                unoptimized
              />
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/5" />
              {isProcessing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl bg-black/60">
                  <Spinner className="size-6 text-white" />
                  <span className="text-xs font-medium text-white">Mengekstrak data KTP...</span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-muted flex h-40 w-64 flex-col items-center justify-center rounded-2xl gap-2 md:h-44 md:w-72">
              <IdCard className="text-muted-foreground h-8 w-8" />
              <span className="text-muted-foreground text-xs font-medium">KTP</span>
            </div>
          )}
        </div>
      </div>

      {uploadError && (
        <p className="text-destructive text-center text-xs">{uploadError}</p>
      )}

      {extracted && !isProcessing && (
        <div className="w-full max-w-xs space-y-2 rounded-xl border bg-emerald-50 p-3 dark:bg-emerald-950/20">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Data terdeteksi dari KTP
            </span>
          </div>
          <div className="space-y-1">
            {extractedFields.map(
              (f) =>
                f.value && (
                  <div key={f.label} className="flex justify-between gap-2 text-[11px]">
                    <span className="text-muted-foreground shrink-0">{f.label}</span>
                    <span className="font-medium text-right truncate max-w-[140px]">{f.value}</span>
                  </div>
                )
            )}
          </div>
          <p className="text-muted-foreground text-[10px]">Data sudah terisi otomatis ke form.</p>
        </div>
      )}

      {ocrError && !isProcessing && (
        <div className="flex items-center gap-1.5 rounded-xl border bg-amber-50 p-3 dark:bg-amber-950/20">
          <AlertCircle className="size-3.5 shrink-0 text-amber-600" />
          <span className="text-xs text-amber-700 dark:text-amber-400">{ocrError}</span>
        </div>
      )}

      <div className="flex justify-center gap-2">
        {isLocalPreview || !hasUploadedKtp ? (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 rounded-full text-xs"
            disabled={isProcessing || isDeleting}
            onClick={uploadError || ocrError ? handleRetry : handleSelectNew}
          >
            {isProcessing ? (
              <Spinner className="size-3.5" />
            ) : uploadError || ocrError ? (
              <RefreshCw className="size-3.5" />
            ) : (
              <Upload className="size-3.5" />
            )}
            {isProcessing ? "Memproses..." : uploadError || ocrError ? "Upload Ulang" : "Upload KTP"}
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 rounded-full text-xs"
            disabled={isProcessing || isDeleting}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="size-3.5" />
            Ganti Foto
          </Button>
        )}

        {(hasUploadedKtp || (isLocalPreview && !uploadError && !ocrError)) && (
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive gap-1.5 rounded-full text-xs"
            disabled={isProcessing || isDeleting}
            onClick={handleDelete}
          >
            {isDeleting ? (
              <Spinner className="size-3.5" />
            ) : (
              <X className="size-3.5" />
            )}
            Hapus
          </Button>
        )}
      </div>

      {isLocalPreview && (uploadError || ocrError) && !isProcessing && (
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground gap-1.5 rounded-full text-xs"
          onClick={handleSelectNew}
        >
          <Upload className="size-3.5" />
          Pilih Foto Lain
        </Button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelect}
      />

      <p className="text-muted-foreground text-center text-xs">
        Format: JPEG, PNG, WebP. Maksimal 2MB.
      </p>
    </div>
  );
}
