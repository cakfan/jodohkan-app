# Prompt: Landing Page Jodohkan — Hotfix v2.1

## Konteks

Iterasi v2 sudah berhasil diimplementasi dengan baik. Ada **2 bug spesifik** yang perlu diperbaiki. Jangan ubah apapun selain yang disebutkan di bawah.

---

## Fix 1 — Footer CTA Dark Mode: Background Salah Warna

**Masalah:** Di dark mode, background seksi "Siap Memulai Perjalanan?" berubah jadi pink muda/blush yang sangat terang — tidak konsisten dengan keseluruhan dark mode yang gelap dan elegan.

**Root cause:** Background seksi kemungkinan menggunakan token seperti `bg-primary` atau `bg-secondary` yang ter-override oleh dark mode variables di `globals.css`.

**Yang harus dilakukan:**

Hardcode warna background seksi ini agar tidak terpengaruh dark mode:

```jsx
// Ganti dari (apapun yang sekarang dipakai, misal):
<section className="bg-primary"> 
// atau
<section className="bg-[#7D3E52]">

// Pastikan menggunakan inline style atau class yang tidak ter-override:
<section style={{ backgroundColor: '#5C2D3E' }}>
// Gunakan warna satu step lebih gelap dari Mauve Primary agar tetap terasa dalam di dark mode
```

**Target warna yang diinginkan:**
- Light mode: `#7D3E52` (Mauve Primary)
- Dark mode: **warna yang sama** `#7D3E52` — seksi ini harus identik di kedua mode, tidak boleh berubah mengikuti dark mode variables

**Solusi paling aman:**

Tambahkan inline style langsung pada element section:

```jsx
<section
  style={{ backgroundColor: '#7D3E52' }}
  className="..." // tetap bisa pakai className untuk padding, dll
>
```

Atau jika menggunakan Tailwind, pakai arbitrary value yang tidak ada di theme sehingga tidak ter-override:

```jsx
<section className="bg-[#7D3E52]">
```

Pastikan warna ini **tidak** diambil dari CSS variable manapun — hardcode `#7D3E52` secara eksplisit.

---

## Fix 2 — Tombol Footer CTA: Masih Outline, Harus Filled

**Masalah:** Tombol "Daftar Sekarang" di seksi footer CTA masih menggunakan variant `outline` — hampir tidak terlihat di atas background mauve, terutama di dark mode.

**Yang harus dilakukan:**

Ganti tombol ini dari variant outline ke filled dengan warna eksplisit:

```jsx
// Sebelum (kemungkinan):
<Button variant="outline">Daftar Sekarang →</Button>

// Sesudah:
<Button
  className="bg-[#F9F3F1] text-[#7D3E52] hover:bg-[#C8A96E] hover:text-[#1E0F16] transition-all duration-200 border-0 px-8 py-3"
>
  Daftar Sekarang →
</Button>
```

Spesifikasi tombol:
- Background normal: `#F9F3F1` (Warm White)
- Teks normal: `#7D3E52` (Mauve)
- Background hover: `#C8A96E` (Gold)
- Teks hover: `#1E0F16` (Plum Deep)
- Border: tidak ada (`border-0` atau `border-none`)
- Transisi: `transition-all duration-200`
- Padding: `px-8 py-3`
- Pastikan warna ini **tidak berubah** di dark mode — gunakan class eksplisit, bukan variant shadcn

---

## Checklist Setelah Fix

1. [ ] Toggle ke dark mode — background footer CTA tetap mauve gelap, tidak berubah pink
2. [ ] Toggle ke light mode — background footer CTA tetap mauve gelap, konsisten
3. [ ] Tombol "Daftar Sekarang" terlihat jelas (Warm White) di atas background mauve di kedua mode
4. [ ] Hover tombol berubah ke Gold dengan teks gelap
5. [ ] Tidak ada perubahan lain di luar dua fix ini

---

*Hotfix v2.1 — Mei 2026.*
