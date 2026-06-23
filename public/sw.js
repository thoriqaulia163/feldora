/**
 * Feldora Service Worker — Production
 *
 * Features:
 * - Cache-first for hashed static assets (JS/CSS/fonts/images)
 * - Network-first for navigation (HTML pages)
 * - Precache root + offline.html on first install
 * - Prompt-based updates (no auto skipWaiting on subsequent installs)
 * - Selective asset download: on update, re-fetch visited pages + their JS/CSS chunks
 * - Pages visited while online work fully offline (including after updates)
 * - Pages never visited show offline fallback
 */

const CACHE_PAGES = 'feldora-pages-v3'
const CACHE_ASSETS = 'feldora-assets-v3'
const CACHE_STAGING = 'feldora-staging-v3'

// ─── Install ────────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(handleInstall())
})

async function handleInstall() {
  const isFirstInstall = !(await caches.has(CACHE_PAGES))

  if (isFirstInstall) {
    // First install: precache essentials and activate immediately
    await precacheEssentials()
    self.skipWaiting()
  } else {
    // Update: selectively download new assets for visited pages
    await selectiveUpdate()
    // Do NOT skipWaiting — wait for user approval via UpdatePrompt
  }
}

// ─── Activate ───────────────────────────────────────────────────────────────

self.addEventListener('activate', (event) => {
  event.waitUntil(handleActivate())
})

async function handleActivate() {
  // Promote staging cache to active caches
  const stagingExists = (await caches.keys()).includes(CACHE_STAGING)

  if (stagingExists) {
    const staging = await caches.open(CACHE_STAGING)
    const pages = await caches.open(CACHE_PAGES)
    const assets = await caches.open(CACHE_ASSETS)

    const stagedKeys = await staging.keys()
    for (const request of stagedKeys) {
      const response = await staging.match(request)
      if (!response) continue
      const url = new URL(request.url)
      // Route HTML to pages cache, assets to assets cache
      if (isStaticAsset(url.pathname)) {
        await assets.put(request, response)
      } else {
        await pages.put(request, response)
      }
    }
    await caches.delete(CACHE_STAGING)
  }

  // Clean up old caches from previous versions
  const keepCaches = new Set([CACHE_PAGES, CACHE_ASSETS])
  const allKeys = await caches.keys()
  await Promise.all(
    allKeys
      .filter((key) => !keepCaches.has(key))
      .map((key) => caches.delete(key))
  )

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

  // Skip cross-origin
  if (url.origin !== self.location.origin) return

  // Navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(handleNavigation(event.request))
    return
  }

  // Static assets
  if (isStaticAsset(url.pathname)) {
    event.respondWith(handleStaticAsset(event.request))
    return
  }

  // Everything else
  event.respondWith(handleOther(event.request))
})

// ─── Navigation: Network-first → cache → offline fallback ───────────────────

async function handleNavigation(request) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_PAGES)
      cache.put(request, networkResponse.clone())
      return networkResponse
    }
    return networkResponse
  } catch (err) {
    const url = new URL(request.url)

    // Try exact URL from cache
    const cached = await caches.match(request, { cacheName: CACHE_PAGES })
    if (cached) return cached

    // Try without query params
    const cleanUrl = url.origin + url.pathname
    const cachedClean = await caches.match(new Request(cleanUrl), { cacheName: CACHE_PAGES })
    if (cachedClean) return cachedClean

    // Try parent path
    const segments = url.pathname.split('/').filter(Boolean)
    if (segments.length > 1) {
      const parentPath = '/' + segments.slice(0, -1).join('/')
      const parentCached = await caches.match(new Request(url.origin + parentPath), { cacheName: CACHE_PAGES })
      if (parentCached) return parentCached
    }

    // Try root
    const rootCached = await caches.match(new Request(url.origin + '/'), { cacheName: CACHE_PAGES })
    if (rootCached) return rootCached

    // Offline fallback
    const offlinePage = await caches.match('/offline.html', { cacheName: CACHE_PAGES })
    if (offlinePage) return offlinePage

    return new Response(
      '<html><body style="background:#0a0a0f;color:#f5f5f7;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0"><p>You are offline.</p></body></html>',
      { status: 503, headers: { 'Content-Type': 'text/html' } }
    )
  }
}

// ─── Static Assets: Cache-first ─────────────────────────────────────────────

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
  } catch (err) {
    return new Response('', { status: 503, statusText: 'Offline' })
  }
}

// ─── Other same-origin ──────────────────────────────────────────────────────

async function handleOther(request) {
  try {
    return await fetch(request)
  } catch (err) {
    const cached = await caches.match(request)
    if (cached) return cached
    return new Response('', { status: 503 })
  }
}

// ─── Selective Update ───────────────────────────────────────────────────────
// On update: re-fetch all previously visited pages + their referenced JS/CSS chunks.
// This ensures offline access is preserved after activating the new SW version.

