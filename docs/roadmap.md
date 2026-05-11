# Roadmap Pengerjaan Projek - Pethuk Jodoh

Roadmap ini disusun berdasarkan PRD untuk membangun aplikasi Ta'aruf Islami yang aman dan sesuai syariah.

---

## 🏗️ Fase 1: Fondasi & Infrastruktur (Minggu 1)

**Tujuan**: Menyiapkan lingkungan pengembangan dan sistem inti.

- [x] Inisialisasi Project: Next.js (App Router) + Bun.js.
- [x] Setup Database: Supabase + Drizzle ORM.
- [x] Autentikasi: Konfigurasi Better-auth (Username & Social Auth).
- [x] Design System: Instalasi shadcn/ui, Tailwind CSS, dan Lucide Icons.
- [x] Boilerplate Layout: Setup Navbar, Sidebar, dan Protected Routes.
- [x] Refactoring: Struktur proyek clean (halaman signin/signup & layout terpusat).
- [x] Quality Assurance: Setup Bun Test & Unit Tests dasar.
- [x] Forgot Password: Implementasi fitur lupa password dengan email reset & rate limiting (Anti-spam timer 5 menit).

## 📝 Fase 2: Manajemen CV Ta'aruf (Minggu 2)

**Tujuan**: Memungkinkan pengguna membuat profil ta'aruf yang komprehensif.

- [x] Skema Database: Implementasi tabel `users`, `profiles`, dan `mediators`.
- [x] Onboarding Flow: Halaman edukasi adab ta'aruf dan pernyataan komitmen.
- [x] CV Editor: Form multi-step untuk data diri, visi-misi, dan kriteria pasangan.
- [x] Logic Blur Foto: Implementasi storage Supabase dengan masking/blur otomatis (CSS blur → server-side blur via sharp, menyimpan original + blurred version terpisah).
- [x] Image Moderation: Face detection (MediaPipe) + NSFW classifier (nsfwjs) + face geometry validation (blokir anime/ilustrasi). Prioritas: NSFW → face presence → geometry.
- [x] Foto Upload UX: Preview langsung sebelum upload, retry button, error state, try/catch network handling.
- [x] Loading Spinner: Sentralisasi semua spinner ke komponen `<Spinner>` dari shadcn/ui.
- [x] CV Editor UX: Step indicator clickable, auto-scroll ke error, character count, mobile labels, scroll ke QA card baru.
- [x] Token System Core: Skema database untuk `wallets` dan transaksi token.
- [x] Admin Review: Panel review CV (pending → approved/rejected) di `/admin/review`, rejection reason, dan seed admin user (via Better Auth API).
- [x] Admin Sidebar: Admin mendapat navigasi sederhana (Dashboard, Panel Admin, Pesan, Pengaturan) — tanpa CV/Temukan.
- [x] Admin Skip Onboarding: Admin langsung ke dashboard tanpa redirect ke onboarding.
- [x] Admin CV Access: Admin bisa lihat CV apapun di `/cv/[username]` tanpa filter status/gender + lihat info lengkap (foto asli, nama, gender, TTL).
- [x] Published CV Lock: CV yang dipublikasikan tidak bisa diedit langsung — user harus unpublish dulu; setiap edit reset `cvStatus` ke `"pending"`.
- [x] Security: Server-side stripping `photoUrl`/`ktpUrl` untuk non-admin/non-owner.

## 🔒 Fase 1.5: Fitur Forgot Password (Selesai)

**Tujuan**: Implementasi fitur lupa password dengan proteksi anti-spam.

- [x] Auth Config: Tambah `sendResetPassword` dengan email template (Resend).
- [x] Rate Limiting: 3 request per 5 menit untuk `/forget-password`.
- [x] Forgot Password Page: Form email dengan 5-menit cooldown timer (localStorage).
- [x] Reset Password Page: Form password baru + konfirmasi dengan token validation.
- [x] Database: Tabel `rate_limit` untuk tracking rate limit.
- [x] Unit Tests: Test untuk `forgotPasswordSchema`, `resetPasswordSchema`, dan email templates.

