# Jodohkan — Design System

> *Jodohmu Bukan Kebetulan.*

---

## Brand Identity

| Elemen | Nilai |
|---|---|
| **Nama** | Jodohkan |
| **Domain** | jodohkan.com |
| **Tagline** | Jodohmu Bukan Kebetulan. |
| **Kategori** | Platform ta'aruf menuju pernikahan |
| **Target** | Muslim usia 22–35 tahun, anak muda & dewasa |
| **Tone** | Serius, terpercaya, hangat |

---

## Tipografi

### Font Logo
| Properti | Nilai |
|---|---|
| **Font** | Playfair Display |
| **Weight** | 500, 600 |
| **Source** | Google Fonts |
| **Penggunaan** | Logo, hero heading, display text |

### Font App (UI)
| Properti | Nilai |
|---|---|
| **Font** | Plus Jakarta Sans |
| **Weight** | 300, 400, 500, 600 |
| **Source** | Google Fonts / `next/font/google` |
| **Penggunaan** | Semua elemen UI — body, label, button, caption |

### Skala Tipografi
| Role | Font | Size | Weight |
|---|---|---|---|
| Logo | Playfair Display | 28–36px | 600 |
| Hero Heading | Playfair Display | 40–64px | 500 |
| Section Heading | Plus Jakarta Sans | 24–32px | 600 |
| Subheading | Plus Jakarta Sans | 18–20px | 500 |
| Body | Plus Jakarta Sans | 14–16px | 400 |
| Caption / Label | Plus Jakarta Sans | 11–12px | 400–500 |
| Button | Plus Jakarta Sans | 13–14px | 500 |

### Setup Next.js (`layout.tsx`)
```typescript
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google"

export const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600"],
})

export const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "600"],
})

// Di RootLayout:
<body className={`${jakarta.variable} ${playfair.variable}`}>
```

---

## Warna

### Palet Utama
| Nama | Hex | OKLCH | Penggunaan |
|---|---|---|---|
| **Plum Deep** | `#1E0F16` | `oklch(0.155 0.035 345)` | Background dark mode |
| **Plum Card** | `#321824` | `oklch(0.225 0.048 346)` | Card dark mode |
| **Mauve Primary** | `#7D3E52` | `oklch(0.435 0.098 350)` | Primary — tombol, link, ikon |
| **Mauve Light** | `#A05870` | `oklch(0.620 0.115 350)` | Primary dark mode |
| **Dusty Rose** | `#B07A90` | `oklch(0.620 0.090 345)` | Muted foreground, ikon sekunder |
| **Blush** | `#E8C4B8` | `oklch(0.878 0.038 25)` | Secondary, tag, badge |
| **Gold Accent** | `#C8A96E` | `oklch(0.738 0.098 68)` | Aksen premium, highlight, tagline |
| **Warm White** | `#F9F3F1` | `oklch(0.979 0.005 30)` | Background light mode |

### Token Shadcn/UI
```css
/* Light Mode */
--background:           oklch(0.979 0.005 30);   /* Warm White */
--foreground:           oklch(0.185 0.040 345);  /* Plum Deep */
--primary:              oklch(0.435 0.098 350);  /* Mauve Primary */
--primary-foreground:   oklch(0.979 0.005 30);   /* Warm White */
--secondary:            oklch(0.878 0.038 25);   /* Blush */
--secondary-foreground: oklch(0.285 0.055 345);
--muted:                oklch(0.955 0.012 20);
--muted-foreground:     oklch(0.520 0.065 345);  /* Dusty Rose */
--accent:               oklch(0.738 0.098 68);   /* Gold */
--accent-foreground:    oklch(0.185 0.040 345);
--border:               oklch(0.895 0.022 20);
--ring:                 oklch(0.540 0.110 350);

/* Dark Mode */
--background:           oklch(0.155 0.035 345);  /* lebih gelap dari card */
--foreground:           oklch(0.952 0.010 30);
--card:                 oklch(0.225 0.048 346);  /* kontras dari background */
--primary:              oklch(0.620 0.115 350);  /* mauve lebih cerah */
--muted-foreground:     oklch(0.720 0.075 345);
--accent:               oklch(0.738 0.098 68);   /* gold tetap sama */
--border:               oklch(1 0 0 / 14%);
```

---

## Logo

### Elemen Logo
| Elemen | Deskripsi |
|---|---|
| **Icon** | Dua lingkaran yang bertumpuk — melambangkan dua individu yang bertemu |
| **Titik temu** | Area overlap di tengah — momen pertemuan jodoh |
| **Warna icon (light)** | Lingkaran kiri: Mauve `#7D3E52` · Lingkaran kanan: Gold `#C8A96E` |
| **Warna icon (dark)** | Lingkaran kiri: Warm White · Lingkaran kanan: Gold |
| **Wordmark** | "Jodohkan" — Playfair Display 600 |
| **Tagline** | "Jodohmu Bukan Kebetulan." — Plus Jakarta Sans 400, letter-spacing 0.05em |

### Variasi Logo
| Variasi | Penggunaan |
|---|---|
| Icon + Wordmark + Tagline | Landing page hero, about page |
| Icon + Wordmark | Header app, email |
| Icon saja | Favicon, app icon, avatar placeholder |
| Wordmark saja | Footer, watermark dokumen |

### Warna Logo per Background
| Background | Wordmark | Tagline |
|---|---|---|
| Light (`#F9F3F1`) | Plum Deep `#2D1A20` | Mauve `#7D3E52` |
| Dark (`#1E0F16`) | Warm White `#F9F3F1` | Gold `#C8A96E` |
| Mauve (`#7D3E52`) | Warm White `#F9F3F1` | Gold `#C8A96E` |

---

## Radius & Spacing

```css
--radius: 0.625rem;          /* 10px — base radius */
--radius-sm:  0.375rem;      /* 6px  — chip, badge kecil */
--radius-md:  0.5rem;        /* 8px  — input, select */
--radius-lg:  0.625rem;      /* 10px — card, modal */
--radius-xl:  0.875rem;      /* 14px — card besar */
--radius-2xl: 1.125rem;      /* 18px — bottom sheet */
--radius-3xl: 1.375rem;      /* 22px — hero card */
--radius-4xl: 1.625rem;      /* 26px — ilustrasi, image card */
```

---

## Prinsip Desain

1. **Trustworthy first** — setiap elemen harus memancarkan kepercayaan. Hindari visual yang terasa gimmicky.
2. **Warmth over coldness** — warna dan tipografi dipilih agar terasa personal, bukan korporat.
3. **Mobile-first** — mayoritas pengguna akses lewat HP, desain dimulai dari layar kecil.
4. **Kejelasan di atas estetika** — kalau harus memilih antara cantik dan jelas, pilih jelas.
5. **Konsisten & minimal** — gunakan token yang sudah ada, hindari warna atau ukuran di luar sistem.

---

## Referensi File

| File | Deskripsi |
|---|---|
| `globals.css` | Token warna shadcn, light & dark mode |
| `layout.tsx` | Setup `next/font` untuk Plus Jakarta Sans + Playfair Display |
| `design.md` | Dokumen ini — sumber kebenaran design system |

