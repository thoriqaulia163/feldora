# FELDORA — PWA & Offline Strategy

Dokumentasi lengkap tentang Progressive Web App implementation dan offline behaviour.

---

## Overview

Feldora adalah PWA installable dengan offline support. Service Worker mengelola caching untuk memastikan halaman yang pernah dikunjungi tetap berfungsi penuh saat offline, termasuk setelah deploy baru.

---

## Core Principles

1. **Halaman yang pernah dibuka harus berfungsi offline** — termasuk semua JS/CSS chunks yang dibutuhkan
2. **Update seamless tanpa interupsi** — deploy baru tidak merusak offline experience
3. **Bandwidth efficient** — hanya download assets untuk halaman yang pernah dikunjungi, bukan seluruh app
4. **Lazy loading tetap dipertahankan** — halaman yang belum pernah dibuka tidak di-download
5. **Version consistency** — tidak pernah mix HTML versi lama dengan chunks versi baru

---

## Service Worker (`public/sw.js`)

### File Location

```
public/sw.js → deploy langsung sebagai static file (no build-time bundling)
```

Alasan: TanStack Start + Nitro copy `public/` ke output folder. Static SW file lebih reliable dibanding build-time generated.

### Cache Names

| Cache | Name | Purpose |
|-------|------|---------|
| Pages | `feldora-pages-v3` | HTML navigation responses |
| Assets | `feldora-assets-v3` | JS, CSS, fonts, images, JSON models |
| Staging | `feldora-staging-v3` | Temporary: new version assets sebelum activation |

### Version Constant

```js
const SW_VERSION = '1.12.1'
```

**Harus di-bump setiap deploy** agar browser mendeteksi SW baru. Browser melakukan byte-comparison pada file SW — jika konten tidak berubah, tidak ada update yang ter-trigger.

---

## Caching Strategies

### Static Assets (JS/CSS/Fonts/Images)

**Strategy: Cache-first**

```
Request → Check cache → Ada? → Serve from cache
                      → Tidak ada? → Fetch network → Cache → Serve
```

Safe karena Vite output menggunakan content-hashed filenames (`about-Lm3y.js`). File baru = URL baru = fresh fetch. File lama yang masih di-reference = masih valid di cache.

### Navigation (HTML Pages)

**Strategy: Network-first → cache fallback**

```
Request → Try network → OK? → Cache response + Serve
                       → Offline? → Serve from cache
                                  → Fallback chain (lihat di bawah)
```

### Offline Fallback Chain

Saat user offline dan membuka halaman:

```
1. Cache exact URL → ada? serve
2. Cache URL tanpa query params → ada? serve
3. Parent path (e.g., /story/slug → /story) → ada? serve
4. Root "/" → selalu ada (precached) → serve
5. /offline.html → selalu ada (precached) → serve
6. Bare 503 HTML → absolute last resort
```

### Cross-Origin Requests

**Strategy: Not handled (network-only)**

Hygraph API, Google Fonts CDN, dan third-party requests tidak di-cache oleh SW. Hanya same-origin requests yang dikelola.

---

## Install Behaviour

### First Install (Fresh — No Existing Cache)

Terjadi saat user pertama kali membuka app atau setelah clear browser data.

```
1. SW install → detect: feldora-pages-v3 tidak ada
2. Precache essentials: "/" + "/offline.html" + logos
3. skipWaiting() → activate immediately
4. clients.claim() → SW langsung control page
5. User browsing normal → setiap halaman yang dibuka ter-cache otomatis
```

**Tidak ada prompt.** App langsung usable.

### Subsequent Install (Update — Existing Cache Ada)

Terjadi saat deploy baru detected (sw.js content berubah).

```
1. SW baru install → detect: feldora-pages-v3 sudah ada
2. Selective Update:
   a. Inspect feldora-pages-v3 → ambil semua URL yang pernah dikunjungi
   b. Re-fetch HTML setiap URL tersebut (versi baru, cache: 'no-cache')
   c. Parse HTML → extract <script src>, <link stylesheet>, <link modulepreload>
   d. Download JS/CSS chunks yang di-reference
   e. Skip chunks yang hash-nya masih sama (sudah di cache)
   f. Simpan semua ke feldora-staging-v3
3. SW masuk "installed/waiting" state
4. Activation:
   - Jika app tertutup (no active clients): auto-activate pada navigation berikutnya
   - Jika app terbuka (active clients): UpdatePrompt muncul → user decide
5. Activate:
   - Promote staging → active caches (pages + assets)
   - Delete old/legacy caches
   - clients.claim()
```

---

## Selective Asset Download (Detail)

### Apa yang di-download saat update:

| Asset | Condition | Alasan |
|-------|-----------|--------|
| HTML halaman yang pernah dikunjungi | Selalu re-fetch | HTML references chunk baru |
| JS/CSS chunks yang di-reference HTML baru | Download jika hash berubah | Diperlukan agar halaman berfungsi |
| JS/CSS chunks yang hash-nya sama | Copy dari cache lama | Zero bandwidth — sudah ada |
| Halaman yang BELUM pernah dikunjungi | SKIP | Tetap lazy-load saat pertama buka |
| /offline.html, logos | Selalu re-fetch | Essential fallback |

### Parsing Strategy

SW extract asset URLs dari HTML response menggunakan regex:

