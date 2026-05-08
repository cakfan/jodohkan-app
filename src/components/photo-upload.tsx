"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Upload, X, RefreshCw } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { uploadPhoto, deletePhoto } from "@/app/actions/photo";
import { toast } from "sonner";

interface PhotoChangeValue {
  photoUrl: string | null;
  photoBlurredUrl: string | null;
}

interface PhotoUploadProps {
  photoUrl: string | null | undefined;
  onPhotoChange: (value: PhotoChangeValue) => void;
}

export function PhotoUpload({ photoUrl, onPhotoChange }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(photoUrl ?? null);
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
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
    setUploadError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("photo", file);

      const result = await uploadPhoto(formData);

      if (result.error) {
        setUploadError(result.error);
        return;
      }

      if (result.photoUrl) {
        URL.revokeObjectURL(objectUrl);
        setPreview(result.photoUrl);
        setLocalFile(null);
        setUploadError(null);
        onPhotoChange({
          photoUrl: result.photoUrl,
          photoBlurredUrl: result.photoBlurredUrl ?? null,
        });
      }
    } catch {
      setUploadError("Koneksi terputus. Periksa internet Anda dan coba lagi.");
      return;
    } finally {
      setIsUploading(false);
    }

    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleRetry() {
    if (!localFile) return;

    setUploadError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("photo", localFile);

      const result = await uploadPhoto(formData);

      if (result.error) {
        setUploadError(result.error);
        return;
      }

      if (result.photoUrl) {
        if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
        setPreview(result.photoUrl);
        setLocalFile(null);
        setUploadError(null);
        onPhotoChange({
          photoUrl: result.photoUrl,
          photoBlurredUrl: result.photoBlurredUrl ?? null,
        });
      }
    } catch {
      setUploadError("Koneksi terputus. Periksa internet Anda dan coba lagi.");
      return;
    } finally {
      setIsUploading(false);
    }

    if (inputRef.current) inputRef.current.value = "";
  }

  function handleSelectNew() {
    if (localFile && preview?.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }
    setLocalFile(null);
    setUploadError(null);
    setPreview(photoUrl ?? null);
    inputRef.current?.click();
  }

  async function handleDelete() {
    setIsDeleting(true);

    try {
      const result = await deletePhoto();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setPreview(null);
      setLocalFile(null);
      setUploadError(null);
      onPhotoChange({ photoUrl: null, photoBlurredUrl: null });
    } catch {
      toast.error("Koneksi terputus. Periksa internet Anda dan coba lagi.");
      return;
    } finally {
      setIsDeleting(false);
    }
  }

  const hasUploadedPhoto = !!photoUrl && !isLocalPreview;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center">
        <div className="relative">
          {preview || localFile ? (
            <div className="relative overflow-hidden rounded-2xl">
              <Image
                src={preview ?? ""}
                alt="Foto profil"
                width={224}
                height={224}
                className="h-48 w-48 object-cover md:h-56 md:w-56"
                loading="eager"
                unoptimized
              />
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/5" />
            </div>
          ) : (
            <div className="bg-muted flex h-48 w-48 items-center justify-center rounded-2xl md:h-56 md:w-56">
              <Upload className="text-muted-foreground h-10 w-10" />
            </div>
          )}
        </div>
      </div>

      {uploadError && (
        <div className="text-destructive flex flex-col items-center gap-2 text-center text-xs">
          <p>{uploadError}</p>
        </div>
      )}

      <div className="flex justify-center gap-2">
        {isLocalPreview || !hasUploadedPhoto ? (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 rounded-full text-xs"
            disabled={isUploading || isDeleting}
            onClick={isLocalPreview && uploadError ? handleRetry : handleSelectNew}
          >
            {isUploading ? (
              <Spinner className="size-3.5" />
            ) : isLocalPreview && uploadError ? (
              <RefreshCw className="size-3.5" />
            ) : (
              <Upload className="size-3.5" />
            )}
            {isUploading ? "Mengunggah..." : isLocalPreview && uploadError ? "Upload Ulang" : "Upload Foto"}
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 rounded-full text-xs"
            disabled={isUploading || isDeleting}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="size-3.5" />
            Ganti Foto
          </Button>
        )}

        {(hasUploadedPhoto || (isLocalPreview && !uploadError)) && (
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive gap-1.5 rounded-full text-xs"
            disabled={isUploading || isDeleting}
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

      {isLocalPreview && uploadError && (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground gap-1.5 rounded-full text-xs"
            onClick={handleSelectNew}
          >
            <Upload className="size-3.5" />
            Pilih Foto Lain
          </Button>
        </div>
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
