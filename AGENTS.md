<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# agents.md — Jodohkan

> Dokumen ini adalah sumber kebenaran tunggal untuk AI agent (Claude Code, Cursor) maupun developer manusia yang mengerjakan codebase Jodohkan. Baca dokumen ini sebelum menyentuh kode apapun.

---

## 1. Gambaran Umum Sistem

Jodohkan adalah platform ta'aruf Islami berbasis web yang memfasilitasi proses perkenalan menuju pernikahan secara syar'i. Setiap interaksi antar pengguna dijaga oleh mediator dan sistem adab guard.

### Stack Teknologi

| Layer            | Teknologi                                                                      |
| ---------------- | ------------------------------------------------------------------------------ |
| Framework        | Next.js (App Router)                                                           |
| Runtime          | Bun.js                                                                         |
| Database         | Supabase (PostgreSQL)                                                          |
| ORM              | Drizzle ORM                                                                    |
| Auth             | Better Auth                                                                    |
| UI               | shadcn/ui + Tailwind CSS + Lucide Icons                                        |
| Chat & Video     | GetStream.io (stream-chat-react + @stream-io/video-react-sdk)                  |
| Payment          | Xendit Invoice                                                                 |
| Email            | Resend                                                                         |
| Storage          | Supabase Storage                                                               |
| Image Processing | sharp (server-side blur), MediaPipe (face detection), nsfwjs (NSFW classifier) |
| Testing          | Bun Test                                                                       |
| Deployment       | Vercel                                                                         |

### Role Pengguna

| Role       | Kemampuan                                                                |
| ---------- | ------------------------------------------------------------------------ |
| `user`     | Buat CV, temukan kandidat, kirim/terima request ta'aruf, chat, nadzor    |
| `mediator` | Semua kemampuan user + moderasi chat, panel mediator, kontrol video call |
| `admin`    | Semua kemampuan mediator + review & approve/reject CV, lihat semua data  |

---

## 2. Arsitektur Database

### Tabel Utama

#### `users`

Dikelola oleh Better Auth. Kolom tambahan:

- `role` — enum: `user` | `mediator` | `admin`

#### `profiles`

CV Ta'aruf pengguna.

| Kolom             | Tipe            | Keterangan                                       |
| ----------------- | --------------- | ------------------------------------------------ |
| id                | text PK         | UUID                                             |
| user_id           | text FK → users | NOT NULL, unique                                 |
| cv_status         | enum            | `draft` \| `pending` \| `approved` \| `rejected` |
| is_published      | boolean         | Default false                                    |
| photo_url         | text            | URL foto original (Supabase Storage)             |
| photo_blurred_url | text            | URL foto blurred (server-side sharp)             |
| ktp_url           | text            | URL KTP (hanya admin yang bisa lihat)            |
| gender            | enum            | `ikhwan` \| `akhwat`                             |
| rejection_reason  | text            | Alasan penolakan CV (nullable)                   |
| ...data_diri      | -               | Nama, TTL, kota, pendidikan, pekerjaan, dll      |
| ...visi_misi      | -               | Visi rumah tangga, misi pribadi                  |
| ...kriteria       | -               | Kriteria pasangan yang dicari                    |
| ...spiritual      | -               | Info keislaman                                   |
| created_at        | timestamp       | NOT NULL, default now()                          |
| updated_at        | timestamp       | NOT NULL, default now()                          |

> **Aturan penting**: CV yang `is_published = true` tidak bisa diedit langsung. User harus unpublish dulu. Setiap edit reset `cv_status` ke `pending`.

#### `mediators`

Data tambahan untuk user dengan role mediator.

#### `wallets`

| Kolom      | Tipe            | Keterangan             |
| ---------- | --------------- | ---------------------- |
| id         | text PK         | UUID                   |
| user_id    | text FK → users | NOT NULL, unique       |
| balance    | integer         | Saldo token, default 0 |
| updated_at | timestamp       | NOT NULL               |

#### `token_transactions`

Log setiap transaksi token (top-up, penggunaan).

#### `taaruf_request`

| Kolom            | Tipe            | Keterangan                                                    |
| ---------------- | --------------- | ------------------------------------------------------------- |
| id               | text PK         | UUID                                                          |
| sender_id        | text FK → users | NOT NULL                                                      |
| receiver_id      | text FK → users | NOT NULL                                                      |
| status           | enum            | `pending` \| `accepted` \| `declined` \| `expired` \| `ended` |
| phase            | enum            | `chat` \| `nadzor` \| `khitbah` \| `completed`                |
| phase_updated_at | timestamp       | Kapan terakhir fase berubah                                   |
| mediator_id      | text FK → users | Mediator yang ditugaskan (nullable)                           |
| expires_at       | timestamp       | 24 jam dari created_at                                        |
| created_at       | timestamp       | NOT NULL                                                      |

