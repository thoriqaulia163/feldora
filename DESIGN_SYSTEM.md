# FELDORA — Design System & Architecture

## Identitas

**Feldora** adalah platform website modern dengan nuansa cinematic, futuristik, dan premium.
Desain terinspirasi dari filosofi visual Riot Games — angular, bold, geometric — namun diimplementasikan secara ringan tanpa GPU-heavy effects.

Kesan yang ingin dicapai:
- Futuristik & cinematic
- Premium & mysterious
- Immersive namun performant
- Elegan namun bold

---

## Orientasi Pengembangan

Prinsip yang menjadi panduan dalam setiap keputusan teknis dan arsitektural Feldora:

- **Security & Privacy** — Data user dilindungi, environment variables tidak ter-expose ke client tanpa prefix `VITE_`, dan semua third-party integration mengikuti least-privilege principle.
- **High Performance & Lightweight** — SSR by default, CSS-only animations, minimal dependencies, lazy loading, dan zero runtime animation libraries. Setiap byte dan millisecond diperhitungkan.
- **Modular & Scalable** — Komponen reusable (StoryCard, LogCard, Skeleton, ErrorState, Toast), folder architecture terstruktur, dan separation of concerns yang jelas antara UI, data layer, dan routing.
- **Maintainable & Fixable** — Code yang readable, TypeScript strict mode, naming conventions konsisten, DESIGN_SYSTEM.md sebagai single source of truth, dan error handling yang informatif untuk debugging cepat.

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | TanStack Start (SSR + file-based routing) |
| UI | React 19 + TypeScript |
| Styling | TailwindCSS 3.4 |
| Data Fetching | React Query (TanStack Query) |
| API | GraphQL via `graphql-request` |
| CMS | Hygraph (headless CMS) |
| Build Tool | Vite 7 |
| PWA | Manual (manifest + service worker) |
| Deployment | Vercel-ready |

---

## Folder Architecture

```
src/
├── components/
│   ├── home/            # Homepage sections (Hero, Featured, Updates, CTA)
│   ├── layout/          # Navbar, Footer (persistent layout)
│   ├── playground/      # Playground shell, module registry, types
│   │   └── modules/     # Module implementations (weather/, weather-v2/, weather-v2-5/, split-bill/, tic-tac-toe/, quick-upscaler/)
│   ├── story/           # Story list & detail components
│   └── ui/              # Reusable UI components (LogCard, Carousel)
├── constants/
│   ├── copy/              # Copywriting terpusat per halaman
│   │   ├── index.ts       # Barrel export
│   │   ├── home.ts        # Hero, Featured, Updates, CTA
│   │   ├── about.ts       # Header (with creator quote), Design Philosophy, Development Philosophy
│   │   ├── log.ts         # Section header for update log (used in About page)
│   │   ├── story.ts       # Header, Error states, Detail page
│   │   └── playground.ts  # Playground & module copy
│   ├── navigation.ts      # Navigation links array
│   ├── placeholderStories.ts  # Static placeholder articles
│   └── updateLog.ts       # Update log data & types
├── lib/
│   ├── crypto/          # Reusable encryption layer (DEK + KEK)
│   │   ├── aes.ts       # AES-GCM encrypt/decrypt primitives
│   │   ├── kek.ts       # KEK derivation (env passphrase / PIN)
│   │   ├── dek.ts       # DEK generation, wrap/unwrap
│   │   ├── types.ts     # EncryptedPayload, WrappedDEK types
│   │   └── index.ts     # Barrel export
│   ├── graphql.ts       # GraphQL queries & types (Hygraph)
│   ├── ml/              # Machine learning predictors & types
│   │   ├── rf-local-weather-forecast-v1.ts   # RF train/predict (V1)
│   │   ├── rf-local-weather-forecast-v2.ts   # RF per-slot predict (V2)
│   │   ├── gbt-local-weather-forecast-v2-5.ts # GBT per-slot predict (V2.5)
│   │   ├── types.ts     # V1 model types
│   │   ├── typesV2.ts   # V2 model types
│   │   ├── cities.ts    # 287 kota Indonesia
│   │   └── prng.ts      # Deterministic PRNG (Mulberry32)
│   ├── queries.ts       # React Query hooks (useGetPosts, useGetPostDetail)
│   └── queryClient.ts   # Query client factory
├── routes/
│   ├── __root.tsx       # Root layout (Navbar + Footer + QueryProvider + SW register)
│   ├── index.tsx        # Home page
│   ├── about.tsx        # About page (includes update log section)
│   ├── playground.tsx   # Playground layout
│   ├── playground.index.tsx  # Playground module list
│   ├── playground.local-weather-forecast.tsx  # Weather module V1 route
│   ├── playground.local-weather-forecast-v2.tsx  # Weather module V2 route
│   ├── playground.local-weather-forecast-v2-5.tsx  # Weather module V2.5 route
│   ├── playground.split-bill.tsx            # Split Bill layout (crypto gate)
│   ├── playground.split-bill.index.tsx      # Split Bill home
│   ├── playground.split-bill.create.tsx     # Create bill
│   ├── playground.split-bill.detail.$id.tsx # Bill detail
│   ├── playground.split-bill.edit.$id.tsx   # Edit bill
│   ├── playground.tic-tac-toe.tsx           # Tic Tac Toe route (lazy loaded)
│   ├── playground.quick-upscaler.tsx        # Quick Image Upscaler route (lazy loaded)
│   ├── story.tsx        # Story layout (Outlet)
│   ├── story.index.tsx  # Story list page (/story)
│   └── story.$slug.tsx  # Story detail page (/story/:slug)
├── styles/
│   └── global.css       # Tailwind directives + custom components
├── utils/
│   └── formatDate.ts    # Date formatting utility
├── env.d.ts             # Type declarations (Vite env, CSS modules)
├── router.tsx           # Router configuration
└── routeTree.gen.ts     # Auto-generated route tree (DO NOT EDIT)

public/
├── ai-models/           # Pre-trained ML models (served to browser)
├── dataset/             # Training datasets (git-ignored, not deployed)
├── manifest.json        # PWA manifest
├── sw.js                # Service worker (offline support)
├── offline.html         # Custom offline fallback page
├── feldora-logo-192.png # PWA icon (192x192) + favicon
├── feldora-logo-512.png # PWA icon (512x512) for splash screen
└── fonts/               # Custom font files

scripts/
└── local-weather-forecast/  # Dataset extraction & model training scripts
```

