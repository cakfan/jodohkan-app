# Chat System Design — Ta'aruf Islami

## Filosofi

Sistem chat ini dirancang bukan sebagai "aplikasi chat pada umumnya", melainkan sebagai **media komunikasi ta'aruf yang terjaga**. Setiap aspek teknis dibuat untuk mendukung adab dan akuntabilitas, bukan sekadar kecepatan atau kemudahan.

---

## Arsitektur

```
┌─────────────────────┐       ┌──────────────────────┐
│   Next.js App       │       │   Socket.io Server    │
│                     │       │   (Next.js API/standalone)
│  - Halaman Chat     │◄─────►│                      │
│  - Komponen UI      │       │  - rooms (conversation)
│  - useConversation  │       │  - events (message,   │
│    (custom hook)    │       │    typing, receipt)    │
└─────────┬───────────┘       └──────────┬─────────────┘
          │                              │
          │        ┌──────────────────────┐
          │        │   PostgreSQL         │
          ├────────►  (via Drizzle ORM)   │
                   │                      │
                   │  conversations       │
                   │  messages            │
                   │  participants        │
                   │  attachments         │
                   └──────────────────────┘
```

**Opsi deployment Socket.io:**
1. **Next.js API route** — sederhana, satu domain, tapi tidak ideal untuk koneksi long-lived (edge/ serverless timeout).
2. **Standalone server** — port terpisah, bisa scaling sendiri, recommended untuk production.

Rekomendasi: standalone server di subdomain `ws.jodohkan.com` atau di port terpisah.

---

## Database Schema

### System User (untuk system messages)

```sql
-- System user untuk welcome message & event otomatis
-- Insert sekali saat migrasi
INSERT INTO users (id, username, name, role)
VALUES ('00000000-0000-0000-0000-000000000001', 'system', 'System', 'system');
```

### Tabel Baru

```sql
-- ============================================================
-- CONVERSATIONS
-- ============================================================
CREATE TABLE conversations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  taaruf_session_id UUID NOT NULL UNIQUE REFERENCES taaruf_sessions(id) ON DELETE CASCADE,
  status            VARCHAR(20) NOT NULL DEFAULT 'active'
                      CHECK (status IN ('active', 'archived', 'deleted')),
  last_message_at   TIMESTAMPTZ, -- diupdate setiap ada pesan baru (untuk sorting)
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);

-- ============================================================
-- PARTICIPANTS
-- ============================================================
CREATE TABLE conversation_participants (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id),
  role            VARCHAR(20) NOT NULL DEFAULT 'participant'
                    CHECK (role IN ('participant', 'mediator')),
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  left_at         TIMESTAMPTZ, -- null jika masih aktif
  last_read_at    TIMESTAMPTZ, -- untuk unread count
  is_online       BOOLEAN NOT NULL DEFAULT FALSE,
  last_seen_at    TIMESTAMPTZ, -- terakhir terlihat online

  -- Satu user hanya bisa jadi participant 1x di conversation yang sama
  UNIQUE (conversation_id, user_id)
);

CREATE INDEX idx_participants_conversation ON conversation_participants(conversation_id);
CREATE INDEX idx_participants_user ON conversation_participants(user_id);
CREATE INDEX idx_participants_active ON conversation_participants(conversation_id, user_id)
  WHERE left_at IS NULL;
CREATE INDEX idx_participants_online ON conversation_participants(is_online)
  WHERE is_online = TRUE;

-- ============================================================
-- MESSAGES
-- ============================================================
CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID REFERENCES users(id), -- NULL untuk system message
  content         TEXT,
  message_type    VARCHAR(20) NOT NULL DEFAULT 'text'
                    CHECK (message_type IN ('text', 'image', 'system', 'welcome', 'pin')),
  metadata        JSONB DEFAULT '{}'::jsonb, -- flexible: image URL, pin info, etc.
  search_vector   TSVECTOR, -- diisi via trigger untuk full-text search
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
  -- NOTE: tidak ada updated_at — message tidak bisa diedit
);

-- Full-text search untuk mediator
CREATE INDEX idx_messages_search ON messages USING gin (search_vector);

-- Trigger: update search_vector otomatis
CREATE OR REPLACE FUNCTION messages_search_update()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('indonesian', coalesce(NEW.content, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_messages_search
  BEFORE INSERT OR UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION messages_search_update();

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at ASC);
CREATE INDEX idx_messages_type ON messages(conversation_id, message_type);
CREATE INDEX idx_messages_metadata ON messages USING gin (metadata);

-- ============================================================
-- ATTACHMENTS
-- ============================================================
CREATE TABLE message_attachments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id  UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  file_url    TEXT NOT NULL,
  file_type   VARCHAR(50),
  is_blurred  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_attachments_message ON message_attachments(message_id);

-- ============================================================
-- PINNED MESSAGES (terpisah dari conversations untuk menghindari circular FK)
-- ============================================================
CREATE TABLE conversation_pins (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  message_id      UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  pinned_by       UUID NOT NULL REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Hanya satu pin aktif per conversation
  UNIQUE (conversation_id)
);

CREATE INDEX idx_pins_conversation ON conversation_pins(conversation_id);
```

