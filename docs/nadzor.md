# Nadzor — Video Call

## Konsep

Nadzor adalah sesi video call antar dua pihak (ikhwan & akhwat) yang didampingi oleh wali dari pihak wanita. Wali hadir secara fisik di sisi akhwat, bukan sebagai user/login dalam aplikasi.

Setiap sesi nadzor wajib dimoderatori oleh mediator. Moderator tidak tampil di video (audio-only / invisible observer) tapi berhak mengakhiri call jika terjadi pelanggaran.

Tujuan: Ta'aruf naik ke level lanjutan setelah kedua pihak merasa cocok di fase chat.

---

## Alur

### 1. Transisi dari Chat ke Nadzor

- Kedua pihak sepakat untuk lanjut ke nadzor melalui chat.
- Mediator mengaktifkan fase nadzor dari panel mediator.
- Channel chat diberi label fase `nadzor` (indikator di header).

### 2. Menjadwalkan Sesi

- Mediator atau salah satu pihak mengajukan jadwal (tanggal & jam).
- Pihak lain menyetujui jadwal tersebut.
- Mediator wajib tersedia di jadwal tersebut sebagai moderator.
- Jadwal disimpan di database.

### 3. Video Call

- Video call menggunakan **Stream Video** (satu provider dengan chat).
- Panggilan hanya bisa dimulai pada jadwal yang sudah disepakati.
- Pihak wanita WAJIB didampingi wali secara fisik — ini tanggung jawab di luar aplikasi (the system trusts but reminds).
- Before the call starts, aplikasi menampilkan pengingat: *"Pastikan akhwat didampingi wali/keluarga terpercaya"*.
- Call bersifat **1-on-1 video** antara ikhwan dan akhwat (wali tidak login sebagai user terpisah).
- **Mediator bergabung sebagai moderator** — tidak tampil di video, hanya audio (muted by default) atau invisible observer. Bisa lihat dan dengar kedua pihak.
- Jika mediator mendeteksi pelanggaran (pembahasan tidak pantas, durasi melebihi batas, dll), mediator bisa **mengakhiri call dari panel mediator**.

### 4. Setelah Sesi

- Kedua pihak mengisi feedback (opsional): apakah ingin lanjut atau tidak.
- Mediator juga memberi rekomendasi.
- Hasil musyawarah:
  - **Lanjut ke Khitbah** — lamaran resmi ke pihak wanita / keluarga
  - **Stop** — ta'aruf selesai, status diupdate
- Jika lanjut, status ta'aruf diupdate dan fase baru dimulai.

---

## Database Schema

### Tabel: `nadzor_session`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | text PK | UUID |
| channel_id | text FK → stream channel | NOT NULL. Channel chat terkait |
| requested_by | text FK → user | NOT NULL. Yang mengajukan sesi |
| mediator_id | text FK → user | NOT NULL. Mediator sebagai moderator sesi ini |
| max_duration_minutes | integer | Durasi maksimal sesi (default: 30) |
| scheduled_at | timestamp | NOT NULL. Jadwal sesi |
| started_at | timestamp | Real start (nullable) |
| ended_at | timestamp | Real end (nullable) |
| ended_by | text FK → user | Siapa yang mengakhiri (nullable) |
| end_reason | end_reason_enum | violation \| timeout \| completed \| cancelled |
| status | session_status_enum | scheduled \| ongoing \| completed \| cancelled \| terminated |
| feedback_ikhwan | text | Feedback setelah sesi dari ikhwan (nullable) |
| feedback_akhwat | text | Feedback setelah sesi dari akhwat (nullable) |
| mediator_notes | text | Catatan mediator (nullable) |
| decision_ikhwan | text | `continue` \| `stop` — keputusan ikhwan setelah sesi (nullable) |
| decision_akhwat | text | `continue` \| `stop` — keputusan akhwat setelah sesi (nullable) |
| created_at | timestamp | NOT NULL. Default now() |

> **Index**: `(channel_id, status)`, `(mediator_id, status)`, `(scheduled_at)`

### Enum: `end_reason_enum`

| Value | Keterangan |
|-------|------------|
| completed | Selesai normal sesuai durasi |
| timeout | Melebihi batas waktu |
| violation | Pelanggaran adab — diakhiri mediator |
| cancelled | Dibatalkan sebelum dimulai |

### Enum: `session_status_enum`

| Value | Keterangan |
|-------|------------|
| scheduled | Terjadwal, belum mulai |
| ongoing | Sedang berlangsung |
| completed | Berakhir normal |
| cancelled | Dibatalkan |
| terminated | Dihentikan paksa oleh moderator |

### Tabel: `nadzor_session_agreement`