---

## ML Predictor Naming Convention

File predictor di `src/lib/ml/` menggunakan format:

```
{model}-{module}-{version}.ts
```

| File | Model | Module | Version |
|------|-------|--------|---------|
| `rf-local-weather-forecast-v1.ts` | Random Forest | Local Weather Forecast | V1 |
| `rf-local-weather-forecast-v2.ts` | Random Forest | Local Weather Forecast | V2 |
| `gbt-local-weather-forecast-v2-5.ts` | Gradient Boosted Trees | Local Weather Forecast | V2.5 |

Konvensi ini memudahkan identifikasi:
- **Model** yang digunakan (rf, gbt, nn, dll)
- **Module** playground mana yang menggunakannya
- **Version** iterasi mana

File types (`types.ts`, `typesV2.ts`) dan shared utilities (`cities.ts`, `prng.ts`) tidak mengikuti konvensi ini karena bersifat generic/shared.

---

## Routing

| Path | Page | Deskripsi |
|------|------|-----------|
| `/` | Home | Landing page — Hero carousel + Featured (API) + CTA (Playground) + Updates |
| `/about` | About | Vision, design philosophy, development philosophy, update log (infinite scroll) |
| `/playground` | Playground | Module eksperimen (AI, Tool, Game) — dynamic loading |
| `/playground/tic-tac-toe` | Tic Tac Toe | Game 3×3, PvP & PvC (bot Easy/Medium/Hard Minimax) |
| `/playground/quick-upscaler` | Quick Image Upscaler | In-browser upscaling via Bicubic, Lanczos3, FSR1, Jinc EWA — WebGPU accelerated |
| `/story` | Story List | Grid card articles (dari Hygraph atau placeholder) |
| `/story/:slug` | Story Detail | Full article — title, meta, image, content HTML |
| `*` (catch-all) | 404 Not Found | Error page untuk route yang tidak ada |

Route `/story` berfungsi sebagai layout route (`<Outlet />`), dengan child:
- `/story/` → `story.index.tsx` (list)
- `/story/$slug` → `story.$slug.tsx` (detail)

Route `/about#log` — deep link langsung ke section update log di halaman About.

---

## Color Palette

Dark-only theme dengan dual-tone accent (purple + orange). Semua warna didefinisikan di `tailwind.config.ts` sebagai `feldora.*`:

| Token | Hex | Penggunaan |
|-------|-----|-----------|
| `feldora-bg` | `#0a0a0f` | Background utama body |
| `feldora-surface` | `#12121a` | Card/panel background |
| `feldora-surface-light` | `#1a1a26` | Elevated surface, hover state |
| `feldora-border` | `#2a2a3a` | Border card, divider |
| `feldora-accent` | `#8b5cf6` | Primary accent (ungu) — buttons, heading highlights, hover borders |
| `feldora-accent-soft` | `#6d28d9` | Accent muted/darker |
| `feldora-accent-glow` | `rgba(139, 92, 246, 0.15)` | Glow/shadow accent |
| `feldora-accent-secondary` | `#f97316` | Secondary accent (orange) — markers, labels, badges, tags, decorative elements |
| `feldora-muted` | `#6b7280` | Teks tertiary, placeholder |
| `feldora-text` | `#f5f5f7` | Teks utama (putih) |
| `feldora-text-secondary` | `#a1a1aa` | Teks sekunder |

### Distribusi Warna Dual-Tone