```js
// <script src="/assets/chunk-abc123.js">
/<script[^>]+src=["']([^"']+)["']/g

// <link rel="stylesheet" href="/assets/style-xyz.css">
/<link[^>]+href=["']([^"']+)["'][^>]*>/g  (filtered: stylesheet/css only)

// <link rel="modulepreload" href="/assets/vendor-def.js">
/<link[^>]+rel=["']modulepreload["'][^>]+href=["']([^"']+)["']/g
```

### Timeout & Error Handling

```js
await withTimeout(selectiveUpdate(), 60000) // Max 60 detik
```

Jika gagal atau timeout:
- SW tetap masuk "installed" state (non-fatal)
- User masih bisa update, hanya tanpa pre-downloaded assets
- Halaman akan lazy-fetch chunks saat dibuka online berikutnya

---

## Update Prompt (`UpdatePrompt.tsx`)

### Kapan Muncul

Prompt muncul **hanya** jika:
- Ada SW dalam state "waiting" (`reg.waiting !== null`)
- Dan user **sedang aktif** menggunakan app (ada controlled clients)

### Kapan TIDAK Muncul

- First install (skipWaiting langsung, tidak ada waiting SW)
- User buka app setelah tutup → SW auto-activate karena no active clients → seamless
- selectiveUpdate gagal tapi SW tetap install → prompt tetap muncul jika user aktif

### User Actions

| Action | Behaviour |
|--------|-----------|
| "Update now" | `postMessage({ type: 'SKIP_WAITING' })` → SW activate → page reload |
| "Later" | Dismiss prompt, old version tetap berjalan, offline tetap works |

### Detection Methods (layered)

1. `navigator.serviceWorker.message` event (type: 'UPDATE_READY')
2. `updatefound` + `statechange` → `sw-update-ready` custom event
3. `reg.waiting` check on component mount

Semua memanggil `checkAndShow()` yang verify `reg.waiting` sebelum show.

---

## Registration (`__root.tsx`)

```js
if ('serviceWorker' in navigator && location.hostname !== 'localhost') {
  navigator.serviceWorker.register('/sw.js').then(function(reg) {
    // Periodic update check every 60 minutes
    setInterval(function(){ reg.update() }, 60*60*1000);

    // Detect already-waiting SW
    if (reg.waiting) window.dispatchEvent(new CustomEvent('sw-update-ready'));

    // Detect new SW entering waiting state
    reg.addEventListener('updatefound', function() {
      var newSW = reg.installing;
      newSW.addEventListener('statechange', function() {
        if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
          window.dispatchEvent(new CustomEvent('sw-update-ready'));
        }
      });
    });
  });
}
```

- **localhost excluded** — no caching during development
- **60-minute update check** — detect deploys without user needing to hard-refresh
- **Custom event bridge** — connects inline script (runs before React) to React component

---

## Offline Behaviour per Page Type

### Halaman yang pernah dikunjungi online

✅ Fully functional offline — HTML cached + all referenced JS/CSS chunks cached

### Halaman yang BELUM pernah dikunjungi

❌ Tidak bisa dibuka offline — fallback chain:
1. Coba serve parent route (jika cached)
2. Serve root "/"
3. Serve /offline.html

### Playground AI Models (model.json)

✅ Cached via cache-first strategy saat pertama kali dimuat. Tetap tersedia offline setelah pertama visit.

### Story detail (/story/:slug)

Tergantung — jika slug spesifik pernah dibuka online, cached. Jika belum, fallback ke /story list atau root.

---

## Deploy Checklist

Setiap deploy baru:

1. ✅ Bump `SW_VERSION` di `public/sw.js` agar browser detect perubahan
2. ✅ Bump `version` di `package.json` (untuk display purposes)
3. ✅ Pastikan `sw.js` file content berubah (minimal version constant)

Jika `sw.js` content tidak berubah antar deploy, browser **tidak akan** install SW baru dan selective update tidak terjadi.

---

## File Structure

```
public/
├── sw.js              # Production Service Worker (plain JS, no bundling)
├── manifest.json      # PWA manifest (name, icons, display mode)
├── offline.html       # Offline fallback page (selalu precached)
├── feldora-logo-192.png  # PWA icon + precached
└── feldora-logo-512.png  # PWA icon + precached

src/
├── components/ui/UpdatePrompt.tsx  # Update notification banner
└── routes/__root.tsx               # SW registration + event bridge
```

---

## Edge Cases

| Skenario | Behaviour |
|----------|-----------|
| User offline saat deploy | SW baru tidak ter-install sampai online |
| selectiveUpdate timeout (>60s) | SW tetap install, update tanpa pre-download |
| User klik "Later" | Old SW tetap active, full offline preserved |
| User tutup app, buka lagi setelah deploy | Waiting SW auto-activate (seamless, no prompt) |
| Chunk hash berubah tapi HTML references old hash | Tidak terjadi — HTML selalu di-re-fetch dulu |
| Browser clear storage | First install behaviour, cache dari awal |
| Multiple tabs open | UpdatePrompt muncul di semua tabs, first click wins |

---

## Limitations

- **Tidak ada full precache** — hanya halaman yang pernah dibuka yang tersedia offline
- **First visit setelah clear storage** butuh online untuk load halaman manapun selain "/"
- **Cross-origin resources** (API Hygraph, Google Fonts) tidak di-cache — content dari API tidak tersedia offline
- **SW_VERSION harus di-bump manual** — jika lupa, update tidak ter-trigger
- **60s timeout** pada selective update — koneksi sangat lambat mungkin tidak selesai download semua assets
- **HTML parsing via regex** — edge case: script/link dalam comment atau string bisa false-match (sangat jarang)
