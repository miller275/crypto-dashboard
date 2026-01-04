// Basic SW: cache app shell + data snapshots (works on GitHub Pages)
const CACHE = "cw-cache-v1";
const CORE = [
  "./",
  "./index.html",
  "./coin.html",
  "./manifest.json",
  "./robots.txt",
  "./assets/css/styles.css",
  "./assets/css/responsive.css",
  "./assets/js/app.js",
  "./assets/js/coin.js",
  "./assets/js/api.js",
  "./assets/js/ui.js",
  "./assets/js/utils.js",
  "./assets/js/i18n.js",
  "./assets/js/theme.js",
  "./assets/img/logo.svg",
  "./assets/img/coin.svg",
  "./data/markets.latest.json",
  "./data/fear-greed.latest.json",
  "./data/news.latest.json"
];

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(CORE);
    self.skipWaiting();
  })());
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    self.clients.claim();
  })());
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;

  // Network-first for /data, cache-first for the rest.
  const isData = url.pathname.includes("/data/");
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    if (isData){
      try{
        const fresh = await fetch(e.request);
        cache.put(e.request, fresh.clone());
        return fresh;
      }catch(_){
        const cached = await cache.match(e.request);
        return cached || new Response(JSON.stringify({error:"offline"}), { headers: {"Content-Type":"application/json"} });
      }
    }else{
      const cached = await cache.match(e.request);
      if (cached) return cached;
      const res = await fetch(e.request);
      cache.put(e.request, res.clone());
      return res;
    }
  })());
});
