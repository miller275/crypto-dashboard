/**
 * Fetch CoinMarketCap Pro data and write GitHub Pages snapshots into /data
 * Usage (GitHub Actions):
 *   CMC_PRO_API_KEY=... node scripts/fetch-cmc.js
 */
const fs = require("fs");
const path = require("path");

const API_KEY = process.env.CMC_PRO_API_KEY;

if (!API_KEY) {
  console.error("Missing env CMC_PRO_API_KEY. Add it as a GitHub Actions secret.");
  process.exit(1);
}

const BASE = "https://pro-api.coinmarketcap.com/v1";
const OUT_DIR = path.join(process.cwd(), "data");

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function cmc(endpoint, params) {
  const url = new URL(BASE + endpoint);
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    url.searchParams.set(k, String(v));
  });

  const res = await fetch(url.toString(), {
    headers: {
      "Accept": "application/json",
      "X-CMC_PRO_API_KEY": API_KEY
    }
  });

  const text = await res.text();
  let data = null;
  try { data = JSON.parse(text); } catch {}

  if (!res.ok) {
    console.error("CMC HTTP error", res.status, url.toString(), text.slice(0, 400));
    throw new Error(`CMC HTTP ${res.status}`);
  }

  if (data && data.status && data.status.error_code && data.status.error_code !== 0) {
    throw new Error(`CMC API error ${data.status.error_code}: ${data.status.error_message || "Unknown"}`);
  }

  return data;
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function safeStr(s, max = 1200) {
  const x = (s || "").toString();
  return x.length > max ? x.slice(0, max) : x;
}

function pickFirst(arr) {
  if (!Array.isArray(arr)) return "";
  const v = arr.find(Boolean);
  return v || "";
}

function makeGlobalLikeCG(globalData, vsLower) {
  // Try to be resilient to slightly different shapes.
  const d = (globalData && globalData.data) ? globalData.data : (globalData || {});
  const q = d.quote ? (d.quote[(vsLower || "usd").toUpperCase()] || d.quote.USD || d.quote.EUR) : null;

  const total_market_cap = (q && q.total_market_cap) ?? d.total_market_cap ?? null;
  const total_volume = (q && q.total_volume_24h) ?? d.total_volume_24h ?? d.total_volume_24h_reported ?? null;

  const btc_dom = d.btc_dominance ?? (q && q.btc_dominance) ?? null;

  // change % if available
  const mcap_change =
    (q && (q.total_market_cap_yesterday_percentage_change ?? q.total_market_cap_yesterday_percent_change ?? q.total_market_cap_yesterday_change_percentage)) ??
    null;

  return {
    data: {
      total_market_cap: { [vsLower]: total_market_cap },
      total_volume: { [vsLower]: total_volume },
      market_cap_percentage: { btc: btc_dom },
      active_cryptocurrencies: d.active_cryptocurrencies ?? null,
      markets: d.active_market_pairs ?? d.active_exchanges ?? null,
      market_cap_change_percentage_24h_usd: (vsLower === "usd" ? mcap_change : null)
    }
  };
}

function mapCoin(listing, info, vsLower, convert) {
  const q = listing.quote ? (listing.quote[convert] || listing.quote.USD || listing.quote.EUR) : {};
  return {
    id: String(listing.id),
    name: listing.name,
    symbol: listing.symbol,
    image: (info && info.logo) ? info.logo : "",
    market_cap_rank: listing.cmc_rank ?? null,
    current_price: q.price ?? null,
    market_cap: q.market_cap ?? null,
    total_volume: q.volume_24h ?? null,
    price_change_percentage_1h_in_currency: q.percent_change_1h ?? null,
    price_change_percentage_24h_in_currency: q.percent_change_24h ?? null,
    price_change_percentage_7d_in_currency: q.percent_change_7d ?? null,
    circulating_supply: listing.circulating_supply ?? null,
    max_supply: listing.max_supply ?? null,
    total_supply: listing.total_supply ?? null,
    last_updated: listing.last_updated ?? (q.last_updated ?? null),

    // extras for coin page
    description: safeStr(info && info.description ? info.description : "", 1400),
    homepage: pickFirst(info && info.urls ? info.urls.website : []),
    explorer: pickFirst(info && info.urls ? info.urls.explorer : []),
    tags: (info && Array.isArray(info.tags)) ? info.tags.slice(0, 12) : []
  };
}

function makeTrendingLikeCG(coins) {
  // "Trending" = top positive 24h movers from our snapshot (simple + fast)
  const arr = coins
    .filter(c => typeof c.price_change_percentage_24h_in_currency === "number")
    .slice()
    .sort((a, b) => b.price_change_percentage_24h_in_currency - a.price_change_percentage_24h_in_currency)
    .slice(0, 7)
    .map(c => ({ item: { id: c.id, name: c.name, symbol: c.symbol, market_cap_rank: c.market_cap_rank } }));
  return { coins: arr };
}

async function build(convert) {
  const vsLower = convert.toLowerCase();

  // 1) Listings latest
  const listings = await cmc("/cryptocurrency/listings/latest", {
    start: 1,
    limit: 250,
    convert: convert
  });

  const list = (listings && listings.data) ? listings.data : [];
  const ids = list.map(x => x.id);

  // 2) Info (logos + descriptions) in chunks
  const infoMap = {};
  for (const part of chunk(ids, 100)) {
    const info = await cmc("/cryptocurrency/info", { id: part.join(",") });
    const data = info && info.data ? info.data : {};
    Object.assign(infoMap, data);
    // small delay to be nice
    await sleep(250);
  }

  // 3) Global metrics
  const globalRaw = await cmc("/global-metrics/quotes/latest", { convert: convert });

  const coins = list.map(l => mapCoin(l, infoMap[String(l.id)], vsLower, convert));
  const snapshot = {
    source: "coinmarketcap-pro",
    convert: convert,
    updated_at: new Date().toISOString(),
    global: makeGlobalLikeCG(globalRaw, vsLower),
    trending: makeTrendingLikeCG(coins),
    coins
  };

  return snapshot;
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const usd = await build("USD");
  fs.writeFileSync(path.join(OUT_DIR, "market_usd.json"), JSON.stringify(usd, null, 2), "utf8");

  const eur = await build("EUR");
  fs.writeFileSync(path.join(OUT_DIR, "market_eur.json"), JSON.stringify(eur, null, 2), "utf8");

  console.log("✅ Updated snapshots in /data");
}

main().catch((e) => {
  console.error("❌ Failed to update snapshots:", e);
  process.exit(1);
});
