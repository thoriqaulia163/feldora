/// <reference lib="webworker" />

/**
 * Service Worker — Feldora PWA
 *
 * Strategy:
 * - NO auto skipWaiting/clients.claim
 * - Prompt-based updates (user decides when to activate)
 * - Selective asset download: only fetch new chunks for previously visited routes
 * - Cache-first for hashed static assets (JS/CSS/fonts/images)
 * - Network-first for navigation (HTML)
 * - Version consistency: never mix old HTML with new chunks
 */

import { setCacheNameDetails, clientsClaim } from 'workbox-core'
import { registerRoute, NavigationRoute } from 'workbox-routing'
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

// ─── Cache Names ────────────────────────────────────────────────────────────

setCacheNameDetails({
  prefix: 'feldora',
  suffix: 'v1',
})

const CACHE_ASSETS = 'feldora-assets'
const CACHE_PAGES = 'feldora-pages'
const CACHE_STAGING = 'feldora-staging' // For new version assets before activation

// ─── Types ──────────────────────────────────────────────────────────────────

interface RouteManifest {
  version: string
  buildId: string
  timestamp: string
  routes: Record<string, { chunks: string[] }>
  shared: string[]
  all: string[]
}

interface UpdateMessage {
  type: 'SKIP_WAITING' | 'GET_UPDATE_STATUS'
}

interface UpdateStatus {
  type: 'UPDATE_READY' | 'UPDATE_PROGRESS' | 'NO_UPDATE'
  version?: string
  progress?: number
}

// ─── Install Event ──────────────────────────────────────────────────────────
// Do NOT call skipWaiting(). Stay in "waiting" state until user approves update.

self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(handleInstall())
})

async function handleInstall(): Promise<void> {
  // Fetch the new route manifest
  const newManifest = await fetchManifest()
  if (!newManifest) return

  // Determine which routes were previously used by inspecting existing cache
  const usedRoutes = await getUsedRoutes(newManifest)

  // Collect assets to download: shared chunks + chunks for used routes only
  const assetsToDownload = new Set<string>()

  // Always download shared chunks (vendor, framework, CSS)
  for (const shared of newManifest.shared) {
    assetsToDownload.add(shared)
  }

  // Download chunks only for routes the user has previously visited
  for (const route of usedRoutes) {
    const routeInfo = newManifest.routes[route]
    if (routeInfo) {
      for (const chunk of routeInfo.chunks) {
        assetsToDownload.add(chunk)
      }
    }
  }

  // Download all selected assets into staging cache
  const staging = await caches.open(CACHE_STAGING)
  const downloads = [...assetsToDownload].map(async (asset) => {
    try {
      const response = await fetch(`/${asset}`, { cache: 'no-cache' })
      if (response.ok) {
        await staging.put(`/${asset}`, response)
      }
    } catch {
      // Non-fatal: some assets might not be fetchable if offline
    }
  })

  await Promise.allSettled(downloads)

  // Store the new manifest in staging for reference during activation
  await staging.put(
    '/route-manifest.json',
    new Response(JSON.stringify(newManifest), {
      headers: { 'Content-Type': 'application/json' },
    })
  )

  // Notify all clients that update is ready
  const clients = await (self as unknown as ServiceWorkerGlobalScope).clients.matchAll()
  for (const client of clients) {
    client.postMessage({
      type: 'UPDATE_READY',
      version: newManifest.version,
    } satisfies UpdateStatus)
  }
}

// ─── Activate Event ─────────────────────────────────────────────────────────
// Called when user approves the update (after skipWaiting is triggered by message)

self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(handleActivate())
})

async function handleActivate(): Promise<void> {
  // Move staging cache to active asset cache
  const staging = await caches.open(CACHE_STAGING)
  const assets = await caches.open(CACHE_ASSETS)

  const stagedKeys = await staging.keys()
  for (const request of stagedKeys) {
    const response = await staging.match(request)
    if (response) {
      await assets.put(request, response)
    }
  }

  // Delete old caches
  const allCaches = await caches.keys()
  const keepCaches = new Set([CACHE_ASSETS, CACHE_PAGES, CACHE_STAGING])
  for (const name of allCaches) {
    // Delete legacy caches and staging
    if (!keepCaches.has(name) || name === CACHE_STAGING) {
      await caches.delete(name)
    }
  }

  // Delete legacy v2 caches from old SW
  await caches.delete('feldora-v2')
  await caches.delete('feldora-pages-v2')
  await caches.delete('feldora-assets-v2')

  // Claim all clients so the new SW takes over immediately
  clientsClaim()
}

// ─── Message Handler ────────────────────────────────────────────────────────
// Listens for messages from the client (e.g., "SKIP_WAITING" to activate update)