#### `nadzor_session`

| Kolom                | Tipe                     | Keterangan                                                             |
| -------------------- | ------------------------ | ---------------------------------------------------------------------- |
| id                   | text PK                  | UUID                                                                   |
| channel_id           | text FK → Stream channel | NOT NULL                                                               |
| requested_by         | text FK → users          | NOT NULL                                                               |
| mediator_id          | text FK → users          | NOT NULL                                                               |
| max_duration_minutes | integer                  | Default 30                                                             |
| scheduled_at         | timestamp                | NOT NULL                                                               |
| started_at           | timestamp                | Nullable                                                               |
| ended_at             | timestamp                | Nullable                                                               |
| ended_by             | text FK → users          | Nullable                                                               |
| end_reason           | enum                     | `completed` \| `timeout` \| `violation` \| `cancelled`                 |
| status               | enum                     | `scheduled` \| `ongoing` \| `completed` \| `cancelled` \| `terminated` |
| feedback_ikhwan      | text                     | Nullable                                                               |
| feedback_akhwat      | text                     | Nullable                                                               |
| mediator_notes       | text                     | Nullable                                                               |
| created_at           | timestamp                | NOT NULL                                                               |

> **Index**: `(channel_id, status)`, `(mediator_id, status)`, `(scheduled_at)`

#### `nadzor_session_agreement`

| Kolom        | Tipe                     | Keterangan    |
| ------------ | ------------------------ | ------------- |
| id           | text PK                  | UUID          |
| session_id   | text FK → nadzor_session | NOT NULL      |
| user_id      | text FK → users          | NOT NULL      |
| agreed       | boolean                  | Default false |
| requested_at | timestamp                | NOT NULL      |
| responded_at | timestamp                | Nullable      |

> **Unique constraint**: `(session_id, user_id)`

#### `moderator_audit_log`

Semua tindakan moderator (mute, end call, freeze channel, dll) tercatat di sini untuk audit trail.

#### `notifications`

Notifikasi in-app untuk aktivitas penting.

#### `rate_limit`

Tracking rate limit untuk endpoint sensitif (forgot password: 3 request per 5 menit).

---

## 3. Fitur & Implementasi

### 3.1 Autentikasi

**Provider**: Better Auth dengan Username & Social Auth.

- Registrasi, login, logout
- Forgot password via email (Resend) dengan rate limiting
  - 3 request per 5 menit per email
  - Cooldown timer 5 menit di localStorage
  - Token reset divalidasi server-side
- Protected routes — redirect ke `/signin` jika belum login
- Admin skip onboarding, langsung ke dashboard

**Catatan untuk agent**: Jangan modifikasi konfigurasi Better Auth tanpa memahami session handling-nya. Semua auth logic ada di `lib/auth.ts`.

---

### 3.2 Onboarding

- Halaman edukasi adab ta'aruf sebelum bisa buat CV
- Pernyataan komitmen yang harus disetujui user
- Admin & mediator skip onboarding otomatis

---

### 3.3 CV Ta'aruf

**Form multi-step** dengan sections:

1. Data Diri (nama, TTL, kota, pendidikan, pekerjaan)
2. Foto & KTP upload
3. Visi & Misi rumah tangga
4. Kriteria pasangan
5. Info spiritual

**Foto handling**:

- Upload ke Supabase Storage
- Client-side: preview langsung sebelum upload
- Server-side moderation pipeline (urutan prioritas):
  1. NSFW classifier (nsfwjs)
  2. Face presence detection (MediaPipe)
  3. Face geometry validation (blokir anime/ilustrasi)
- Jika lolos, generate dua versi: original + blurred (via sharp)
- `photo_url` — hanya terlihat oleh owner & admin
- `photo_blurred_url` — terlihat oleh semua user yang approve

**CV Status lifecycle**:

```
draft → pending (submit) → approved / rejected
                                ↓
                    (jika edit setelah publish → kembali ke pending)
```

**Security**: Server-side stripping `photoUrl` dan `ktpUrl` untuk non-admin dan non-owner.

**Admin review panel** (`/admin/review`):

- List CV dengan status `pending`
- Tombol approve / reject dengan alasan
- Akses penuh ke foto original, nama, gender, TTL

---

### 3.4 Discovery (Temukan)

Route: `/temukan`

