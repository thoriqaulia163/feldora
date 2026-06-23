/**
 * Development Service Worker (no-op)
 *
 * In production, this file is overwritten by the build output from src/sw.ts.
 * During development (localhost), SW registration is skipped entirely by the
 * inline script in __root.tsx (hostname !== 'localhost' check).
 *
 * This file exists only as a fallback if somehow accessed during dev.
 */

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})
