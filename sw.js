const CACHE = "cryptowatch-v9";
const ASSETS = [
  "./",
  "./index.html",
  "./coin.html",
  "./assets/css/variables.css",
  "./assets/css/base.css",
  "./assets/css/layout.css",
  "./assets/css/components.css",
  "./assets/css/responsive.css",
  "./assets/js/app.js",
  "./assets/js/config.js",
  "./assets/js/store.js",
  "./assets/js/i18n.js",
  "./assets/js/theme.js",
  "./assets/js/utils.js",
  "./assets/js/data.js",
  "./assets/js/charts.js",
  "./assets/js/ui.js",
  "./assets/js/pages/index.js",
  "./assets/js/pages/coin.js",
  "./assets/img/logo.svg",
  "./assets/img/coin-placeholder.svg",
];

self.addEventListener("install", (e)=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});

self.addEventListener("activate", (e)=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener("fetch", (e)=>{
  const url = new URL(e.request.url);
  // network-first for data files
  if (url.pathname.includes("/data/")) {
    e.respondWith(
      fetch(e.request).then(r=>{
        const copy = r.clone();
        caches.open(CACHE).then(c=>c.put(e.request, copy));
        return r;
      }).catch(()=>caches.match(e.request))
    );
    return;
  }

  // cache-first for assets
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
