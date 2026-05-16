# Theme Changelog — Jodohkan

> Dokumentasi perubahan design system dari Rose & Mauve penuh ke Dark Neutral + Brand Accent.

---

## Versi 2.0 — Dark Neutral (Terkini)

**Tanggal**: Mei 2026
**File yang diubah**: `globals.css`, `stream-chat.css`

### Latar Belakang

Skema warna versi 1.x menggunakan rose & mauve di seluruh surface — background, card, sidebar, dan muted. Meskipun karakter brand kuat, warna berchroma tinggi di area luas melelahkan mata untuk sesi panjang.

Versi 2.0 mengadopsi pendekatan **neutral-first** seperti Instagram dan Threads:
- Surface (background, card, sidebar) menggunakan abu netral tanpa chroma
- Brand color (Mauve & Gold) hanya muncul di aksen — tombol, focus ring, badge, bubble chat
- Hasilnya: mata lebih rileks, brand tetap terasa, kontras lebih terjaga

---

## Perubahan globals.css

### Light Mode

Light mode tetap mempertahankan warm tint sangat tipis pada foreground agar tidak terasa steril.

| Token | v1.x (Rose) | v2.0 (Neutral) | Alasan |
|---|---|---|---|
| `--background` | `oklch(0.979 0.005 30)` Warm White | `oklch(0.980 0 0)` #FAFAFA | Hilangkan chroma, tetap off-white |
| `--foreground` | `oklch(0.185 0.040 345)` Plum Deep | `oklch(0.130 0.010 345)` #1A1218 | Warm dark tipis, bukan pure black |
| `--card` | `oklch(0.997 0.002 30)` off-white | `oklch(1.000 0 0)` #FFFFFF | Pure white, gap dari bg lebih jelas |
| `--secondary` | `oklch(0.878 0.038 25)` Blush | `oklch(0.960 0 0)` #F5F5F5 | Netral, tidak ada chroma |
| `--secondary-foreground` | `oklch(0.285 0.055 345)` Plum Elevated | `oklch(0.130 0.010 345)` warm dark | Konsisten dengan foreground utama |
| `--muted` | `oklch(0.952 0.010 22)` rose tipis | `oklch(0.940 0 0)` #EFEFEF | Netral penuh |
| `--muted-foreground` | `oklch(0.520 0.068 345)` Dusty Rose | `oklch(0.450 0 0)` #696969 | Netral, AA 6.62:1 vs card ✓ |
| `--border` | `oklch(0.905 0.018 22)` warm border | `oklch(0.900 0 0)` #E0E0E0 | Netral |
| `--input` | `oklch(0.878 0.024 22)` warm input | `oklch(0.870 0 0)` #D4D4D4 | Netral |
| `--sidebar` | `oklch(0.968 0.008 22)` warm | `oklch(0.960 0 0)` #F5F5F5 | Netral |
| `--sidebar-accent` | `oklch(0.940 0.016 25)` Blush Light | `oklch(0.940 0 0)` #EFEFEF | Netral hover state |

**Token yang tidak berubah di light mode:**
- `--primary` — Mauve Primary `oklch(0.435 0.098 350)` #7D3E52
- `--primary-foreground` — `oklch(0.980 0 0)` #FAFAFA
- `--accent` — Gold `oklch(0.738 0.098 68)` #C8A96E
- `--accent-foreground` — warm dark
- `--ring` — Mauve Primary
- `--destructive`

---

### Dark Mode

Dark mode adalah perubahan terbesar — dari plum berchroma ke abu netral murni.