### Integrasi dengan Existing

```sql
-- taaruf_sessions sudah punya:
-- id, sender_id, receiver_id, mediator_id, status, stage

-- Relasi:
-- conversations.taaruf_session_id → taaruf_sessions.id
-- conversation_participants.user_id → taaruf_sessions.{sender_id, receiver_id, mediator_id}

-- Saat ta'aruf diterima, insert:
-- 1. conversations (taaruf_session_id)
-- 2. 3x conversation_participants (sender, receiver, mediator)
-- 3. 1x messages (type='welcome', sender_id=system)
-- 4. UPDATE conversations SET last_message_at = now()
```

### Catatan: File Cleanup

`ON DELETE CASCADE` hanya menghapus row database, **tidak menghapus file dari Supabase Storage**.

**Wajib** implementasi server-side cleanup sebelum delete/archive conversation:

```typescript
// Pseudocode — panggil sebelum DELETE conversations
async function cleanupConversationFiles(conversationId: string) {
  const attachments = await db.query.message_attachments.findMany({
    where: eq(message_attachments.conversation_id, conversationId),
  });

  for (const att of attachments) {
    const filePath = extractPathFromUrl(att.file_url);
    await supabase.storage.from("chat-attachments").remove([filePath]);
  }
}
```

**Alternatif:** periodic cron job (misal tiap jam) yang cari attachment orphan (file di storage tanpa row di DB).

---

## Socket.io Event Flow

### Connection

```typescript
// Client connect
socket = io("wss://ws.jodohkan.com", {
  auth: { token: "better-auth-session-token" }
});
```

Server memverifikasi token Better Auth — reject jika invalid/expired.

### Events

| Event | Arah | Description |
|-------|------|-------------|
| `conversation:join` | client→server | Join room conversation |
| `conversation:leave` | client→server | Leave room (hanya jika di-archive) |
| `message:send` | client→server | Kirim pesan baru |
| `message:new` | server→client | Pesan baru diterima (broadcast ke room) |
| `message:system` | server→client | Pesan sistem (user join/left, stage change) |
| `typing:start` | client→server | User mulai mengetik |
| `typing:stop` | client→server | User berhenti mengetik |
| `typing:update` | server→client | Broadcast typing indicator |
| `read:update` | client→server | Update last_read_at |
| `presence:update` | server→client | Broadcast status online/offline participant |
| `message:pin` | client→server | Mediator pin pesan (body: `{ messageId }`) |
| `message:unpin` | client→server | Mediator unpin pesan |
| `message:pinned` | server→client | Broadcast: ada pesan di-pin (termasuk info pin) |
| `message:unpinned` | server→client | Broadcast: pin dicabut |

### Alur Kirim Pesan

```
User A → message:send → Server:
  1. Validasi: apakah User A aktif participant di conversation ini?
  2. Validasi: apakah conversation status = active?
  3. Validasi: apakah taaruf_session masih di stage yang memungkinkan chat?
  4. INSERT ke tabel messages
  5. Jika ada attachment, INSERT ke message_attachments
  6. Broadcast message:new ke semua participant di room
  7. Trigger notifikasi untuk participant yang offline
```

### Alur Pin/Unpin Pesan

