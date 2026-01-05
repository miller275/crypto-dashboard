#!/usr/bin/env node
/**
 * Update /data snapshots for GitHub Pages.
 *
 * Design goals:
 *  - Browser NEVER calls public APIs.
 *  - GitHub Actions fetches data using secrets and writes JSON snapshots into /data.
 *
 * Data sources:
 *  - CoinMarketCap (CMC) for listings/global/metadata (requires CMC_PRO_API_KEY).
 *  - CoinGecko (public) for OHLC/market_chart fallback (runs in GitHub Actions, NOT in browser).
 *
 * Why CoinGecko fallback?
 *  - Some CMC plans return HTTP 403 for /cryptocurrency/ohlcv/historical from GitHub runners.
 */

import fs from 'fs';
import path from 'path';

const __dirname = process.cwd();

const CMC_KEY = process.env.CMC_PRO_API_KEY || process.env.CMC_API_KEY || '';
if (!CMC_KEY) {
  console.error('Missing CMC_PRO_API_KEY (Actions secret).');
  process.exit(1);
}

const TOP_LIMIT   = clampInt(process.env.TOP_LIMIT, 150, 1, 500);
const CHART_LIMIT = clampInt(process.env.CHART_LIMIT, 50, 0, 300);
const LOGO_LIMIT  = clampInt(process.env.LOGO_LIMIT, 150, 0, 500);

const OUT_DIR = path.join(__dirname, 'data');
const COINS_DIR = path.join(OUT_DIR, 'coins');
const MC_DIR = path.join(OUT_DIR, 'market_chart');
const OHLC_DIR = path.join(OUT_DIR, 'ohlc');
const IMG_DIR = path.join(__dirname, 'assets', 'img', 'coins');

ensureDir(OUT_DIR);
ensureDir(COINS_DIR);
ensureDir(MC_DIR);
ensureDir(OHLC_DIR);
ensureDir(IMG_DIR);

const CMC_BASE = 'https://pro-api.coinmarketcap.com';
const CG_BASE = 'https://api.coingecko.com/api/v3';

const CMC_HEADERS = {
  'Accept': 'application/json',
  'X-CMC_PRO_API_KEY': CMC_KEY
};

const nowISO = () => new Date().toISOString();

const GECKO_OVERRIDES = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  USDT: 'tether',
  USDC: 'usd-coin',
  BNB: 'binancecoin',
  XRP: 'ripple',
  SOL: 'solana',
  ADA: 'cardano',
  DOGE: 'dogecoin',
  TRX: 'tron',
  TON: 'the-open-network',
  DOT: 'polkadot',
  MATIC: 'polygon',
  AVAX: 'avalanche-2',
  SHIB: 'shiba-inu',
  LTC: 'litecoin',
  LINK: 'chainlink',
  BCH: 'bitcoin-cash',
  XLM: 'stellar',
  ATOM: 'cosmos',
  XMR: 'monero',
  ETC: 'ethereum-classic',
  ICP: 'internet-computer'
};

