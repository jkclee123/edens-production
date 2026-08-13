const CACHE_NAME = 'edens-production-v2';
const OFFLINE_URL = '/offline';

// Cache only the public offline page. Authenticated pages must always be
// resolved by the server so a logged-out session cannot receive stale HTML.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.add(OFFLINE_URL);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  self.clients.claim();
});

// Use the network for every navigation. If it is unavailable, show the
// public offline page instead of replaying a cached authenticated route.
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  if (event.request.mode !== 'navigate') return;

  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(OFFLINE_URL).then((cachedResponse) => {
          return cachedResponse || new Response('Offline', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' },
          });
        });
      })
  );
});