```
Mediator → message:pin → Server:
  1. Validasi: sender role = mediator
  2. Validasi: message_id valid dan milik conversation ini
  3. INSERT OR REPLACE INTO conversation_pins (conversation_id, message_id, pinned_by)
  4. Broadcast message:pinned ke semua participant (termasuk info pesan yang di-pin)

Mediator → message:unpin → Server:
  1. Validasi: sender role = mediator
  2. DELETE FROM conversation_pins WHERE conversation_id = ?
  3. Broadcast message:unpinned ke semua participant
```

---

## Fitur Khusus Ta'aruf

### 1. Mediator Auto-Include

Saat ta'aruf request **diterima**, sistem otomatis:
1. Buat `conversations` row dengan `taaruf_session_id`
2. INSERT 3 `conversation_participants`: sender, receiver, mediator
3. Broadcast `message:system` — "[Mediator] telah bergabung ke dalam percakapan"
4. Kirim notifikasi ke mediator

Mediator selalu menjadi participant tetap — tidak bisa di-remove oleh siapapun.

### 2. Participant Tidak Bisa Leave

Pengguna (bukan mediator) tidak bisa leave conversation. Jika ada tombol "leave", hanya mediator yang bisa meng-archive. Ini untuk menjaga akuntabilitas.

Cara enforce:
- Server-side: validasi di event `conversation:leave` — hanya `role = mediator` yang boleh
- Client-side: tombol leave disembunyikan untuk non-mediator

### 3. Nazhar Blur & Attachment Gate

**Attachment (gambar, file) HANYA bisa dikirim saat tahap Nazhar aktif.**

Sebelum Nazhar:
- Tombol upload gambar/file **disembunyikan/dinonaktifkan**
- Hanya pesan teks yang bisa dikirim
- System message jika ada percobaan upload: "Fitur foto tersedia setelah memasuki tahap Nazhar"

Saat kedua pihak setuju memasuki tahap Nazhar (`taaruf_sessions.stage = 'nazhar'`):
- Tombol upload muncul
- Gambar bisa dikirim — tetap di-blur secara server-side (sharp) dengan flag `is_blurred = true`
- Tampil blur di chat

Saat tahap Nazhar selesai (feedback diberikan):
- Semua `message_attachments` dengan `is_blurred = true` diupdate menjadi `false`
- Client menampilkan ulang gambar tanpa blur
- System message: "Tahap Nazhar selesai. Foto dapat dilihat."

**Enforce:** server-side validasi `taaruf_sessions.stage` sebelum menerima upload — tidak hanya client-side.

### 4. Adab Guard

Lapisan filter di server sebelum pesan disimpan:

1. **Kata kasar** — blacklist + regex, blokir dengan soft warning
2. **Gambar tidak senonoh** — NSFW detection (nsfwjs), blokir otomatis
3. **Konten terlarang** — nomor HP, link external (opsional: detect & warn)
4. **Etika otomatis** — reminder periodik dari sistem (contoh: "Jaga adab dalam berkomunikasi")

Response jika kena filter:
```json
{
  "type": "message:rejected",
  "reason": "Pesan mengandung kata yang tidak sesuai dengan adab ta'aruf",
  "original_content": "***"
}
```

### 5. Tidak Bisa Edit / Delete Pesan

Tidak ada fitur edit atau delete pesan (kecuali oleh mediator dalam kondisi khusus via panel admin). Ini untuk:
- Menjaga track record komunikasi
- Mediator bisa review history dengan akurat
- Mencegah penyangkalan

Jika ada typo, user bisa kirim pesan koreksi baru.

### 6. Presence & Read Receipts

**Online/Offline:**
- Socket `connection` → `UPDATE conversation_participants SET is_online = TRUE`
- Socket `disconnect` → `UPDATE conversation_participants SET is_online = FALSE, last_seen_at = now()`
- Broadcast `presence:update` ke room saat status berubah
- Tampilkan indikator hijau/abu-abu di avatar participant

**Read Receipts:**
- Setiap user mengirim `read:update` saat membuka/melihat pesan baru
- Server menyimpan `last_read_at` di `conversation_participants`
- Tampilkan centang/badge "Sudah dibaca" di UI
- Mediator bisa lihat siapa yang sudah baca pesan tertentu

