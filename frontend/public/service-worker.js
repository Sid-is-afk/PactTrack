// PactTrack Service Worker Stub
// This is a placeholder for future offline caching and push notification support.

const CACHE_NAME = 'pacttrack-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass through all requests for now
  event.respondWith(fetch(event.request));
});
