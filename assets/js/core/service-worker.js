/**
 * Modular Service Worker (imported from /service-worker.js).
 * This is a starter placeholder; extend caching as needed.
 */
const CACHE = 'cryptoboard-v1';
const APP_SHELL = [
  './',
  './index.html',
  './coin.html',
  './assets/css/tokens.css',
  './assets/css/base.css',
  './assets/css/layout.css',
  './assets/css/components.css',
  './assets/css/pages/index.css',
  './assets/css/pages/coin.css',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(cache => cache.put(req, copy)).catch(()=>{});
      return res;
    }).catch(()=>cached))
  );
});
