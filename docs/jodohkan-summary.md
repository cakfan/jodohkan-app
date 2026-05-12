# Ringkasan Sesi — Brand Identity Jodohkan

> Sesi brainstorming dan perancangan brand identity aplikasi ta'aruf dari nol hingga aset siap pakai.

---

## 1. Penamaan Brand

Eksplorasi nama melewati beberapa ronde dengan berbagai bahasa (Indonesia, Jepang, Arab, Inggris). Kriteria yang dicari: satu kata bahasa Indonesia, 6–9 huruf, natural diucap, serius tapi tidak kaku.

**Nama yang dipertimbangkan:** Meguri, Halfmoon, Jodohku, Kepincut, Muara, Terpaut, Labuh, Pungkas, Padanan, Sangkut, Temukan, Jodohkelas, Jodohin, Jodohkan, dan lainnya.

**Nama terpilih: Jodohkan**

- Domain: `jodohkan.com`
- Alasan: natural seperti "Jodohin" tapi terasa lebih resmi dan dewasa, cocok untuk segmen anak muda (22–28) sekaligus dewasa (28–35)

---

## 2. Tagline

**Terpilih: "Jodohmu Bukan Kebetulan."**

Alternatif yang dipertimbangkan:

- Serius Menikah? Mulai di Sini.
- Temukan. Kenali. Nikahi.
- Bukan Pacaran. Ini Lebih dari Itu.
- Untuk yang Sudah Siap.

---

## 3. Identitas Visual

### Warna

Palet **Rose & Mauve** dipilih atas Navy karena lebih hangat dan personal.

| Nama          | Hex       |
| ------------- | --------- |
| Plum Deep     | `#1E0F16` |
| Mauve Primary | `#7D3E52` |
| Mauve Light   | `#A05870` |
| Dusty Rose    | `#B07A90` |
| Blush         | `#E8C4B8` |
| Gold Accent   | `#C8A96E` |
| Warm White    | `#F9F3F1` |

### Tipografi

| Peran               | Font              | Keterangan                           |
| ------------------- | ----------------- | ------------------------------------ |
| Logo & hero heading | Playfair Display  | Weight 500, 600 — elegan dan tegas   |
| UI / App            | Plus Jakarta Sans | Weight 300–600 — humanis dan terbaca |

### Logo

- **Icon:** dua lingkaran bertumpuk (mauve + gold) dengan area intersect berwarna mauve gelap
- **Wordmark:** "Jodohkan" — Playfair Display 600
- **Divider:** garis tipis `#E8C4B8`
- **Tagline:** Plus Jakarta Sans 400, letter-spacing lebar, uppercase

---

## 4. Filosofi Logo

Dua lingkaran melambangkan dua individu dengan perjalanan hidup masing-masing yang menemukan satu titik temu.

- **Lingkaran kiri (Mauve)** — ketenangan, keseriusan, niat yang tulus
- **Lingkaran kanan (Gold)** — nilai, kualitas, harapan dan keberkahan
- **Area overlap (Mauve gelap)** — pertemuan yang menciptakan sesuatu lebih kaya dari masing-masing individu
- **Bentuk lingkaran** — tidak punya awal dan akhir, melambangkan ikatan yang tidak terputus
- **Tagline** — mengingatkan bahwa Jodohkan adalah _wasilah_, bukan penentu jodoh

---

## 5. Aset yang Dihasilkan

| File                     | Isi                                                            |
| ------------------------ | -------------------------------------------------------------- |
| `globals.css`            | Token warna shadcn/ui — light & dark mode, format oklch        |
| `jodohkan-logo.svg`      | Logo lengkap — icon + wordmark + divider + tagline             |
| `jodohkan-logo-icon.svg` | Icon saja — untuk favicon dan app icon                         |
| `design.md`              | Design system lengkap — brand, tipografi, warna, logo, prinsip |

---

## 6. Catatan Teknis

### Shadcn/UI Dark Mode

Dark mode awal terlalu minim kontras — diperbaiki dengan memperlebar gap lightness antara `--background` dan `--card` minimal 0.06–0.08 dalam oklch.

### Setup Font Next.js

```typescript
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";

export const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600"],
});

export const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "600"],
});
```

### Tutorial Figma

7 langkah membuat logo di Figma:

1. Buat frame 480 × 300, fill `#F9F3F1`
2. Buat dua lingkaran W&H 104px, jarak antar center 68px
3. Buat area overlap via klik kanan → Boolean Groups → Intersect
4. Tambah wordmark — Playfair Display 600, 56px, `#2D1A20`
5. Tambah divider (0.75px, `#E8C4B8`) dan tagline
6. Duplikat frame untuk variasi dark mode
7. Group semua elemen → ekspor SVG, PNG @2x, PDF

### Ukuran Icon (tanpa teks)

| Kebutuhan            | Ukuran         |
| -------------------- | -------------- |
| Favicon              | 32 × 32 px     |
| Header app           | 40 × 40 px     |
| Social preview       | 120 × 120 px   |
| App icon iOS/Android | 1024 × 1024 px |

---

## 7. Prinsip Desain

1. **Trustworthy first** — hindari visual yang terasa gimmicky
2. **Warmth over coldness** — personal, bukan korporat
3. **Mobile-first** — mulai dari layar kecil
4. **Kejelasan di atas estetika** — kalau harus memilih, pilih jelas
5. **Konsisten & minimal** — gunakan token yang ada