### 7. Mediator Authority

Mediator memiliki kemampuan eksklusif:
- **Archive conversation** — soft delete, chat tidak bisa diakses participant
- **Lihat semua attachment** — termasuk foto asli (non-blur) untuk verifikasi
- **Export chat log** — untuk dokumentasi jika diperlukan
- **Warn user** — system message dari mediator

### 8. Pin Pesan oleh Mediator

Mediator bisa **pin** satu pesan penting di setiap conversation (hanya satu pin aktif per room).

**Fungsi:**
- Mediator melihat ikon pin di setiap pesan (hover/click)
- Saat di-pin: INSERT ke `conversation_pins`, broadcast `message:pinned`
- Pesan yang di-pin tampil di **banner sticky** di bagian atas MessageList
- Banner menampilkan: potongan teks, nama pengirim, tombol "scroll ke pesan"
- Hanya mediator yang bisa **unpin** (via tombol di banner atau di pesan asli) — DELETE dari `conversation_pins`

**Tujuan:**
- Mediator bisa menandai pesan penting (kesepakatan jadwal nazhar, komitmen, dll.)
- Pesan pin tidak hilang tergulung — selalu terlihat
- Akuntabilitas: semua peserta tahu pesan mana yang dianggap penting oleh mediator

```
[Sticky Banner — Pin by Mediator]
📌 "Baik, jadwal Nazhar kita sepakati hari Sabtu jam 10..." — [John]  [Lihat Pesan] [Unpin]
┌────────────────────────────────────────────┐
│  MessageList                               │
│  (konten chat seperti biasa)               │
└────────────────────────────────────────────┘
```

### 9. Pesan Pembuka & Aturan Ta'aruf

Saat conversation pertama kali dibuat, sistem secara otomatis mengirimkan **pesan pembuka dan aturan** sebagai pesan sistem (tidak bisa dihapus).

**Isi pesan pembuka (system message):**

> Bismillahirrahmanirrahim.
>
> Selamat datang di ruang ta'aruf. Semoga Allah سُبْحَانَهُ وَتَعَالَىٰ memudahkan proses ini dan memberikan keberkahan.
>
> Mediator: [Nama Mediator] akan mendampingi proses ta'aruf ini.
>
> **Aturan yang perlu dipahami:**
> 1. **Niat** — Ta'aruf ini diniatkan karena Allah, bukan karena faktor fisik atau duniawi.
> 2. **Adab bicara** — Jaga perkataan, hindari gurauan berlebihan, gossip, atau pembicaraan yang tidak esensial.
> 3. **Fokus visi** — Bahas visi rumah tangga, kesiapan, dan pemahaman agama. Bukan hal duniawi yang tidak esensial.
> 4. **Foto/attachment** — Hanya bisa dikirim setelah tahap Nazhar disetujui kedua pihak.
> 5. **Tidak ada private chat** — Semua komunikasi melalui ruang ini yang dimonitor mediator.
> 6. **Pesan tidak bisa diedit/dihapus** — Berhati-hatilah dalam menulis pesan.
> 7. **Waktu** — Hormati waktu istirahat masing-masing. Tidak ada kewajiban untuk membalas di luar jam wajar.
>
> Jika ada pertanyaan atau masalah, silakan hubungi mediator.

**Cara kerja:**
1. `message_type = 'welcome'` — disimpan di tabel messages seperti pesan biasa
2. Dikirim oleh `system` (sender_id = null atau system user khusus)
3. Tampil di bagian paling atas MessageList, sebelum pesan pertama dari user
4. Bisa di-pin oleh mediator agar selalu terlihat
5. Tidak bisa dihapus oleh siapapun

**Schema addition (optional):**
```sql
ALTER TABLE conversations ADD COLUMN welcome_sent BOOLEAN DEFAULT FALSE;
```

Atau cukup dicek dengan `SELECT EXISTS` pada messages dengan `message_type = 'welcome'`.

---

## UI Components

### Component Tree

