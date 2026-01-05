/**
 * Update /data snapshots for GitHub Pages.
 *
 * IMPORTANT:
 * - Browser reads ONLY /data/*.json (no public API calls from the site).
 * - This script runs in GitHub Actions and may call external APIs server-side.
 *
 * Data sources:
 * - CoinMarketCap Pro (market listings + meta)
 * - Binance public (klines) for charts when available
 * - Synthetic chart fallback when Binance pair doesn't exist
 * - alternative.me (Fear & Greed) + RSS (News) are also fetched server-side
 */

import fs from "node:fs";
import path from "node:path";

const CMC_KEY = process.env.CMC_PRO_API_KEY;
const TOP_LIMIT = Math.max(1, Number(process.env.TOP_LIMIT || 150));
const CHART_LIMIT = Math.max(1, Number(process.env.CHART_LIMIT || TOP_LIMIT));
const LOGO_LIMIT = Math.max(1, Number(process.env.LOGO_LIMIT || TOP_LIMIT));

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "data");
const COINS_DIR = path.join(DATA_DIR, "coins");
const MC_DIR = path.join(DATA_DIR, "market_chart");
const OHLC_DIR = path.join(DATA_DIR, "ohlc");
const COINS_IMG_DIR = path.join(ROOT, "assets", "img", "coins");

const CMC_BASE = "https://pro-api.coinmarketcap.com";

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJSON(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

function clamp(x, a, b) {
  return Math.min(b, Math.max(a, x));
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithRetry(url, options = {}, retries = 3) {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          "user-agent": "crypto-dashboard-snapshotter/1.0",
          ...(options.headers || {}),
        },
      });

      if (res.status === 429 || res.status === 502 || res.status === 503 || res.status === 504) {
        // backoff and retry
        const wait = 500 * (i + 1) + Math.floor(Math.random() * 500);
        await sleep(wait);
        lastErr = new Error(`HTTP ${res.status} for ${url}`);
        continue;
      }
      return res;
    } catch (e) {
      lastErr = e;
      const wait = 500 * (i + 1) + Math.floor(Math.random() * 500);
      await sleep(wait);
    }
  }
  throw lastErr;
}

async function fetchJSON(url, options = {}, retries = 3) {
  const res = await fetchWithRetry(url, options, retries);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}: ${text.slice(0, 500)}`);
  }
  return await res.json();
}

async function fetchText(url, options = {}, retries = 3) {
  const res = await fetchWithRetry(url, options, retries);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}: ${text.slice(0, 500)}`);
  }
  return await res.text();
}

async function fetchCMC(endpoint) {
  if (!CMC_KEY) throw new Error("CMC_PRO_API_KEY is missing (set GitHub Actions secret)");
  const url = `${CMC_BASE}${endpoint}`;
  return await fetchJSON(url, {
    headers: {
      "X-CMC_PRO_API_KEY": CMC_KEY,
      Accept: "application/json",
    },
  });
}

// --- Binance helpers ---
let BINANCE_SYMBOL_SET = null;
async function loadBinanceSymbols() {
  if (BINANCE_SYMBOL_SET) return BINANCE_SYMBOL_SET;
  const info = await fetchJSON("https://api.binance.com/api/v3/exchangeInfo");
  const set = new Set((info?.symbols || []).map((s) => s.symbol));
  BINANCE_SYMBOL_SET = set;
  return set;
}

function binancePairFor(coinSymbol, binanceSet) {
  const s = String(coinSymbol || "").toUpperCase();
  if (!s) return null;

  // Avoid meaningless self-pegged pairs
  const stable = new Set(["USDT", "USDC", "DAI", "TUSD", "FDUSD", "USDE"]);
  if (stable.has(s)) return null;

  const pair = `${s}USDT`;
  return binanceSet.has(pair) ? pair : null;
}

async function fetchBinanceKlines(symbol, interval, limit) {
  const url = `https://api.binance.com/api/v3/klines?symbol=${encodeURIComponent(symbol)}&interval=${interval}&limit=${limit}`;
  return await fetchJSON(url, {}, 2);
}

function parseKlines(klines) {
  return (klines || []).map((k) => ({
    t: Number(k[0]),
    o: Number(k[1]),
    h: Number(k[2]),
    l: Number(k[3]),
    c: Number(k[4]),
  })).filter((x) => Number.isFinite(x.t) && Number.isFinite(x.c));
}

