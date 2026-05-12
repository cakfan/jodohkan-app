# Prompt: Improvement Landing Page Jodohkan — Early Adopter Framing

## Konteks

Kamu adalah seorang senior product designer dan copywriter yang membantu memperbaiki landing page **Jodohkan** — platform ta'aruf menuju pernikahan untuk Muslim usia 22–35 tahun.

**Design system yang sudah ada:**

| Elemen | Nilai |
|---|---|
| Font heading | Playfair Display (weight 500, 600) |
| Font UI | Plus Jakarta Sans (weight 300–600) |
| Warna utama | Mauve `#7D3E52`, Gold `#C8A96E`, Warm White `#F9F3F1`, Plum Deep `#1E0F16` |
| Tone | Serius, terpercaya, hangat — bukan app kencan biasa |
| Tagline | "Jodohmu Bukan Kebetulan." |

**Situasi:** Jodohkan baru saja diluncurkan. Belum ada testimoni user. Strategi yang dipilih adalah **early adopter framing** — bukan menyembunyikan status baru, tapi menjadikannya keuntungan dan keistimewaan bagi yang bergabung duluan.

---

## Tugas

Buat **kode HTML + CSS + JS lengkap** untuk landing page Jodohkan yang sudah diperbaiki. Implementasi harus mencakup seluruh perubahan di bawah ini, konsisten dengan design system yang ada.

---

## Perubahan yang Harus Diimplementasi

### 1. Hero Section — Tambah Early Adopter Banner

Tepat di bawah navbar, sebelum hero heading, tambahkan **banner eksklusivitas early access**:

```
[✦ Akses Awal Terbuka — Hanya 500 Slot Pertama]
```

- Styling: pill/badge horizontal, background `#C8A96E` (Gold), teks `#1E0F16`, font Plus Jakarta Sans 12px
- Tambahkan **slot counter** sederhana: progress bar tipis di bawah badge yang menunjukkan slot terisi (misal 312/500), animasi dari 0 ke angka tersebut saat page load
- Ini menciptakan urgensi nyata tanpa kebohongan

---

### 2. Hero Copy — Ganti Sub-copy

**Sebelum:**
> Proses ta'aruf yang aman, terjaga, dan tetap memegang teguh prinsip syariah. Dilengkapi dengan pendampingan mediator di setiap tahapannya.

**Sesudah (ganti dengan):**
> Capek kenalan yang tidak jelas arahnya? Jodohkan hadir untuk kamu yang serius menuju pernikahan — dengan proses yang terjaga, berpendamping, dan sesuai syariah.

---

### 3. CTA Utama — Ganti Label Tombol

**Sebelum:** "Mulai Sekarang →"

**Sesudah:** "Daftar Sebagai Member Awal →"

- Tambahkan micro-copy di bawah kedua tombol:
  ```
  Gratis · Tanpa kartu kredit · Proses diverifikasi manual
  ```
  Font 11px, warna `#B07A90` (Dusty Rose), center-aligned

---

### 4. Seksi Baru — "Mengapa Daftar Sekarang?" (Early Adopter Benefits)

Tambahkan seksi baru **di antara hero dan "Mengapa Jodohkan?"**, berisi 3 keuntungan bergabung di awal:

| Icon | Judul | Deskripsi |
|---|---|---|
| `ti-star` | Profil Lebih Mudah Ditemukan | Database masih kecil — kandidat yang cocok lebih mudah melihat profilmu di antara sedikit pesaing |
| `ti-shield-check` | Komunitas yang Terkurasi | Anggota awal diseleksi lebih ketat. Kamu akan bertemu orang-orang yang betul-betul serius |
| `ti-clock` | Akses Fitur Premium Gratis | Member pertama mendapat akses penuh tanpa biaya selama masa early access berlangsung |

- Layout: 3 kolom horizontal di desktop, stack vertikal di mobile
- Warna card: background `#F9F3F1`, border `#E8C4B8`, icon warna `#C8A96E`
- Heading seksi: "Keuntungan Bergabung Sekarang" — Playfair Display

