# Prompt: Landing Page Jodohkan — Iterasi v2

## Konteks

Ini adalah iterasi kedua perbaikan landing page **Jodohkan** (Next.js + shadcn/ui). Semua perubahan dari iterasi pertama sudah diimplementasi dengan baik. Sekarang fokus pada **5 perbaikan spesifik** berikut — jangan ubah apapun di luar yang disebutkan.

---

## Perbaikan 1 — Early Access Banner: Lebih Assertif

**Lokasi:** Bar paling atas halaman (sebelum navbar)

**Masalah saat ini:** Banner terlalu kecil dan tipis, tenggelam di antara elemen lain.

**Yang harus diubah:**

- Jadikan bar ini **full-width strip** dengan background `#C8A96E` (Gold), bukan hanya pill/badge
- Tinggi bar: minimal `40px`, padding vertikal `10px`
- Teks: Plus Jakarta Sans `12px`, warna `#1E0F16`, `font-weight: 500`
- Layout dalam bar: teks di tengah, slot counter di sebelah kanan dengan separator `·`
- Contoh tampilan:

  ```
  ✦ Akses Awal Terbuka — Hanya 500 Slot Pertama  ·  312 / 500 terisi  ████████░░ 
  ```

- Progress bar di dalam strip (bukan di bawahnya): tinggi `3px`, background `rgba(30,15,22,0.2)`, fill `#1E0F16`, lebar mengikuti persentase slot terisi
- Animasi counting-up dari 0 ke 312 saat page load, durasi `1.2s`, easing `ease-out`

---

## Perbaikan 2 — Whitespace Antar Seksi: Kurangi Jarak Vertikal

**Masalah saat ini:** Jarak antar seksi terlalu besar sehingga halaman terasa kosong dan kehilangan ritme.

**Yang harus diubah:**

Kurangi `padding-top` dan `padding-bottom` pada setiap seksi sesuai tabel berikut:

| Seksi | Sebelum | Sesudah |
|---|---|---|
| Hero badges → "Keuntungan Bergabung" | ~120px | 64px |
| "Keuntungan Bergabung" → "Mengapa Jodohkan?" | ~120px | 80px |
| "Mengapa Jodohkan?" → "Tahapan Ta'aruf" | ~120px | 80px |
| "Tahapan Ta'aruf" → "Dijaga Sejak Hari Pertama" | ~120px | 64px |

Tambahkan **visual divider** antar seksi sebagai penanda transisi — bukan sekadar whitespace:

```jsx
// Komponen divider yang dipakai antar seksi
<div className="flex items-center justify-center py-2">
  <div className="h-px w-16 bg-[#E8C4B8]" />
  <div className="mx-3 text-[#E8C4B8] text-xs">✦</div>
  <div className="h-px w-16 bg-[#E8C4B8]" />
</div>
```

---

## Perbaikan 3 — Seksi "Dijaga Sejak Hari Pertama": Bedakan dari Feature Cards

**Masalah saat ini:** Layout 3 card-nya identik dengan seksi "Mengapa Jodohkan?" sehingga terasa redundan secara visual.

**Yang harus diubah:**

- Hapus card border dan background putih — ganti dengan **layout horizontal satu baris** tanpa card wrapper
- Background seksi: `#EDE0DC` (satu step lebih gelap dari Warm White), full-width
- Setiap trust indicator: icon + teks dalam satu baris, tidak dalam card
- Di desktop: ketiganya dalam satu baris horizontal, separator `·` di antara item, center-aligned
- Di mobile: stack vertikal, left-aligned
- Icon: Tabler Icons, ukuran `16px`, warna `#7D3E52` (Mauve)
- Teks: Plus Jakarta Sans `13px`, warna `#2D1A20`, `font-weight: 500`
- Padding seksi: `32px` atas-bawah — lebih compact dari seksi lain

Contoh tampilan desktop:

```
[id-card] Setiap profil diverifikasi KTP secara manual   ·   [users] Tim mediator berlatar pendidikan agama Islam   ·   [lock] Data pribadi tidak pernah dibagikan ke pihak ketiga
```

---

## Perbaikan 4 — Footer CTA: Tombol Filled + Micro-copy Diperkuat

**Lokasi:** Seksi "Siap Memulai Perjalanan?" dengan background mauve gelap

**Masalah saat ini:** Tombol outline tipis hampir tidak terlihat di atas background mauve gelap.

**Yang harus diubah:**

Tombol CTA utama:
- Background: `#F9F3F1` (Warm White)
- Teks: `#7D3E52` (Mauve)
- Hover state: background `#C8A96E` (Gold), teks `#1E0F16`
- Transisi hover: `transition: all 0.2s ease`
- Padding: `12px 32px`, border-radius mengikuti `--radius` dari shadcn config
- Hilangkan border/outline sepenuhnya

Micro-copy di bawah tombol — ganti jadi dua baris terpisah:

```
Bergabunglah dengan 312 member yang sudah mendaftar lebih awal
Gratis · Tanpa kartu kredit · Slot terbatas
```

- Baris 1: `12px`, warna `#E8C4B8` (Blush)
- Baris 2: `11px`, warna `rgba(232,196,184,0.7)`, letter-spacing sedikit lebar

---

## Perbaikan 5 — Sub-heading "Keuntungan Bergabung Sekarang": Persingkat

**Masalah saat ini:** Sub-heading terlalu panjang untuk ukuran font yang dipakai.

**Sebelum:**
> Early adopter mendapat keistimewaan yang tidak akan tersedia lagi setelah platform resmi dibuka.

**Sesudah:**
> Bergabung sekarang berarti kamu dapat yang tidak akan tersedia nanti.

---

## Catatan Teknis

- Semua perubahan menggunakan token warna yang sudah ada di `globals.css` — tidak perlu menambahkan warna baru
- Komponen shadcn/ui yang mungkin perlu disentuh: `Button`, section wrapper, progress indicator
- Animasi slot counter: implementasi dengan `useEffect` + `useState` di Next.js, hitung dari 0 ke target dalam durasi yang ditentukan
- Pastikan semua perubahan tetap **responsif** di lebar 375px (mobile) dan 1280px (desktop)
- Jangan ubah seksi lain di luar yang disebutkan di atas

---

## Checklist Review Setelah Implementasi

1. [ ] Banner atas terlihat bold dan full-width, animasi counter berjalan saat load
2. [ ] Ritme scroll terasa lebih padat — tidak ada jarak kosong berlebihan antar seksi
3. [ ] Seksi "Dijaga Sejak Hari Pertama" secara visual berbeda dari feature cards
4. [ ] Tombol footer CTA terlihat jelas dan kontras di atas background mauve
5. [ ] Sub-heading "Keuntungan Bergabung" lebih ringkas

---

*Iterasi v2 — berdasarkan review visual landing page Jodohkan, Mei 2026.*
