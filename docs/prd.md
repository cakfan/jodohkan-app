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
| **Payment Gateway**              | Midtrans / Xendit (Token Purchase) |
| **UI Components**                | shadcn/ui & Base UI                |
| **Styling**                      | Tailwind CSS & Lucide Icons        |

---

## 3. User Personas

1.  **Candidate (Pria/Wanita):** Individu yang berniat serius untuk menikah.
2.  **Mediator (Murabbi/Wali/Ustadz):** Pihak ketiga yang memantau proses ta'aruf dan memfasilitasi komunikasi.

---

## 4. Key Features

### 4.1. Onboarding & Niat

- Edukasi singkat mengenai adab ta'aruf sebelum pendaftaran.
- Pernyataan komitmen untuk mengikuti aturan syar'i di platform.

### 4.2. CV Ta'aruf Digital (Rich Profile)

- Pengisian data komprehensif:
  - Data Diri (Visi, Misi, Latar Belakang).
  - Kriteria Pasangan.
  - Pemahaman Agama (Hafalan, Manhaj, Kebiasaan Ibadah).
  - Pertanyaan Terbuka (Q&A) untuk menggali pemikiran.
- Fitur **Blur Foto**: Foto calon pasangan secara default diburamkan dan hanya bisa dilihat jika kedua belah pihak (dan mediator) menyetujui tahap _Nazhar_.

### 4.3. Algoritma Pencarian & Filtering

- Filter berdasarkan kriteria agama, lokasi, usia, dan visi hidup.
- Tidak ada fitur "swipe" tanpa tujuan; fokus pada pembacaan CV yang mendalam.

### 4.4. Guided Chat with Mediator (GetStream Integration)

- Komunikasi **tidak bisa dilakukan berduaan**.
- Chat room secara otomatis menyertakan minimal 1 Mediator.
- Bot pengingat adab di dalam chat (misal: pengingat jika pembicaraan sudah terlalu jauh dari topik ta'aruf).

### 4.5. Management Tahapan Ta'aruf

Pelacakan status proses:

1.  **Pertukaran CV**: Saling membaca data tanpa foto.
2.  **Nazhar**: Saling melihat foto atau bertemu langsung (offline/video call) didampingi mediator.
3.  **Istikharah**: Waktu tenang untuk mengambil keputusan.
4.  **Khitbah**: Pemberitahuan bahwa proses berlanjut ke lamaran.
5.  **Menikah/Selesai**: Akun dinonaktifkan setelah mendapatkan pasangan.

### 4.6. Ekonomi Token (Sistem Token Niat)

Untuk menjamin keseriusan dan sustainibilitas platform:

- **Verifikasi Identitas**: Membutuhkan 1 Token untuk pengajuan verifikasi KTP/Dokumen.
- **Membuka Sesi Ta'aruf**: Membutuhkan 2 Token untuk mengajak calon pasangan ta'aruf (melalui mediator).
- **Pembelian Token**: Pengguna dapat membeli paket token melalui payment gateway.
- **Welcome Bonus**: 1 Token gratis untuk pengguna baru setelah melengkapi profil dasar.

### 4.7. Sistem Notifikasi

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
- Verifikasi identitas (E-KTP/Dokumen pendukung) untuk menjamin keamanan.

### 5.2. Profile Management (Drizzle + Supabase)

- CRUD CV Ta'aruf.
- Pengaturan privasi (siapa yang bisa melihat CV).

### 5.3. Real-time Chat (GetStream)

- Channel type khusus `taaruf_room` yang memaksa keberadaan mediator.
- Fitur kirim CV di dalam chat.

---

## 6. Database Schema (Conceptual)

- `users`: Data akun utama.
- `profiles`: Data detail CV Ta'aruf.
- `mediators`: Data mediator yang terverifikasi.
- `taaruf_sessions`: Mencatat proses yang sedang berjalan antara Pria, Wanita, dan Mediator.
- `nazhar_schedules`: Penjadwalan pertemuan.
- `wallets`: Saldo token pengguna.
- `token_transactions`: Riwayat penggunaan dan pembelian token.
- `notifications`: Riwayat notifikasi pengguna.

---

## 7. UI/UX Design Goals

- **Modest & Clean**: Desain yang menenangkan, tidak provokatif, dan profesional.
- **Privacy First**: Informasi sensitif tidak ditampilkan secara publik.
- **Accessibility**: Mudah digunakan oleh berbagai kalangan usia.

---

## 8. Success Metrics

- Jumlah pengguna yang berlanjut hingga tahap Khitbah/Menikah.
- Tingkat kepatuhan terhadap aturan mediator di dalam chat.
- Kecepatan verifikasi identitas pengguna.
