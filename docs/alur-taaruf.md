# Alur Ta'aruf Jodohkan

> Dokumen ini mendefinisikan UI/UX flow lengkap proses ta'aruf dari awal hingga selesai,
> berdasarkan prinsip syariat Islam dan kebutuhan aplikasi Jodohkan.

---

## Daftar Isi

1. [Filosofi Alur](#1-filosofi-alur)
2. [Flow Diagram](#2-flow-diagram)
3. [Detail Setiap Fase](#3-detail-setiap-fase)
   - [Fase 0: Persiapan](#fase-0-persiapan)
   - [Fase 1: Discovery & Request](#fase-1-discovery--request)
   - [Fase 2: Chat](#fase-2-chat)
   - [Fase 3: Readiness Nadzor](#fase-3-readiness-nadzor)
   - [Fase 4: Nadzor](#fase-4-nadzor)
   - [Fase 5: Khitbah](#fase-5-khitbah)
   - [Fase 6: Completed](#fase-6-completed)
4. [Global Banner](#4-global-banner)
5. [Navigasi & Transformasi Halaman](#5-navigasi--transformasi-halaman)
6. [State Machine Lengkap](#6-state-machine-lengkap)
7. [Notifikasi per Fase](#7-notifikasi-per-fase)
8. [Kode yang Perlu Diubah](#8-kode-yang-perlu-diubah)

---

## 1. Filosofi Alur

Aplikasi Jodohkan memfasilitasi ta'aruf Islami dengan prinsip:

| Prinsip | Implementasi |
|---|---|
| **Mutual consent** | Setiap transisi fase butuh persetujuan kedua pihak |
| **Ada mediator** | Mediator sebagai pengawas dan fasilitator |
| **Tidak berduaan (khalwat)** | Video call diawasi mediator, wali wajib untuk akhwat |
| **Terarah & tidak berlarut** | Batas waktu di setiap fase untuk mencegah ta'aruf tanpa keputusan |
| **Adab terjaga** | Filter pesan, freeze channel, appeal system |

---

## 2. Flow Diagram

```
REGISTRASI & ONBOARDING
    ↓
BUAT CV → ADMIN APPROVE → PUBLISH
    ↓
DISCOVERY & KIRIM REQUEST (token)
    ↓
    ├── Ditolak → Selesai
    └── Diterima
          ↓
    ┌─────────────────┐
    │  FASE 2: CHAT   │ ← Chat bebas dengan adab guard
    └────────┬────────┘
             ↓
    ┌──────────────────────┐
    │  FASE 3: READINESS   │
    │                      │
    │ [A] klik "Siap"      │
    │ [B] notif ke pihak   │
    │     lain + timer 7   │
    │     hari             │
    │                      │
    ├── [B] klik "Siap"    │ → kedua siap → notif mediator aktivasi
    │         Juga"        │
    ├── [B] klik "Belum    │ → ⛔ TA'ARUF ENDED
    │         Siap"        │
    ├── Timer 7 hari habis │ → ⛔ TA'ARUF ENDED
    └── Hanya 1 siap       │ → ⛔ TA'ARUF ENDED (jika satunya tidak)
              ↓
    ┌──────────────────────┐
    │  FASE 4: NADZOR      │
    │                      │
    │ 1. Atur Jadwal       │
    │ 2. Video Call        │
    │ 3. Keputusan         │
    │                      │
    ├── Kedua pilih        │ → 🎉 FASE 5: KHITBAH
    │    "Lanjut Khitbah"   │
    ├── Salah satu pilih   │ → ⛔ TA'ARUF ENDED
    │    "Berhenti"         │
    └── Timer 7 hari       │ → ⛔ TA'ARUF ENDED
              ↓
    ┌──────────────────────┐
    │  FASE 5: KHITBAH     │ ← Di luar aplikasi (tatap muka)
    │                      │
    └── Mediator complete  │ → 🎉 FASE 6: COMPLETED
              ↓
    ┌──────────────────────┐
    │  FASE 6: COMPLETED   │
    │  Mubarakah screen    │
    └──────────────────────┘
```

### State & Phase Machine

```
Fase: "chat"
Status: "accepted" (dari diterima)
  │
  ├── Masuk readiness → phase tetap "chat", status tetap "accepted"
  │   (readiness_ikhwan & readiness_akhwat sebagai kolom baru di DB)
  │
  ├── [Kedua siap] + [Mediator aktivasi] → phase: "nadzor"
  │
  └── [Salah satu tidak siap / timeout] → status: "ended"

Fase: "nadzor"
Status: "accepted"
  │
  ├── [Kedua pilih lanjut] → phase: "khitbah"
  └── [Salah satu berhenti / timeout] → status: "ended"

Fase: "khitbah"
Status: "accepted"
  │
  └── [Mediator complete] → phase: "completed", status: "ended"

Fase: "completed"
Status: "ended"
```

---

## 3. Detail Setiap Fase

### Fase 0: Persiapan

| Langkah | Detail | Route |
|---|---|---|
| Register | Email/password via Better Auth | `/daftar` |
| Onboarding | Edukasi adab ta'aruf + komitmen | `/pengenalan` |
| Buat CV | Form multi-step: data diri, foto/ktp, visi-misi, kriteria, spiritual | `/cv/edit` |
| Submit CV | Status jadi `pending` | - |
| Admin review | Approve/reject | `/admin/review` |
| Publish | User aktifkan publikasi | `/cv/edit` |

**Guard**: Admin & mediator skip onboarding.

---

### Fase 1: Discovery & Request

| Langkah | Detail | Route |
|---|---|---|
| Browse | Katalog kandidat gender berlawanan, foto blurred | `/temukan` |
| Filter | Kota, pendidikan, usia, username | `/temukan` |
| Lihat CV detail | Tab data diri/visi-misi/kriteria/spiritual | `/cv/[username]` |
| Kirim request | **Bayar token**, validasi CV sendiri approved & published | via API |
| Terima/tolak | 24h window, notifikasi | `/taaruf` |

**Token**: Kirim request = 1 token (sesuai nominal top-up).

**Guard**:
- Tidak bisa kirim jika sudah punya ta'aruf aktif
- Tidak bisa kirim ke diri sendiri
- Tidak bisa kirim jika CV sendiri belum approved
- Hanya ke gender berlawanan

---

### Fase 2: Chat

Setelah request diterima, Stream Chat channel dibuat dengan mediator auto-include.

**UI**: Messages page seperti sekarang.

**Fitur**:
- Chat dengan adab guard (filter pesan, freeze channel, appeal)
- Welcome message dari mediator
- Pin/unpin pesan (mediator)
- Ban/unban user (mediator)
- Upload file/gambar (Stream CDN)
- Avatar circular link ke CV

**Kondisi**: Input chat aktif, bisa kirim pesan bebas.

---

### Fase 3: Readiness Nadzor

Peralihan dari chat ke nadzor. **Kedua pihak harus menyatakan siap secara independen.**

#### 3a. State: Belum Ada yang Siap

**UI Chat** — Muncul panel/button baru:

```
┌──────────────────────────────────┐
│  🚀 Fase Nadzor                  │
│  Setelah Anda dan pasangan siap, │
│  ta'aruf akan lanjut ke sesi     │
│  video call nadzor.              │
│                                  │
│  [Saya Siap Lanjut ke Nadzor]    │ ← Button hijau
└──────────────────────────────────┘
```

**Trigger**: Button ini tersedia di chat page (inline panel atau sidebar).

#### 3b. State: Satu Pihak Siap

Ketika satu pihak klik "Siap":

1. **Partner dapat notifikasi**: `Pasangan Anda sudah menyatakan siap untuk nadzor`
2. **Timer 7 hari** dimulai (countdown muncul di chat header)
3. **Banner navbar**: `🟢 Pasangan sudah siap — 7 hari tersisa`
4. **Partner lihat dua opsi**:

```
┌──────────────────────────────────┐
│  ✅ Pasangan sudah siap          │
│  ⏳ Sisa waktu: 6 hari 12 jam    │
│                                  │
│  [Saya Juga Siap] [Belum Siap]   │
└──────────────────────────────────┘
```

#### 3c. State: Dua Pihak Siap

Ketika keduanya klik "Siap Juga":

1. **Notifikasi ke mediator**: `Kedua pihak siap untuk nadzor — Aktivasi sekarang?`
2. **Notifikasi ke kedua pihak**: `Menunggu mediator mengaktifkan sesi nadzor`
3. **Banner navbar**: `✅ Siap Nadzor — Menunggu Mediator`
4. Mediator lihat button **"Aktifkan Nadzor"** di chat header

#### 3d. State: Readiness Gagal

| Skenario | Aksi |
|---|---|
| Partner klik "Belum Siap" | Ta'aruf langsung ended. Yang klik "Belum Siap" dianggap penyebab stop |
| Timer 7 hari expired | Ta'aruf ended otomatis (alasan: timeout) |
| Yang siap berubah pikiran | Tidak bisa — commit final (atau konfirmasi dialog) |

#### Readiness Schema

Di tabel `taaruf_request`, tambah kolom:

```typescript
readinessIkhwan: timestamp("readiness_ikhwan"), // null = belum, terisi = siap
readinessAkhwat: timestamp("readiness_akhwat"), // null = belum, terisi = siap
readinessTimer: timestamp("readiness_timer"), // 7 hari dari readiness pertama
```

---

### Fase 4: Nadzor

Saat mediator aktivasi nadzor, fase berubah ke `"nadzor"`.

#### 4a. Transformasi Messages Page

Layout berubah. **Chat jadi read-only**, area utama jadi Nadzor Panel:

```
┌─────────┬─────────────────────────────────────┐
│ Channel │  ⚠️ Chat hanya bisa dibaca          │
│ List    │  ┌──────────────────────────────┐   │
│         │  │ Pesan terakhir...             │   │
│ [Chat1] │  │ Pesan sebelumnya...           │   │
│ [Chat2] │  │ [Input chat: disabled]        │   │
│ [Chat3] │  └──────────────────────────────┘   │
│         │                                     │
│         ├─────────────────────────────────────┤
│         │  📹 NADZOR PANEL (full-width)       │
│         │  ┌──────────────────────────────┐   │
│         │  │ 📅 Jadwal                     │   │
│         │  │ 🤝 Konfirmasi                 │   │
│         │  │ 🎥 Mulai Video Call           │   │
│         │  └──────────────────────────────┘   │
└─────────┴─────────────────────────────────────┘
```

#### 4b. Global Banner

```
┌─────────────────────────────────────────────────┐
│  LOGO  Dashboard  Pesan  Temukan  Profil        │
├─────────────────────────────────────────────────┤
│  📹 Fase Nadzor — Atur jadwal sesi video call   │
│     [Buka Halaman Nadzor]                       │
└─────────────────────────────────────────────────┘
```

Tombol "Buka Halaman Nadzor" scroll/mengarah ke bagian Nadzor Panel.

#### 4c. Step 1: Atur Jadwal

| Aksi | UI |
|---|---|
| Salah satu pihak usul jadwal | Date picker + time picker (09:00-15:00, min H+1) |
| Pihak lain setuju | Button "Setuju" atau "Tolak" |
| Jika setuju → auto-confirm | Status: "Terkonfirmasi" |
| Jika tolak → cancel | Kembali ke form usul jadwal |
| Mediator revize/konfirmasi | Notifikasi ke semua pihak |

**Timer window video call**: ±15 menit dari jadwal.

#### 4d. Step 2: Video Call

| Kondisi | Aksi |
|---|---|
| H-15 menit | Button "Mulai Video Call" aktif |
| Akhwat | Wajib centang "Saya sudah didampingi wali" |
| Mediator | Join dengan audio-only, kamera mati |
| Wali banner | Muncul permanent selama call (tidak bisa dismiss) |
| Moderator control | Mute audio/video, end call |

**Absence handling**:
- Mediator tidak hadir 5 menit pertama → call batal otomatis
- Peserta tidak hadir 15 menit → call batal
- Semua tercatat di audit log

#### 4e. Step 3: After Call — Keputusan

Setelah video call selesai:

```
┌──────────────────────────────────┐
│  ❤️ Sesi Nadzor Selesai          │
│  Terima kasih telah mengikuti    │
│  sesi nadzor. Silakan tentukan   │
│  langkah selanjutnya.            │
│                                  │
│  ┌ Feedback (opsional) ───────┐  │
│  │ Tulis kesan Anda...         │  │
│  └────────────────────────────┘  │
│                                  │
│  Langkah Selanjutnya:            │
│  [Lanjut ke Khitbah]             │ ← Hijau
│  [Berhenti]                      │ ← Merah
└──────────────────────────────────┘
```

| Keputusan | Akibat |
|---|---|
| **Pertama pilih "Lanjut"** | Menunggu keputusan pihak lain. Timer 7 hari dimulai |
| **Pertama pilih "Berhenti"** | **LANGSUNG ENDED**. Pihak lain dapat notifikasi |
| **Kedua pilih "Lanjut"** | 🎉 **Fase Khitbah**. Phase berubah ke `"khitbah"` |
| **Satu pilih "Berhenti"** | ⛔ **Ta'aruf ended** |
| **Timer 7 hari habis** | ⛔ **Ta'aruf ended** |

**Rule penting**:
- "Berhenti" bersifat **final dan instan** — ta'aruf langsung berakhir, tidak perlu menunggu pihak lain
- "Lanjut" bersifat **mutual** — butuh kedua pihak
- Setelah keputusan, feedback opsional tetap bisa diisi

---

### Fase 5: Khitbah

Fase di luar aplikasi (tatap muka langsung dengan wali).

**UI Chat**: Hidden (tidak ada akses ke history chat).

**Banner navbar**:
```
💍 Tahap Khitbah — Barakallahu lakuma
```

**Halaman Timeline** (di halaman ta'aruf):
```
┌─ TA'ARUF TIMELINE ─────────────────┐
│  ✅ Fase 1: Perkenalan (Chat)      │
│  ✅ Fase 2: Nadzor                 │
│  ⏳ Fase 3: Khitbah (tatap muka)   │ ← Active
│  ⬜ Fase 4: Selesai                │
│                                     │
│  Status: Menunggu konfirmasi        │
│  mediator untuk menyelesaikan       │
│  proses ta'aruf.                    │
└─────────────────────────────────────┘
```

**Mediator**: Button "Tandai Selesai" untuk mengubah phase ke `completed`.

---

### Fase 6: Completed

**UI**: Halaman mubarakah

```
┌──────────────────────────────────┐
│  🎉 Alhamdulillah                │
│  Barakallahu lakuma wa baraka    │
│  'alaikuma                       │
│                                  │
│  Proses ta'aruf telah selesai.   │
│  Semoga menjadi keluarga yang    │
│  sakinah, mawaddah, wa rahmah.   │
│                                  │
│  [Kembali ke Dashboard]          │
└──────────────────────────────────┘
```

**Banner navbar**:
```
🎉 Ta'aruf Selesai — Alhamdulillah
```

---

## 4. Global Banner

Banner muncul di bawah navbar di **semua halaman** saat user sedang dalam ta'aruf aktif.

### Spesifikasi Banner

```
┌──────────────────────────────────────────────────────────────┐
│  [icon] [text]                                 [Button CTA]  │
└──────────────────────────────────────────────────────────────┘
```

- Background: sesuai fase (lihat tabel)
- Sticky di bawah navbar
- Bisa di-dismiss? **Tidak untuk fase Nadzor** (wajib). Bisa untuk Khitbah/Completed.

### State Banner per Fase

| Fase | Sub-state | Icon | Text | Warna | CTA Button |
|---|---|---|---|---|---|
| Chat | - | - | - | - | Tidak muncul |
| Readiness | 1 siap | 🟢 | "Pasangan sudah siap — N hari tersisa" | Amber | "Lihat" |
| Readiness | 2 siap | ✅ | "Siap Nadzor — Menunggu mediator" | Green | - |
| Nadzor | Jadwal | 📹 | "Fase Nadzor — Atur jadwal video call" | Amber | "Buka Halaman Nadzor" |
| Nadzor | Sesi berlangsung | 🎥 | "Sesi nadzor sedang berlangsung" | Amber | "Buka Halaman Nadzor" |
| Nadzor | Menunggu keputusan | ❤️ | "Menunggu keputusan setelah sesi nadzor" | Amber | "Beri Keputusan" |
| Khitbah | - | 💍 | "Tahap Khitbah — Barakallahu lakuma" | Emerald | - |
| Completed | - | 🎉 | "Ta'aruf Selesai — Alhamdulillah" | Blue | "Lihat" |

---

## 5. Navigasi & Transformasi Halaman

### Messages Page per Fase

| Fase | Channel List | Chat Area | Side Panels |
|---|---|---|---|
| Chat | Normal | Full access | Member, Violation, (none) |
| Readiness | Normal | Full access + readiness panel | Member, Violation, Readiness |
| **Nadzor** | Normal | **Read-only** (input disabled) | **Nadzor Panel full-width** (ganti sidebar) |
| Khitbah | **Hidden** | Chat tidak ditampilkan | - |
| Completed | **Hidden** | Chat tidak ditampilkan | - |

### Navbar Changes

| Menu Item | Visibility |
|---|---|
| Dashboard | Selalu |
| Pesan | Selalu (tapi bisa kosong jika semua chat hidden) |
| Temukan | Selalu (tapi tidak muncul jika sedang ta'aruf aktif — guard di backend) |
| Top Up | Selalu |
| Notifications | Selalu |
| Profil | Selalu |

**Catatan**: Tidak perlu menu sidebar baru. Cukup banner global + transformasi halaman pesan.

---

## 6. State Machine Lengkap

### Kolom Status (taaruf_request)

| Kolom | Tipe | Nilai |
|---|---|---|
| `status` | enum | `pending` \| `accepted` \| `declined` \| `expired` \| `ended` |
| `phase` | enum | `chat` \| `nadzor` \| `khitbah` \| `completed` |
| `readiness_ikhwan` | timestamp | null = belum siap |
| `readiness_akhwat` | timestamp | null = belum siap |
| `readiness_timer` | timestamp | 7 hari dari readiness pertama |
| `phase_updated_at` | timestamp | - |

### Diagram State

```
status: pending
  ├── [accept] → status: accepted, phase: chat
  ├── [decline] → status: declined
  └── [expire] → status: expired

status: accepted, phase: chat
  ├── [readiness_ikhwan diisi] → (satu siap)
  │   └── [readiness_akhwat diisi] → (dua siap)
  │       └── [mediator aktivasi] → phase: nadzor
  ├── [readiness_akhwat diisi] → (satu siap)
  │   └── [readiness_ikhwan diisi] → (dua siap)
  │       └── [mediator aktivasi] → phase: nadzor
  ├── [belum siap / timeout 7h] → status: ended
  └── [freeze channel (mediator)] → status: ended

status: accepted, phase: nadzor
  ├── [decision: kedua lanjut] → phase: khitbah
  ├── [decision: salah satu berhenti] → status: ended
  └── [timeout 7h] → status: ended

status: accepted, phase: khitbah
  └── [mediator complete] → phase: completed, status: ended

status: ended
  └── Terminal state
```

---

## 7. Notifikasi per Fase

| Trigger | Type | Penerima |
|---|---|---|
| Request ta'aruf masuk | `taaruf_request_received` | Recipient |
| Request diterima | `taaruf_request_accepted` | Sender |
| Request ditolak | `taaruf_request_declined` | Sender |
| Request expired | `taaruf_request_expired` | Sender |
| Readiness: pasangan siap | `nadzor_readiness_partner_ready` | Yang belum siap |
| Readiness: kedua siap | `nadzor_readiness_both_ready` | Mediator |
| Readiness: dibatalkan | `nadzor_readiness_cancelled` | Kedua pihak |
| Nadzor diaktifkan | `nadzor_activated` | Kedua pihak |
| Jadwal diajukan | `nadzor_scheduled` | Yang belum usul + mediator |
| Jadwal dikonfirmasi | `nadzor_schedule_confirmed` | Semua |
| Jadwal dibatalkan | `nadzor_schedule_cancelled` | Semua |
| Video call dimulai | `nadzor_call_started` | Mediator |
| Video call selesai | `nadzor_call_ended` | Kedua pihak + mediator |
| Menunggu keputusan | `nadzor_decision_pending` | Yang belum memutuskan |
| Lanjut ke khitbah | `nadzor_to_khitbah` | Kedua pihak |
| Ta'aruf dihentikan | `taaruf_ended` | Kedua pihak + mediator |
| Ta'aruf selesai | `taaruf_completed` | Kedua pihak |
| Pengingat readiness (H-3, H-1) | `nadzor_readiness_reminder` | Yang belum siap |
| Pengingat keputusan (H-3, H-1) | `nadzor_decision_reminder` | Yang belum memutuskan |

---

## 8. Kode yang Perlu Diubah

### 8.1 Database (Schema)

File: `src/db/schema/taaruf-schema.ts`

```typescript
// Tambah kolom readiness
readinessIkhwan: timestamp("readiness_ikhwan"),
readinessAkhwat: timestamp("readiness_akhwat"),
readinessTimer: timestamp("readiness_timer"),
```

### 8.2 Actions Baru

File: `src/app/actions/taaruf.ts`

| Fungsi | Deskripsi |
|---|---|
| `declareNadzorReadiness(requestId)` | Set readiness_ikhwan/akhwat + start timer jika pertama |
| `cancelNadzorReadiness(requestId)` | Pihak lain klik "Belum Siap" → status: ended |
| `getNadzorReadinessStatus(requestId)` | Return status readiness + timer |

### 8.3 Actions Update

File: `src/app/actions/nadzor.ts`

- `submitNadzorDecision`: rule diupdate — "Berhenti" langsung ended, "Lanjut" butuh mutual
- Tambah auto-end logic untuk timeout readiness & timeout keputusan (bisa cron atau inline check)

### 8.4 Actions yang Perlu Dikembalikan

- `transitionToCompleted` — perlu dikembalikan untuk mediator complete khitbah

### 8.5 Components Baru

| Komponen | Lokasi | Deskripsi |
|---|---|---|
| `readiness-panel.tsx` | `components/chat/` | Panel inline di chat untuk declare readiness, lihat status, timer |
| `taaruf-banner.tsx` | `components/shared/` | Global banner di bawah navbar, berubah per fase |
| `taaruf-timeline.tsx` | `components/chat/` | Timeline visual progress ta'aruf |

### 8.6 Components Update

| Komponen | Perubahan |
|---|---|
| `pesan/page.tsx` | Layout berubah saat fase nadzor (chat read-only, nadzor panel full-width) |
| `pesan/page.tsx` | Sembunyikan channel list untuk fase khitbah/completed |
| `nadzor/nadzor-panel.tsx` | Layout full-width saat jadi konten utama |
| `stream-chat-provider.tsx` | Mungkin perlu update untuk handle read-only mode |

### 8.7 Lib / Utils

- Fungsi cron/interval untuk cek timeout readiness & timeout keputusan
- Helper untuk get ta'aruf active + phase

### 8.8 Route

Tidak perlu halaman baru — semua via banner + messages page transformation.

---

## 9. Catatan Implementasi

1. **Prioritas**: Readiness flow → Banner → Transformasi messages page → After call decision → Khitbah
2. **Urutan pengerjaan**:
   1. Schema + migration (readiness columns)
   2. Actions: readiness + update decision
   3. Banner global component
   4. Readiness panel
   5. Transformasi messages page saat nadzor
   6. Update after-call dengan rule baru
   7. Timeline component sederhana untuk khitbah
   8. Cron logic untuk timeout