| Elemen | Warna | Alasan |
|--------|-------|--------|
| Buttons (CTA) | Ungu (`accent`) | Interaktif, perlu standout |
| Heading accent words | Ungu (`accent`) | Emphasis di judul section |
| Card hover borders | Ungu (`accent`) | Feedback interaksi |
| Diamond markers | Orange (`accent-secondary`) | Dekoratif, section indicator |
| Hex badges | Orange (`accent-secondary`) | Penomoran, ranking |
| Section labels (mono) | Orange (`accent-secondary`) | Label kecil di atas heading |
| Category tags (StoryCard) | Orange (`accent-secondary`) | Badges kategori |
| Logo bar (Navbar/Footer) | Orange (`accent-secondary`) | Brand identity mark |
| Navbar active indicator | Orange (`accent-secondary`) | Navigasi state |
| Panel frame corners | Orange (`accent-secondary`) | Dekoratif frame |
| GlobalLoader | Gradient ungu → orange | Transisi visual dinamis |
| Scrollbar hover | Orange (`accent-secondary`) | Micro-interaction |

---

## Typography

- **Sans-serif**: Inter (weight 300-900) — headings & body
- **Monospace**: JetBrains Mono (weight 400-500) — labels, tags, dates, code

Hierarchy:
- Page headings: `text-5xl md:text-7xl font-black uppercase tracking-tight`
- Section headings: `text-4xl md:text-5xl font-black uppercase`
- Card titles: `text-xl font-bold uppercase tracking-wide`
- Body text: `text-base text-feldora-text-secondary leading-relaxed`
- Labels/tags: `font-mono text-xs uppercase tracking-[0.3em]`

---

## Geometric Design Language

Elemen visual angular/geometric yang menjadi identitas Feldora:

### Diamond Marker (`.diamond-marker`)
Kotak kecil dirotasi 45° — digunakan sebagai bullet/indicator section.

### Card Polygon (`.card-polygon`)
Card dengan sudut kanan bawah terpotong (clip-path). Memberikan kesan sci-fi panel.

### Hex Badge (`.hex-badge`)
Badge heksagonal untuk nomor versi/ranking. Menggunakan clip-path polygon.

### Panel Frame (`.panel-frame`)
Container dengan corner accent orange (border-corner) di top-left dan bottom-right.

### Angular Buttons (`.btn-angular-*`)
Tombol CTA dengan clip-path parallelogram — bukan rounded, bukan square.
- `.btn-angular-primary` — background ungu, text putih
- `.btn-angular-outline` — border only, transparent bg

### Clip Utilities
- `.clip-notch-br` — Bottom-right corner notch
- `.clip-arrow-right` — Arrow/chevron shape (untuk tags)
- `.clip-parallelogram` — Jajaran genjang (active indicator navbar)

---

## Section Patterns

### Hero Section
- Full-height (`min-h-screen`)
- **Carousel** dengan 5 slide (auto-scroll 10 detik, pause on hover):
  1. **Intro** — Grid 7:5 (judul FELDORA + deskripsi kiri, geometric art kanan). CTA scroll ke Featured section.
  2. **Playground: Weather** — Local Weather Forecast module showcase dengan ilustrasi rain prediction
  3. **Playground: Split Bill** — Split Bill module showcase dengan ilustrasi receipt + QR sharing
  4. **Latest Story** — Judul + excerpt dari Hygraph API (dengan featured image), fallback "Explore Stories" jika offline
  5. **About/Log** — Ringkasan platform dengan ilustrasi blueprint/design system
- Background: subtle grid pattern + diagonal accent slabs
- Corner frame decorations (border-corner elements)
- Bottom: SVG angular cut sebagai divider

### Content Sections
- Skewed background panels (`-skew-y-1`) untuk visual depth
- Diagonal decorative lines (`rotate-[-35deg]`)
- Gradient accent lines di top/bottom
- Diamond marker + mono label sebagai section identifier
- Menggunakan `SectionHeader` component untuk konsistensi header antar section

### SectionHeader Component (`src/components/ui/SectionHeader.tsx`)

Komponen reusable untuk header section yang konsisten di seluruh halaman. Digunakan di:
- **FeaturedSection** (home) — dengan trailing decorative line
- **LatestUpdates** (home) — dengan trailing CTA link ke `/about#log`
- **About page** (design philosophy, development philosophy, update log sections)

#### Props

| Prop | Type | Default | Deskripsi |
|------|------|---------|-----------|
| `label` | `string` | required | Label kecil (orange, mono, uppercase) di atas heading |
| `heading` | `string` | required | Judul utama |
| `headingAccent` | `string` | required | Bagian heading yang di-highlight ungu |
| `headingSize` | `string` | `"text-4xl md:text-5xl"` | Override ukuran heading |
| `trailing` | `ReactNode` | — | Elemen di kanan (CTA link, garis dekoratif, dll) |

#### Layout

```
[◆ diamond] [LABEL orange]
HEADING HEADINGACCENT(ungu)           [trailing element]
```

#### Catatan
- Berbeda dengan `PageHeader` yang untuk heading utama halaman (full-width, dengan description).
- `SectionHeader` untuk sub-section di dalam halaman (lebih compact, tanpa description, dengan trailing support).

### Cards
- Image top + content bottom
- Gradient overlay pada image (from-feldora-surface)
- Arrow-shaped category tag (`.clip-arrow-right`)
- Corner brackets yang muncul on-hover
- "Read Story" text yang slide-in on-hover

### Carousel Component (`src/components/ui/Carousel.tsx`)

Komponen reusable untuk carousel/slider. Digunakan di:
- **HeroSection** (home) — 5 slides, autoScroll 10 detik