---

### 5. Seksi "Mengapa Jodohkan?" — Perkuat Copy Card

Pertahankan layout 4 card, tapi **perbarui deskripsi** agar lebih kontekstual terhadap ta'aruf Islami:

| Card | Deskripsi Baru |
|---|---|
| CV Ta'aruf Digital | Profil lengkap yang mencakup visi hidup, pemahaman agama, dan kriteria pasangan — bukan sekadar foto dan bio singkat |
| Algoritma Matching | Kandidat dicocokkan berdasarkan keselarasan agama, usia, lokasi, dan visi hidup — tanpa fitur swipe yang mereduksi manusia jadi gambar |
| Chat dengan Mediator | Tidak ada komunikasi langsung antar calon. Setiap percakapan didampingi mediator terverifikasi, sesuai adab ta'aruf |
| Sistem Token Niat | Token digunakan sebelum membuka sesi ta'aruf — memastikan hanya yang serius dan berniat menikah yang bisa melanjutkan |

---

### 6. Footer CTA — Perkuat Tombol dan Tambah Trust Signal

**Perubahan tombol:**
- Ganti dari: tombol outline tipis
- Jadi: tombol filled, background `#F9F3F1` (Warm White), teks `#7D3E52` (Mauve)

**Tambahkan micro-copy di bawah tombol:**
```
Bergabunglah dengan 312 member yang sudah mendaftar lebih awal
```
Font 12px, warna `#E8C4B8` (Blush), center-aligned

---

### 7. Seksi Baru — "Dijaga Sejak Awal" (sebelum footer CTA)

Tambahkan seksi kepercayaan yang menggantikan peran testimoni:

**Heading:** "Dijaga Sejak Hari Pertama"
**Sub-heading:** "Jodohkan dibangun dengan prinsip privasi dan kehati-hatian — bukan kecepatan viral."

Tampilkan 3 trust indicator dalam format horizontal:

| Icon | Teks |
|---|---|
| `ti-id` | Setiap profil diverifikasi KTP secara manual |
| `ti-users` | Tim mediator berlatar pendidikan agama Islam |
| `ti-lock` | Data pribadi tidak pernah dibagikan ke pihak ketiga |

- Styling: background sedikit berbeda dari seksi lain, misal `#F0E8E4`
- Icon warna Mauve, teks Plum Deep

---

## Catatan Implementasi

- Gunakan **Tailwind CSS** atau **vanilla CSS** dengan variabel CSS yang mengikuti token design system
- Import font dari Google Fonts: `Playfair+Display:wght@500,600` dan `Plus+Jakarta+Sans:wght@300,400,500,600`
- Import icon dari Tabler Icons CDN: `https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css`
- Slot counter animasi: gunakan `requestAnimationFrame` atau CSS counter untuk efek counting up saat load
- Pastikan layout **mobile-first** dan responsif di lebar 375px ke atas
- Pertahankan seluruh seksi yang sudah ada (Tahapan Ta'aruf, dll.) — hanya tambah dan modifikasi, tidak menghapus

---

## Urutan Seksi Final (dari atas ke bawah)

1. Navbar
2. **[BARU]** Early Access Banner + Slot Counter
3. Hero — heading, sub-copy baru, CTA baru + micro-copy
4. Hero badges (Terjaga Syar'i, Didampingi Mediator, Tujuan Menikah)
5. **[BARU]** "Keuntungan Bergabung Sekarang" — 3 early adopter benefits
6. "Mengapa Jodohkan?" — 4 feature cards (copy diperbarui)
7. "Tahapan Ta'aruf" — pertahankan apa adanya
8. **[BARU]** "Dijaga Sejak Hari Pertama" — 3 trust indicators
9. Footer CTA — tombol dan micro-copy diperbarui
10. Footer

---

*Prompt ini dibuat berdasarkan design system Jodohkan dan hasil audit landing page — versi early launch, Mei 2026.*
