const CACHE_NAME = 'feldora-v2'
const CACHE_PAGES = 'feldora-pages-v2'
const CACHE_ASSETS = 'feldora-assets-v2'

// Routes to precache on install — these will always be available offline
const PRECACHE_ROUTES = ['/', '/about', '/log', '/story']

// Static assets to precache on install
const PRECACHE_ASSETS = [
  '/feldora-logo-192.png',
  '/feldora-logo-512.png',
  '/offline.html',
]

// ─── Install ────────────────────────────────────────────────────────────────
// Precache all main routes + critical assets immediately on install
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_PAGES).then((cache) =>
        Promise.allSettled(
          PRECACHE_ROUTES.map((url) =>
            fetch(url, { credentials: 'same-origin' })
              .then((res) => res.ok && cache.put(url, res))
              .catch(() => {}) // non-fatal if offline at install time
          )
        )
      ),
      caches.open(CACHE_ASSETS).then((cache) =>
        Promise.allSettled(
          PRECACHE_ASSETS.map((url) =>
            fetch(url)
              .then((res) => res.ok && cache.put(url, res))
              .catch(() => {})
          )
        )
      ),
    ])
  )
  self.skipWaiting()
})

// ─── Activate ───────────────────────────────────────────────────────────────
// Delete all caches that don't match current version
self.addEventListener('activate', (event) => {
  const currentCaches = new Set([CACHE_NAME, CACHE_PAGES, CACHE_ASSETS])
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => !currentCaches.has(key))
          .map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

// ─── Fetch ───────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)

  // Skip cross-origin requests (Hygraph API, Google Fonts CDN, etc.)
  // These are network-only — no point caching dynamic API responses in SW
  if (url.origin !== self.location.origin) return

  // ── Navigation requests (HTML pages) ──────────────────────────────────────
  // Strategy: Network-first → cache fallback → root "/" fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(handleNavigation(event.request))
    return
  }

  // ── Static assets (JS, CSS, fonts, images) ────────────────────────────────
  // Strategy: Cache-first → network fallback + cache update
  if (isStaticAsset(url.pathname)) {
    event.respondWith(handleStaticAsset(event.request))
    return
  }

  // ── Everything else (same-origin, non-navigate) ───────────────────────────
  // Strategy: Network-first → cache fallback
  event.respondWith(handleOther(event.request))
})

// ─── Navigation handler ──────────────────────────────────────────────────────
// Network-first: always try to get fresh page from server.
// Only falls back to cache when genuinely offline.
async function handleNavigation(request) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      // Cache the fresh response for future offline use
      const cache = await caches.open(CACHE_PAGES)
      cache.put(request, networkResponse.clone())
      return networkResponse
    }
    return networkResponse
  } catch {
    // Offline — try exact URL from cache
    const cached = await caches.match(request, { cacheName: CACHE_PAGES })
    if (cached) return cached

    // Try without query params (handles TanStack Router search params)
    const url = new URL(request.url)
    const cleanRequest = new Request(url.origin + url.pathname)
    const cachedClean = await caches.match(cleanRequest, { cacheName: CACHE_PAGES })
    if (cachedClean) return cachedClean

    // For story detail pages (/story/some-slug) that haven't been visited —
    // serve the /story list page instead (still useful, not a blank screen)
    if (url.pathname.startsWith('/story/')) {
      const storyListCached = await caches.match('/story', { cacheName: CACHE_PAGES })
      if (storyListCached) return storyListCached
    }

    // Ultimate fallback — root "/" is always precached
    const rootCached = await caches.match('/', { cacheName: CACHE_PAGES })
    if (rootCached) return rootCached

    // Absolute last resort — serve offline.html (always precached on install)
    const offlinePage = await caches.match('/offline.html', { cacheName: CACHE_ASSETS })
    if (offlinePage) return offlinePage

    // If even offline.html isn't cached somehow, return a bare 503
    return new Response(
      '<html><body><p>You are offline. Please reconnect and try again.</p></body></html>',
      { status: 503, headers: { 'Content-Type': 'text/html' } }
    )
  }
}

// ─── Static asset handler ────────────────────────────────────────────────────
// Cache-first: Vite outputs content-hashed filenames, so cached assets
// are always valid — a new file = new hash = new URL = fresh network fetch.
async function handleStaticAsset(request) {
  const cached = await caches.match(request, { cacheName: CACHE_ASSETS })
  if (cached) return cached

  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_ASSETS)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch {
    return new Response('', { status: 503 })
  }
}

// ─── Generic same-origin handler ─────────────────────────────────────────────
async function handleOther(request) {
  try {
    return await fetch(request)
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached
    return new Response('', { status: 503 })
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function isStaticAsset(pathname) {
  return /\.(js|mjs|css|woff2?|ttf|otf|png|jpg|jpeg|webp|avif|svg|ico|json)(\?.*)?$/.test(pathname)
}