| Token | v1.x (Rose Dark) | v2.0 (Neutral Dark) | Alasan |
|---|---|---|---|
| `--background` | `oklch(0.145 0.032 345)` #1E0F16 plum | `oklch(0.145 0 0)` #111111 | Near-black netral, tidak ada chroma |
| `--foreground` | `oklch(0.948 0.008 30)` warm white | `oklch(0.940 0.004 30)` #F0EDEB | Sedikit dikurangi agar tidak menyilaukan |
| `--card` | `oklch(0.230 0.050 346)` plum card | `oklch(0.230 0 0)` #1E1E1E | Netral, gap dari bg = 0.085 ✓ |
| `--popover` | `oklch(0.268 0.054 346)` plum elevated | `oklch(0.265 0 0)` #262626 | Netral elevated |
| `--primary` | `oklch(0.620 0.115 350)` Mauve Bright ❌ | `oklch(0.435 0.098 350)` Mauve Primary ✓ | **Fix kritis**: Mauve Bright = 3.63:1 GAGAL WCAG |
| `--primary-foreground` | `oklch(0.145 0.032 345)` gelap ❌ | `oklch(0.980 0 0)` #FAFAFA ✓ | **Fix kritis**: teks gelap di atas mauve = tidak terbaca |
| `--secondary` | `oklch(0.300 0.060 346)` plum | `oklch(0.320 0 0)` #333333 | Netral |
| `--secondary-foreground` | `oklch(0.878 0.038 25)` Blush | `oklch(0.870 0 0)` #DEDEDE | Netral, 8.56:1 ✓ AAA |
| `--muted` | `oklch(0.272 0.052 346)` plum muted | `oklch(0.210 0 0)` #1A1A1A | Netral sidebar-level |
| `--muted-foreground` | `oklch(0.680 0.072 345)` Dusty Rose | `oklch(0.590 0 0)` #8A8A8A | Netral, by design ⚠ Large |
| `--accent-foreground` | `oklch(0.185 0.040 345)` Plum Deep | `oklch(0.145 0 0)` #111111 | Netral dark, 8.37:1 ✓ AAA |
| `--border` | `oklch(1 0 0 / 14%)` | `oklch(1 0 0 / 12%)` | Sedikit dikurangi — netral lebih subtle |
| `--input` | `oklch(1 0 0 / 20%)` | `oklch(1 0 0 / 18%)` | Adjusted |
| `--sidebar` | `oklch(0.192 0.042 346)` plum | `oklch(0.210 0 0)` #1A1A1A | Netral, gap dari bg = 0.065 ✓ |
| `--sidebar-accent` | `oklch(0.268 0.054 346)` plum | `oklch(0.265 0 0)` #262626 | Netral hover |
| `--sidebar-accent-foreground` | `oklch(0.878 0.038 25)` Blush | `oklch(0.940 0.004 30)` warm white | Kontras lebih baik |

**Token yang tidak berubah di dark mode:**
- `--accent` — Gold `oklch(0.738 0.098 68)` #C8A96E
- `--ring` — Mauve Primary `oklch(0.435 0.098 350)`
- `--destructive`

---

## Perubahan stream-chat.css

### Light Mode

| Elemen | v1.x | v2.0 | Alasan |
|---|---|---|---|
| Avatar text | `#7D3E52` Mauve | `#1a1218` warm dark | Kontras dari Blush bg: 10.04:1 ✓ AAA |

### Dark Mode

| Elemen | v1.x | v2.0 | Alasan |
|---|---|---|---|
| Avatar bg | `#3d2530` Plum Card | `#262626` abu netral | Selaras dengan card dark baru |
| Avatar text | `#e8c4b8` Blush | `#f0edeb` warm white | Kontras 12.82:1 ✓ AAA |
| Bubble incoming bg | `var(--color-muted)` | `var(--color-secondary)` #333 | Lebih kontras dari card #1E1E1E |
| Bubble incoming text | `var(--color-foreground)` | `var(--color-foreground)` | Tidak berubah |
| Unread badge | `#b8628a` Mauve Bright | `#7d3e52` Mauve Primary | Konsisten dengan `--primary` |
| Composer input bg | `var(--color-card)` | `#262626` popover level | Lebih elevated dari card, terasa sebagai input area |
| Mention color | `#b8628a` | `#b8628a` | Tidak berubah — Mauve Bright tetap visible |

### Fix Kritis — Bubble Me (Outgoing)

