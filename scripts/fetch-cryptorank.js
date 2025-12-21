#!/usr/bin/env node
/**
 * CryptoWatch — CryptoRank snapshot fetcher (v7)
 *
 * Writes:
 *   data/market_usd.json
 *   data/market_eur.json
 *
 * IMPORTANT (based on your GitHub Actions logs):
 * - /v2/currencies rejects: offset, currency, convert, quote
 * - limit must be one of: 100, 500, 1000
 * - include=... often fails enum validation on public plans
 *
 * So we only call:
 *   GET https://api.cryptorank.io/v2/currencies?limit=100&sortBy=marketCap&sortDirection=DESC
 * and fallback to:
 *   GET https://api.cryptorank.io/v2/currencies?limit=100
 */

const fs = require("fs");
const path = require("path");

const API_KEY = process.env.CRYPTORANK_API_KEY;
if (!API_KEY) {
  console.error("Missing env CRYPTORANK_API_KEY (set it in GitHub repo secrets).");
  process.exit(1);
}

const BASE = "https://api.cryptorank.io/v2";
const OUT_DIR = path.join(__dirname, "..", "data");

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function safeNum(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

async function cr(pathname, params = {}) {
  const url = new URL(BASE + pathname);

  // Only set params that are explicitly passed.
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    url.searchParams.set(k, String(v));
  }

  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "X-Api-Key": API_KEY,
    },
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    // Don't spam full responses (and never log API key).
    console.error("CryptoRank HTTP error", res.status, url.toString(), text.slice(0, 350));
    throw new Error(`CryptoRank HTTP ${res.status}`);
  }
  return data;
}

function unwrapData(x) {
  if (!x) return x;
  if (Object.prototype.hasOwnProperty.call(x, "data")) return x.data;
  return x;
}

function extractList(resp) {
  const u = unwrapData(resp);
  if (Array.isArray(u)) return u;
  if (u && Array.isArray(u.data)) return u.data;
  if (u && Array.isArray(u.items)) return u.items;
  if (resp && Array.isArray(resp.data)) return resp.data;
  if (resp && resp.data && Array.isArray(resp.data.data)) return resp.data.data;
  return [];
}

// Try to read values in USD from different possible shapes.
function getUsdValues(cur) {
  if (!cur || typeof cur !== "object") return null;

  const v = cur.values || cur.value || null;
  if (!v) return null;

  // Common shape: values: { USD: {...} }
  if (v.USD && typeof v.USD === "object") return v.USD;
  if (v.usd && typeof v.usd === "object") return v.usd;

  // Sometimes: values: [{ currency: "USD", ... }]
  if (Array.isArray(v)) {
    const found = v.find((x) => (x && (x.currency === "USD" || x.currencyCode === "USD")));
    if (found) return found;
  }

  return null;
}

function pickImage(cur) {
  const img = cur.images || cur.image || null;
  if (!img) return null;
  if (typeof img === "string") return img;
  if (Array.isArray(img)) {
    // Could be [{ url }] or just strings
    const first = img[0];
    if (!first) return null;
    if (typeof first === "string") return first;
    if (first.url) return first.url;
    if (first.small) return first.small;
  }
  if (img.url) return img.url;
  if (img.small) return img.small;
  return null;
}

function pickLinks(cur) {
  const links = cur.links || {};
  // We keep it minimal, the UI can handle missing.
  const homepage =
    (Array.isArray(links.website) ? links.website[0] : links.website) ||
    (Array.isArray(links.homepage) ? links.homepage[0] : links.homepage) ||
    links.site ||
    null;

  const explorer =
    (Array.isArray(links.explorer) ? links.explorer[0] : links.explorer) ||
    (Array.isArray(links.blockchain_site) ? links.blockchain_site[0] : links.blockchain_site) ||
    null;

  return { homepage, explorer };
}

function mapToCoinGeckoLike(cur) {
  const usd = getUsdValues(cur) || {};

  const price =
    safeNum(usd.price) ??
    safeNum(usd.priceUsd) ??
    safeNum(cur.price) ??
    safeNum(cur.priceUsd);

  const marketCap =
    safeNum(usd.marketCap) ??
    safeNum(usd.marketCapUsd) ??
    safeNum(cur.marketCap) ??
    safeNum(cur.marketCapUsd);

  const vol24h =
    safeNum(usd.volume24h) ??
    safeNum(usd.volume24hUsd) ??
    safeNum(cur.volume24h) ??
    safeNum(cur.volume24hUsd);

  const ch1h =
    safeNum(usd.percentChange1h) ??
    safeNum(usd.change1h) ??
    safeNum(cur.percentChange1h) ??
    safeNum(cur.change1h);

  const ch24h =
    safeNum(usd.percentChange24h) ??
    safeNum(usd.change24h) ??
    safeNum(cur.percentChange24h) ??
    safeNum(cur.change24h);

  const ch7d =
    safeNum(usd.percentChange7d) ??
    safeNum(usd.change7d) ??
    safeNum(cur.percentChange7d) ??
    safeNum(cur.change7d);

  const rank = safeNum(cur.rank) ?? safeNum(cur.marketCapRank) ?? safeNum(cur.market_cap_rank);

  const image = pickImage(cur);
  const { homepage, explorer } = pickLinks(cur);

  return {
    id: String(cur.id ?? cur.slug ?? cur.symbol ?? cur.name ?? ""),
    symbol: (cur.symbol || "").toLowerCase(),
    name: cur.name || cur.fullName || cur.slug || cur.symbol || "Unknown",
    market_cap_rank: rank,
    image: image,
    current_price: price,
    market_cap: marketCap,
    total_volume: vol24h,
    price_change_percentage_1h_in_currency: ch1h,
    price_change_percentage_24h_in_currency: ch24h,
    price_change_percentage_7d_in_currency: ch7d,
    circulating_supply: safeNum(cur.circulatingSupply) ?? safeNum(cur.circulating_supply),
    max_supply: safeNum(cur.maxSupply) ?? safeNum(cur.max_supply),
    description: cur.description || null,
    homepage: homepage,
    explorer: explorer,
    // Optional sparkline — leave absent (UI will just skip it).
  };
}

