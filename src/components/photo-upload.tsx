"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
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
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 2MB");
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Format file tidak didukung. Gunakan JPEG, PNG, atau WebP.");
      return;
    }

    const formData = new FormData();
    formData.append("photo", file);

    setIsUploading(true);
    const result = await uploadPhoto(formData);

    if (result.error) {
      toast.error(result.error);
      setIsUploading(false);
      return;
    }

    if (result.photoUrl) {
      setPreview(result.photoUrl);
      onPhotoChange({
        photoUrl: result.photoUrl,
        photoBlurredUrl: result.photoBlurredUrl ?? null,
      });
      toast.success("Foto berhasil diunggah");
    }

    setIsUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleDelete() {
    setIsDeleting(true);
    const result = await deletePhoto();
    if (result.error) {
      toast.error(result.error);
      setIsDeleting(false);
      return;
    }
    setPreview(null);
    onPhotoChange({ photoUrl: null, photoBlurredUrl: null });
    toast.success("Foto berhasil dihapus");
    setIsDeleting(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center">
        <div className="relative">
          {preview ? (
            <div className="relative overflow-hidden rounded-2xl">
              <Image
                src={preview}
                alt="Foto profil"
                width={224}
                height={224}
                className="h-48 w-48 object-cover md:h-56 md:w-56"
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

      <div className="flex justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 rounded-full text-xs"
          disabled={isUploading || isDeleting}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Upload className="h-3.5 w-3.5" />
          )}
          {preview ? "Ganti Foto" : "Upload Foto"}
        </Button>

        {preview && (
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive gap-1.5 rounded-full text-xs"
            disabled={isUploading || isDeleting}
            onClick={handleDelete}
          >
            {isDeleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <X className="h-3.5 w-3.5" />
            )}
            Hapus
          </Button>
        )}
      </div>

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