#### Props

| Prop | Type | Default | Deskripsi |
|------|------|---------|-----------|
| `children` | `ReactNode[]` | required | Array of slide content |
| `autoScroll` | `boolean` | `false` | Enable auto-advance |
| `interval` | `number` | `10000` | Auto-scroll interval (ms) |
| `pauseOnHover` | `boolean` | `true` | Pause auto-scroll saat hover |
| `minHeight` | `string` | `"min-h-[400px] md:min-h-[450px]"` | Min height slide container |
| `showIndicators` | `boolean` | `true` | Tampilkan dot indicators |
| `showCounter` | `boolean` | `true` | Tampilkan "01 / 04" counter |
| `showArrows` | `boolean` | `true` | Tampilkan tombol prev/next |

#### Perilaku
- Slide aktif: `opacity-100 pointer-events-auto`, slide lain: `opacity-0 pointer-events-none`
- Transition: `duration-700 ease-in-out` (slide + fade)
- Prev/Next arrows di bottom-right (orange accent, fill on hover)
- Dot indicators di bottom-left (active = bar orange, inactive = dot abu-abu)
- Pause on hover mencegah auto-advance saat user berinteraksi

---

## Animation Strategy

Semua animasi ringan, CSS-only, tanpa library external:

| Animation | Durasi | Penggunaan |
|-----------|--------|-----------|
| `fade-in` | 0.6s | Elemen statis yang appear |
| `fade-up` | 0.6s | Content yang slide up + fade |
| `slide-in` | 0.5s | Horizontal slide content |
| `glow` | 2s loop | Subtle glow pada accent elements |

Hover transitions:
- Card lift: `hover:-translate-y-1`
- Image zoom: `group-hover:scale-110 duration-700`
- Border color: `hover:border-feldora-accent/40 duration-300`
- Text color: `group-hover:text-feldora-accent duration-300`

---

## Update Log System

Update log ditampilkan sebagai section terakhir di halaman `/about` (bukan route terpisah). Menggunakan **infinite scroll** (5 entri per batch, 300ms debounce) agar performa tetap baik saat log semakin banyak. Deep link: `/about#log`.

### Data Structure (`src/constants/updateLog.ts`)

```typescript
type UpdateStatus = 'minor' | 'moderate' | 'major'
type UpdateCategory = 'update' | 'fixing' | 'refactor' | 'revamp'

interface UpdateEntry {
  date: string          // Tanggal update (format: "2 June 2026")
  title: string         // Judul/ringkasan update
  status: UpdateStatus  // Level dampak update
  type: UpdateCategory  // Kategori jenis perubahan
  version: string       // Versi (format semver: "1.0.0")
  description: string   // Deskripsi detail, max 150 karakter
}
```

### Aturan Penulisan Log

- **`description`**: Maksimal **150 karakter**. Ringkas, padat, tanpa detail implementasi. Jika perlu lebih detail, tulis di commit message atau PR description.
- **`title`**: Ringkasan perubahan utama dalam satu baris.
- **`version`**: Mengikuti semver — major (breaking/rebuild), moderate (fitur baru), minor (fix/tweak).

### Versioning Rules

Format: `MAJOR.MINOR.PATCH`

| Increment | Kapan | Contoh |
|-----------|-------|--------|
| **MAJOR** | Rebuild/redesign fundamental, breaking changes | 1.0.0 → 2.0.0 |
| **MINOR** | Fitur baru, module baru, perubahan signifikan | 1.10.0 → 1.11.0 |
| **PATCH** | Bug fix, UI tweak, refactor kecil | 1.11.0 → 1.11.1 |

Aturan:
- Log harus **descending** (terbaru di atas)
- Version harus **monoton naik** — setiap entry memiliki version lebih tinggi dari entry di bawahnya
- `package.json` version selalu sama dengan entry log teratas
- Jangan skip version (1.10.0 → 1.12.0) kecuali ada alasan kuat
- Jika beberapa perubahan di hari yang sama, tetap gunakan version terpisah per entry

### Status Mapping (Warna Tag)

| Status | Label | Warna | Class |
|--------|-------|-------|-------|
| `minor` | Minor | Abu-abu | `border-feldora-muted text-feldora-muted` |
| `moderate` | Moderate | Kuning-orange | `border-amber-400/60 text-amber-400` |
| `major` | Major | Merah | `border-feldora-accent text-feldora-accent` |

Tag status memiliki fixed width `w-16` agar konsisten antar value yang berbeda.

### Type Mapping (Icon & Warna)

| Type | Label | Icon | Warna |
|------|-------|------|-------|
| `update` | Update | Circle-up / arrow up dalam lingkaran (Heroicons, stroke) | Hijau (`text-emerald-400`) |
| `fixing` | Fixing | Wrench + screwdriver menyilang (Heroicons, stroke) | Merah (`text-red-400`) |
| `refactor` | Refactor | Broom / sapu (Font Awesome, filled) | Orange (`text-orange-400`) |
| `revamp` | Revamp | Sparkles / bintang-bintang (Heroicons, stroke) | Biru (`text-sky-400`) |