- Katalog kandidat dengan CV yang `is_published = true` dan `cv_status = approved`
- Filter otomatis berdasarkan gender berlawanan dari user yang login
- Filter tambahan: kota, pendidikan, usia, username
- Sticky filter sidebar
- State filter dikelola via `useSearchParams`
- Foto tampil dalam kondisi blurred

**Detail CV** (`/cv/[username]`):

- Tabs: Data Diri / Visi & Misi / Kriteria / Spiritual
- Foto blurred untuk user biasa, original untuk admin
- Tombol "Kirim Request Ta'aruf" jika belum ada request aktif

---

### 3.5 Request Ta'aruf

**Flow**:

1. User A kirim request ke User B (membutuhkan token)
2. User B terima atau tolak dalam 24 jam
3. Jika tidak direspons → auto-expire (background job / cron)
4. Jika diterima → channel Stream Chat dibuat otomatis dengan mediator auto-include
5. Active ta'aruf guard — user tidak bisa kirim request baru jika sudah punya ta'aruf aktif

**Fase ta'aruf** (kolom `phase` di `taaruf_request`):

```
chat → nadzor → khitbah → completed
```

- `status` — lifecycle request (pending/accepted/declined/expired/ended)
- `phase` — progres ta'aruf setelah diterima

---

### 3.6 Token & Pembayaran

**Provider**: Xendit Invoice

**Tier pricing**:
| Nominal | Token |
|---|---|
| Rp 10.000 | 10 Token |
| Rp 25.000 | 30 Token |
| Rp 50.000 | 65 Token |
| Rp 100.000 | 140 Token |

**Flow**:

1. User pilih nominal di `/topup`
2. Backend buat Xendit Invoice → redirect ke Xendit checkout
3. Xendit kirim webhook ke endpoint kita
4. Backend verifikasi webhook token
5. Update saldo wallet user

**UI**:

- Saldo token tampil di navbar dan dashboard
- Halaman top-up di `/topup`

---

### 3.7 Chat (Stream Chat)

**Provider**: GetStream.io — `stream-chat-react`

**Setup channel**:

- Channel dibuat otomatis saat request ta'aruf diterima
- Peserta: ikhwan + akhwat + mediator (auto-include)
- Welcome message otomatis dari mediator berisi aturan ta'aruf

**Fitur chat**:

- `ChannelList`, `MessageList`, `MessageComposer` dari stream-chat-react
- Avatar circular dengan link ke profil CV
- File & gambar attachment via Stream CDN
- Custom theme — override CSS Stream dengan token shadcn/ui

**Adab Guard**:

- Filter pesan aktif di setiap pengiriman
- Blokir kata kasar
- Pengingat etika otomatis jika topik fisik/pacaran terdeteksi
- Log pelanggaran ke database

**Kontrol mediator**:

- Hapus channel
- Block/unblock user
- Freeze channel
- Pin pesan (banner pinned message di atas daftar pesan)
- Lepas pin pesan

**Indikator fase**:

- Badge fase aktif di header chat (`chat` / `nadzor` / `khitbah`)
- Countdown ke jadwal nadzor jika ada sesi terjadwal

---

### 3.8 Nadzor — Video Call

**Provider**: GetStream.io — `@stream-io/video-react-sdk`

**Konsep**:

- Video call 1-on-1 antara ikhwan dan akhwat
- Wali hadir secara fisik di sisi akhwat (tidak login sebagai user)
- Mediator join sebagai audio-only / invisible observer
- Call tidak direkam oleh sistem

#### Alur Lengkap

**Transisi ke fase nadzor**:

1. Kedua pihak sepakat lanjut ke nadzor via chat
2. Mediator aktifkan fase nadzor dari panel mediator
3. Validasi: kedua pihak harus setuju
4. `taaruf_request.phase` diupdate ke `nadzor`
5. Badge "Nadzor" muncul di header chat

**Penjadwalan sesi**:

1. Mediator atau salah satu pihak ajukan jadwal (tanggal & jam)
2. Pihak lain setujui via `nadzor_session_agreement`
3. Mediator konfirmasi ketersediaan
4. Jadwal tersimpan di `nadzor_session`
5. Notifikasi ke semua pihak

**Video call**:

1. Tombol "Mulai Video Call" aktif 15 menit sebelum jadwal
2. Dialog wajib centang sebelum masuk: _"Saya sudah didampingi wali/keluarga terpercaya"_
3. Stream Video call dibuat dengan id: `nadzor-${sessionId}`
4. Call type kustom: `"nadzor"`
5. Permission:
   - Ikhwan & akhwat: send + receive video & audio
   - Mediator: receive only (audio-only, video off)
