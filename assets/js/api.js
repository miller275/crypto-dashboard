/* CryptoWatch — api.js (CoinMarketCap Pro via GitHub Pages snapshots + alternative.me F&G)
   IMPORTANT: CoinMarketCap Pro API нельзя дергать напрямую из браузера (CORS + утечка ключа).
   Поэтому данные обновляются GitHub Actions и сохраняются в /data/*.json, а сайт читает их как статику.
*/
(function () {
  const NS = (window.CryptoWatch = window.CryptoWatch || {});
  NS.api = NS.api || {};

  const FNG_URL = "https://api.alternative.me/fng/?limit=1&format=json";

  const _status = { snapshotsReady: false, updatedAt: null, lastVs: "usd" };
  NS.api.getStatus = function () { return Object.assign({}, _status); };

  function now() { return Date.now(); }

  function cacheGet(key, ttlMs) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (!obj || typeof obj !== "object") return null;
      if (!obj.t || !obj.v) return null;
      if (now() - obj.t > ttlMs) return null;
      return obj.v;
    } catch { return null; }
  }

  function cacheSet(key, value) {
    try { localStorage.setItem(key, JSON.stringify({ t: now(), v: value })); } catch {}
  }

  async function getJSON(url, { cacheKey, ttlMs } = {}) {
    if (cacheKey && ttlMs) {
      const v = cacheGet(cacheKey, ttlMs);
      if (v) return v;
    }
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
    const data = await res.json();
    if (cacheKey && ttlMs) cacheSet(cacheKey, data);
    return data;
  }

  function normalizeVs(vs) {
    const v = (vs || "usd").toLowerCase();
    return (v === "eur") ? "eur" : "usd";
  }

  function marketFile(vs) {
    const v = normalizeVs(vs);
    return `data/market_${v}.json`;
  }

  function requireData(snapshot) {
    const ok = snapshot && Array.isArray(snapshot.coins) && snapshot.coins.length;
    return !!ok;
  }

  async function getSnapshot(vs) {
    const v = normalizeVs(vs);
    _status.lastVs = v;
    const key = `cw_cache_market_snapshot_${v}`;
    // 2 minutes cache
    const snap = await getJSON(marketFile(v), { cacheKey: key, ttlMs: 2 * 60 * 1000 });

    const ok = requireData(snap);
    _status.snapshotsReady = ok;
    _status.updatedAt = (snap && snap.updated_at) ? snap.updated_at : null;

    if (!ok) {
      // Return a safe empty snapshot so the UI can show setup instructions instead of crashing.
      return {
        source: (snap && snap.source) || "coinmarketcap-pro",
        convert: (snap && snap.convert) || v.toUpperCase(),
        updated_at: _status.updatedAt,
        global: (snap && snap.global) || null,
        trending: (snap && snap.trending) || { coins: [] },
        coins: [],
        _needsUpdate: true
      };
    }

    return snap;
  }

  function sortCoins(coins, order) {
    const o = (order || "market_cap_desc");
    const arr = coins.slice();
    const num = (x) => (typeof x === "number" && !Number.isNaN(x)) ? x : -Infinity;
    const pick = (c) => {
      switch (o) {
        case "market_cap_desc": return num(c.market_cap);
        case "market_cap_asc": return -num(c.market_cap);
        case "price_desc": return num(c.current_price);
        case "price_asc": return -num(c.current_price);
        case "change_desc": return num(c.price_change_percentage_24h_in_currency);
        case "change_asc": return -num(c.price_change_percentage_24h_in_currency);
        case "volume_desc": return num(c.total_volume);
        default: return num(c.market_cap);
      }
    };
    arr.sort((a, b) => pick(b) - pick(a));
    return arr;
  }

  async function getMarketCoins(vsCurrency, perPage, page, order) {
    const snap = await getSnapshot(vsCurrency);
    const coins = sortCoins(snap.coins || [], order);
    const per = Number(perPage) || coins.length;
    const pg = Number(page) || 1;
    const start = (pg - 1) * per;
    return coins.slice(start, start + per);
  }

  async function getGlobal(vsCurrency) {
    const vs = vsCurrency || (localStorage.getItem("cw_vs") || "usd");
    const snap = await getSnapshot(vs);
    // already in CoinGecko-like shape for app.js compatibility
    return snap.global;
  }

  async function getTrending(vsCurrency) {
    const vs = vsCurrency || (localStorage.getItem("cw_vs") || "usd");
    const snap = await getSnapshot(vs);
    return snap.trending;
  }

  async function getFearGreed() {
    return getJSON(FNG_URL, { cacheKey: "cw_cache_fng", ttlMs: 10 * 60 * 1000 });
  }

  async function getCoin(id, vsCurrency) {
    const vsCur = vsCurrency || (localStorage.getItem("cw_vs") || "usd");
    const snap = await getSnapshot(vsCur);
    const c = (snap.coins || []).find(x => String(x.id) === String(id));
    if (!c) throw new Error("Coin not found in snapshot");
    const vs = normalizeVs(vsCur);

    // минимальная совместимость с прежним coin.js (CoinGecko-like)
    return {
      id: String(c.id),
      symbol: c.symbol,
      name: c.name,
      market_cap_rank: c.market_cap_rank,
      image: { large: c.image || "" },
      description: { en: c.description || "" },
      links: {
        homepage: [c.homepage || ""],
        blockchain_site: [c.explorer || ""]
      },
      market_data: {
        current_price: { [vs]: c.current_price },
        market_cap: { [vs]: c.market_cap },
        total_volume: { [vs]: c.total_volume },
        circulating_supply: c.circulating_supply,
        max_supply: c.max_supply,
        ath: { [vs]: null },
        ath_date: { [vs]: null }
      }
    };
  }

  function clearCaches() {
    try {
      const keys = Object.keys(localStorage);
      for (const k of keys) {
        if (k.startsWith("cw_cache_")) localStorage.removeItem(k);
      }
    } catch {}
  }

  NS.api = { getSnapshot, getMarketCoins, getGlobal, getTrending, getFearGreed, getCoin, clearCaches };
})();
