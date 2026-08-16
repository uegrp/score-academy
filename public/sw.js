// Minimal app-shell service worker for SCORE.
// Caches only static build assets — never API/Firestore responses,
// so player data always stays fresh and never goes stale offline.
const CACHE_NAME = 'score-shell-v1'
const SHELL_ASSETS = ['/', '/manifest.json']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS)).catch(() => {})
  )
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

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).catch(() => cached))
  )
})
