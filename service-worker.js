/* service-worker.js — offline cache (static + /data) */
const CACHE = "cryptoboard-v1";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./coin.html",
  "./manifest.json",
  "./assets/css/tokens.css",
  "./assets/css/base.css",
  "./assets/css/layout.css",
  "./assets/css/components.css",
  "./assets/css/pages/index.css",
  "./assets/css/pages/coin.css",
  "./assets/js/pages/index.js",
  "./assets/js/pages/coin.js",
  "./assets/js/core/config.js",
  "./assets/js/core/data-client.js",
  "./assets/js/core/format.js",
  "./assets/js/core/dom.js",
  "./assets/js/core/storage.js",
  "./assets/js/core/theme.js",
  "./assets/js/core/service-worker.js",
  "./assets/js/i18n/i18n.js",
  "./assets/js/i18n/locales/en.json",
  "./assets/js/i18n/locales/ru.json",
  "./assets/js/ui/search.js",
  "./assets/js/ui/sparkline.js",
  "./assets/img/icon-192.png",
  "./assets/img/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k === CACHE ? null : caches.delete(k)))).then(()=>self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Always network-first for /data (fresh snapshots)
  if (url.pathname.includes("/data/")) {
    event.respondWith(
      fetch(event.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy));
        return res;
      }).catch(()=>caches.match(event.request))
    );
    return;
  }

  // Cache-first for core assets
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