async function selectiveUpdate() {
  const staging = await caches.open(CACHE_STAGING)

  // 1. Get all previously visited page URLs from the pages cache
  const pagesCache = await caches.open(CACHE_PAGES)
  const cachedRequests = await pagesCache.keys()
  const visitedUrls = cachedRequests
    .map((req) => new URL(req.url))
    .filter((url) => url.origin === self.location.origin)
    .map((url) => url.pathname)

  // Always include root
  if (!visitedUrls.includes('/')) visitedUrls.push('/')

  // 2. Fetch new HTML for each visited page
  const fetchedAssetUrls = new Set()

  for (const pagePath of visitedUrls) {
    try {
      const response = await fetch(pagePath, { cache: 'no-cache', credentials: 'same-origin' })
      if (!response.ok) continue

      // Clone before reading body (we need to cache the original)
      const responseForParse = response.clone()
      await staging.put(new Request(self.location.origin + pagePath), response)

      // 3. Parse HTML to find referenced JS/CSS assets
      const html = await responseForParse.text()
      const assetUrls = extractAssetUrls(html)

      for (const assetUrl of assetUrls) {
        if (!fetchedAssetUrls.has(assetUrl)) {
          fetchedAssetUrls.add(assetUrl)
        }
      }
    } catch (err) {
      // Network error — skip this page (will use old cache if still available)
    }
  }

  // 4. Download all referenced assets (JS/CSS chunks)
  // Skip assets that haven't changed (same URL = same hash = same content)
  const assetsCache = await caches.open(CACHE_ASSETS)

  await Promise.allSettled(
    [...fetchedAssetUrls].map(async (assetUrl) => {
      // Check if already in current assets cache (same hash = no change)
      const existing = await assetsCache.match(new Request(assetUrl))
      if (existing) {
        // Asset unchanged — copy to staging
        await staging.put(new Request(assetUrl), existing.clone())
        return
      }

      // New asset — download it
      try {
        const response = await fetch(assetUrl, { cache: 'no-cache' })
        if (response.ok) {
          await staging.put(new Request(assetUrl), response)
        }
      } catch (err) {
        // Non-fatal: asset download failed
      }
    })
  )

  // 5. Also stage essential static files
  await Promise.allSettled([
    safeFetchToCache(staging, '/offline.html'),
    safeFetchToCache(staging, '/feldora-logo-192.png'),
    safeFetchToCache(staging, '/feldora-logo-512.png'),
  ])

  // 6. Notify clients that update is ready
  const clients = await self.clients.matchAll()
  for (const client of clients) {
    client.postMessage({ type: 'UPDATE_READY' })
  }
}

// ─── Extract asset URLs from HTML ───────────────────────────────────────────
// Parses <script src="..."> and <link rel="stylesheet" href="..."> from HTML

function extractAssetUrls(html) {
  const urls = []

  // Match <script src="/assets/...">
  const scriptRegex = /<script[^>]+src=["']([^"']+)["']/g
  let match
  while ((match = scriptRegex.exec(html)) !== null) {
    const src = match[1]
    if (src.startsWith('/') || src.startsWith(self.location.origin)) {
      urls.push(src.startsWith('/') ? self.location.origin + src : src)
    }
  }

  // Match <link rel="stylesheet" href="/assets/...">
  const linkRegex = /<link[^>]+href=["']([^"']+)["'][^>]*>/g
  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1]
    const tag = match[0]
    if ((tag.includes('stylesheet') || href.endsWith('.css')) &&
        (href.startsWith('/') || href.startsWith(self.location.origin))) {
      urls.push(href.startsWith('/') ? self.location.origin + href : href)
    }
  }

  // Match modulepreload links
  const preloadRegex = /<link[^>]+rel=["']modulepreload["'][^>]+href=["']([^"']+)["']/g
  while ((match = preloadRegex.exec(html)) !== null) {
    const href = match[1]
    if (href.startsWith('/') || href.startsWith(self.location.origin)) {
      urls.push(href.startsWith('/') ? self.location.origin + href : href)
    }
  }

  return urls
}

// ─── First Install Precache ─────────────────────────────────────────────────

async function precacheEssentials() {
  const pages = await caches.open(CACHE_PAGES)
  await Promise.allSettled([
    safeFetchToCache(pages, '/'),
    safeFetchToCache(pages, '/offline.html'),
  ])

  const assets = await caches.open(CACHE_ASSETS)
  await Promise.allSettled([
    safeFetchToCache(assets, '/feldora-logo-192.png'),
    safeFetchToCache(assets, '/feldora-logo-512.png'),
  ])
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function isStaticAsset(pathname) {
  return /\.(js|mjs|css|woff2?|ttf|otf|png|jpg|jpeg|webp|avif|svg|ico|gif|json)(\?.*)?$/.test(pathname)
}

async function safeFetchToCache(cache, url) {
  try {
    const response = await fetch(url, { credentials: 'same-origin', cache: 'no-cache' })
    if (response.ok) await cache.put(new Request(self.location.origin + url), response)
  } catch (e) {
    // Non-fatal
  }
}
