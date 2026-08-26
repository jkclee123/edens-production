const CACHE_NAME = 'edens-production-v3';
const OFFLINE_URL = '/offline';

// Cache only the public offline page. Authenticated pages must always be
// resolved by the server so a logged-out session cannot receive stale HTML.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.add(new Request(OFFLINE_URL, { cache: 'reload' })))
      // A failed pre-cache must not block installation, otherwise a stale
      // worker stays in control.
      .catch(() => undefined)
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable().catch(() => undefined);
      }
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
      await self.clients.claim();
    })()
  );
});

// Brief pause before retrying a failed navigation. Route blips between the
// device and the edge often clear in well under a second, and retrying
// instantly just burns the one retry on the same dead socket.
const RETRY_DELAY_MS = 500;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Escape hatch: a page can tell a wedged worker to remove itself.
self.addEventListener('message', (event) => {
  if (event.data === 'unregister') {
    event.waitUntil(
      self.registration
        .unregister()
        .then(() => caches.keys())
        .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
        .catch(() => undefined)
    );
  }
});

// Use the network for every navigation. If it is unavailable, show the
// public offline page instead of replaying a cached authenticated route.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (event.request.mode !== 'navigate') return;

  event.respondWith(
    (async () => {
      try {
        const preloaded = await event.preloadResponse;
        if (preloaded) return preloaded;
        return await fetch(event.request);
      } catch {
        // One retry, after a short backoff: a single transient failure should
        // not strand the user on the offline page.
        try {
          await delay(RETRY_DELAY_MS);
          return await fetch(event.request);
        } catch {
          const cachedResponse = await caches.match(OFFLINE_URL);
          return (
            cachedResponse ||
            new Response('Offline', {
              status: 503,
              headers: { 'Content-Type': 'text/plain' },
            })
          );
        }
      }
    })()
  );
});
