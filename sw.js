const CACHE = "cryptowatch-v10";
const ASSETS = [
  "./",
  "./index.html",
  "./coin.html",
  "./assets/css/styles.css",
  "./assets/js/app.js",
  "./assets/js/coin.js",
  "./assets/js/api.js",
  "./assets/js/ui.js",
  "./assets/js/utils.js",
  "./assets/js/sparkline.js",
  "./assets/js/tradingview.js",
  "./assets/img/coin.svg"
];

self.addEventListener("install", (e)=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e)=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>k===CACHE?null:caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", (e)=>{
  const url = new URL(e.request.url);
  if (url.pathname.includes("/data/")){
    e.respondWith(fetch(e.request).then(res=>{
      const copy = res.clone();
      caches.open(CACHE).then(c=>c.put(e.request, copy));
      return res;
    }).catch(()=>caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit=>hit || fetch(e.request)));
});