// --- Synthetic series (deterministic) ---
function mulberry32(seed) {
  let t = seed >>> 0;
  return function () {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function randn(rng) {
  // Box–Muller
  let u = 0, v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function makeBridgePrices({ seed, n, startPrice, endPrice, volatility = 0.08 }) {
  const rng = mulberry32(seed);
  const s = Math.max(1e-12, startPrice);
  const e = Math.max(1e-12, endPrice);
  const logS = Math.log(s);
  const logE = Math.log(e);
  const out = [];
  for (let i = 0; i < n; i++) {
    const p = n === 1 ? 1 : i / (n - 1);
    const base = logS + (logE - logS) * p;
    const bridgeScale = Math.sqrt(Math.max(0, p * (1 - p)));
    const noise = randn(rng) * volatility * bridgeScale;
    out.push(Math.exp(base + noise));
  }
  return out;
}

function pricesToOHLC({ seed, startTs, stepMs, prices }) {
  const rng = mulberry32(seed ^ 0xA5A5A5A5);
  const out = [];
  let prevClose = prices[0];
  for (let i = 0; i < prices.length; i++) {
    const close = prices[i];
    const open = i === 0 ? prevClose : prevClose;
    const baseHi = Math.max(open, close);
    const baseLo = Math.min(open, close);
    const wiggle = 0.004 + rng() * 0.012; // 0.4% .. 1.6%
    const high = baseHi * (1 + wiggle);
    const low = baseLo * (1 - wiggle);
    const t = startTs + i * stepMs;
    out.push({ t, o: open, h: high, l: low, c: close });
    prevClose = close;
  }
  return out;
}

function inferStartPrice(endPrice, pctChange) {
  const ch = Number(pctChange);
  if (!Number.isFinite(ch)) return endPrice;
  const f = 1 + clamp(ch, -95, 400) / 100;
  if (f <= 0) return endPrice;
  return endPrice / f;
}

function makeSyntheticSeries(coin, kind) {
  // kind: 'hourly30d' or 'daily365d'
  const end = Math.max(1e-9, Number(coin.price || 1));
  if (kind === "hourly30d") {
    const n = 30 * 24; // 720
    const start = inferStartPrice(end, coin.change30d ?? (Number(coin.change7d) * (30 / 7)));
    const prices = makeBridgePrices({
      seed: Number(coin.id) ^ 0x1BADC0DE,
      n,
      startPrice: start,
      endPrice: end,
      volatility: 0.10,
    });
    const now = Date.now();
    const startTs = now - (n - 1) * 3600_000;
    return pricesToOHLC({ seed: Number(coin.id) ^ 0xC0FFEE, startTs, stepMs: 3600_000, prices });
  }

  // daily365d
  const n = 365;
  const approx = Number(coin.change30d);
  const scaled = Number.isFinite(approx) ? clamp(approx * (365 / 30), -90, 250) : 0;
  const start = inferStartPrice(end, scaled);
  const prices = makeBridgePrices({
    seed: Number(coin.id) ^ 0xBEEFCAFE,
    n,
    startPrice: start,
    endPrice: end,
    volatility: 0.14,
  });
  const now = Date.now();
  const startTs = now - (n - 1) * 86400_000;
  return pricesToOHLC({ seed: Number(coin.id) ^ 0xDEADBEEF, startTs, stepMs: 86400_000, prices });
}

function sliceLast(arr, n) {
  if (!Array.isArray(arr)) return [];
  if (arr.length <= n) return arr;
  return arr.slice(arr.length - n);
}

function toMarketChart(ohlc) {
  return {
    prices: (ohlc || []).map((p) => [p.t, p.c]),
  };
}

function toOHLCArray(ohlc) {
  return (ohlc || []).map((p) => [p.t, p.o, p.h, p.l, p.c]);
}

async function getChartSeriesForCoin(coin) {
  // returns { source, hourly30d: [{t,o,h,l,c}..], daily365d: [...] }
  const binanceSet = await loadBinanceSymbols();
  const pair = binancePairFor(coin.symbol, binanceSet);

  if (!pair) {
    return {
      source: "synthetic",
      hourly30d: makeSyntheticSeries(coin, "hourly30d"),
      daily365d: makeSyntheticSeries(coin, "daily365d"),
    };
  }

  try {
    // 1h for last 30d, and 1d for last 365d
    const [h30, d365] = await Promise.all([
      fetchBinanceKlines(pair, "1h", 720),
      fetchBinanceKlines(pair, "1d", 365),
    ]);
    const hourly30d = parseKlines(h30);
    const daily365d = parseKlines(d365);
    if (hourly30d.length < 24 || daily365d.length < 30) throw new Error("Not enough kline data");
    return { source: `binance:${pair}`, hourly30d, daily365d };
  } catch (e) {
    console.warn(`[chart] ${coin.symbol} fallback synthetic: ${e?.message || e}`);
    return {
      source: "synthetic",
      hourly30d: makeSyntheticSeries(coin, "hourly30d"),
      daily365d: makeSyntheticSeries(coin, "daily365d"),
    };
  }
}

async function downloadToFile(url, dest) {
  try {
    const res = await fetchWithRetry(url, {}, 2);
    if (!res.ok) return false;
    const buf = Buffer.from(await res.arrayBuffer());
    ensureDir(path.dirname(dest));
    fs.writeFileSync(dest, buf);
    return true;
  } catch {
    return false;
  }
}

// --- News + Fear & Greed ---
function stripHtml(s) {
  return String(s || "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseRssItems(xml, limit = 10) {
  // Minimal RSS/Atom parsing (best-effort)
  const items = [];
  const itemBlocks = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
  const entryBlocks = xml.match(/<entry[\s\S]*?<\/entry>/gi) || [];
  const blocks = itemBlocks.length ? itemBlocks : entryBlocks;

  function pick(tag, block) {
    const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
    const m = block.match(re);
    return m ? stripHtml(m[1]) : "";
  }

  for (const b of blocks.slice(0, limit)) {
    const title = pick("title", b);
    let link = "";
    const m1 = b.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
    if (m1) link = stripHtml(m1[1]);
    const m2 = b.match(/<link[^>]*href=["']([^"']+)["'][^>]*\/?>(?:<\/link>)?/i);
    if (!link && m2) link = m2[1];
    const pubDate = pick("pubDate", b) || pick("updated", b) || pick("published", b);
    const source = "RSS";
    if (title && link) items.push({ title, url: link, source, publishedAt: pubDate || null });
  }
  return items;
}

async function buildNewsSnapshot() {
  // You can replace this feed with your preferred source later.
  const FEED = "https://cryptopotato.com/feed/";
  try {
    const xml = await fetchText(FEED, {}, 2);
    const items = parseRssItems(xml, 12);
    return { updatedAt: new Date().toISOString(), source: "cryptopotato", items };
  } catch (e) {
    console.warn(`[news] failed: ${e?.message || e}`);
    return { updatedAt: new Date().toISOString(), source: "sample", items: [] };
  }
}

async function buildFearGreedSnapshot() {
  try {
    const fg = await fetchJSON("https://api.alternative.me/fng/?limit=1&format=json", {}, 2);
    const d = fg?.data?.[0];
    if (!d) throw new Error("no data");
    return {
      updatedAt: new Date().toISOString(),
      value: Number(d.value),
      valueClassification: d.value_classification,
      timestamp: d.timestamp,
      source: "alternative.me",
    };
  } catch (e) {
    console.warn(`[fng] failed: ${e?.message || e}`);
    return {
      updatedAt: new Date().toISOString(),
      value: null,
      valueClassification: "N/A",
      timestamp: null,
      source: "alternative.me",
    };
  }
}

function toCoinRowShape(c) {
  return {
    id: String(c.id),
    symbol: c.symbol,
    name: c.name,
    image: c.image,
    rank: c.rank,
    price: c.price,
    marketCap: c.marketCap,
    volume24h: c.volume24h,
    circulating: c.circulating,
    totalSupply: c.totalSupply,
    maxSupply: c.maxSupply,
    change1h: c.change1h,
    change24h: c.change24h,
    change7d: c.change7d,
    sparkline7d: c.sparkline7d,
    lastUpdated: c.lastUpdated,
  };
}

function toCoinDetailsShape(c, meta) {
  const description = meta?.description || "";
  const urls = meta?.urls || {};
  const website = Array.isArray(urls.website) ? urls.website.filter(Boolean) : [];
  const explorers = Array.isArray(urls.explorer) ? urls.explorer.filter(Boolean) : [];
  const forums = Array.isArray(urls.forum) ? urls.forum.filter(Boolean) : [];

  return {
    id: String(c.id),
    symbol: String(c.symbol || "").toLowerCase(),
    name: c.name,
    market_cap_rank: c.rank,
    image: { thumb: c.image, small: c.image, large: c.image },
    description: { en: description },
    descriptionSource: "CoinMarketCap",
    links: {
      homepage: website,
      blockchain_site: explorers,
      official_forum_url: forums,
    },
    market_data: {
      current_price: { usd: c.price },
      market_cap: { usd: c.marketCap },
      total_volume: { usd: c.volume24h },
      circulating_supply: c.circulating,
      total_supply: c.totalSupply,
      max_supply: c.maxSupply,
      price_change_percentage_1h: c.change1h,
      price_change_percentage_24h: c.change24h,
      price_change_percentage_7d: c.change7d,
      price_change_percentage_30d: c.change30d,
      ath: { usd: null },
      atl: { usd: null },
      last_updated: c.lastUpdated,
    },
    categories: meta?.category ? [meta.category] : [],
    tags: Array.isArray(meta?.tags) ? meta.tags : [],
    last_updated: c.lastUpdated,
  };
}

async function main() {
  ensureDir(DATA_DIR);
  ensureDir(COINS_DIR);
  ensureDir(MC_DIR);
  ensureDir(OHLC_DIR);
  ensureDir(COINS_IMG_DIR);

  console.log(`[update-data] TOP_LIMIT=${TOP_LIMIT} CHART_LIMIT=${CHART_LIMIT} LOGO_LIMIT=${LOGO_LIMIT}`);

  // 1) Fetch core market lists
  const [listingsResp, globalResp] = await Promise.all([
    fetchCMC(`/v1/cryptocurrency/listings/latest?start=1&limit=${TOP_LIMIT}&convert=USD`),
    fetchCMC(`/v1/global-metrics/quotes/latest?convert=USD`),
  ]);

  const listings = listingsResp?.data || [];
  if (!Array.isArray(listings) || listings.length === 0) throw new Error("CMC listings empty");

  const global = globalResp?.data?.quote?.USD || {};
  const globalSnap = {
    updatedAt: new Date().toISOString(),
    marketCap: global.total_market_cap || null,
    volume24h: global.total_volume_24h || null,
    btcDominance: globalResp?.data?.btc_dominance ?? null,
    ethDominance: globalResp?.data?.eth_dominance ?? null,
    source: "coinmarketcap",
  };

  // 2) Fetch meta/info for these coins
  const ids = listings.map((x) => x.id).join(",");
  const infoResp = await fetchCMC(`/v2/cryptocurrency/info?id=${ids}`);
  const info = infoResp?.data || {};

  // 3) Map to site schema
  const coins = listings.map((c) => {
    const q = c.quote?.USD || {};
    const meta = info?.[String(c.id)] || {};
    const localImgRel = `assets/img/coins/${c.id}.png`;

    return {
      id: String(c.id),
      symbol: c.symbol,
      name: c.name,
      rank: c.cmc_rank ?? null,
      price: q.price ?? null,
      marketCap: q.market_cap ?? null,
      volume24h: q.volume_24h ?? null,
      circulating: c.circulating_supply ?? null,
      totalSupply: c.total_supply ?? null,
      maxSupply: c.max_supply ?? null,
      change1h: q.percent_change_1h ?? null,
      change24h: q.percent_change_24h ?? null,
      change7d: q.percent_change_7d ?? null,
      change30d: q.percent_change_30d ?? null,
      lastUpdated: q.last_updated ?? null,
      image: localImgRel,
      _logoUrl: meta.logo || null,
      _meta: meta,
      sparkline7d: null,
    };
  });

  // 4) Download logos (limited)
  let logosOk = 0;
  for (const c of coins.slice(0, LOGO_LIMIT)) {
    if (!c._logoUrl) continue;
    const dest = path.join(COINS_IMG_DIR, `${c.id}.png`);
    if (fs.existsSync(dest)) { logosOk++; continue; }
    const ok = await downloadToFile(c._logoUrl, dest);
    if (ok) logosOk++;
    await sleep(40);
  }
  console.log(`[logos] saved/exists: ${logosOk}`);

  // 5) Build charts + sparklines
  const chartCoins = coins.slice(0, CHART_LIMIT);
  console.log(`[charts] generating for ${chartCoins.length} coins...`);
  for (let i = 0; i < chartCoins.length; i++) {
    const c = chartCoins[i];
    const series = await getChartSeriesForCoin(c);

    // derive ranges
    const hourly = series.hourly30d;
    const daily = series.daily365d;

    const ohlc1 = sliceLast(hourly, 24);
    const ohlc7 = sliceLast(hourly, 168);
    const ohlc30 = hourly;
    const ohlc365 = daily;

    const id = c.id;
    // market_chart
    const mc1 = { ...toMarketChart(ohlc1), updatedAt: new Date().toISOString(), days: "1", source: series.source };
    const mc7 = { ...toMarketChart(ohlc7), updatedAt: new Date().toISOString(), days: "7", source: series.source };
    const mc30 = { ...toMarketChart(ohlc30), updatedAt: new Date().toISOString(), days: "30", source: series.source };
    const mc365 = { ...toMarketChart(ohlc365), updatedAt: new Date().toISOString(), days: "365", source: series.source };
    const mcMax = { ...toMarketChart(ohlc365), updatedAt: new Date().toISOString(), days: "max", source: series.source };

    writeJSON(path.join(MC_DIR, `${id}-1.json`), mc1);
    writeJSON(path.join(MC_DIR, `${id}-7.json`), mc7);
    writeJSON(path.join(MC_DIR, `${id}-30.json`), mc30);
    writeJSON(path.join(MC_DIR, `${id}-365.json`), mc365);
    writeJSON(path.join(MC_DIR, `${id}-max.json`), mcMax);

    // ohlc
    writeJSON(path.join(OHLC_DIR, `${id}-1.json`), toOHLCArray(ohlc1));
    writeJSON(path.join(OHLC_DIR, `${id}-7.json`), toOHLCArray(ohlc7));
    writeJSON(path.join(OHLC_DIR, `${id}-30.json`), toOHLCArray(ohlc30));
    writeJSON(path.join(OHLC_DIR, `${id}-365.json`), toOHLCArray(ohlc365));

    // sparkline7d for table
    const spark = (mc7.prices || []).map((p) => Number(p[1])).filter((x) => Number.isFinite(x));
    // Avoid flat lines (can render as empty)
    if (spark.length >= 2) {
      const min = Math.min(...spark);
      const max = Math.max(...spark);
      if (Math.abs(max - min) < 1e-12) {
        spark[spark.length - 1] = spark[spark.length - 1] * 1.0001;
      }
    }
    c.sparkline7d = spark;

    if ((i + 1) % 10 === 0) console.log(`[charts] ${i + 1}/${chartCoins.length}`);
    await sleep(60);
  }

  // For coins without chart generation (if CHART_LIMIT < TOP_LIMIT), give them synthetic sparklines
  for (const c of coins.slice(CHART_LIMIT)) {
    const hourly = makeSyntheticSeries(c, "hourly30d");
    const spark = sliceLast(hourly, 168).map((p) => p.c);
    c.sparkline7d = spark;
  }

  // 6) Write per-coin details (for coin.html)
  console.log(`[coins] writing details for ${coins.length} coins...`);
  for (const c of coins) {
    const meta = c._meta || {};
    const details = toCoinDetailsShape(c, meta);
    writeJSON(path.join(COINS_DIR, `${c.id}.json`), details);
  }

  // 7) Trending snapshot (top movers by |24h|)
  const trendingItems = [...coins]
    .filter((c) => Number.isFinite(Number(c.change24h)))
    .sort((a, b) => Math.abs(Number(b.change24h)) - Math.abs(Number(a.change24h)))
    .slice(0, 12)
    .map((c) => ({
      id: c.id,
      symbol: c.symbol,
      name: c.name,
      image: c.image,
      price: c.price,
      change24h: c.change24h,
    }));
  writeJSON(path.join(DATA_DIR, "trending.latest.json"), {
    updatedAt: new Date().toISOString(),
    source: "derived",
    items: trendingItems,
  });

  // 8) News + Fear&Greed snapshots
  const [news, fearGreed] = await Promise.all([buildNewsSnapshot(), buildFearGreedSnapshot()]);
  writeJSON(path.join(DATA_DIR, "news.latest.json"), news);
  writeJSON(path.join(DATA_DIR, "fear-greed.latest.json"), fearGreed);

  // 9) Main markets snapshot
  writeJSON(path.join(DATA_DIR, "markets.latest.json"), {
    updatedAt: new Date().toISOString(),
    source: "coinmarketcap",
    global: globalSnap,
    coins: coins.map(toCoinRowShape),
  });

  console.log("[update-data] done");
}

main().catch((e) => {
  console.error("[update-data] ERROR:", e);
  process.exit(1);
});
