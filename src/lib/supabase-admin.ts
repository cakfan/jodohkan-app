import { createClient } from "@supabase/supabase-js";

const BUCKET_NAME = "profile-photos";

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function ensureBucketExists(): Promise<string | null> {
  const supabase = getAdminClient();
  const { data: buckets } = await supabase.storage.listBuckets();
  if (buckets?.some((b) => b.name === BUCKET_NAME)) return null;

  const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
    public: true,
    fileSizeLimit: 2 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  });

  return error ? `Gagal membuat bucket: ${error.message}` : null;
}

export function getPublicUrl(filePath: string): string {
  const supabase = getAdminClient();
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
  return data.publicUrl;
}

export function buildFilePath(userId: string, fileName: string, prefix = "profiles"): string {
  return `${prefix}/${userId}/${fileName}`;
}

export function extractStoragePath(url: string): string | null {
  const match = url.match(/profile-photos\/(.+)/);
  return match ? match[1] : null;
}

export async function uploadToStorage(filePath: string, buffer: Buffer, contentType: string) {
  const supabase = getAdminClient();
  return supabase.storage.from(BUCKET_NAME).upload(filePath, buffer, {
    contentType,
    upsert: false,
  });
}

export async function removeFromStorage(filePath: string) {
  const supabase = getAdminClient();
  return supabase.storage.from(BUCKET_NAME).remove([filePath]);
}


