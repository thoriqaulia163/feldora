const CACHE_NAME = 'feldora-v1'
const OFFLINE_PAGE = '/offline.html'

// Precache essential pages and assets
const PRECACHE_URLS = [
  '/',
  '/about',
  '/log',
  '/story',
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

// Fetch: network-first with cache fallback
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  // Skip cross-origin requests (e.g., Hygraph API, Google Fonts CDN)
  if (!event.request.url.startsWith(self.location.origin)) {
    // For cross-origin, try network only — don't cache
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Only cache successful responses
        if (response.status === 200) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        }
        return response
      })
      .catch(() =>
        // Network failed: try cache, then fallback to offline page
        caches.match(event.request).then((cached) => {
          if (cached) return cached
          // For navigation requests, show offline page
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_PAGE)
          }
          return new Response('', { status: 503 })
        })
      )
  )
})