async function main(){
  console.log(`[update-data] TOP_LIMIT=${TOP_LIMIT} CHART_LIMIT=${CHART_LIMIT} LOGO_LIMIT=${LOGO_LIMIT}`);

  // 1) Listings (prices, marketcap, changes)
  const listingsUrl = `${CMC_BASE}/v1/cryptocurrency/listings/latest?start=1&limit=${TOP_LIMIT}&convert=USD`;
  const listings = await fetchJSON(listingsUrl, { headers: CMC_HEADERS, retries: 2 });
  const listData = listings?.data;
  if (!Array.isArray(listData)) {
    throw new Error('CMC listings/latest returned no data array.');
  }

  // 2) Global metrics
  const globalUrl = `${CMC_BASE}/v1/global-metrics/quotes/latest?convert=USD`;
  const globalRes = await fetchJSON(globalUrl, { headers: CMC_HEADERS, retries: 2 });
  const global = normalizeGlobal(globalRes);

  // 3) Metadata (logos) + per-coin details
  const ids = listData.map(c => c.id).filter(Boolean);
  const logoIds = ids.slice(0, LOGO_LIMIT);
  const meta = await fetchCMCMetadata(logoIds);

  // CoinGecko mapping (for chart fallback)
  const geckoIndex = await buildGeckoIndex();

  const mappedCoins = listData.map(c => {
    const q = c.quote?.USD || {};
    const logo = meta[c.id]?.logo;
    const symbol = String(c.symbol || '').toUpperCase();
    const name = String(c.name || '');
    const geckoId = resolveGeckoId(symbol, name, geckoIndex);
    return {
      id: String(c.id),
      symbol,
      name,
      image: logo ? `assets/img/coins/${c.id}.png` : 'assets/img/coin.svg',
      rank: c.cmc_rank ?? null,
      price: q.price ?? null,
      marketCap: q.market_cap ?? null,
      volume24h: q.volume_24h ?? null,
      change1h: q.percent_change_1h ?? null,
      change24h: q.percent_change_24h ?? null,
      change7d: q.percent_change_7d ?? null,
      sparkline7d: null,
      geckoId: geckoId || null
    };
  });

  // Enrich with CoinGecko sparkline + ATH/ATL (browser will only read /data)
  let geckoMarketById = new Map();
  try {
    const geckoIds = mappedCoins.map(c => c.geckoId).filter(Boolean);
    const geckoMarkets = await fetchGeckoMarkets(geckoIds);
    geckoMarketById = new Map(geckoMarkets.map(x => [x.id, x]));
    for (const c of mappedCoins){
      const g = c.geckoId ? geckoMarketById.get(c.geckoId) : null;
      if (g?.sparkline_in_7d?.price?.length) {
        c.sparkline7d = g.sparkline_in_7d.price;
      }
      // Fallback so sparklines render for all rows even if CoinGecko mapping is missing
      if (!c.sparkline7d && typeof c.price === "number") {
        c.sparkline7d = Array.from({ length: 30 }, () => c.price);
      }
      c.ath = (typeof g?.ath === "number") ? g.ath : null;
      c.atl = (typeof g?.atl === "number") ? g.atl : null;
      c.athDate = g?.ath_date ?? null;
      c.atlDate = g?.atl_date ?? null;
    }
  } catch (err) {
    console.warn("[WARN] CoinGecko markets (sparkline) failed:", err?.message || err);
  }


  // Download logos
  await downloadLogos(mappedCoins, meta);

  // Per-coin details snapshot
  for (const c of mappedCoins) {
    const src = listData.find(x => String(x.id) === String(c.id));
    const q = src?.quote?.USD || {};
    const detail = {
      id: c.id,
      symbol: c.symbol,
      name: c.name,
      slug: c.slug,
      rank: c.rank,
      image: c.image || "assets/img/coin.svg",
      price: c.price,
      marketCap: c.marketCap,
      volume24h: c.volume24h,
      circulating: c.circulating,
      totalSupply: c.totalSupply,
      maxSupply: c.maxSupply,
      percentChange1h: c.change1h,
      percentChange24h: c.change24h,
      percentChange7d: c.change7d,
      ath: c.ath ?? null,
      atl: c.atl ?? null,
      athDate: c.athDate ?? null,
      atlDate: c.atlDate ?? null,
      lastUpdated: c.lastUpdated,
      description: meta[c.id]?.description ?? null,
      urls: meta[c.id]?.urls ?? null,
      tags: meta[c.id]?.tags ?? [],
      category: meta[c.id]?.category ?? null,
      platform: meta[c.id]?.platform ?? null,
      geckoId: c.geckoId
    };
    writeJSON(path.join(COINS_DIR, `${c.id}.json`), detail);
  }

  // 4) Charts (fallback to CoinGecko OHLC)
  const chartCoins = mappedCoins.slice(0, CHART_LIMIT);
  const chartDaysList = ['1','7','30','365','max'];

  for (const coin of chartCoins) {
    if (!coin.geckoId) {
      // Ensure files exist to avoid frontend crash.
      for (const d of chartDaysList) {
        writeEmptyMarketChart(coin.id, d);
        writeEmptyOHLC(coin.id, d === 'max' ? '365' : d);
      }
      continue;
    }

    // We build sparkline from 7d OHLC closes
    let sparkline = null;

    for (const d of chartDaysList) {
      try {
        const ohlcDays = d;
        const ohlc = await fetchGeckoOHLC(coin.geckoId, ohlcDays);

        // Save OHLC for candles (CoinGecko supports these values)
        const ohlcSaveDays = (ohlcDays === 'max') ? '365' : ohlcDays;
        // For candles, coin.js maps max->365. We store 365 for max too.
        writeJSON(path.join(OHLC_DIR, `${coin.id}-${ohlcSaveDays}.json`), Array.isArray(ohlc) ? ohlc : []);

        // Save market_chart for line chart (convert OHLC close -> [ts, price])
        const prices = Array.isArray(ohlc)
          ? ohlc.map(row => [row[0], row[4]])
          : [];

        writeJSON(path.join(MC_DIR, `${coin.id}-${d}.json`), {
          prices,
          updatedAt: nowISO(),
          source: 'coingecko'
        });

        if (d === '7') {
          sparkline = prices.map(p => p[1]).filter(v => typeof v === 'number');
        }

      } catch (e) {
        console.warn(`[chart] ${coin.symbol} (${coin.id}) days=${d} failed: ${e?.message || e}`);
        // Don't overwrite existing snapshots on transient errors (rate limits etc.)
        const mcPath = path.join(DATA_DIR, `market_chart/${coin.id}-${d}.json`);
        if (!existsSync(mcPath)) writeEmptyMarketChart(coin.id, d);
        const ohlcSaveDays = (d === 'max') ? '365' : d;
        const ohlcPath = path.join(DATA_DIR, `ohlc/${coin.id}-${ohlcSaveDays}.json`);
        if (!existsSync(ohlcPath)) writeEmptyOHLC(coin.id, ohlcSaveDays);
      }

      // Be nice to CoinGecko rate limits
      await sleep(900);
    }

    if (Array.isArray(sparkline) && sparkline.length) {
      coin.sparkline7d = sparkline;
    }
  }

  // Save markets.latest.json
  const updatedAt = nowISO();
  writeJSON(path.join(OUT_DIR, 'markets.latest.json'), {
    source: 'coinmarketcap',
    updatedAt,
    global,
    coins: mappedCoins
  });

  // 5) Fear & Greed index (public API, server-side)
  await writeFearGreed();

  // 6) News (server-side RSS) 
  await writeNews();

  console.log('[update-data] Done');
}

