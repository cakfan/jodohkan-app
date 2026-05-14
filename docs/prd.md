# Product Requirements Document (PRD) - Pethuk Jodoh

## 1. Product Overview

**Pethuk Jodoh** adalah platform digital yang memfasilitasi proses **Ta'aruf Islami** secara modern, aman, dan tetap memegang teguh prinsip-prinsip syariah. Berbeda dengan aplikasi kencan (dating apps) konvensional, Pethuk Jodoh berfokus pada keseriusan menuju pernikahan dengan melibatkan peran mediator (mahram/wali/ustadz) dalam setiap interaksinya.

### Goal

Membantu muslim dan muslimah menemukan pasangan hidup melalui proses yang terjaga, transparan, dan terhindar dari fitnah (khalwat digital).

---

## 2. Tech Stack

| Komponen                         | Teknologi                          |
| :------------------------------- | :--------------------------------- |
| **Frontend & Backend Framework** | Next.js (App Router)               |
| **Runtime & Package Manager**    | Bun.js                             |
| **Authentication**               | Better-auth                        |
| **Database & Storage**           | Supabase (PostgreSQL)              |
| **ORM**                          | Drizzle ORM                        |
| **Chat Engine**                  | GetStream.io (Stream Chat)         |
| **Video Call**                   | GetStream.io (Stream Video)        |
| **Payment Gateway**              | Xendit Invoice (Token Purchase)    |
| **UI Components**                | shadcn/ui                          |
| **Styling**                      | Tailwind CSS & Lucide Icons        |
| **Image Moderation**             | MediaPipe (face detection) + nsfwjs |
| **Image Processing**             | Sharp (server-side image blur)     |

---

## 3. User Personas

1. **Candidate (Pria/Wanita):** Individu yang berniat serius untuk menikah.
2. **Mediator (Murabbi/Wali/Ustadz):** Pihak ketiga yang memantau proses ta'aruf dan memfasilitasi komunikasi.
3. **Admin:** Pengelola platform yang memverifikasi CV, memantau aktivitas, dan mengatur sistem.

---

## 4. Key Features

### 4.1. Onboarding & Niat

- Edukasi singkat mengenai adab ta'aruf sebelum pendaftaran.
- Pernyataan komitmen untuk mengikuti aturan syar'i di platform.
- Admin langsung skip onboarding dan diarahkan ke dashboard.

### 4.2. CV Ta'aruf Digital (Rich Profile)

- Pengisian data komprehensif multi-step:
  - Data Diri (Visi, Misi, Latar Belakang).
  - Kriteria Pasangan (dengan slider).
  - Pemahaman Agama (Hafalan, Manhaj, Kebiasaan Ibadah).
  - Pertanyaan Terbuka (Q&A) untuk menggali pemikiran.
- Step indicator clickable, auto-scroll ke error, character count, mobile labels.
- Fitur **Blur Foto**: Foto default diburamkan (CSS blur → server-side blur via sharp, menyimpan original + blurred version).
- **Image Moderation**: Face detection (MediaPipe) + NSFW classifier (nsfwjs) + face geometry validation (blokir anime/ilustrasi). Prioritas: NSFW → face presence → geometry.
- **Foto Upload UX**: Preview langsung, retry button, error state, try/catch network handling.
- **Published CV Lock**: CV yang dipublikasikan tidak bisa diedit langsung — user harus unpublish dulu; setiap edit reset `cvStatus` ke `"pending"`.
- **Admin Review Panel**: Panel review CV (pending → approved/rejected) di `/admin/review`, rejection reason.
- **Admin CV Access**: Admin bisa lihat CV apapun di `/cv/[username]` tanpa filter status/gender + lihat info lengkap (foto asli, nama, gender, TTL).
- **Security**: Server-side stripping `photoUrl`/`ktpUrl` untuk non-admin/non-owner.
- **Admin Sidebar**: Admin mendapat navigasi sederhana (Dashboard, Panel Admin, Pesan, Pengaturan) — tanpa CV/Temukan.

### 4.3. Pencarian & Filtering (Temukan)

- Katalog kandidat dengan useSearchParams filter, sticky filter sidebar, auto gender filter.
- Filter berdasarkan kota, pendidikan, usia, username.
- Detail CV view di `/cv/[username]` dengan `BlurredPhoto` dan tabs: Data Diri/Visi & Misi/Kriteria/Spiritual.
- Tidak ada fitur "swipe" tanpa tujuan; fokus pada pembacaan CV yang mendalam.