Icon ditampilkan tanpa border/background, hanya icon berwarna. Saat di-hover, muncul tooltip di sebelah kanan icon yang menampilkan label type.

---

## LogCard Component (`src/components/ui/LogCard.tsx`)

Komponen reusable untuk menampilkan satu entry update log. Digunakan di:
- **Home page** (`LatestUpdates.tsx`) — tanpa accent bar
- **Update Log page** (`log.tsx`) — dengan accent bar

### Props

| Prop | Type | Default | Deskripsi |
|------|------|---------|-----------|
| `entry` | `UpdateEntry` | required | Data entry dari `WEB_UPDATE_LOG` |
| `number` | `number` | required | Nomor urut (ditampilkan di hex badge) |
| `showAccentBar` | `boolean` | `false` | Tampilkan garis vertikal merah di kiri saat hover |

### Perilaku

- **Accordion** — Card bisa di-click untuk expand/collapse description
- **Truncate** — Title di-truncate saat card tertutup, tampil penuh saat terbuka
- **Arrow indicator** — Chevron di ujung kanan, rotate 180° saat open
- **Keyboard accessible** — Support Enter & Space untuk toggle

### Layout

**Desktop (sm+):**
```
[Hex#] [Date/Version] [Status Tag] [Type Icon] | Title... | [▼]
```

**Mobile (<sm):**
```
[Hex#] [Date/Version] ........... [Status Tag] [Type Icon]
Title...
```

Pada mobile, status & type icon di-push ke ujung kanan (`ml-auto`) sejajar dengan nomor dan date/version.

### Styling

- Container: `clip-notch-br bg-feldora-surface border border-feldora-border/40`
- Hover: `hover:border-feldora-accent/30`
- Accent bar (optional): `w-[3px]` di sisi kiri, transparan → merah saat hover
- Accordion content: border-top separator, padding internal
- Version: ditampilkan di bawah date dengan font lebih kecil (`text-[10px]`) dan warna lebih muted

---

## PWA (Progressive Web App)

Feldora diimplementasikan sebagai PWA installable dengan offline support.

> Dokumentasi lengkap: **[PWA_OFFLINE.md](./PWA_OFFLINE.md)**

### Ringkasan

| Aspek | Implementasi |
|-------|-------------|
| Service Worker | `public/sw.js` — plain JS, no bundling |
| Caching | Cache-first (assets), Network-first (navigation) |
| Update strategy | Selective download (hanya halaman yang pernah dikunjungi) |
| Update UX | Seamless auto-activate saat app di-relaunch; prompt hanya jika user aktif |
| Offline | Halaman yang pernah dibuka berfungsi penuh offline |
| Manifest | `public/manifest.json` — standalone, dark theme |

### Key Behaviours

- **First install**: precache root + offline.html, activate langsung
- **Update detected**: re-fetch HTML + JS/CSS chunks untuk visited pages → staging → activate
- **Offline fallback**: exact URL → parent path → root → offline.html
- **Version detection**: `SW_VERSION` constant di sw.js harus di-bump setiap deploy

### Files

```
public/sw.js                         # Production Service Worker
public/manifest.json                 # PWA manifest
public/offline.html                  # Offline fallback page
src/components/ui/UpdatePrompt.tsx   # Update notification (shown when user active)
src/routes/__root.tsx                # Registration + event bridge
```

---

## Error & Loading State Handling

Sistem penanganan error dan loading state untuk UX yang konsisten di seluruh app.

### Komponen

| Komponen | Lokasi | Fungsi |
|----------|--------|--------|
| `GlobalLoader` | `src/components/ui/GlobalLoader.tsx` | Loading bar merah di top saat route transition |
| `Skeleton` | `src/components/ui/Skeleton.tsx` | Reusable skeleton blocks & presets (card, article, grid) |
| `ErrorState` | `src/components/ui/ErrorState.tsx` | Reusable error UI dengan retry & back button |
| `ErrorPage` | `src/components/layout/ErrorPage.tsx` | Global error boundary — runtime crash fallback |
| `NotFoundPage` | `src/components/layout/NotFoundPage.tsx` | 404 page untuk route yang tidak dikenali |
| `OfflineBanner` | `src/components/ui/OfflineBanner.tsx` | Notifikasi dismissible saat koneksi terputus |
| `ToastProvider` | `src/components/ui/Toast.tsx` | Notification system (success/error/warning/info) |

### Global Loader

- Loading bar merah 3px di paling atas halaman (`z-[100]`)
- Muncul otomatis saat navigasi antar route (listen `onBeforeNavigate` & `onResolved`)
- Animasi `loading-bar` (translateX loop)
- Dipasang di `__root.tsx` di atas Navbar

### Skeleton Components

- `Skeleton` — block dasar (ukuran via className)
- `SkeletonCard` — skeleton story card (image + text)
- `SkeletonArticle` — skeleton halaman artikel
- `SkeletonCardGrid` — grid skeleton cards (prop `count`)

### ErrorState (Reusable)

Props:
- `label` — label kecil (default: "Connection Error")
- `title` — judul error
- `message` — deskripsi
- `onRetry` — callback retry
- `backTo` / `backText` — tombol navigasi kembali

### Error Boundary