// -------------------- CMC helpers --------------------

async function fetchCMCMetadata(ids){
  if (!ids.length) return {};
  const url = `${CMC_BASE}/v2/cryptocurrency/info?id=${ids.join(',')}`;
  const res = await fetchJSON(url, { headers: CMC_HEADERS, retries: 2 });
  // v2 returns object keyed by id
  return res?.data || {};
}

function normalizeGlobal(globalRes){
  const d = globalRes?.data;
  const q = d?.quote?.USD || {};
  const btc = d?.btc_dominance ?? null;
  const eth = d?.eth_dominance ?? null;
  return {
    marketCap: q.total_market_cap ?? null,
    volume24h: q.total_volume_24h ?? null,
    btcDominance: btc,
    ethDominance: eth,
    lastUpdated: q.last_updated ?? d?.last_updated ?? null
  };
}

async function downloadLogos(mappedCoins, meta){
  const coins = mappedCoins.slice(0, LOGO_LIMIT);
  let n = 0;
  for (const c of coins) {
    const logoUrl = meta[c.id]?.logo;
    if (!logoUrl) continue;
    const out = path.join(IMG_DIR, `${c.id}.png`);

    // Skip if exists and non-empty
    if (fs.existsSync(out) && fs.statSync(out).size > 1024) continue;

    try {
      const buf = await fetchBuffer(logoUrl, { retries: 2 });
      fs.writeFileSync(out, buf);
      n++;
      // small pause
      await sleep(120);
    } catch (e) {
      console.warn(`[logo] failed ${c.symbol} (${c.id}): ${e?.message || e}`);
    }
  }
  if (n) console.log(`[logos] downloaded ${n}`);
}