self.addEventListener('message', (event: ExtendableMessageEvent) => {
  const data = event.data as UpdateMessage

  if (data?.type === 'SKIP_WAITING') {
    (self as unknown as ServiceWorkerGlobalScope).skipWaiting()
  }
})

// ─── Routing Strategies ─────────────────────────────────────────────────────

// Navigation requests: Network-first with cache fallback
const navigationHandler = new NetworkFirst({
  cacheName: CACHE_PAGES,
  plugins: [
    new ExpirationPlugin({
      maxEntries: 30,
      maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
    }),
  ],
})

registerRoute(new NavigationRoute(navigationHandler, {
  // Allow all navigation requests to be handled
}))

// Static assets (JS, CSS): Cache-first (Vite hashes filenames, so safe to cache forever)
registerRoute(
  ({ url }) => /\.(js|mjs|css)$/.test(url.pathname),
  new CacheFirst({
    cacheName: CACHE_ASSETS,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year (hash ensures freshness)
      }),
    ],
  })
)

// Fonts: Cache-first with long expiration
registerRoute(
  ({ url }) => /\.(woff2?|ttf|otf)$/.test(url.pathname),
  new CacheFirst({
    cacheName: CACHE_ASSETS,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 365 * 24 * 60 * 60,
      }),
    ],
  })
)

// Images: Cache-first with moderate expiration
registerRoute(
  ({ url }) => /\.(png|jpg|jpeg|webp|avif|svg|ico|gif)$/.test(url.pathname),
  new CacheFirst({
    cacheName: CACHE_ASSETS,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
)

// JSON data files (AI models, datasets): Cache-first
registerRoute(
  ({ url }) => url.pathname.startsWith('/ai-models/') && url.pathname.endsWith('.json'),
  new CacheFirst({
    cacheName: CACHE_ASSETS,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 90 * 24 * 60 * 60, // 90 days
      }),
    ],
  })
)

// route-manifest.json: Network-first (always want latest)
registerRoute(
  ({ url }) => url.pathname === '/route-manifest.json',
  new NetworkFirst({
    cacheName: CACHE_ASSETS,
  })
)

// ─── Helpers ────────────────────────────────────────────────────────────────

async function fetchManifest(): Promise<RouteManifest | null> {
  try {
    const response = await fetch('/route-manifest.json', { cache: 'no-cache' })
    if (!response.ok) return null
    return await response.json()
  } catch {
    return null
  }
}

/**
 * Determine which routes were previously used by the user.
 * Inspects the active asset cache and cross-references with the current manifest.
 */
async function getUsedRoutes(newManifest: RouteManifest): Promise<string[]> {
  const usedRoutes: string[] = []

  // Try to get the currently active manifest from cache
  const currentManifest = await getCurrentManifest()

  if (currentManifest) {
    // Cross-reference: which routes have their chunks in cache?
    const assetCache = await caches.open(CACHE_ASSETS)
    const cachedRequests = await assetCache.keys()
    const cachedUrls = new Set(cachedRequests.map((r) => new URL(r.url).pathname))

    for (const [route, info] of Object.entries(currentManifest.routes)) {
      // If at least one chunk of this route is cached, the user has visited it
      const hasVisited = info.chunks.some((chunk) => cachedUrls.has(`/${chunk}`))
      if (hasVisited) {
        usedRoutes.push(route)
      }
    }
  } else {
    // No current manifest available — first install or migration from old SW
    // In this case, check the page cache for visited navigation URLs
    const pageCache = await caches.open(CACHE_PAGES)
    const cachedPages = await pageCache.keys()
    for (const request of cachedPages) {
      const path = new URL(request.url).pathname
      if (path in newManifest.routes) {
        usedRoutes.push(path)
      }
    }

    // Also check legacy caches from old SW
    try {
      const legacyPages = await caches.open('feldora-pages-v2')
      const legacyCachedPages = await legacyPages.keys()
      for (const request of legacyCachedPages) {
        const path = new URL(request.url).pathname
        if (path in newManifest.routes && !usedRoutes.includes(path)) {
          usedRoutes.push(path)
        }
      }
    } catch {
      // Legacy cache doesn't exist, that's fine
    }
  }

  // Always include root route
  if (!usedRoutes.includes('/')) {
    usedRoutes.push('/')
  }

  return usedRoutes
}

async function getCurrentManifest(): Promise<RouteManifest | null> {
  try {
    const cache = await caches.open(CACHE_ASSETS)
    const response = await cache.match('/route-manifest.json')
    if (!response) return null
    return await response.json()
  } catch {
    return null
  }
}

// ─── TypeScript declarations for SW globals ─────────────────────────────────

declare const self: ServiceWorkerGlobalScope
export {}