- Dipasang via `errorComponent` di root route
- Menangkap runtime render errors di semua child routes
- Tampilkan tombol "Try Again" (invalidate router) dan "Return Home"

### Offline Banner

- Posisi: fixed top-right (di bawah navbar)
- Muncul otomatis saat `navigator.onLine === false`
- Dismissible via tombol X
- Reset saat koneksi kembali lalu putus lagi

### Toast System

- Provider: `ToastProvider` membungkus seluruh app di `__root.tsx`
- Hook: `useToast()` → `toast(message, type)`
- 4 tipe: `success` (hijau), `error` (merah), `warning` (kuning), `info` (biru)
- Auto dismiss 4 detik, bisa dismiss manual
- Posisi: fixed bottom-right, stack vertikal

### Alur Error di Story Pages

**StoryList (Infinite Scroll):**
1. Initial loading → `SkeletonCardGrid` (12 cards)
2. Error → `ErrorState` dengan retry
3. Empty → `ErrorState` pesan "Belum ada cerita"
4. Success → render story cards (12 per page)
5. Scroll ke bawah → `Spinner` + auto-fetch next page
6. Semua loaded → "All stories loaded" text

**StoryDetail:**
1. Cek placeholder dulu — kalau slug cocok, langsung render tanpa tunggu API
2. Loading (tanpa placeholder) → `SkeletonArticle`
3. Error (tanpa placeholder) → `ErrorState` dengan retry + back
4. Not found → 404 UI
5. Success → render artikel

---

## Infinite Scroll (`StoryList`)

Story list menggunakan `useInfiniteQuery` dari React Query dengan pagination 12 post per page.

### Mekanisme
- `IntersectionObserver` pada div trigger di bawah grid
- Saat trigger element terlihat di viewport (threshold 0.1), otomatis `fetchNextPage()`
- Loading next page menampilkan `Spinner` (circle loader)
- Berhenti fetch saat `hasNextPage === false`
- `allPosts` di-memoize dengan `useMemo` agar flatMap hanya di-recalculate saat data berubah, bukan setiap render

### Data Source
- **Production**: Hygraph GraphQL — `getPostsPaginated(page, perPage)` menggunakan `first`, `skip`, dan `pageInfo.hasNextPage`
- **Mock (testing)**: `src/lib/mockPosts.ts` — 36 mock posts, 800ms simulated delay, tersedia untuk development/testing di masa depan

### Spinner Component (`src/components/ui/Spinner.tsx`)

Reusable circle loader dengan props:
- `size` — Tailwind width/height classes (default: `"w-6 h-6"`)
- `className` — tambahan class (misal `"border-4"` untuk lebih tebal)

```tsx
<Spinner />                  // default
<Spinner size="w-4 h-4" />   // kecil
<Spinner size="w-10 h-10" /> // besar
```

---

## API Architecture

### GraphQL (Hygraph CMS)
Endpoint: `VITE_GRAPH_CMS_ENDPOINT` (environment variable)

Queries:
- `getPosts()` — List semua post (title, slug, excerpt, image, category, author, date)
- `getPostDetail(slug)` — Detail post (+ content HTML, author photo)

### React Query Hooks
- `useGetPosts()` — staleTime 1 hour (legacy, non-paginated)
- `useGetPostsPaginated()` — `useInfiniteQuery`, 12 posts per page, staleTime 1 hour
- `useGetPostDetail(slug)` — enabled only when slug exists

Fallback: Jika API endpoint tidak tersedia, Story page menampilkan placeholder articles.

---

## Content Rendering

Post content dari Hygraph di-render sebagai raw HTML menggunakan `dangerouslySetInnerHTML`.
Styling via `.prose-feldora` class yang men-style:
- Headings, paragraphs, links
- Lists (ordered & unordered)
- Blockquotes (border-left accent)
- Inline code & code blocks

---

## Localization (i18n)

Story posts support optional Indonesian localization via Hygraph's built-in locale system.

**Locales:** `en` (default), `id_ID` (Indonesian)

**Localized fields:** `title`, `excerpt`, `content`

**Behaviour:**
- `getPostDetail` fetches both `en` content and `localizations(includeCurrent: false)` which returns `id_ID` if available
- If Indonesian content exists → language toggle (EN | ID) shown on story detail page (orange border, orange active state)
- Toggle switches title + content body between languages
- If no Indonesian locale → toggle hidden, only English shown

**Query approach:**
```graphql
post(where: { slug: $slug }, locales: [en, id_ID]) {
  title, content { html }
  localizations(includeCurrent: false) { locale, title, excerpt, content { html } }
}
```
- Images (full-width, rounded)
- First letter drop cap (text-5xl accent color)

---

## Performance Principles

- **SSR by default** — TanStack Start renders all pages server-side
- **Automatic code splitting** — setiap route di-lazy-load
- **Manual chunk grouping** — Module dengan multi-route (seperti Split Bill) di-bundle menjadi 1 chunk via Vite `manualChunks` di `vite.config.ts`. Ini memastikan seluruh module ter-load sekali saat pertama kali dibuka, tanpa request tambahan untuk sub-pages.
- **CSS-only animations** — tanpa Framer Motion atau runtime library
- **Lazy loading images** — `loading="lazy"` pada semua non-critical images
- **Minimal dependencies** — hanya 8 production deps
- **PWA caching** — halaman yang pernah dikunjungi tersedia offline
- **No client-side routing waterfall** — React Query hanya untuk dynamic Story data

