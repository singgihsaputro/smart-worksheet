// Keeps Smart Worksheet opening on a poor connection, or with the server down:
// the app's files come from the network when it answers and from the last
// copy when it doesn't. The API is never cached.
const CACHE = 'smart-worksheet'

// Saved up front so the worksheets open offline. Sounds are cached as they play.
const CORE = ['/', '/app.js', '/dom.js', '/drag.js', '/data.js', '/sheets.js', '/sfx.js', '/style.css',
  '/manifest.webmanifest', '/icon-192.png', '/apple-touch-icon.png', '/brand/childplay-logo-icon.svg',
  '/brand/childplay-logo-horizontal.svg']

self.addEventListener('install', event => {
  self.skipWaiting()
  event.waitUntil(caches.open(CACHE).then(cache => Promise.all(CORE.map(path => cache.add(path).catch(() => {})))))
})
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()))

async function saved(request) {
  const hit = await caches.match(request, { ignoreSearch: true })
  if (hit) return hit
  if (request.mode === 'navigate') return (await caches.match('/')) ?? Response.error()
  return Response.error()
}

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url)
  if (event.request.method !== 'GET' || url.origin !== location.origin || url.pathname.startsWith('/api/')) return
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok) {
          const copy = response.clone()
          caches.open(CACHE).then(cache => cache.put(event.request, copy))
          return response
        }
        return response.status >= 500 ? saved(event.request).then(r => (r.type === 'error' ? response : r)) : response
      })
      .catch(() => saved(event.request)),
  )
})