Mencatat persetujuan jadwal dari kedua pihak dan mediator.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | text PK | UUID |
| session_id | text FK → nadzor_session | NOT NULL |
| user_id | text FK → user | NOT NULL |
| agreed | boolean | NOT NULL. Default false |
| requested_at | timestamp | NOT NULL. Kapan undangan persetujuan dikirim |
| responded_at | timestamp | Kapan direspons (nullable) |

> **Unique**: `(session_id, user_id)` — satu persetujuan per user per sesi

---

## Stream Video Integration

- **SDK**: `@stream-io/video-react-sdk`
- Setiap sesi nadzor → buat Stream Video **call** dengan `id: nadzor-${sessionId}`
- Call type kustom: `"nadzor"` — dengan aturan:
  - 3 peserta: ikhwan (video on), akhwat (video on), moderator (audio-only, video off)
  - Moderator bisa `mute` peserta dan `endCall`
  - Call tidak direkam secara default
- Permission:
  - Ikhwan & akhwat: bisa kirim video & audio
  - Moderator: hanya menerima audio/video, tidak mengirim
- Call hanya aktif dalam window waktu jadwal (±15 menit dari jadwal)

### Moderator Controls (via Stream Video API)

- `call.muteUser(userId, "audio")` — mematikan audio peserta
- `call.muteUser(userId, "video")` — mematikan video peserta
- `call.endCall()` — mengakhiri call untuk semua peserta

---

## UI

### Indikator Fase di Chat Header
- Badge "Nadzor" muncul setelah fase diaktifkan
- Jika ada sesi terjadwal, tampilkan countdown ke jadwal

### Panel / Tombol Nadzor
- Muncul di chat setelah fase nadzor aktif
- Di dalam panel:
  - Tombol "Jadwalkan Sesi" (untuk mediator atau pengguna)
  - Timeline sesi yang sudah/sedang berlangsung
  - Tombol "Mulai Video Call" (aktif 15 menit sebelum jadwal)

### Modal Video Call
- Full-screen video call UI (Stream Video Call UI)
- Sebelum masuk, tampilkan pengingat: *"Pastikan akhwat didampingi wali"*
- Setelah call selesai: form feedback + pilihan lanjut (khitbah / stop)

### Panel Moderator (khusus mediator)
- Tampil saat sesi sedang berlangsung
- Tombol **Akhiri Sesi** — dengan konfirmasi dan alasan
- Tombol **Mute Peserta** (audio/video)
- Indikator siapa yang sedang berbicara
- Notifikasi jika durasi melebihi batas

### Pengingat Wali
- Tampil sebagai dialog sebelum call dimulai dan sebagai banner selama call
- Tidak bisa di-skip — harus centang "Saya sudah didampingi wali"

---

## Keamanan & Aturan

- Video call tidak direkam oleh sistem
- Kedua pihak harus setuju jadwal sebelum call bisa dimulai
- Call hanya bisa dilakukan dalam jadwal yang disepakati (±15 menit toleransi)
- Mediator wajib hadir sebagai moderator — jika tidak hadir dalam 5 menit, call dibatalkan
- Mediator berhak mengakhiri call kapan saja jika mendeteksi pelanggaran
- Jika salah satu pihak tidak hadir dalam 15 menit, call dianggap batal
- Riwayat sesi tetap tersimpan meskipun ta'aruf tidak lanjut
- Semua tindakan moderator (mute, end call) tercatat di database untuk audit

---

## Catatan

- Wali tidak perlu memiliki akun di aplikasi — cukup pendampingan fisik
- Aplikasi hanya memfasilitasi jadwal, pengingat, moderator, dan video call
- Integrasi Stream Video memanfaatkan Stream yang sudah terpasang (satu vendor)
- Khitbah adalah fase di luar aplikasi (tatap muka langsung dengan wali/keluarga)

## Perubahan pada `taaruf_request`

Untuk skema yang scalable, kolom `result` tidak disimpan di `nadzor_session` (karena satu channel bisa punya banyak sesi). Sebagai gantinya, **`taaruf_request` perlu ditambahkan kolom fase**:

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| phase | phase_enum | chat \| nadzor \| khitbah \| completed |
| phase_updated_at | timestamp | Kapan terakhir fase berubah |
| readiness_ikhwan | timestamp | Kapan ikhwan menyatakan siap nadzor (nullable) |
| readiness_akhwat | timestamp | Kapan akhwat menyatakan siap nadzor (nullable) |
| readiness_timer | timestamp | 7 hari dari readiness pertama (nullable) |
| decision_timer | timestamp | 7 hari dari keputusan pertama setelah nadzor (nullable) |

Dengan ini, `taaruf_request.status` tetap untuk lifecycle request (pending/accepted/declined/expired/ended), sedangkan `phase` mencatat progres ta'aruf itu sendiri.
