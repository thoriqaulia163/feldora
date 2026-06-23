/**
 * Feldora Service Worker — Production
 *
 * Strategy:
 * - Cache-first for hashed static assets (JS/CSS/fonts/images)
 * - Network-first for navigation (HTML pages)
 * - Precache root + offline.html on first install
 * - Prompt-based updates (no auto skipWaiting on subsequent installs)
 * - Pages visited while online work fully offline
 * - Pages never visited show offline fallback
 */

const CACHE_PAGES = 'feldora-pages-v3'
const CACHE_ASSETS = 'feldora-assets-v3'
const APP_VERSION = 'v3'

// ─── Install ────────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(handleInstall())
})

async function handleInstall() {
  const isFirstInstall = !(await caches.has(CACHE_ASSETS))

  // Always precache essentials
  const pages = await caches.open(CACHE_PAGES)
  await Promise.allSettled([
    safeFetchAndCache(pages, '/'),
    safeFetchAndCache(pages, '/offline.html'),
  ])

  const assets = await caches.open(CACHE_ASSETS)
  await Promise.allSettled([
    safeFetchAndCache(assets, '/feldora-logo-192.png'),
    safeFetchAndCache(assets, '/feldora-logo-512.png'),
  ])

  if (isFirstInstall) {
    // First install: activate immediately (no old version to preserve)
    self.skipWaiting()
  }
  // Subsequent installs (updates): stay in waiting state, let client decide
}

// ─── Activate ───────────────────────────────────────────────────────────────

self.addEventListener('activate', (event) => {
  event.waitUntil(handleActivate())
})

async function handleActivate() {
  // Clean up old caches from previous SW versions
  const currentCaches = new Set([CACHE_PAGES, CACHE_ASSETS])
  const allKeys = await caches.keys()
  await Promise.all(
    allKeys
      .filter((key) => !currentCaches.has(key))
      .map((key) => caches.delete(key))
  )

  // Take control of all clients
  self.clients.claim()
}

// ─── Message Handler ────────────────────────────────────────────────────────

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// ─── Fetch ──────────────────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)

  // Skip cross-origin (API, CDN, Google Fonts)
  if (url.origin !== self.location.origin) return

  // Navigation requests (HTML pages)
  if (event.request.mode === 'navigate') {
    event.respondWith(handleNavigation(event.request))
    return
  }

  // Static assets (JS, CSS, fonts, images, JSON models)
  if (isStaticAsset(url.pathname)) {
    event.respondWith(handleStaticAsset(event.request))
    return
  }

  // Everything else: network with cache fallback
  event.respondWith(handleOther(event.request))
})

// ─── Navigation: Network-first → cache → offline fallback ───────────────────

async function handleNavigation(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      // Cache the page for future offline use
      const cache = await caches.open(CACHE_PAGES)
      cache.put(request, networkResponse.clone())
      return networkResponse
    }
    return networkResponse
  } catch (err) {
    // Offline — try to serve from cache
    const url = new URL(request.url)

    // Try exact URL
    const cached = await caches.match(request, { cacheName: CACHE_PAGES })
    if (cached) return cached

    // Try without query params
    const cleanUrl = url.origin + url.pathname
    const cachedClean = await caches.match(new Request(cleanUrl), { cacheName: CACHE_PAGES })
    if (cachedClean) return cachedClean

    // For sub-paths, try the parent layout route
    // e.g., /story/some-slug → try /story
    const segments = url.pathname.split('/').filter(Boolean)
    if (segments.length > 1) {
      const parentPath = '/' + segments.slice(0, -1).join('/')
      const parentCached = await caches.match(new Request(url.origin + parentPath), { cacheName: CACHE_PAGES })
      if (parentCached) return parentCached
    }

    // Try root (always precached)
    const rootCached = await caches.match(new Request(url.origin + '/'), { cacheName: CACHE_PAGES })
    if (rootCached) return rootCached

    // Last resort: offline.html
    const offlinePage = await caches.match('/offline.html', { cacheName: CACHE_PAGES })
    if (offlinePage) return offlinePage

    return new Response(
      '<html><body style="background:#0a0a0f;color:#f5f5f7;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0"><p>You are offline.</p></body></html>',
      { status: 503, headers: { 'Content-Type': 'text/html' } }
    )
  }
}

// ─── Static Assets: Cache-first (hashed filenames = safe to cache) ──────────

async function handleStaticAsset(request) {
  // Check cache first
  const cached = await caches.match(request, { cacheName: CACHE_ASSETS })
  if (cached) return cached

  // Not in cache — fetch from network and cache it
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_ASSETS)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (err) {
    // Offline and not cached — return error
    return new Response('', { status: 503, statusText: 'Offline' })
  }
}

// ─── Other same-origin requests ─────────────────────────────────────────────

async function handleOther(request) {
  try {
    return await fetch(request)
  } catch (err) {
    const cached = await caches.match(request)
    if (cached) return cached
    return new Response('', { status: 503 })
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function isStaticAsset(pathname) {
  return /\.(js|mjs|css|woff2?|ttf|otf|png|jpg|jpeg|webp|avif|svg|ico|gif|json)(\?.*)?$/.test(pathname)
}

async function safeFetchAndCache(cache, url) {
  try {
    const response = await fetch(url, { credentials: 'same-origin' })
    if (response.ok) await cache.put(url, response)
  } catch (e) {
    // Non-fatal
  }
}
