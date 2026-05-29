/* Gurjar Connect service worker — minimal & privacy-safe.
 *
 * Design rules:
 *  - NEVER cache /api/* (e.g. /api/members carries auth-gated phone numbers).
 *  - NEVER cache cross-origin requests (LinkedIn photos etc.).
 *  - Cache only immutable build assets (/_next/static) and the app icons.
 *  - Navigations: network-first, fall back to an offline page when truly offline.
 *  Bump CACHE when changing this file to evict the old cache on activate.
 */
const CACHE = 'gc-static-v1'
const PRECACHE = ['/offline.html', '/icon-192.png', '/icon-512.png']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // Same-origin only; let cross-origin (licdn images, etc.) go straight to network.
  if (url.origin !== self.location.origin) return

  // Never intercept API routes — they may carry private, per-user data.
  if (url.pathname.startsWith('/api/')) return

  // Immutable build assets + precached icons → cache-first.
  const isStatic = url.pathname.startsWith('/_next/static/') || PRECACHE.includes(url.pathname)
  if (isStatic) {
    event.respondWith(
      caches.match(request).then((cached) =>
        cached ||
        fetch(request).then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put(request, copy))
          return res
        })
      )
    )
    return
  }

  // Page navigations → network-first, offline fallback. Responses are NOT cached
  // (they can be personalized / authenticated).
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('/offline.html')))
    return
  }

  // Everything else → straight to network, no caching.
})
