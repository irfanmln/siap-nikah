// Service Worker for Siap Nikah PWA
const CACHE_NAME = 'siapnikah-cache-v1';

// Install event - skip waiting
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event - claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network-first strategy for safety with API & real-time sync
self.addEventListener('fetch', (event) => {
  // Ignore non-GET and API calls from service worker cache
  if (event.request.method !== 'GET' || event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If good network response, return directly
        return response;
      })
      .catch(() => {
        // Fallback to cache if offline
        return caches.match(event.request);
      })
  );
});
