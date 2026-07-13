// Nous PWA Service Worker
const CACHE   = 'nous-v3'
const OFFLINE  = '/offline'
const PRECACHE = [
  OFFLINE,
  '/nous-logo.svg',
  '/manifest.json',
]

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', e => {
  // Only handle GET requests
  if (e.request.method !== 'GET') return

  const url = new URL(e.request.url)
  if (url.origin !== self.location.origin) return

  // Next.js client navigation requests React Server Component payloads. They
  // are route state, not immutable assets; caching them can mix an old hero
  // tree with a new JavaScript bundle after a deployment or language switch.
  const accept = e.request.headers.get('accept') || ''
  const isRoutePayload =
    e.request.headers.get('rsc') === '1' ||
    url.searchParams.has('_rsc') ||
    url.pathname.startsWith('/_next/data/') ||
    accept.includes('text/x-component')

  if (isRoutePayload) {
    e.respondWith(fetch(e.request))
    return
  }

  // Network-first for API routes
  if (e.request.url.includes('/api/')) {
    e.respondWith(
      fetch(e.request).catch(() =>
        new Response(JSON.stringify({ error: 'Offline' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 503,
        })
      )
    )
    return
  }

  // HTML is always network-first and is not stored as an app-shell snapshot.
  // The dedicated offline page is the only navigation fallback.
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(OFFLINE))
    )
    return
  }

  // Hashed Next assets are immutable and safe to cache-first.
  if (url.pathname.startsWith('/_next/static/')) {
    e.respondWith(caches.match(e.request).then(cached => cached ?? fetch(e.request).then(res => {
      if (res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()))
      return res
    })))
    return
  }

  // Public visual assets may keep a stale copy while refreshing. Everything
  // else passes directly to the network so route state can never be fossilised.
  if (['image', 'font'].includes(e.request.destination) || url.pathname === '/manifest.json') {
    e.respondWith(
      caches.match(e.request).then(cached => {
        const fresh = fetch(e.request).then(res => {
          if (res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()))
          return res
        })
        return cached ?? fresh
      })
    )
  }
})
