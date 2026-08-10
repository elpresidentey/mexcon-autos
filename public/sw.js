const CACHE_NAME = 'mexcon-autos-v2';
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/offline.html',
];

const OFFLINE_PAGE = '/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  // Navigation requests: try network first, then the cached copy of the exact
  // URL, then the app shell, then the dedicated offline page.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          const cachedRequest = await caches.match(request);
          if (cachedRequest) return cachedRequest;
          const cachedIndex = await caches.match('/index.html');
          return cachedIndex || (await caches.match(OFFLINE_PAGE));
        })
    );
    return;
  }

  if (new URL(request.url).origin !== self.location.origin) return;

  // Same-origin static assets: cache-first with background refresh.
  event.respondWith(
    caches.match(request).then(
      (cached) => {
        const networkFetch = fetch(request)
          .then((response) => {
            if (response.ok && response.type === 'basic') {
              const copy = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            }
            return response;
          })
          .catch(() => cached);
        return cached || networkFetch;
      }
    )
  );
});