6. Banner pengingat wali tampil selama call berlangsung (tidak bisa di-skip)

**Kontrol mediator selama call**:

- `call.muteUser(userId, "audio")` — mute audio peserta
- `call.muteUser(userId, "video")` — matikan video peserta
- `call.endCall()` — akhiri call untuk semua
- Semua tindakan tercatat di `moderator_audit_log`

**Batas waktu**:

- Call hanya bisa dimulai ±15 menit dari jadwal
- Mediator wajib hadir dalam 5 menit pertama — jika tidak, call dibatalkan otomatis
- Jika salah satu peserta tidak hadir dalam 15 menit → call batal

**Setelah call**:

1. Form feedback ikhwan & akhwat (opsional)
2. Mediator isi catatan
3. Pilihan hasil: **Lanjut ke Khitbah** atau **Stop**
4. Jika lanjut: `taaruf_request.phase` → `khitbah`
5. Jika stop: `taaruf_request.status` → `ended`

**Khitbah**: Fase di luar aplikasi (tatap muka langsung). Mediator update status sebagai `completed` setelah dikonfirmasi.

#### Stream Video — Konfigurasi

```typescript
// Call ID
const callId = `nadzor-${sessionId}`;

// Call type kustom
const callType = "nadzor";

// Permission per role
// ikhwan & akhwat: send-audio, send-video, join-call
// mediator: join-call (receive only, audio & video off by default)
```

#### UI Components yang Dibutuhkan

| Component            | Deskripsi                                            |
| -------------------- | ---------------------------------------------------- |
| `NadzorPanel`        | Panel di sidebar chat, muncul saat fase nadzor aktif |
| `ScheduleForm`       | Form ajukan jadwal sesi                              |
| `AgreementConfirm`   | Konfirmasi persetujuan jadwal                        |
| `VideoCallModal`     | Full-screen video call UI                            |
| `WaliReminderDialog` | Dialog centang wali sebelum masuk call               |
| `WaliBanner`         | Banner permanen selama call                          |
| `ModeratorPanel`     | Panel kontrol mediator selama call                   |
| `AfterCallForm`      | Form feedback + pilihan lanjut/stop                  |

---

### 3.9 Notifikasi

**In-app** (halaman `/notifications`):

- Request ta'aruf baru
- Request diterima/ditolak
- Pesan baru di chat
- Status verifikasi CV (approved/rejected)
- Jadwal nadzor baru
- Pengingat jadwal (H-1, H-0)

**Email** (via Resend, opsional):

- Ringkasan aktivitas penting
- Notifikasi jika user tidak aktif

---

### 3.10 Admin Panel

Route: `/admin`

**Sidebar admin**: Dashboard, Panel Admin, Pesan, Pengaturan (tanpa CV/Temukan).

**Fitur**:

- Review CV pending (`/admin/review`)
  - Approve dengan satu klik
  - Reject dengan alasan wajib diisi
- Lihat semua CV di `/cv/[username]` tanpa filter (foto original, nama, gender, TTL)
- Seed admin user via Better Auth API

---

## 4. Keamanan & Aturan Bisnis

### Server-side Rules

- `photoUrl` dan `ktpUrl` di-strip dari response untuk non-admin dan non-owner
- CV hanya tampil di Temukan jika `is_published = true` dan `cv_status = approved`
- User hanya bisa punya satu ta'aruf aktif pada satu waktu (active ta'aruf guard)
- Request ta'aruf expire otomatis setelah 24 jam
- Webhook Xendit diverifikasi dengan token sebelum update saldo

### Rate Limiting

- Forgot password: 3 request per 5 menit per email (tabel `rate_limit`)

### Adab Guard

- Filter berjalan server-side setiap pesan dikirim
- Log pelanggaran disimpan ke database

### Video Call

- Tidak direkam oleh sistem
- Hanya bisa dimulai dalam window ±15 menit dari jadwal
- Mediator wajib hadir, jika tidak → call batal otomatis
- Semua tindakan moderator tercatat di `moderator_audit_log`

---

## 5. Konvensi Kode

### Struktur Project (App Router)

```
app/
├── (auth)/
│   ├── signin/
│   └── signup/
├── (dashboard)/
│   ├── dashboard/
│   ├── cv/
│   ├── temukan/
│   ├── taaruf/
│   ├── pesan/
│   ├── notifications/
│   ├── topup/
│   └── pengaturan/
├── (admin)/
│   └── admin/
│       └── review/
├── api/
│   ├── auth/
│   ├── webhooks/
│   │   └── xendit/
│   └── stream/
└── layout.tsx

lib/
├── auth.ts          — Better Auth config
├── db/
│   ├── schema.ts    — Drizzle schema
│   └── index.ts     — DB client
├── stream.ts        — Stream Chat & Video client
└── xendit.ts        — Xendit client

components/
├── ui/              — shadcn/ui components
├── chat/            — Stream Chat components
├── nadzor/          — Video call components
└── shared/          — Komponen shared (Spinner, dll)
```

