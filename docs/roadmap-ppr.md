# Partial Pre-Rendering (PPR) — Analisis & Roadmap

## Ringkasan

Partial Pre-Rendering (PPR) mengirimkan **static HTML shell** secara instan saat pengguna membuka halaman. Konten dinamis (data user, cookies, searchParams) **streaming** masuk via `<Suspense>` fallback. Di Next.js 16 diaktifkan via `cacheComponents: true` di `next.config.ts` (tidak perlu `experimental.ppr`).

**Manfaat:**
- Waktu muat awal lebih cepat karena shell sudah terkirim
- Core Web Vitals (LCP, FCP) membaik
- Pengguna melihat layout segera, konten mengisi bertahap

---

## Status Terkini (Build 14 Mei 2026 ✅ — 25/25 pages, zero prerender errors)

| Halaman | Status Build | Keterangan |
|---------|-------------|------------|
| `/` | ◐ PPR | Session + redirect logic di `HomeContent` dalam `<Suspense>` |
| `/find` | ◐ PPR | `async` di `<Suspense>`, `force-dynamic` dihapus |
| `/cv/[username]` | ◐ PPR | `async` di `<Suspense>` |
| `/dashboard` | ◐ PPR | `DashboardContent` di `<Suspense>` + skeleton |
| `/notifications` | ◐ PPR | `NotificationsContent` di `<Suspense>` + skeleton |
| `/cv/edit` | ◐ PPR | `CVEditContent` di `<Suspense>` + skeleton |
| `/admin/review` | ◐ PPR | `force-dynamic` dihapus, `ReviewClient` di `<Suspense>` |
| `/onboarding` | ◐ PPR | `OnboardingLoader` di `<Suspense>` |
| `/taaruf` | ◐ PPR | `TaarufLoader` di `<Suspense>` |
| `/topup` | ◐ PPR | — |
| `/topup/success` | ◐ PPR | — |
| `/topup/failed` | ◐ PPR | — |
| `/messages` | ◐ PPR | — |
| `/signin` | ○ Static | — |
| `/signup` | ○ Static | — |
| `/forgot-password` | ○ Static | — |
| `/reset-password` | ○ Static | — |
| `/setup-username` | ○ Static | — |

**Catatan:** `(dashboard)/layout.tsx` masih punya async session/redirect logic di dalam `<Suspense>`. Untuk PPR penuh di semua dashboard pages, redirect perlu pindah ke middleware (Fase 3).

---

## Langkah Implementasi

### Fase 1 ✅ — Konfigurasi & Halaman Siap Pakai
- [x] Tambah `cacheComponents: true` di `next.config.ts`
- [x] Hapus `dynamic = "force-dynamic"` di `/find/page.tsx`
- [x] Hapus `dynamic = "force-dynamic"` di `/admin/review/page.tsx`
- [x] Restruktur `/find/page.tsx`: `async` dalam `<Suspense>`
- [x] Restruktur `/cv/[username]/page.tsx`: `async` dalam `<Suspense>`

### Fase 2 ✅ — Suspense Boundaries Baru
- [x] `/dashboard/page.tsx`: `DashboardContent` dalam `<Suspense>` + skeleton
- [x] `/notifications/page.tsx`: `NotificationsContent` dalam `<Suspense>` + skeleton
- [x] `/cv/edit/page.tsx`: `CVEditContent` dalam `<Suspense>` + skeleton
- [x] `/admin/review/page.tsx`: `ReviewClient` dalam `<Suspense>`
- [x] `/(dashboard)/layout.tsx`: async session/redirect di dalam `<Suspense>`
- [x] `/onboarding/page.tsx`: `OnboardingLoader` dalam `<Suspense>`
- [x] `/taaruf/page.tsx`: `TaarufLoader` dalam `<Suspense>`
- [x] `/page.tsx`: `HomeContent` dalam `<Suspense>`

### Fase 3 ✅ — Pindahkan Redirect Login/Akses ke Proxy
`src/proxy.ts` dijadikan Next.js 16 proxy (auto-detected, tanpa `middleware.ts`). Proxy Edge runtime tidak bisa akses DB, jadi redirect detail (username, onboarding) tetap di layout dalam Suspense — PPR tetap berjalan.

**Yang berubah:**
- `DEFAULT_LOGIN_REDIRECT` → `/dashboard` (dari `/`)
- Proxy redirect logged-in users dari `/` ke `/dashboard`
- Landing page menjadi **○ Static** murni (tanpa session/redirect logic)
- Auth guard (no session → /signin) ditangani proxy, layout hanya handle username/onboarding
- `(dashboard)/layout.tsx` retain: session null check + username + onboarding + sidebar cookie (need DB)
- `page.tsx`: jadi non-async, `session={null}`, copyright year via client component dalam Suspense

**Checklist:**
- [x] Proxy.ts auto-detected sebagai Next.js 16 proxy (hapus middleware.ts)
- [x] Evaluasi: redirect detail (username/onboarding) **tidak bisa** pindah ke proxy (Edge runtime, no DB)
- [x] Landing page redirect dipindahkan ke proxy: logged-in → `/dashboard`
- [x] Landing page jadi fully static (○) tanpa Suspense wrapper

---

## Intercepting Routes — Modal Detail CV dari Halaman Find

**Intercepting Routes** memungkinkan navigasi dari `/find` ke `/cv/[username]` ditangkap dan ditampilkan sebagai **modal/overlay** di atas halaman `/find`, tanpa meninggalkan konteks pencarian. URL tetap berubah ke `/cv/[username]` (bisa di-share), dan jika di-refresh atau dibuka langsung, tampil halaman CV penuh.

### Cara Kerja

Ketika user klik kartu CV di `/find`:
1. Next.js menangkap navigasi ke `/cv/[username]` karena ada file `(..)cv/[username]/page.tsx` di dalam parallel route `@modal`
2. Konten CV dirender di dalam modal di atas halaman `/find`
3. URL berubah ke `/cv/[username]`
4. User klik close modal → navigasi balik ke `/find` (bukan ke halaman sebelumnya)
5. Jika user buka URL `/cv/[username]` langsung atau refresh → tampil halaman CV penuh (tanpa modal)

### Struktur Folder

```
src/app/(dashboard)/
├── find/
│   ├── page.tsx              ← halaman daftar kandidat
│   ├── find-client.tsx
│   └── @modal/               ← parallel route slot untuk modal
│       └── (..)cv/
│           └── [username]/
│               └── page.tsx  ← intercept `/cv/[username]` dari `/find`
├── layout.tsx                ← perlu render `@modal` slot
└── cv/
    └── [username]/
        └── page.tsx          ← halaman CV penuh (tidak berubah)
```

### Prasyarat
- Parallel route `@modal` di `(dashboard)/find/`
- Layout `(dashboard)/layout.tsx` perlu menerima dan merender prop `modal`
- Komponen modal (sheet/dialog) yang membungkus konten CV
- Link di `find-client.tsx` mengarah ke `/cv/[username]` (sudah ada)

### Checklist Implementasi ✅
- [x] Buat `src/app/(dashboard)/find/@modal/` dengan `default.tsx` dan `[...catchAll]/page.tsx`
- [x] Buat `src/app/(dashboard)/find/@modal/(..)cv/[username]/page.tsx` — intercepting route
- [x] Buat komponen modal (`CvDetailModal`) dengan shadcn `Dialog` + `CandidateDetailClient`
- [x] Buat `src/app/(dashboard)/find/layout.tsx` untuk render slot `@modal`
- [x] Responsive: `w-full max-w-3xl`, `p-0 pt-8` (dialog paddding dihapus, konten punya padding sendiri)