async function getUsdEurRate() {
  const candidates = [
    async () => {
      const r = await fetch("https://api.exchangerate.host/latest?base=USD&symbols=EUR");
      const j = await r.json();
      const rate = j && j.rates && j.rates.EUR;
      return safeNum(rate);
    },
    async () => {
      const r = await fetch("https://api.frankfurter.app/latest?from=USD&to=EUR");
      const j = await r.json();
      const rate = j && j.rates && j.rates.EUR;
      return safeNum(rate);
    },
    async () => {
      const r = await fetch("https://open.er-api.com/v6/latest/USD");
      const j = await r.json();
      const rate = j && j.rates && j.rates.EUR;
      return safeNum(rate);
    },
  ];

  for (const fn of candidates) {
    try {
      const v = await fn();
      if (v && v > 0) return v;
    } catch {}
  }
  return 0.92; // fallback
}

function buildGlobalFromCoins(coins, usdEur) {
  const sum = (arr, key) =>
    arr.reduce((acc, c) => acc + (Number.isFinite(Number(c[key])) ? Number(c[key]) : 0), 0);

  const totalMarketCapUsd = sum(coins, "market_cap");
  const totalVolumeUsd = sum(coins, "total_volume");

  const btc = coins.find((c) => (c.symbol || "").toLowerCase() === "btc" || (c.id || "").toLowerCase() === "bitcoin");
  const btcDominance = btc && totalMarketCapUsd > 0 && Number.isFinite(Number(btc.market_cap))
    ? (Number(btc.market_cap) / totalMarketCapUsd) * 100
    : null;

  return {
    data: {
      active_cryptocurrencies: coins.length,
      markets: null,
      total_market_cap: {
        usd: totalMarketCapUsd,
        eur: totalMarketCapUsd * usdEur,
      },
      total_volume: {
        usd: totalVolumeUsd,
        eur: totalVolumeUsd * usdEur,
      },
      market_cap_percentage: {
        btc: btcDominance,
      },
      market_cap_change_percentage_24h_usd: null,
      updated_at: Math.floor(Date.now() / 1000),
    },
  };
}

function buildTrendingFromCoins(coins) {
  const list = [...coins]
    .filter((c) => Number.isFinite(Number(c.price_change_percentage_24h_in_currency)))
    .sort((a, b) => Number(b.price_change_percentage_24h_in_currency) - Number(a.price_change_percentage_24h_in_currency))
    .slice(0, 9)
    .map((c) => ({
      item: {
        id: c.id,
        name: c.name,
        symbol: c.symbol,
        market_cap_rank: c.market_cap_rank,
        small: c.image,
      },
    }));
  return { coins: list };
}

function convertCoinsToEur(coins, usdEur) {
  return coins.map((c) => {
    const out = { ...c };
    if (Number.isFinite(Number(out.current_price))) out.current_price = Number(out.current_price) * usdEur;
    if (Number.isFinite(Number(out.market_cap))) out.market_cap = Number(out.market_cap) * usdEur;
    if (Number.isFinite(Number(out.total_volume))) out.total_volume = Number(out.total_volume) * usdEur;
    return out;
  });
}

async function fetchCurrenciesTop100() {
  const LIMIT = 100; // MUST be 100/500/1000
  try {
    const resp = await cr("/currencies", { limit: LIMIT, sortBy: "marketCap", sortDirection: "DESC" });
    return extractList(resp);
  } catch (e) {
    console.warn("⚠️ /currencies sorted request failed; retrying with only limit:", e.message);
    const resp = await cr("/currencies", { limit: LIMIT });
    return extractList(resp);
  }
}

async function main() {
  ensureDir(OUT_DIR);

  const raw = await fetchCurrenciesTop100();
  const coinsUsd = raw.map(mapToCoinGeckoLike).filter((c) => c && c.id && c.symbol);

  const usdEur = await getUsdEurRate();

  const global = buildGlobalFromCoins(coinsUsd, usdEur);
  const trending = buildTrendingFromCoins(coinsUsd);

  const snapshotUsd = {
    updated_at: new Date().toISOString(),
    convert: "USD",
    global,
    trending,
    coins: coinsUsd,
  };

  const coinsEur = convertCoinsToEur(coinsUsd, usdEur);
  const snapshotEur = {
    updated_at: new Date().toISOString(),
    convert: "EUR",
    global,
    trending,
    coins: coinsEur,
  };

  fs.writeFileSync(path.join(OUT_DIR, "market_usd.json"), JSON.stringify(snapshotUsd, null, 2), "utf-8");
  fs.writeFileSync(path.join(OUT_DIR, "market_eur.json"), JSON.stringify(snapshotEur, null, 2), "utf-8");

  console.log(`✅ Snapshots updated: ${coinsUsd.length} coins (USD/EUR), USD→EUR=${usdEur}`);
}

main().catch((e) => {
  console.error("❌ Failed to update snapshots:", e);
  process.exit(1);
});
