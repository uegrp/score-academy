// Minimal app-shell service worker for SCORE.
// Uses a network-first strategy for the HTML shell so a fresh deploy is
// always picked up (the shell references hashed JS/CSS filenames that
// change on every build — caching it cache-first would keep pointing at
// filenames that no longer exist after a new deployment, causing 404s).
// Hashed static assets (JS/CSS/images) are safe to cache more eagerly
// since their filename changes whenever their content does.
const CACHE_NAME = 'score-shell-v2'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  // Never intercept Firebase/Firestore/API calls — always go to network.
  if (request.url.includes('googleapis.com') || request.url.includes('firestore')) return

  // Navigation requests (the HTML shell) and manifest: network-first,
  // falling back to cache only if the network is unavailable.
  const isNavigation = request.mode === 'navigate'
  const isManifest = request.url.endsWith('/manifest.json')

  if (isNavigation || isManifest) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {})
          return response
        })
        .catch(() => caches.match(request))
    )
    return
  }

  // Hashed build assets: cache-first is safe since the filename changes
  // whenever the content does.
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).catch(() => cached))
  )
})
