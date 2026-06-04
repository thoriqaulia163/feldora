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
│   ├── story/           # Story list & detail components
│   └── ui/              # Reusable UI components (LogCard)
├── constants/
│   ├── copy/              # Copywriting terpusat per halaman
│   │   ├── index.ts       # Barrel export
│   │   ├── home.ts        # Hero, Featured, Updates, CTA
│   │   ├── about.ts       # Header, Philosophy, Platform, Values, Creator
│   │   ├── log.ts         # Header
│   │   └── story.ts       # Header, Error states, Detail page
│   ├── navigation.ts      # Navigation links array
│   ├── placeholderStories.ts  # Static placeholder articles
│   └── updateLog.ts       # Update log data & types
├── lib/
│   ├── graphql.ts       # GraphQL queries & types (Hygraph)
│   ├── queries.ts       # React Query hooks (useGetPosts, useGetPostDetail)
│   └── queryClient.ts   # Query client factory
├── routes/
│   ├── __root.tsx       # Root layout (Navbar + Footer + QueryProvider + SW register)
│   ├── index.tsx        # Home page
│   ├── about.tsx        # About page
│   ├── log.tsx          # Changelog page
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
├── manifest.json        # PWA manifest
├── sw.js                # Service worker (offline support)
├── offline.html         # Custom offline fallback page
├── feldora-logo-2.webp  # Logo / PWA icon
└── fonts/               # Custom font files
```

---

## Routing

| Path | Page | Deskripsi |
|------|------|-----------|
| `/` | Home | Landing page — Hero + Featured + Updates + CTA |
| `/about` | About | Vision, philosophy, values, creator |
| `/log` | Log | Changelog/update history (timeline) |
| `/story` | Story List | Grid card articles (dari Hygraph atau placeholder) |
| `/story/:slug` | Story Detail | Full article — title, meta, image, content HTML |
| `*` (catch-all) | 404 Not Found | Error page untuk route yang tidak ada |

Route `/story` berfungsi sebagai layout route (`<Outlet />`), dengan child:
- `/story/` → `story.index.tsx` (list)
- `/story/$slug` → `story.$slug.tsx` (detail)

---

## Color Palette

Dark-only theme. Semua warna didefinisikan di `tailwind.config.ts` sebagai `feldora.*`:

| Token | Hex | Penggunaan |
|-------|-----|-----------|
| `feldora-bg` | `#0a0a0f` | Background utama body |
| `feldora-surface` | `#12121a` | Card/panel background |
| `feldora-surface-light` | `#1a1a26` | Elevated surface, hover state |
| `feldora-border` | `#2a2a3a` | Border card, divider |
| `feldora-accent` | `#dc2626` | Primary accent (merah) — CTA, highlight |
| `feldora-accent-soft` | `#991b1b` | Accent muted |
| `feldora-accent-glow` | `rgba(220,38,38,0.15)` | Glow/shadow accent |
| `feldora-muted` | `#6b7280` | Teks tertiary, placeholder |
| `feldora-text` | `#f5f5f7` | Teks utama (putih) |
| `feldora-text-secondary` | `#a1a1aa` | Teks sekunder |

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
Container dengan corner accent merah (border-corner) di top-left dan bottom-right.

### Angular Buttons (`.btn-angular-*`)
Tombol CTA dengan clip-path parallelogram — bukan rounded, bukan square.
- `.btn-angular-primary` — background merah, text putih
- `.btn-angular-outline` — border only, transparent bg

### Clip Utilities
- `.clip-notch-br` — Bottom-right corner notch
- `.clip-arrow-right` — Arrow/chevron shape (untuk tags)
- `.clip-parallelogram` — Jajaran genjang (active indicator navbar)

---

## Section Patterns

### Hero Section
- Full-height (`min-h-screen`)
- Grid 7:5 (text kiri, geometric art kanan)
- Background: subtle grid pattern + diagonal accent slabs
- Corner frame decorations (border-corner elements)
- Bottom: SVG angular cut sebagai divider

### Content Sections
- Skewed background panels (`-skew-y-1`) untuk visual depth
- Diagonal decorative lines (`rotate-[-35deg]`)
- Gradient accent lines di top/bottom
- Diamond marker + mono label sebagai section identifier

