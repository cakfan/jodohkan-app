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

## 💬 Fase 4: Integrasi Chat & Mediator (Minggu 4-5)

**Tujuan**: Membangun sistem komunikasi yang terjaga.

### 💬 Chat Integration dengan GetStream.io

- [x] **Setup GetStream.io**: Setup akun Stream, API key & secret di environment.
- [x] **Ta'aruf Room (Stream)**: Channel dibuat otomatis saat ta'aruf diterima dengan mediator auto-include.
- [x] **Chat UI (Stream)**: Implementasi `ChannelList`, `MessageList`, `MessageComposer` dari stream-chat-react.
- [x] **Avatar Circular + CV Link**: Override komponen Avatar Stream agar bisa link ke profil CV.
- [x] **Mediator Controls**: Mediator dapat menghapus channel, block/unblock user, freeze channel.
- [x] **Chat Custom Theme**: Override CSS Stream Chat dengan design system shadcn/ui (token colors, border, font).
- [x] **Multiple Participant Ta'aruf**: Channel messaging dengan mediator sebagai participant ketiga.
- [x] **Chat Attachment**: Upload file/gambar via Stream CDN dengan attachment selector.
- [x] **Adab Guard**: Filter pesan — blokir kata kasar, pengingat etika otomatis saat topik fisik/pacaran terdeteksi, log pelanggaran ke database.
- [x] **Welcome Message**: Pesan pembuka & aturan ta'aruf dikirim otomatis saat channel dibuat dari mediator.
- [x] **Pin Pesan**: Mediator bisa pin lewat menu aksi pesan + banner pinned message di atas daftar pesan + tombol lepas pin.
- [x] **Notification Core**: Notifikasi in-app untuk aktivitas penting (request ta'aruf baru, pesan baru, status verifikasi CV, pengingat jadwal).
- [x] **Notification Page**: Halaman `/notifications` untuk melihat riwayat notifikasi.
- [x] **Email Notification**: Ringkasan aktivitas atau notifikasi penting ke email via Resend (Opsional).

## 🔄 Fase 5: Nadzor — Video Call & Fase Lanjutan (Minggu 5)

**Tujuan**: Memfasilitasi sesi video call nadzor dengan moderator dan transisi ke khitbah.

- [x] DB Schema: `nadzor_session` (mediator_id, max_duration, enum status/reason, index) + `nadzor_session_agreement` (unique constraint, requested_at/responded_at) + `moderator_audit_log` (audit trail).
- [x] Phase State: Tambah kolom `phase` (chat|nadzor|khitbah|completed) + `phase_updated_at` + `mediator_id` di `taaruf_request`.
- [x] Phase Transition: Mediator bisa mengaktifkan fase nadzor dari panel — validasi kedua pihak setuju.
- [x] Unit Tests: Test untuk `transitionToNadzorPhase`, `getActiveTaarufPhase`, dan validasi enum phase.
- [x] Scheduling Panel: Ajukan jadwal (09:00-15:00), approval dari kedua pihak via nadzor_session_agreement, auto-konfirmasi jika mediator pengaju, notifikasi ke semua pihak.
- [ ] Stream Video SDK: Install `@stream-io/video-react-sdk`, custom call type `"nadzor"`.
- [ ] Video Call UI: 1-on-1 video (ikhwan & akhwat), moderator join audio-only sebagai observer.
- [ ] Moderator Panel: Tombol mute peserta (audio/video) dan akhiri call, indikator pembicara.
- [ ] Pengingat Wali: Dialog wajib centang sebelum call dimulai + banner selama call.
- [ ] Wali Reminder: Banner "Pastikan akhwat didampingi wali/keluarga terpercaya" (tidak bisa di-skip).
- [ ] Time Window: Call hanya aktif ±15 menit dari jadwal; moderator wajib hadir 5 menit.
- [ ] After Call: Form feedback ikhwan/akhwat + pilihan lanjut (khitbah / stop).
- [ ] Absence Handling: Jika salah satu pihak tidak hadir 15 menit → call batal.
- [ ] Audit Trail: Semua tindakan moderator (mute, end call) tercatat di DB.
- [ ] Khitbah: Fase di luar aplikasi — mediator update status sebagai completed setelah dikonfirmasi.

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
6.  Chat Room Dasar (✅ Selesai — Stream Chat dengan mediator auto-include).
7.  Status Tahapan Ta'aruf Sederhana.