// -------------------- CoinGecko helpers --------------------

async function buildGeckoIndex(){
  try {
    const url = `${CG_BASE}/coins/list?include_platform=false`;
    const list = await fetchJSON(url, { retries: 2 });
    if (!Array.isArray(list)) return { bySymbol: new Map(), all: [] };

    const bySymbol = new Map();
    for (const item of list) {
      const sym = String(item.symbol || '').toUpperCase();
      if (!sym) continue;
      if (!bySymbol.has(sym)) bySymbol.set(sym, []);
      bySymbol.get(sym).push({ id: item.id, name: String(item.name || '') });
    }
    return { bySymbol, all: list };
  } catch (e) {
    console.warn(`[coingecko] coins/list failed: ${e?.message || e}`);
    return { bySymbol: new Map(), all: [] };
  }
}

function resolveGeckoId(symbol, name, geckoIndex){
  if (!symbol) return null;
  if (GECKO_OVERRIDES[symbol]) return GECKO_OVERRIDES[symbol];

  const candidates = geckoIndex.bySymbol.get(symbol) || [];
  if (!candidates.length) return null;
  if (candidates.length === 1) return candidates[0].id;

  const n = normName(name);
  let best = candidates[0];
  let bestScore = -1;
  for (const c of candidates) {
    const cn = normName(c.name);
    let score = 0;
    if (cn === n) score += 5;
    if (cn && n && (cn.includes(n) || n.includes(cn))) score += 3;
    if (c.id && n && c.id.replace(/[-_]/g,' ').includes(n.split(' ')[0])) score += 1;
    if (score > bestScore) { bestScore = score; best = c; }
  }
  return best?.id || null;
}

function normName(s){
  return String(s || '')
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

async function fetchGeckoOHLC(geckoId, days){
  const d = encodeURIComponent(days);
  const url = `${CG_BASE}/coins/${encodeURIComponent(geckoId)}/ohlc?vs_currency=usd&days=${d}`;

  // CoinGecko sometimes returns 429. Retry with backoff.
  const data = await fetchJSON(url, {
    retries: 3,
    retryOn: (status) => status === 429 || status >= 500,
    backoffMs: 1200,
    headers: { 'Accept': 'application/json' }
  });

  if (!Array.isArray(data)) throw new Error('CoinGecko OHLC returned non-array.');
  return data;
}


async function fetchGeckoMarkets(ids){
  // Bulk markets endpoint gives us sparkline + ATH/ATL in one call.
  const out = [];
  const unique = Array.from(new Set(ids.filter(Boolean)));
  const BATCH = 200; // keep URL size safe
  for (let i = 0; i < unique.length; i += BATCH){
    const batch = unique.slice(i, i + BATCH);
    const url = `${CG_BASE}/coins/markets?vs_currency=usd&ids=${encodeURIComponent(batch.join(","))}&order=market_cap_desc&per_page=${batch.length}&page=1&sparkline=true`;
    const data = await fetchJSON(url, { retries: 3, backoffMs: 1500 });
    if (Array.isArray(data)) out.push(...data);
    // gentle pacing vs rate limits
    await sleep(700);
  }
  return out;
}

// -------------------- Fear & Greed + News --------------------

async function writeFearGreed(){
  const url = 'https://api.alternative.me/fng/?limit=1&format=json';
  try{
    const res = await fetchJSON(url, { retries: 2 });
    const item = res?.data?.[0];
    const out = {
      source: 'alternative.me',
      updatedAt: nowISO(),
      data: item ? [item] : []
    };
    writeJSON(path.join(OUT_DIR, 'fear-greed.latest.json'), out);
  }catch(e){
    console.warn(`[fng] failed: ${e?.message || e}`);
    writeJSON(path.join(OUT_DIR, 'fear-greed.latest.json'), { source: 'alternative.me', updatedAt: nowISO(), data: [] });
  }
}

// Simple RSS to JSON (server-side). We keep it lightweight.
async function writeNews(){
  const feeds = [
    'https://cryptopotato.com/feed/',
    'https://www.coindesk.com/arc/outboundfeeds/rss/',
    'https://cointelegraph.com/rss'
  ];

  const items = [];
  for (const feed of feeds) {
    try{
      const xml = await fetchText(feed, { retries: 1 });
      // very small RSS parsing via regex (good enough for headlines)
      const channelTitle = (xml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/i)?.[1]
        || xml.match(/<title>(.*?)<\/title>/i)?.[1]
        || '');

      const blocks = xml.split(/<item>/i).slice(1, 6);
      for (const b of blocks) {
        const title = (b.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/i)?.[1]
          || b.match(/<title>(.*?)<\/title>/i)?.[1]
          || '').trim();
        const link = (b.match(/<link>(.*?)<\/link>/i)?.[1] || '').trim();
        const pubDate = (b.match(/<pubDate>(.*?)<\/pubDate>/i)?.[1] || '').trim();
        if (!title || !link) continue;
        items.push({ title, url: link, source: channelTitle || hostOf(feed), publishedAt: pubDate });
      }
    }catch(_){
      // ignore
    }
    await sleep(120);
  }

  writeJSON(path.join(OUT_DIR, 'news.latest.json'), {
    source: 'rss',
    updatedAt: nowISO(),
    items: items.slice(0, 20)
  });
}