### Cards
- Image top + content bottom
- Gradient overlay pada image (from-feldora-surface)
- Arrow-shaped category tag (`.clip-arrow-right`)
- Corner brackets yang muncul on-hover
- "Read Story" text yang slide-in on-hover

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
  description: string   // Deskripsi detail (ditampilkan di accordion)
}
```

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

Feldora diimplementasikan sebagai PWA untuk pengalaman installable dan offline support.

### File PWA

| File | Lokasi | Fungsi |
|------|--------|--------|
| `manifest.json` | `public/manifest.json` | Metadata app (nama, icon, display mode, warna) |
| `sw.js` | `public/sw.js` | Service worker — caching & offline fallback |
| `offline.html` | `public/offline.html` | Halaman custom saat user offline dan cache tidak tersedia |

### Manifest

```json
{
  "short_name": "Feldora",
  "name": "FELDORA — A Cinematic Digital Universe",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#0a0a0f",
  "background_color": "#0a0a0f",
  "orientation": "portrait-primary"
}
```

- `display: standalone` — app terbuka tanpa browser UI (address bar hilang)
- Warna theme & background menggunakan `feldora-bg` agar splash screen konsisten

### Service Worker Strategy

| Resource | Strategy | Alasan |
|----------|----------|--------|
| Same-origin pages & assets | **Network-first, cache fallback** | Selalu coba fresh content, offline serve dari cache |
| Cross-origin (API, CDN) | **Network-only** | Tidak di-cache untuk menghindari stale data dari third-party |
| Halaman belum pernah dikunjungi | **Fallback ke `offline.html`** | Custom offline page dengan styling Feldora |

### Precache

Halaman-halaman utama di-precache saat install:
- `/`, `/about`, `/log`, `/story`
- `/offline.html`, `/feldora-logo-2.webp`

### Registration

Service worker di-register via inline script di `__root.tsx`, **hanya di production** (bukan localhost):
```js
if ('serviceWorker' in navigator && location.hostname !== 'localhost') {
  navigator.serviceWorker.register('/sw.js')
}
```

Ini mencegah caching yang mengganggu saat development. Di localhost, perubahan code langsung terlihat tanpa perlu unregister SW.

### Offline Page (`public/offline.html`)

Halaman static HTML dengan styling Feldora (dark bg, diamond markers, angular button).
Ditampilkan saat user offline dan navigasi ke halaman yang belum pernah di-cache.

### Cache Versioning

Ubah `CACHE_NAME` di `sw.js` (e.g., `feldora-v1` → `feldora-v2`) saat deploy perubahan besar.
Service worker akan otomatis hapus cache lama saat activate.

### Splash Screen

- **Android**: Auto-generated dari manifest (`name` + `icons[512]` + `background_color`)
- **iOS**: Tidak otomatis — perlu `apple-touch-startup-image` meta tags (belum diimplementasi)
- **Desktop**: Tidak ada splash screen

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

**StoryList:**
1. Loading → `SkeletonCardGrid`
2. Error → `ErrorState` dengan retry
3. Empty → `ErrorState` pesan "Belum ada cerita"
4. Success → render story cards

**StoryDetail:**
1. Cek placeholder dulu — kalau slug cocok, langsung render tanpa tunggu API
2. Loading (tanpa placeholder) → `SkeletonArticle`
3. Error (tanpa placeholder) → `ErrorState` dengan retry + back
4. Not found → 404 UI
5. Success → render artikel

---

## API Architecture

### GraphQL (Hygraph CMS)
Endpoint: `VITE_GRAPH_CMS_ENDPOINT` (environment variable)

Queries:
- `getPosts()` — List semua post (title, slug, excerpt, image, category, author, date)
- `getPostDetail(slug)` — Detail post (+ content HTML, author photo)

### React Query Hooks
- `useGetPosts()` — staleTime 1 hour
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
- Images (full-width, rounded)
- First letter drop cap (text-5xl accent color)

---

## Performance Principles

- **SSR by default** — TanStack Start renders all pages server-side
- **Automatic code splitting** — setiap route di-lazy-load
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

9. **PWA & Service Worker** — Service worker (`public/sw.js`) hanya di-register di production (bukan localhost). Saat develop, SW tidak aktif sehingga perubahan langsung terlihat. Ubah `CACHE_NAME` di `sw.js` saat deploy perubahan besar agar cache lama terhapus.

10. **Copywriting terpusat** — Semua teks/copy di-manage dari `src/constants/copy/`. Setiap halaman punya file sendiri (`home.ts`, `about.ts`, `log.ts`, `story.ts`). Untuk ubah teks di website, cukup edit file di directory ini tanpa perlu sentuh komponen.