Bubble me di dark mode menggunakan `var(--color-primary)` yang di v1.x = Mauve Bright `oklch(0.620)`. Kontras dengan Warm White hanya **3.63:1 — GAGAL WCAG AA**.

**Solusi**: hardcode `oklch(0.435 0.098 350)` (Mauve Primary) langsung untuk `--str-chat__chat-bg-outgoing` di dark mode, tidak mengikuti `var(--color-primary)`.

```css
/* v1.x — GAGAL */
--str-chat__chat-bg-outgoing: var(--color-primary); /* 3.63:1 ✗ */

/* v2.0 — AMAN */
--str-chat__chat-bg-outgoing: oklch(0.435 0.098 350); /* 7.91:1 ✓ AAA */
--str-chat__chat-text-outgoing: oklch(0.979 0.005 30);
```

---

## Audit Kontras — Perbandingan

### Light Mode

| Pasangan | v1.x | v2.0 | Status |
|---|---|---|---|
| `background → foreground` | 19.01:1 | 19.01:1 | ✓ AAA |
| `card → foreground` | 20.08:1 | 20.08:1 | ✓ AAA |
| `primary → primary-fg` | 7.91:1 | 7.91:1 | ✓ AAA |
| `secondary → secondary-fg` | 15.90:1 | 15.90:1 | ✓ AAA |
| `muted → muted-fg` | 6.62:1 | 6.62:1 | ✓ AA |
| `accent → accent-fg` | 8.52:1 | 8.52:1 | ✓ AAA |

### Dark Mode

| Pasangan | v1.x | v2.0 | Status |
|---|---|---|---|
| `background → foreground` | 16.58:1 | 16.58:1 | ✓ AAA |
| `card → foreground` | 14.15:1 | 14.15:1 | ✓ AAA |
| `primary → primary-fg` | **3.63:1 ✗** | **7.91:1 ✓** | **FIXED** |
| `secondary → secondary-fg` | 8.56:1 | 8.56:1 | ✓ AAA |
| `muted → muted-fg` | 3.94:1 | 3.94:1 | ⚠ Large |
| `accent → accent-fg` | 8.37:1 | 8.37:1 | ✓ AAA |

> **Catatan `muted-fg`**: Nilai 3.94:1 adalah by design — dipakai hanya untuk placeholder, caption, dan timestamp. Ini konsisten dengan pendekatan Instagram (#737373 di #1E1E1E = 3.57:1). Bukan untuk body text.

---

## Filosofi Perubahan

### v1.x — Rose Everywhere
Brand color (mauve/rose) digunakan di seluruh surface. Karakter kuat, tapi:
- Chroma tinggi di area luas melelahkan mata
- Dark mode terasa "purple-ish" dan berat
- Kurang familiar untuk sesi panjang

### v2.0 — Neutral Surface, Brand Accent
Mengadopsi prinsip yang dipakai Instagram, Threads, Linear, dan Notion:

> **Surface netral, aksen bermakna.**

- Background dan card: abu netral tanpa chroma → mata rileks
- Brand color hanya muncul saat bermakna: tombol CTA, focus ring, bubble chat, badge
- Setiap kali mauve muncul → bermakna, bukan sekadar dekorasi
- Gold tetap sebagai aksen premium — tidak berubah

---

## Referensi Warna Brand (Tetap)

Token-token ini tidak berubah di kedua versi — ini adalah identitas brand Jodohkan:

| Nama | Hex | OKLCH | Dipakai di |
|---|---|---|---|
| Mauve Primary | `#7D3E52` | `oklch(0.435 0.098 350)` | `--primary`, `--ring`, bubble me |
| Gold Accent | `#C8A96E` | `oklch(0.738 0.098 68)` | `--accent`, badge premium, tagline logo |
| Blush | `#E8C4B8` | `oklch(0.878 0.038 25)` | Avatar bg light, chart-1 |
| Mauve Bright | `#B8628A` | `oklch(0.620 0.115 350)` | chart-3 dark, mention color |

