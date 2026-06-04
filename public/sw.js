const CACHE_NAME = 'feldora-v1'
const OFFLINE_PAGE = '/offline.html'

// Precache essential static assets
const PRECACHE_URLS = [
  '/offline.html',
  '/feldora-logo-2.webp',
]

// Install: precache essential resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  )
  self.skipWaiting()
})

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

// Fetch: only cache static assets, skip navigation requests
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return

  // Skip navigation requests — let TanStack Router handle client-side routing
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match(OFFLINE_PAGE).then((cached) => cached || new Response('Offline', { status: 503 }))
      )
    )
    return
  }

  // For static assets: cache-first strategy
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached

      return fetch(event.request).then((response) => {
        // Only cache successful responses for static assets
        if (response.status === 200 && isStaticAsset(event.request.url)) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        }
        return response
      }).catch(() => new Response('', { status: 503 }))
    })
  )
})

function isStaticAsset(url) {
  return /\.(js|css|woff2?|png|jpg|jpeg|webp|svg|ico)(\?.*)?$/.test(url)
}