---

## Development Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build (SSR + client)
npm run preview  # Preview production build
npm run lint     # TypeScript type check (tsc --noEmit)
```

---

## Deployment

**Platform:** Vercel (auto-deploy dari GitHub repo)

**Setup:**
1. Install `nitro` sebagai dependency: `npm i nitro`
2. Tambahkan plugin `nitro()` di `vite.config.ts`:
   ```ts
   import { nitro } from 'nitro/vite'
   // ...
   plugins: [tanstackStart(), nitro(), react()]
   ```
3. `vercel.json` dibiarkan kosong `{}` — Vercel auto-detect dari `.output/nitro.json`
4. Di Vercel Dashboard → Framework Preset: pilih **TanStack Start**

**Alur deploy:**
1. Push ke GitHub → Vercel otomatis build & deploy
2. `npm run build` menghasilkan `.output/` directory (format Nitro/Vercel)
3. Vercel membaca `.output/nitro.json` dan deploy sebagai serverless SSR

**Environment Variables (Vercel Dashboard → Settings → Environment Variables):**
- `VITE_GRAPH_CMS_ENDPOINT` — Hygraph GraphQL endpoint
- `VITE_SPLIT_BILL_KEK` — Encryption passphrase for Split Bill module (required to enable the module)

**Catatan:**
- Tanpa plugin `nitro`, build output ke `dist/` yang tidak dipahami Vercel untuk SSR
- Dengan plugin `nitro`, build output ke `.output/` yang merupakan format standar Vercel
- `vercel.json` TIDAK perlu rewrites — SSR menangani semua routing di server
- Jangan gunakan `"framework": "vite"` di vercel.json — itu untuk static site saja

---

## Catatan Penting

1. **`routeTree.gen.ts`** — File ini auto-generated oleh TanStack Router. JANGAN diedit manual. Akan di-regenerate setiap kali dev server start.

2. **Story layout route** — `/story` route (`story.tsx`) hanya berisi `<Outlet />`. Content sebenarnya ada di `story.index.tsx` (list) dan `story.$slug.tsx` (detail).

3. **Hygraph endpoint** — Didefinisikan di `.env` sebagai `VITE_GRAPH_CMS_ENDPOINT`. Tanpa ini, Story page akan menampilkan placeholder data.

4. **Design adalah dark-only** — Tidak ada light theme. Background selalu `#0a0a0f`. Semua warna di-hardcode di Tailwind config, bukan CSS variables.

5. **Clip-path components** — Card dan button menggunakan CSS `clip-path`. Ini berarti `border-radius` tidak berlaku pada elemen-elemen ini. Visual "rounded" diganti dengan "angular cut".

6. **404 Page** — Di-handle via `notFoundComponent` di `__root.tsx`. Menampilkan "404" besar dengan corner accent merah, pesan "Lost in the void", dan tombol "Return Home". Tidak perlu file route terpisah — TanStack Router otomatis menampilkan component ini untuk semua route yang tidak dikenali.

7. **Nitro plugin** — Wajib untuk deployment Vercel. Tanpa `nitro()` di vite plugins, build output tidak compatible dengan Vercel serverless.

8. **Routing links:**
   - Internal route (mengarah ke halaman website sendiri) → **WAJIB** menggunakan `<Link>` dari `@tanstack/react-router`. Ini memastikan client-side navigation tanpa full page reload. Gunakan `<a>` hanya jika ada kebutuhan spesifik yang tidak bisa di-cover oleh `<Link>`.
   - External route (mengarah ke domain luar seperti GitHub, Discord, dll) → boleh menggunakan tag `<a>` biasa dengan `target="_blank"` dan `rel="noopener noreferrer"`.

9. **PWA & Service Worker** — Service worker (`public/sw.js`) hanya di-register di production (bukan localhost). Saat develop, SW tidak aktif sehingga perubahan langsung terlihat. Saat deploy perubahan besar, bump semua tiga cache name (`feldora-v2`, `feldora-pages-v2`, `feldora-assets-v2`) ke versi berikutnya secara bersamaan agar cache lama terhapus.

10. **Copywriting terpusat** — Semua teks/copy di-manage dari `src/constants/copy/`. Setiap halaman punya file sendiri (`home.ts`, `about.ts`, `log.ts`, `story.ts`). Khusus playground, semua module menggunakan `playground.ts` yang berisi copy untuk setiap module: `weather`, `weatherV2`, `weatherV2_5`, `quickUpscaler`, `ticTacToe`, `splitBill`. Untuk ubah teks di website, cukup edit file di directory ini tanpa perlu sentuh komponen.

11. **Auto-version di Footer** — Footer menampilkan versi website yang otomatis dibaca dari `package.json` via Vite `define`. Didefinisikan di `vite.config.ts` sebagai `__APP_VERSION__` (string replacement saat build, zero runtime cost). Cukup update `version` di `package.json`, footer otomatis ikut. Perlu restart dev server jika version berubah saat dev sedang jalan. Gunakan `typeof __APP_VERSION__ !== 'undefined'` guard untuk mencegah ReferenceError di SSR context.