### 4.4. Request Ta'aruf

- Pengajuan proses ta'aruf antar pengguna (kirim, terima/tolak).
- 24 jam expiry, auto-expire, active ta'aruf guard (cegah multi ta'aruf aktif).
- Mengkonsumsi token untuk membuka sesi ta'aruf.

### 4.5. Guided Chat with Mediator (GetStream Integration)

- Komunikasi **tidak bisa dilakukan berduaan** — channel otomatis menyertakan minimal 1 Mediator sebagai participant ketiga.
- Channel type khusus `taaruf_room`.
- **Adab Guard**: Filter pesan — blokir kata kasar, pengingat etika otomatis saat topik fisik/pacaran terdeteksi, log pelanggaran ke database.
- **Welcome Message**: Pesan pembuka & aturan ta'aruf dikirim otomatis dari mediator saat channel dibuat.
- **Pin Pesan**: Mediator bisa pin lewat menu aksi pesan + banner pinned message + tombol lepas pin.
- **Avatar Circular + CV Link**: Override Avatar Stream agar bisa link ke profil CV.
- **Chat Custom Theme**: Override CSS Stream Chat dengan design system shadcn/ui.
- **Chat Attachment**: Upload file/gambar via Stream CDN.

### 4.6. Nadzor — Video Call (Fase Lanjutan)

Sesi video call nadzor dengan moderator:

- **Scheduling Panel**: Ajukan jadwal, approval dari kedua pihak, notifikasi ke mediator.
- **Stream Video SDK**: Custom call type `"nadzor"`.
- **Video Call UI**: 1-on-1 video (ikhwan & akhwat), moderator join audio-only sebagai observer.
- **Moderator Panel**: Tombol mute peserta (audio/video) dan akhiri call, indikator pembicara.
- **Wali Reminder**: Dialog wajib centang sebelum call + banner "Pastikan akhwat didampingi wali/keluarga terpercaya" (tidak bisa di-skip).
- **Time Window**: Call hanya aktif ±15 menit dari jadwal; moderator wajib hadir 5 menit.
- **After Call**: Form feedback ikhwan/akhwat + pilihan lanjut (khitbah / stop).
- **Absence Handling**: Jika salah satu pihak tidak hadir 15 menit → call batal.
- **Audit Trail**: Semua tindakan moderator (mute, end call) tercatat di DB.

### 4.7. Management Tahapan Ta'aruf

Pelacakan status proses dalam phase: `chat` → `nadzor` → `khitbah` → `completed`:

1. **Chat**: Pertukaran CV dan komunikasi awal via chat dengan mediator.
2. **Nadzor**: Sesi video call didampingi mediator (setelah kedua pihak setuju).
3. **Khitbah**: Fase di luar aplikasi — mediator update status setelah dikonfirmasi.
4. **Completed**: Proses ta'aruf selesai.

Mediator mengaktifkan fase nadzor dari panel — validasi kedua pihak setuju via `nadzor_session_agreement`.

### 4.8. Ekonomi Token (Sistem Token Niat)

Untuk menjamin keseriusan dan sustainibilitas platform:

- **Wallet System**: Setiap user memiliki wallet dengan saldo token.
- **Token Purchase**: Pembelian token melalui Xendit Invoice (4 tier pricing).
- **Webhook**: Xendit webhook untuk verifikasi pembayaran (`verifyWebhookToken`).
- **Token Usage**: Token dikonsumsi untuk membuka sesi ta'aruf.
- **Welcome Bonus**: Token gratis untuk pengguna baru.
- **Wallet UI**: Saldo token card di dashboard, balance di navbar, halaman top-up di `/topup` dengan pilihan nominal + redirect Xendit checkout.

### 4.9. Forgot Password

- Form email dengan 5-menit cooldown timer (localStorage, 3 request per 5 menit).
- Reset password page dengan token validation.
- Email reset via Resend dengan template.

### 4.10. Sistem Notifikasi

Untuk menjaga responsivitas interaksi:

- **In-App Notification**: Pemberitahuan di dalam aplikasi untuk setiap aktivitas penting.
- **Jenis Notifikasi**:
  - Permintaan Ta'aruf baru.
  - Pesan baru dari Mediator/Calon Pasangan.
  - Status verifikasi profil.
  - Pengingat tahapan (misal: jadwal Nazhar).
- **Email Notification**: Ringkasan aktivitas atau notifikasi penting ke email (Opsional).

---