## 🔍 Fase 3: Discovery & Matching (Minggu 3)

**Tujuan**: Memudahkan pencarian calon pasangan berdasarkan kriteria.

- [x] Katalog Kandidat -> Temukan: useSearchParams filter, username filter, sticky filter sidebar, auto gender filter.
- [x] Advanced Filtering: Filter berdasarkan kriteria kota, pendidikan, usia, username.
- [x] Detail CV View: Halaman pratinjau CV yang detail namun tetap menjaga privasi (route: `/cv/[username]`, pakai `BlurredPhoto`, tabs: Data Diri/Visi & Misi/Kriteria/Spiritual).
- [x] Fitur Request Ta'aruf: Pengajuan proses ta'aruf antar pengguna (kirim, terima/tolak, 24h expiry, auto-expire, active ta'aruf guard).
- [x] Payment Integration: Integrasi Xendit Invoice untuk top-up token (4 tier pricing, webhook, verifyWebhookToken).
- [x] Wallet UI: Saldo Token card di dashboard, balance di navbar, halaman top-up di `/topup` dengan pilihan nominal + redirect Xendit checkout.

## 💬 Fase 4: Integrasi Chat & Mediator (Minggu 4)

**Tujuan**: Membangun sistem komunikasi yang terjaga (Stream Chat).

- [ ] Setup GetStream.io: Integrasi Stream SDK di Frontend & Backend.
- [ ] Ta'aruf Room: Logic pembuatan channel chat otomatis yang menyertakan Mediator.
- [ ] Mediator Dashboard: Panel khusus bagi mediator untuk mengelola permintaan ta'aruf dan memantau chat.
- [ ] Notification Core: Implementasi sistem notifikasi in-app untuk aktivitas ta'aruf.
- [ ] Chat Guard: Bot pengingat adab di dalam ruang obrolan.

## 🔄 Fase 5: Lifecycle & Nazhar System (Minggu 5)

**Tujuan**: Mengelola alur ta'aruf hingga tahap akhir.

- [ ] State Management: Sistem pelacakan tahapan (Tukar CV -> Nazhar -> Istikharah -> Khitbah).
- [ ] Nazhar Scheduler: Penjadwalan pertemuan (online/offline) yang difasilitasi mediator.
- [ ] Feedback System: Pengguna dapat memberikan update status setelah nazhar.
- [ ] Akumulasi Data: Laporan progres ta'aruf untuk pengguna.

## 🚀 Fase 6: Polish, Testing & Launch (Minggu 6)

**Tujuan**: Menjamin kualitas dan keamanan sebelum rilis.

- [ ] Security Audit: Memastikan data pribadi (terutama foto dan dokumen) aman di Supabase.
- [ ] Uji Coba (QA): Simulasi proses ta'aruf end-to-end dengan peran Pria, Wanita, dan Mediator.
- [ ] Optimization: SEO, Page Speed, dan Responsive Design (Mobile First).
- [ ] Deployment: Rilis ke Vercel dan setup custom domain.

---

## 🛠️ Prioritas Pengembangan (MVP)

1.  Autentikasi & Onboarding (✅ Selesai - termasuk forgot password).
2.  Pembuatan CV Ta'aruf (✅ Selesai - termasuk KTP OCR, partner criteria slider).
3.  Discovery/Listing Kandidat (✅ Selesai - Temukan dengan filter username, usia, kota, sticky sidebar, useSearchParams).
4.  Request Ta'aruf (✅ Selesai - kirim/terima/tolak, 24h expiry, active ta'aruf guard, sidebar badge).
5.  Token Top-Up (✅ Selesai - Xendit Invoice, 4 tier pricing, webhook, balance display di navbar & dashboard).
6.  Chat Room Dasar (Pria + Wanita + Mediator).
7.  Status Tahapan Ta'aruf Sederhana.