function hostOf(url){
  try { return new URL(url).hostname.replace(/^www\./,''); } catch { return url; }
}

// -------------------- IO helpers --------------------

function ensureDir(p){
  fs.mkdirSync(p, { recursive: true });
}

function writeJSON(p, obj){
  fs.writeFileSync(p, JSON.stringify(obj, null, 2));
}

function writeEmptyMarketChart(id, days){
  writeJSON(path.join(MC_DIR, `${id}-${days}.json`), { prices: [], updatedAt: nowISO(), source: 'empty' });
}

function writeEmptyOHLC(id, days){
  // OHLC files are arrays
  fs.writeFileSync(path.join(OHLC_DIR, `${id}-${days}.json`), '[]');
}

function clampInt(v, def, min, max){
  const n = Number.parseInt(String(v ?? ''), 10);
  if (!Number.isFinite(n)) return def;
  return Math.min(max, Math.max(min, n));
}

function sleep(ms){
  return new Promise(r => setTimeout(r, ms));
}

async function fetchBuffer(url, { timeoutMs=20000, retries=2 }={}){
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try{
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const ab = await res.arrayBuffer();
    return Buffer.from(ab);
  }catch(e){
    if (retries > 0) {
      await sleep(400);
      return fetchBuffer(url, { timeoutMs, retries: retries - 1 });
    }
    throw e;
  }finally{
    clearTimeout(t);
  }
}

async function fetchText(url, { timeoutMs=20000, retries=1 }={}){
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try{
    const res = await fetch(url, { signal: controller.signal, headers: { 'Accept': 'text/xml,application/xml,text/html,*/*' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  }catch(e){
    if (retries > 0) {
      await sleep(600);
      return fetchText(url, { timeoutMs, retries: retries - 1 });
    }
    throw e;
  }finally{
    clearTimeout(t);
  }
}

async function fetchJSON(url, { headers={}, timeoutMs=20000, retries=2, retryOn=null, backoffMs=600 }={}){
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try{
    const res = await fetch(url, {
      signal: controller.signal,
      headers,
      cache: 'no-store'
    });

    if (!res.ok) {
      const shouldRetry = typeof retryOn === 'function'
        ? retryOn(res.status)
        : (res.status === 429 || res.status >= 500);

      if (retries > 0 && shouldRetry) {
        const wait = backoffMs + Math.floor(Math.random() * 400);
        await sleep(wait);
        return await fetchJSON(url, { headers, timeoutMs, retries: retries - 1, retryOn, backoffMs: backoffMs * 1.6 });
      }

      // Try to include response body for debugging
      let body = '';
      try { body = await res.text(); } catch { body = ''; }
      throw new Error(`HTTP ${res.status} ${url} ${body?.slice(0, 180)}`);
    }

    return await res.json();
  }finally{
    clearTimeout(t);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
