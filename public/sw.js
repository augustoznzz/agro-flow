/*
  Simple offline-first service worker for AgroFlow
  - Precache app shell and static assets
  - Network-first for navigation requests (HTML)
  - Cache-first for static assets
  - Fallback to offline page when navigation fails
*/

const CACHE_VERSION = 'v1';
const RUNTIME_CACHE = `agroflow-runtime-${CACHE_VERSION}`;
const PRECACHE = `agroflow-precache-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo2.png',
  '/icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PRECACHE).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => ![PRECACHE, RUNTIME_CACHE].includes(key))
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Helper predicates
const isNavigationRequest = (request) => request.mode === 'navigate';
const isStaticAsset = (url) => {
  return /\.(?:js|css|png|jpg|jpeg|gif|webp|svg|ico|woff2?|ttf|eot)$/.test(url.pathname);
};

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET
  if (request.method !== 'GET') return;

  // Network-first for navigations
  if (isNavigationRequest(request)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || (await caches.match('/offline.html'));
        })
    );
    return;
  }

  // Cache-first for static assets
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request)
          .then((response) => {
            const copy = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              // Evita tentar cachear extensões do browser
              if (request.url.startsWith('chrome-extension://') || request.url.startsWith('moz-extension://')) {
                return Promise.resolve();
              }
              return cache.put(request, copy);
            });
            return response;
          })
          .catch(() => caches.match('/offline.html'));
      })
    );
    return;
  }

  // Default: try network, then cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
        return response;
      })
      .catch(() => caches.match(request))
  );
});


