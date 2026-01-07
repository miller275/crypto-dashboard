/* CryptoBoard SW
 * - caches app shell
 * - caches fetched ./data pages on demand
 * NOTE: keep cache small; listings pages can be large.
 */
const CACHE = "cb-v1";
const SHELL = [
  "./",
  "./index.html",
  "./coin.html",
  "./assets/css/tokens.css",
  "./assets/css/base.css",
  "./assets/css/layout.css",
  "./assets/css/components.css",
  "./assets/css/pages/index.css",
  "./assets/css/pages/coin.css",
  "./assets/js/pages/index-page.js",
  "./assets/js/pages/coin-page.js",
  "./assets/js/pages/shared-ui.js",
  "./assets/js/pages/shared-search.js",
  "./assets/js/core/config.js",
  "./assets/js/core/data-client.js",
  "./assets/js/core/dom.js",
  "./assets/js/core/format.js",
  "./assets/js/core/sparkline.js",
  "./assets/js/core/storage.js",
  "./assets/js/core/theme.js",
  "./assets/js/i18n/i18n.js",
  "./assets/js/i18n/locales/en.json",
  "./assets/js/i18n/locales/ru.json",
  "./assets/img/favicon.svg"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(()=>self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async()=>{
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    self.clients.claim();
  })());
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if(req.method !== "GET") return;

  // Only handle same-origin
  if(url.origin !== location.origin) return;

  // Network-first for /data, cache fallback
  if(url.pathname.includes("/data/")){
    e.respondWith((async()=>{
      const cache = await caches.open(CACHE);
      try{
        const fresh = await fetch(req);
        if(fresh.ok) cache.put(req, fresh.clone());
        return fresh;
      }catch(_){
        const cached = await cache.match(req);
        return cached || new Response(JSON.stringify({}), { headers: { "content-type":"application/json" } });
      }
    })());
    return;
  }

  // Cache-first for everything else
  e.respondWith((async()=>{
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req);
    if(cached) return cached;
    const res = await fetch(req);
    if(res.ok) cache.put(req, res.clone());
    return res;
  })());
});