---

## Playground System

### Konsep

`/playground` adalah halaman host untuk module-module eksperimen — tool, AI, atau game kecil yang berjalan di browser. Setiap module bersifat independen, di-load secara dynamic (lazy), dan tidak mempengaruhi halaman lain.

### Arsitektur

```
src/components/playground/
├── types.ts                  # Interface: PlaygroundModule, ModuleInstance, ModuleLabel
├── moduleRegistry.ts         # Manifest semua module yang terdaftar
├── PlaygroundShell.tsx        # Shell: header, module cards, lifecycle
└── modules/
    └── <module-name>/        # Tiap module punya folder sendiri
        ├── ModuleComponent.tsx
        └── ...helpers
```

### Module Manifest

Setiap module didaftarkan di `moduleRegistry.ts` dengan interface:

```typescript
interface PlaygroundModule {
  id: string                     // Unique identifier (kebab-case), dipakai sebagai route path
  name: string                   // Display name
  description: string            // Deskripsi singkat
  label: ModuleLabel             // 'AI' | 'Tool' | 'Game'
  lastUpdated: string            // Tanggal update terakhir (format: "20 June 2026")
  estimatedDownloadSize: string  // Estimasi ukuran chunk + asset
  cacheCheckUrl?: string         // URL asset utama untuk cek offline status (opsional)
  deviceSupport: DeviceSupportSpec  // WAJIB — kompatibilitas desktop & mobile
}

type DeviceCompatibility = 'smooth' | 'limited' | 'unsupported'

interface DeviceSupportSpec {
  desktop: DeviceCompatibility
  mobile: DeviceCompatibility
}
```

`cacheCheckUrl` opsional karena:
- Module dengan external model/data (AI) perlu cek apakah asset sudah di-cache
- Module pure client-side (Game, Tool) offline by default setelah JS chunk ter-cache — tidak perlu field ini

`deviceSupport` **wajib** untuk semua module. Nilai yang valid:
- `smooth` — berjalan tanpa catatan (✓ hijau di module card)
- `limited` — berjalan tapi ada batasan signifikan, misal WebGPU tidak tersedia di browser tersebut (⚠ amber)
- `unsupported` — tidak berjalan (✗ muted)

### Label Warna

| Label | Warna | Use Case |
|-------|-------|----------|
| `AI` | Purple (accent) | Module yang menggunakan model ML |
| `Tool` | Yellow (amber-400) | Utility/tool umum |
| `Game` | Emerald green | Mini-game atau interaktif |

### Module Lifecycle

```
idle → loading → ready → [active]
                → error → [retry → loading]
```

| State | UI |
|-------|-----|
| `idle` | Card dengan tombol "Load Module" |
| `loading` | Teks "Loading..." pulse animation |
| `ready` | Component di-render, card list disembunyikan |
| `error` | Error message + tombol "Retry" |

### Aturan Module

1. **Route-based loading** — Setiap module punya route file sendiri (`playground.<module-id>.tsx`)
2. **Self-contained** — Setiap module mengelola state, assets, dan error handling sendiri
3. **No side effects** — Module tidak boleh modify global state atau halaman lain
4. **Lazy by default** — TanStack Router code-split per route file, module hanya di-load saat halaman dibuka
5. **Asset singleton** — Model/data yang besar di-cache di module-level variable (bukan component state)

### Konvensi File

- Module route: `src/routes/playground.<module-id>.tsx`
- Module component: `export default function ModuleName()` (harus default export)
- Module folder: `src/components/playground/modules/<kebab-case-name>/`
- Assets AI: `public/ai-models/<module-name>/model.json`
- Dataset: `public/dataset/<module-name>/` (git-ignored, tidak deploy)
- Scripts: `scripts/<module-name>/`

### Dokumentasi Module

Detail lengkap setiap module didokumentasikan di `PLAYGROUND_MODULES.md` di root project.

### Routing

Setiap module memiliki route sendiri di bawah `/playground`:
- `/playground` → layout (Outlet)
- `/playground/` → index (module list + search)
- `/playground/<module-id>` → halaman module (lazy loaded via route code-splitting)

Module tidak di-load saat initial render website maupun saat halaman playground index dibuka. Chunk hanya di-download ketika user navigasi ke route module tersebut.

### Offline Support

- Module yang pernah dibuka tersedia secara offline (SW cache page + model)
- Status offline di-detect via **Cache API** (`caches.match(cacheCheckUrl)`) — single source of truth
- Badge ditampilkan di module card: "Offline Ready" (hijau) atau "Not Loaded" (abu-abu)
- Model singleton (`cachedModel`) di memory tetap tersedia selama tab tidak di-refresh, meskipun cache dihapus
- Di localhost (dev), Cache API kosong karena SW tidak aktif — badge selalu "Not Loaded"

### Not Found Handling

Route `/playground/*` yang tidak ada menampilkan `NotFoundPage` dengan props:
- label: "Module not found"
- backTo: `/playground`

`NotFoundPage` adalah component reusable dengan props untuk label, message, backTo, dan backText.

