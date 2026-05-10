export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_FILE_SIZE = 2 * 1024 * 1024;

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Format file tidak didukung. Gunakan JPEG, PNG, atau WebP.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "Ukuran file maksimal 2MB.";
  }
  return null;
}