## 5. Functional Requirements

### 5.1. Authentication (Better-auth)

- Login via Email/Password.
- Social Auth (opsional).
- Forgot Password dengan rate limiting (3 request/5 menit) dan email reset via Resend.
- Admin user via Better Auth API seed.

### 5.2. Profile Management (Drizzle + Supabase)

- Multi-step CV Editor dengan validasi per-step.
- Upload foto dengan blur (CSS + server-side sharp), moderasi (MediaPipe + nsfwjs).
- Published CV lock — edit memerlukan unpublish dan reset ke pending.
- Admin review workflow (pending → approved/rejected).
- Server-side stripping field sensitif untuk non-admin/non-owner.

### 5.3. Pencarian & Filtering

- Filter by kota, pendidikan, usia, username via useSearchParams.
- Auto gender filter berdasarkan gender pengguna.
- Sticky filter sidebar.
- Detail CV view dengan blurred photo dan tabs informasi.

### 5.4. Request Ta'aruf

- Kirim/terima/tolak request ta'aruf.
- 24h expiry dengan auto-expire cron.
- Active ta'aruf guard (hanya 1 ta'aruf aktif per user).
- Konsumsi token untuk pengajuan.

### 5.5. Real-time Chat (GetStream)

- Channel type `taaruf_room` dengan mediator auto-include.
- Multiple participant (minimal 3: ikhwan, akhwat, mediator).
- Adab Guard: filter kata kasar, deteksi topik sensitif, log pelanggaran.
- Welcome message otomatis dari mediator.
- Pin/lepas pin pesan oleh mediator.
- Avatar custom dengan link ke CV.
- Custom theme sesuai design system shadcn/ui.
- Attachment upload via Stream CDN.

### 5.6. Video Call Nadzor (GetStream Video)

- Custom call type `"nadzor"`.
- 1-on-1 video dengan moderator audio-only.
- Moderator controls: mute, end call.
- Scheduling dengan approval kedua pihak.
- Time window validation (±15 menit dari jadwal).
- Wali reminder sebelum dan selama call.
- After-call feedback form.
- Absence handling (15 menit no-show → batal).
- Audit trail semua aksi moderator.

### 5.7. Payment & Token (Xendit)

- Xendit Invoice untuk top-up token (4 tier pricing).
- Webhook handler dengan token verification.
- Wallet: balance display, transaction history.
- Halaman top-up dengan pilihan nominal.

### 5.8. Admin Panel

- Review CV (pending → approved/rejected) dengan rejection reason.
- Skip onboarding.
- Lihat CV任何 user tanpa filter (foto asli, nama lengkap, gender, TTL).
- Sidebar navigasi khusus admin (tanpa CV/Temukan).

---

## 6. Database Schema (Conceptual)

- `users`: Data akun utama (Better-auth).
- `profiles`: Data detail CV Ta'aruf.
- `mediators`: Data mediator yang terverifikasi.
- `taaruf_requests`: Proses ta'aruf antara Pria, Wanita, dan Mediator (dengan phase: chat|nadzor|khitbah|completed).
- `nadzor_sessions`: Sesi video call nadzor (mediator_id, max_duration, enum status/reason).
- `nadzor_session_agreements`: Persetujuan jadwal nadzor (unique constraint, requested_at/responded_at).
- `nazhar_schedules`: Penjadwalan pertemuan (legacy).
- `wallets`: Saldo token pengguna.
- `token_transactions`: Riwayat penggunaan dan pembelian token.
- `notifications`: Riwayat notifikasi pengguna.
- `rate_limit`: Tracking rate limit (forgot password, dll).
- `adab_violations`: Log pelanggaran adab di chat.
- `moderator_audit_logs`: Audit trail tindakan moderator.

---

## 7. UI/UX Design Goals

- **Modest & Clean**: Desain yang menenangkan, tidak provokatif, dan profesional.
- **Privacy First**: Informasi sensitif tidak ditampilkan secara publik; foto diburamkan secara default.
- **Accessibility**: Mudah digunakan oleh berbagai kalangan usia.
- **Loading Spinner**: Sentralisasi semua spinner ke komponen `<Spinner>` dari shadcn/ui.

---

## 8. Success Metrics

- Jumlah pengguna yang berlanjut hingga tahap Khitbah/Menikah.
- Tingkat kepatuhan terhadap aturan mediator di dalam chat.
- Kecepatan verifikasi CV oleh admin.
- Adopsi fitur video call nadzor.
