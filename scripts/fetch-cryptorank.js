/**
 * Fetch CryptoRank API data and write GitHub Pages snapshots into /data
 *
 * Why GitHub Actions?
 * - CryptoRank API (like most PRO APIs) shouldn't be called directly from the browser:
 *   CORS restrictions + you would leak your API key.
 * - We fetch server-side in GitHub Actions and commit static JSON snapshots to /data.
 *
 * Usage (GitHub Actions):
 *   CRYPTORANK_API_KEY=... node scripts/fetch-cryptorank.js
 */
const fs = require("fs");
const path = require("path");

const API_KEY = process.env.CRYPTORANK_API_KEY;
if (!API_KEY) {
  console.error("Missing env CRYPTORANK_API_KEY. Add it as a GitHub Actions secret.");
  process.exit(1);
}

const BASE = "https://api.cryptorank.io/v2";
const OUT_DIR = path.join(__dirname, "..", "data");

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function safeStr(s, max = 1200) {
  const x = (s || "").toString();
  return x.length > max ? x.slice(0, max) : x;
}

function pickFirst(arr) {
  if (!arr) return "";
  if (Array.isArray(arr)) return arr.find(x => typeof x === "string" && x) || "";
  return (typeof arr === "string") ? arr : "";
}

function findFirstUrl(obj) {
  if (!obj) return "";
  if (typeof obj === "string") return obj.startsWith("http") ? obj : "";
  if (Array.isArray(obj)) return pickFirst(obj);
  if (typeof obj === "object") {
    for (const v of Object.values(obj)) {
      const u = findFirstUrl(v);
      if (u) return u;
    }
  }
  return "";
}

async function cr(pathname, params = {}) {
  const url = new URL(BASE + pathname);
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    url.searchParams.set(k, String(v));
  }

  const res = await fetch(url.toString(), {
    headers: {
      "Accept": "application/json",
      "X-Api-Key": API_KEY,
    },
  });

  const text = await res.text();
  let data = null;
  try { data = JSON.parse(text); } catch {}

  if (!res.ok) {
    console.error("CryptoRank HTTP error", res.status, url.toString(), text.slice(0, 400));
    throw new Error(`CryptoRank HTTP ${res.status}`);
  }

  // Some endpoints might wrap payload into { data: ... }, some might not.
  return data;
}

function unwrapData(x) {
  if (!x) return x;
  if (Object.prototype.hasOwnProperty.call(x, "data")) return x.data;
  return x;
}

function getValuesForCurrency(obj, convert) {
  if (!obj) return null;
  const c = String(convert || "USD").toUpperCase();

  // common shapes:
  // values: { USD: {...}, EUR: {...} }
  // values: [{ currency: 'USD', ... }]
  const values = obj.values || obj.value || null;

  if (values && typeof values === "object" && !Array.isArray(values)) {
    return values[c] || values[c.toLowerCase()] || values.USD || values.EUR || values;
  }

  if (Array.isArray(values)) {
    const found = values.find(v => String(v.currency || v.symbol || v.code || "").toUpperCase() === c);
    return found || values[0] || null;
  }

  return null;
}

