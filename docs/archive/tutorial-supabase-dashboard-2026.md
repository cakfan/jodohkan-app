# Tutorial Dashboard Supabase 2026

Panduan navigasi dashboard Supabase terkini (perubahan UI 2025–2026) untuk mengatur Storage, mengambil API keys, dan konfigurasi project.

---

## 1. Navigasi Dashboard (Setelah Restruktur 2025)

Pada pertengahan 2025, Supabase merombak navigasi dashboard. **Pengaturan service tidak lagi tersembunyi di Project Settings** — sekarang berada di masing-masing area:

| Dulu (di Project Settings) | Sekarang |
|---|---|
| Database → Configuration | Database → Configuration |
| Storage → Settings | Storage → Settings |
| Authentication → Settings | Authentication → Settings |
| API Keys | Settings → API Keys (sidebar kiri bawah) |
| Data API | Settings → Data API |

Project Settings (ikon gear) masih ada, tapi sekarang hanya berisi pengaturan umum project (nama, region, billing).

---

## 2. Mengambil API Keys (Perubahan 2025–2026)

Peringatan: **Supabase sudah memperkenalkan format API key baru** sejak akhir 2025:

| Jenis | Format | Level Akses | Aman di Frontend? |
|---|---|---|---|
| **Publishable key** (baru) | `sb_publishable_xxx` | Rendah (terbatas RLS) | Ya ✅ |
| **Secret key** (baru) | `sb_secret_xxx` | Tinggi (bypass RLS) | Tidak ❌ |
| `anon` (lama) | JWT `eyJ...` | Rendah (terbatas RLS) | Ya ✅ |
| `service_role` (lama) | JWT `eyJ...` | Tinggi (bypass RLS) | Tidak ❌ |

> **Catatan**: `sb_publishable_xxx` menggantikan `anon`, `sb_secret_xxx` menggantikan `service_role`. Legacy keys (`anon`/`service_role`) akan **dihapus akhir 2026**.

### Cara Mengambil API Key (Langkah demi Langkah)

1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Anda
3. Di sidebar kiri, scroll ke bawah ke **Settings** (ikon gear)
4. Klik **API Keys** (dulu bernama "API" di bawah Project Settings)

Di halaman ini Anda akan melihat:
- **Publishable key** — untuk frontend (NEXT_PUBLIC)
- **Secret keys** — untuk backend (JANGAN pernah di-frontend)
- Tab **"Legacy anon, service_role API keys"** — untuk key lama `eyJ...`

### Untuk Project Ini (Pethuk Jodoh)

Kita masih pakai `service_role` key karena kompatibilitas. Ambil dari:

1. Dashboard → Settings → API Keys
2. Tab **"Legacy anon, service_role API keys"**
3. Copy **service_role key** (yang panjang mulai `eyJ...`)
4. Paste ke `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL="https://tglsqgabtspzzymhhldx.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJ...paste di sini..."
```

> ⚠️ **Jangan pernah** prefix `SUPABASE_SERVICE_ROLE_KEY` dengan `NEXT_PUBLIC_` — ini akan mengekspos secret key ke browser!

---

## 3. Setup Storage Bucket

1. Di sidebar kiri, klik **Storage**
2. Klik tombol **New bucket**
3. Isi:
   - **Name**: `profile-photos`
   - **Public bucket**: ✅ Centang
4. Klik **Create bucket**

### Atur Security Policy (RLS)

Di tab **Policies** bucket `profile-photos`:

**Policy untuk INSERT** (upload):
```sql
CREATE POLICY "Users can upload their own photos"
ON storage.objects FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'profiles'
  AND (storage.foldername(name))[2] = auth.uid()::text
);
```

**Policy untuk SELECT** (view):
```sql
CREATE POLICY "Anyone can view photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-photos');
```

**Policy untuk DELETE**:
```sql
CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
USING (
  auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'profiles'
  AND (storage.foldername(name))[2] = auth.uid()::text
);
```

---

## 4. Table Editor (Mengecek Data)

Di sidebar kiri, klik **Table Editor**:

- Semua tabel project ada di sini
- Untuk melihat data profile, pilih tabel `profile`
- Filter, sort, dan edit data langsung dari UI

---

## 5. SQL Editor

Untuk query langsung atau migrasi manual:

- Klik **SQL Editor** di sidebar kiri
- Tulis query SQL
- Klik **Run** (CMD+Enter)
- Hasil bisa di-export CSV/JSON

---

## 6. Tips Penting

| Hal | Keterangan |
|---|---|
| **Service_role key** | Hanya untuk server-side code. Jangan pernah di-frontend! |
| **RLS Storage** | Walaupun pakai service_role di server action, tetap pasang RLS untuk jaga-jaga |
| **Bucket public** | Perlu dicentang agar URL foto bisa diakses tanpa token |
| **CORS** | Tidak diperlukan karena upload via server action (server-side) |
| **Monitoring** | Sidebar → Report → memantau usage, error, performa query |
| **Logs** | Sidebar → Logs → melihat query SQL, auth events, storage events |

---

## 7. Troubleshooting

### "Foto tidak muncul / 403"

1. Cek apakah bucket **public**
2. Cek apakah file benar-benar terupload (via Storage → bucket → folder)
3. Coba akses URL langsung di browser

### "Upload gagal dengan error storage"

1. Cek `SUPABASE_SERVICE_ROLE_KEY` di `.env` sudah benar
2. Cek file size < 2MB dan format JPEG/PNG/WebP

### "Error: supabaseKey is required"

`SUPABASE_SERVICE_ROLE_KEY` kosong. Isi di `.env` dengan key dari dashboard.

---

## Referensi

- [Supabase Docs: Getting Started](https://supabase.com/docs/guides/getting-started)
- [Supabase Docs: API Keys](https://supabase.com/docs/guides/api/api-keys)
- [Supabase Dashboard](https://supabase.com/dashboard)
