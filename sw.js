/* Service Worker (optional but enabled by default)
   Strategy:
   - /assets/* cache-first (static)
   - /data/* network-first + cache fallback
   - Versioning via /data/generated.json timestamp.
   NOTE: GitHub Pages often serves under /<repo>/, so we detect paths via "includes".
*/
const STATIC_CACHE = 'static-v1';
let DATA_CACHE = 'data-v1';

const CORE_ASSETS = [
  './',
  './index.html',
  './coin.html',
  './assets/css/tokens.css',
  './assets/css/base.css',
  './assets/css/layout.css',
  './assets/css/components.css',
  './assets/css/pages/index.css',
  './assets/css/pages/coin.css',
  './assets/js/pages/index.page.js',
  './assets/js/pages/coin.page.js',
  './assets/img/brand.svg',
  './assets/img/coin-placeholder.svg',
  './data/generated.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(STATIC_CACHE);
    await cache.addAll(CORE_ASSETS);
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    self.clients.claim();
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => {
      if (k !== STATIC_CACHE && k !== DATA_CACHE) return caches.delete(k);
      return Promise.resolve();
    }));
  })());
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const fresh = await fetch(request);
  const cache = await caches.open(STATIC_CACHE);
  cache.put(request, fresh.clone());
  return fresh;
}

async function networkFirstData(request) {
  try {
    const fresh = await fetch(request, { cache: 'no-store' });
    const cache = await caches.open(DATA_CACHE);
    cache.put(request, fresh.clone());
    return fresh;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw new Error('No network and no cache');
  }
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only handle same-origin
  if (url.origin !== location.origin) return;

  const path = url.pathname;

  // Data requests (works under /repo/ as well)
  if (path.includes('/data/')) {
    event.respondWith(networkFirstData(event.request));
    return;
  }

  // Static assets & documents
  if (path.includes('/assets/') || path.endsWith('.html') || path.endsWith('/') ) {
    event.respondWith(cacheFirst(event.request));
    return;
  }
});

self.addEventListener('message', (event) => {
  const msg = event.data || {};
  if (msg.type === 'PURGE_DATA') {
    event.waitUntil((async () => {
      if (msg.version) DATA_CACHE = `data-v${msg.version}`;
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => {
        if (k.startsWith('data-v') && k !== DATA_CACHE) return caches.delete(k);
        return Promise.resolve();
      }));
      if (msg.hard === true) await caches.delete(DATA_CACHE);
      const clientList = await self.clients.matchAll({ type: 'window' });
      clientList.forEach((c) => c.postMessage({ type: 'DATA_PURGED' }));
    })());
  }
  if (msg.type === 'SKIP_WAITING') self.skipWaiting();
});
