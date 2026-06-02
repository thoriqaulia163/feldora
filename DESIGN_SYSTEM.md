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
| Deployment | Vercel-ready |

---

## Folder Architecture

```
src/
├── components/          # UI components
│   ├── home/            # Homepage sections (Hero, Featured, Updates, CTA)
│   ├── layout/          # Navbar, Footer (persistent layout)
│   └── story/           # Story list & detail components
├── constants/           # Static data (navigation links, update log)
├── lib/                 # API & data layer
│   ├── graphql.ts       # GraphQL queries & types (Hygraph)
│   ├── queries.ts       # React Query hooks (useGetPosts, useGetPostDetail)
│   └── queryClient.ts   # Query client factory
├── routes/              # TanStack Router file-based routes
│   ├── __root.tsx       # Root layout (Navbar + Footer + QueryProvider)
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
```
◆ Section Title
```

### Card Polygon (`.card-polygon`)
Card dengan sudut kanan bawah terpotong (clip-path). Memberikan kesan sci-fi panel.
```
┌────────────────────┐
│                    │
│     Content        │
│                  ╱ │
└─────────────────╱──┘
```

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
- **Minimal dependencies** — hanya 7 production deps
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