```
ChatLayout
├── ConversationList          # Daftar percakapan aktif
│   └── ConversationCard      # Avatar + nama + last message + unread badge
│
├── ConversationView          # Panel chat aktif
│   ├── ChatHeader
│   │   ├── BackButton        # Mobile only
│   │   ├── ParticipantInfo   # Nama + avatar peserta
│   │   ├── MediatorBadge     # Menunjukkan mediator yang bergabung
│   │   ├── StageIndicator    # Tahap ta'aruf saat ini
│   │   └── ArchiveButton     # Mediator only
│   │
│   ├── MessageList
│   │   ├── PinnedBanner      # Sticky di atas — pesan yang di-pin mediator (dengan tombol scroll & unpin untuk mediator)
│   │   ├── WelcomeMessage    # Pesan pembuka & aturan ta'aruf (message_type = 'welcome')
│   │   ├── SystemMessage     # "[Mediator] bergabung", "Memasuki tahap Nazhar", "Pesan di-pin"
│   │   ├── TextMessage       # Pesan biasa (sent/received styling)
│   │   ├── ImageMessage      # Blur/unblur sesuai stage
│   │   ├── PinIndicator      # Ikon pin di pesan yang di-pin — hanya terlihat oleh mediator
│   │   ├── DateDivider       # Pemisah tanggal
│   │   ├── TypingIndicator   # "Sedang mengetik..."
│   │   └── LoadMore          # Infinite scroll ke atas
│   │
│   └── MessageComposer
│       ├── TextInput
│       ├── UploadButton       # Image — auto blur
│       └── SendButton
│
└── EmptyStates
    ├── NoConversation        # Belum ada percakapan
    └── Archived              # Percakapan ini sudah diarsipkan
```

### Key Components — Catatan Implementasi

| Component | Catatan |
|-----------|---------|
| `MessageList` | Virtual scroll (react-window atau `content-visibility`) untuk ribuan pesan |
| `PinnedBanner` | Sticky di atas list; di-load dari `conversation_pins` JOIN messages |
| `WelcomeMessage` | System message pertama di chat — tidak bisa dihapus; berisi aturan ta'aruf |
| `SystemMessage` | Styling berbeda — italic, icon, center-aligned |
| `TextMessage` | Tambah ikon pin di hover untuk mediator |
| `ImageMessage` | Hanya muncul setelah tahap Nazhar; blur overlay sebelum Nazhar selesai |
| `StageIndicator` | Menunjukkan progress ta'aruf di header |
| `UploadButton` | Disabled/hidden sebelum stage `nazhar` |
| `PinIcon` | Tombol pin di setiap pesan — hanya visible untuk `role = mediator` |

---

## Security

1. **Authentication** — Socket.io connection memakai token Better Auth (HTTP-only cookie atau token di auth payload)
2. **Authorization** — Setiap event server-side memverifikasi user adalah participant valid
3. **Rate Limiting** — per user: max 30 messages per minute, 5 uploads per minute
4. **Content Validation** — Semua input di-sanitize (XSS prevention), gambar di-scan NSFW
5. **Data Isolation** — User hanya bisa akses conversation di mana mereka participant
6. **Encryption at Rest** — Kolom `content` di tabel messages bisa diencrypt (opsional, via pgcrypto)

---

## Catatan: Tidak Perlu Migrasi

Proyek masih tahap development, chat hanya menggunakan dummy user. Tidak ada data riil di Stream yang perlu dipindahkan.
Langkah-langkah yang diperlukan:

1. **Hapus Stream SDK** — `package.json`, komponen, server-side client, API token endpoint
2. **Tambahkan schema baru** — tabel `conversations`, `participants`, `messages`, `attachments`
3. **Set up Socket.io server** — standalone atau di API route
4. **Buat custom hooks** — `useConversation`, `useMessage`, dll
5. **Buat UI komponen** — MessageList, MessageComposer, dll
6. **Aktifkan** untuk ta'aruf baru

---

## Catatan Teknis

- **Socket.io versi 4.x** — sudah mature, dokumentasi lengkap
- **Drizzle ORM** — sudah dipakai di project, konsisten
- **Upload gambar** — tetap pakai Supabase Storage seperti existing flow
- **NSFW detection** — bisa pakai `nsfwjs` yang sudah ada di project
- **Blur image** — pakai `sharp` yang sudah ada untuk server-side blur