### Konvensi Umum

- **Spinner**: Selalu gunakan komponen `<Spinner>` dari shadcn/ui — jangan buat spinner baru
- **Loading state**: Semua async action harus punya loading state yang jelas
- **Error handling**: Semua fetch & upload wajib pakai try/catch
- **Server component dulu**: Gunakan React Server Component sebisa mungkin, client component hanya jika butuh interaktivitas
- **Drizzle query**: Tulis query di file terpisah dalam `lib/db/queries/`, bukan inline di komponen
- **Environment variables**: Semua secret harus di `.env.local`, tidak pernah di-hardcode

### Testing

- Framework: Bun Test
- Test file: `*.test.ts` di sebelah file yang ditest
- Wajib ada test untuk: schema validation, business logic kritis, email templates
- Jalankan test: `bun test`

---

## 6. Status Pengerjaan

### ✅ Selesai

- Fase 1: Fondasi & infrastruktur (Next.js, Supabase, Better Auth, shadcn/ui)
- Fase 1.5: Forgot password dengan rate limiting
- Fase 2: CV Ta'aruf (form multi-step, foto moderation, blur, admin review, token system core)
- Fase 3: Discovery & matching (Temukan, filter, detail CV, request ta'aruf, payment Xendit, wallet UI)
- Fase 4: Chat (Stream Chat, mediator controls, adab guard, notifikasi, pin pesan)
- Fase 5 (parsial): DB schema nadzor, phase state & transition, unit tests

### 🔲 Belum Selesai — Fase 5 (Nadzor)

- [ ] Scheduling Panel — ajukan jadwal, approval kedua pihak, notifikasi mediator
- [ ] Stream Video SDK — install `@stream-io/video-react-sdk`, custom call type `"nadzor"`
- [ ] Video Call UI — 1-on-1 video, moderator audio-only
- [ ] Moderator Panel — mute peserta, akhiri call, indikator pembicara
- [ ] Wali Reminder — dialog centang sebelum call + banner selama call
- [ ] Time Window — call hanya aktif ±15 menit dari jadwal
- [ ] Absence Handling — auto-batal jika salah satu tidak hadir 15 menit
- [ ] After Call — form feedback + pilihan lanjut (khitbah/stop)
- [ ] Audit Trail — semua tindakan moderator tercatat di DB
- [ ] Khitbah — mediator update status completed

### 🔲 Belum Selesai — Fase 6 (Polish & Launch)

- [ ] Security Audit — validasi keamanan data pribadi di Supabase
- [ ] QA End-to-End — simulasi proses ta'aruf dengan 3 role
- [ ] Optimization — SEO, Page Speed, Responsive Design (Mobile First)
- [ ] Deployment — Vercel + custom domain `jodohkan.com`

---

## 7. Panduan untuk AI Agent

### Sebelum mengerjakan task apapun

1. Baca bagian yang relevan dari dokumen ini
2. Cek `roadmap.md` untuk status terbaru
3. Jangan ubah schema database tanpa membuat migration Drizzle
4. Jangan hardcode warna — gunakan token CSS dari `globals.css`
5. Jangan buat komponen spinner baru — gunakan `<Spinner>` yang sudah ada

### Urutan pengerjaan Fase 5 yang disarankan

1. Install `@stream-io/video-react-sdk`
2. Buat `NadzorPanel` component di sidebar chat
3. Implementasi `ScheduleForm` + `AgreementConfirm`
4. Implementasi `VideoCallModal` dengan `WaliReminderDialog` dan `WaliBanner`
5. Implementasi `ModeratorPanel` dengan kontrol mute & end call
6. Implementasi time window + absence handling (server-side)
7. Implementasi `AfterCallForm` + transisi ke khitbah
8. Implementasi audit trail di `moderator_audit_log`
9. Update notifikasi untuk event nadzor

### Yang tidak boleh dilakukan agent

- Jangan hapus atau modifikasi tabel existing tanpa instruksi eksplisit
- Jangan ubah logika auth Better Auth
- Jangan ubah webhook Xendit tanpa memahami verifikasi token-nya
- Jangan rekam video call — ini melanggar prinsip privasi sistem
- Jangan skip wali reminder — ini fitur wajib, tidak boleh di-bypass
