import { Utils } from "./utils.js";

/**
 * Data strategy:
 *  1) Prefer static snapshots under /data (best for GitHub Pages).
 *  2) Fallback to live public endpoints (CoinGecko + Alternative.me + CryptoCompare).
 */
const SNAPSHOT = {
  markets: "data/markets.latest.json",
  global: "data/global.latest.json",
  fng: "data/fear-greed.latest.json",
  news: "data/news.latest.json"
};

async function fetchJSON(url, {timeoutMs=12000}={}){
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try{
    const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

async function trySnapshot(url){
  try{
    return await fetchJSON(url, { timeoutMs: 6000 });
  }catch(_){
    return null;
  }
}

export const API = {
  async loadMarkets(){
    const snap = await trySnapshot(SNAPSHOT.markets);
    if (snap && Array.isArray(snap.coins)){
      return { source: snap.source || "snapshot", updatedAt: snap.updatedAt, coins: snap.coins, global: snap.global || null };
    }

    // Live CoinGecko: coins + global
    const [coins, global] = await Promise.all([
      fetchJSON("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=true&price_change_percentage=1h,24h,7d"),
      fetchJSON("https://api.coingecko.com/api/v3/global")
    ]);

    const mapped = coins.map((c, idx) => ({
      id: c.id,
      symbol: (c.symbol || "").toUpperCase(),
      name: c.name,
      image: c.image,
      rank: c.market_cap_rank ?? (idx+1),
      price: c.current_price,
      marketCap: c.market_cap,
      volume24h: c.total_volume,
      change1h: c.price_change_percentage_1h_in_currency,
      change24h: c.price_change_percentage_24h_in_currency ?? c.price_change_percentage_24h,
      change7d: c.price_change_percentage_7d_in_currency,
      supply: c.circulating_supply,
      totalSupply: c.total_supply,
      sparkline7d: c.sparkline_in_7d?.price || null,
      ath: c.ath,
      atl: c.atl,
      lastUpdated: c.last_updated
    }));

    const g = global?.data ? {
      marketCapUsd: global.data.total_market_cap?.usd ?? null,
      marketCapChange24h: global.data.market_cap_change_percentage_24h_usd ?? null,
      volumeUsd24h: global.data.total_volume?.usd ?? null,
      btcDominance: global.data.market_cap_percentage?.btc ?? null,
      ethDominance: global.data.market_cap_percentage?.eth ?? null
    } : null;

    return { source: "coingecko", updatedAt: new Date().toISOString(), coins: mapped, global: g };
  },

  async loadFearGreed(){
    const snap = await trySnapshot(SNAPSHOT.fng);
    if (snap && snap.data) return { source: snap.source || "snapshot", ...snap };

    try{
      const live = await fetchJSON("https://api.alternative.me/fng/?limit=1&format=json");
      return { source: "alternative.me", data: live.data, updatedAt: new Date().toISOString() };
    }catch(_){
      return { source: "none", data: [{ value: "—", value_classification: "—", timestamp: String(Math.floor(Date.now()/1000)) }], updatedAt: new Date().toISOString() };
    }
  },

  async loadNews(){
    const snap = await trySnapshot(SNAPSHOT.news);
    if (snap && Array.isArray(snap.items)) return { source: snap.source || "snapshot", updatedAt: snap.updatedAt, items: snap.items };

    // CryptoCompare news has decent CORS availability; still, fallback gracefully.
    try{
      const live = await fetchJSON("https://min-api.cryptocompare.com/data/v2/news/?lang=EN");
      const items = (live?.Data || []).slice(0, 8).map(n => ({
        title: n.title,
        url: n.url,
        source: n.source,
        publishedAt: n.published_on ? new Date(n.published_on * 1000).toISOString() : null
      }));
      return { source: "cryptocompare", updatedAt: new Date().toISOString(), items };
    }catch(_){
      return { source: "none", updatedAt: new Date().toISOString(), items: [] };
    }
  },

  async loadCoinDetails(id){
    // Try local snapshots first (optional): data/coins/<id>.json
    const snap = await trySnapshot(`data/coins/${encodeURIComponent(id)}.json`);
    if (snap && snap.id) return { source: snap.source || "snapshot", data: snap };

    const data = await fetchJSON(`https://api.coingecko.com/api/v3/coins/${encodeURIComponent(id)}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`);
    return { source: "coingecko", data };
  },

  async loadMarketChart(id, days){
    // Try local snapshots first (optional): data/charts/<id>-<days>.json
    const snap = await trySnapshot(`data/charts/${encodeURIComponent(id)}-${encodeURIComponent(days)}.json`);
    if (snap && snap.prices) return { source: snap.source || "snapshot", data: snap };

    const data = await fetchJSON(`https://api.coingecko.com/api/v3/coins/${encodeURIComponent(id)}/market_chart?vs_currency=usd&days=${encodeURIComponent(days)}`);
    return { source: "coingecko", data };
  },

  async loadOHLC(id, days){
    // CoinGecko OHLC supports days: 1,7,14,30,90,180,365,max
    const snap = await trySnapshot(`data/ohlc/${encodeURIComponent(id)}-${encodeURIComponent(days)}.json`);
    if (Array.isArray(snap)) return { source: snap.source || "snapshot", data: snap };

    const data = await fetchJSON(`https://api.coingecko.com/api/v3/coins/${encodeURIComponent(id)}/ohlc?vs_currency=usd&days=${encodeURIComponent(days)}`);
    return { source: "coingecko", data };
  }
};