function numOrNull(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

function mapCoin(item, vsLower, convert) {
  const v = getValuesForCurrency(item, convert) || item;

  const image =
    item.image ||
    (item.images ? (item.images.large || item.images.icon || item.images["60x60"] || item.images["40x40"] || findFirstUrl(item.images)) : "") ||
    (item.logo || "");

  const homepage =
    pickFirst(item.homepage) ||
    pickFirst(item.website) ||
    (item.links ? pickFirst(item.links.homepage || item.links.website || item.links.site || item.links.websites) : "") ||
    (item.urls ? pickFirst(item.urls.website) : "");

  const explorer =
    (item.links ? pickFirst(item.links.blockchain_site || item.links.explorer || item.links.explorers) : "") ||
    (item.urls ? pickFirst(item.urls.explorer) : "");

  const tags =
    (Array.isArray(item.tags) ? item.tags : (Array.isArray(item.categories) ? item.categories : [])).slice(0, 12);

  const description = safeStr(item.description || item.about || "", 1400);

  const rank = item.rank ?? item.marketCapRank ?? item.market_cap_rank ?? item.cmc_rank ?? null;

  return {
    id: String(item.id ?? item.currencyId ?? item.slug ?? item.symbol ?? ""),
    name: item.name || item.fullName || "",
    symbol: item.symbol || "",
    image: image || "",
    market_cap_rank: rank,

    current_price: numOrNull(v.price ?? v.value ?? v.currentPrice ?? v.priceUsd),
    market_cap: numOrNull(v.marketCap ?? v.market_cap ?? v.totalMarketCap ?? item.marketCap),
    total_volume: numOrNull(v.volume24h ?? v.volume_24h ?? v.volume ?? item.volume24h),

    price_change_percentage_1h_in_currency: numOrNull(v.percentChange1h ?? v.percent_change_1h ?? item.percentChange1h),
    price_change_percentage_24h_in_currency: numOrNull(v.percentChange24h ?? v.percent_change_24h ?? item.percentChange24h),
    price_change_percentage_7d_in_currency: numOrNull(v.percentChange7d ?? v.percent_change_7d ?? item.percentChange7d),

    circulating_supply: numOrNull(item.circulatingSupply ?? item.circulating_supply ?? v.circulatingSupply),
    max_supply: numOrNull(item.maxSupply ?? item.max_supply ?? v.maxSupply),
    total_supply: numOrNull(item.totalSupply ?? item.total_supply ?? v.totalSupply),
    last_updated: item.updatedAt || item.lastUpdated || item.last_updated || null,

    // extras for coin page
    description,
    homepage,
    explorer,
    tags,
  };
}

function makeTrendingLikeCG(coins) {
  const arr = (coins || [])
    .filter(c => typeof c.price_change_percentage_24h_in_currency === "number")
    .slice()
    .sort((a, b) => b.price_change_percentage_24h_in_currency - a.price_change_percentage_24h_in_currency)
    .slice(0, 7)
    .map(c => ({ item: { id: c.id, name: c.name, symbol: c.symbol, market_cap_rank: c.market_cap_rank } }));
  return { coins: arr };
}

function makeGlobalLikeCG(globalResp, vsLower, convert) {
  const g = unwrapData(globalResp) || {};
  const v = getValuesForCurrency(g, convert) || g;

  const total_market_cap =
    numOrNull(v.marketCap ?? v.totalMarketCap ?? g.marketCap ?? g.totalMarketCap ?? g.total_market_cap);

  const total_volume =
    numOrNull(v.volume24h ?? v.totalVolume24h ?? g.volume24h ?? g.totalVolume24h ?? g.total_volume_24h);

  const btc_dom =
    numOrNull(g.btcDominance ?? g.btc_dominance ?? (g.dominance ? (g.dominance.BTC ?? g.dominance.btc) : null));

  const active =
    numOrNull(g.currenciesCount ?? g.active_cryptocurrencies ?? g.totalCurrencies ?? g.total_cryptocurrencies);

  const markets =
    numOrNull(g.marketsCount ?? g.markets ?? g.active_markets ?? g.active_exchanges ?? g.active_market_pairs);

  const mcap_change =
    numOrNull(g.marketCapChangePercent ?? g.marketCapChange24hPercent ?? g.market_cap_change_percent);

  return {
    data: {
      total_market_cap: { [vsLower]: total_market_cap },
      total_volume: { [vsLower]: total_volume },
      market_cap_percentage: { btc: btc_dom },
      active_cryptocurrencies: active,
      markets,
      market_cap_change_percentage_24h_usd: (vsLower === "usd" ? mcap_change : null),
    }
  };
}

async function fetchCurrencies() {
  // CryptoRank public API is strict:
  // - limit must be one of: 100, 500, 1000
  // - do NOT send offset/currency/convert/quote for this endpoint (your logs show they are rejected)
  // - do NOT send include=... (enum validation fails on public plans)
  const LIMIT = 100;

  function extractList(resp) {
    const unwrapped = unwrapData(resp);
    if (Array.isArray(unwrapped)) return unwrapped;
    if (unwrapped && Array.isArray(unwrapped.data)) return unwrapped.data;
    if (unwrapped && Array.isArray(unwrapped.items)) return unwrapped.items;
    if (resp && Array.isArray(resp.data)) return resp.data;
    if (resp && resp.data && Array.isArray(resp.data.data)) return resp.data.data;
    return null;
  }

  // Preferred: sorted by market cap (if supported)
  try {
    const resp = await cr("/currencies", {
      limit: LIMIT,
      sortBy: "marketCap",
      sortDirection: "DESC",
    });
    const list = extractList(resp);
    return Array.isArray(list) ? list : [];
  } catch (e) {
    console.warn("⚠️ /currencies sorted request failed; retrying with only limit:", e.message);
    const resp = await cr("/currencies", { limit: LIMIT });
    const list = extractList(resp);
    return Array.isArray(list) ? list : [];
  }
}


async function fetchGlobal() {
  // Public API: avoid passing currency/convert/quote params (they are rejected in your logs).
  try {
    return await cr("/global", {});
  } catch (e) {
    console.warn("⚠️ /global request failed:", e.message);
    return null;
  }
}

async function build(convert) {
  const vsLower = (String(convert).toUpperCase() === "EUR") ? "eur" : "usd";

  const list = await fetchCurrencies(convert);
  const coins = (list || []).map(x => mapCoin(x, vsLower, convert));

  let global = { data: { total_market_cap: { [vsLower]: null }, total_volume: { [vsLower]: null }, market_cap_percentage: { btc: null }, active_cryptocurrencies: null, markets: null, market_cap_change_percentage_24h_usd: null } };
  try {
    const globalResp = await fetchGlobal(convert);
    global = makeGlobalLikeCG(globalResp, vsLower, convert);
  } catch (e) {
    console.warn("⚠️ Could not fetch /global, continuing with null global data:", e.message);
  }

  return {
    source: "cryptorank",
    convert,
    updated_at: new Date().toISOString(),
    global,
    trending: makeTrendingLikeCG(coins),
    coins,
  };
}


function deepClone(x) {
  try { return JSON.parse(JSON.stringify(x)); } catch { return x; }
}

async function fetchEurToUsdRate() {
  // Prefer ECB (1 EUR = X USD). Fallback to a public JSON endpoint.
  const tryFetchText = async (url) => {
    const res = await fetch(url, { headers: { "Accept": "application/xml,text/xml,text/plain,*/*" } });
    if (!res.ok) throw new Error(`FX HTTP ${res.status}`);
    return await res.text();
  };
  const tryFetchJson = async (url) => {
    const res = await fetch(url, { headers: { "Accept": "application/json" } });
    if (!res.ok) throw new Error(`FX HTTP ${res.status}`);
    return await res.json();
  };

  // 1) ECB XML: contains <Cube currency='USD' rate='...'/>
  try {
    const xml = await tryFetchText("https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml");
    const m = xml.match(/currency=['"]USD['"]\s+rate=['"]([0-9.]+)['"]/i);
    if (m) {
      const eurToUsd = Number(m[1]);
      if (Number.isFinite(eurToUsd) && eurToUsd > 0) return eurToUsd;
    }
  } catch (_) {}

  // 2) open.er-api: gives USD->EUR
  try {
    const j = await tryFetchJson("https://open.er-api.com/v6/latest/USD");
    const usdToEur = j && j.rates && j.rates.EUR;
    const n = Number(usdToEur);
    if (Number.isFinite(n) && n > 0) return 1 / n;
  } catch (_) {}

  throw new Error("Failed to fetch EUR/USD FX rate");
}

function convertSnapshotUsdToEur(snapshotUsd, eurToUsd) {
  const snap = deepClone(snapshotUsd || {});
  snap.convert = "EUR";

  const toEur = (n) => (typeof n === "number" && Number.isFinite(n)) ? (n / eurToUsd) : n;

  // Convert coins
  if (Array.isArray(snap.coins)) {
    snap.coins = snap.coins.map((c) => {
      const out = Object.assign({}, c);
      // currency-valued fields
      for (const k of ["current_price", "market_cap", "total_volume", "high_24h", "low_24h", "ath", "atl"]) {
        if (k in out) out[k] = toEur(out[k]);
      }
      if (out.sparkline_in_7d && Array.isArray(out.sparkline_in_7d.price)) {
        out.sparkline_in_7d.price = out.sparkline_in_7d.price.map(toEur);
      }
      return out;
    });
  }

  // Convert global
  if (snap.global && snap.global.data) {
    const d = snap.global.data;

    if (d.total_market_cap && typeof d.total_market_cap === "object") {
      const usd = d.total_market_cap.usd;
      d.total_market_cap.eur = toEur(usd);
    }
    if (d.total_volume && typeof d.total_volume === "object") {
      const usd = d.total_volume.usd;
      d.total_volume.eur = toEur(usd);
    }
  }

  // Recompute trending (based on converted coins)
  if (typeof makeTrendingLikeCG === "function") {
    snap.trending = makeTrendingLikeCG(snap.coins || []);
  }

  return snap;
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  // Build USD snapshot (CryptoRank returns USD on public plans)
  const usd = await build("USD");
  fs.writeFileSync(path.join(OUT_DIR, "market_usd.json"), JSON.stringify(usd, null, 2), "utf8");

  // Build EUR snapshot by converting USD->EUR server-side (no CryptoRank fiat conversion params)
  try {
    const eurToUsd = await fetchEurToUsdRate(); // 1 EUR = X USD
    const eur = convertSnapshotUsdToEur(usd, eurToUsd);
    eur.updated_at = new Date().toISOString();
    eur._fx = { provider: "ECB/open.er-api", eur_to_usd: eurToUsd };
    fs.writeFileSync(path.join(OUT_DIR, "market_eur.json"), JSON.stringify(eur, null, 2), "utf8");
  } catch (e) {
    console.warn("⚠️ EUR snapshot conversion failed. Keeping existing placeholder market_eur.json:", e.message);
    if (!fs.existsSync(path.join(OUT_DIR, "market_eur.json"))) {
      const placeholder = { source: "cryptorank", convert: "EUR", updated_at: null, global: null, trending: { coins: [] }, coins: [] };
      fs.writeFileSync(path.join(OUT_DIR, "market_eur.json"), JSON.stringify(placeholder, null, 2), "utf8");
    }
  }

  console.log("✅ Updated snapshots in /data");
}

main().catch((e) => {
  console.error("❌ Failed to update snapshots:", e);
  process.exit(1);
});
