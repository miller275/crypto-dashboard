/**
 * GitHub Actions hourly updater.
 * - Fetches CoinMarketCap listings + info (key from secrets)
 * - Writes:
 *   data/markets/page-N.json, data/markets/meta.json
 *   data/coins/{id}.json
 *   data/global.json
 *   data/feargreed.json
 *   data/trending.json
 *   data/news/latest.json (RSS-based, no key required)
 *   data/charts/tv-map.json
 *   data/generated.json
 * - Caches coin logos into assets/img/coins/{id}.{ext}
 *
 * No secrets are committed. Only generated artifacts.
 */

import path from 'node:path';
import fs from 'node:fs/promises';

import { createCmcClient } from './lib/cmc.js';
import { ensureDir, writeJson, writeFile, extFromContentType } from './lib/fsx.js';
import { fetchRssHeadlines } from './lib/rss.js';

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'data');
const MARKETS_DIR = path.join(DATA_DIR, 'markets');
const COINS_DIR = path.join(DATA_DIR, 'coins');
const NEWS_DIR = path.join(DATA_DIR, 'news');
const CHARTS_DIR = path.join(DATA_DIR, 'charts');
const LOGOS_DIR = path.join(ROOT, 'assets', 'img', 'coins');

const API_KEY = process.env.CMC_PRO_API_KEY;

const MAX_COINS = Number(process.env.MAX_COINS || 1000);
const BASE_PAGE_SIZE = Number(process.env.BASE_PAGE_SIZE || 200);
const MAX_SPARKLINE_COINS = Number(process.env.MAX_SPARKLINE_COINS || 150);
const SPARKLINE_DAYS = Number(process.env.SPARKLINE_DAYS || 7);
const SPARKLINE_INTERVAL_HOURS = Number(process.env.SPARKLINE_INTERVAL_HOURS || 4);

const RSS_SOURCES = [
  { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/?outputType=xml', source: 'CoinDesk' },
  { url: 'https://cointelegraph.com/rss', source: 'Cointelegraph' }
];

function nowISO() { return new Date().toISOString(); }
function unix() { return Math.floor(Date.now() / 1000); }

function pickQuoteUSD(listing) {
  const q = listing?.quote?.USD || {};
  return {
    price: q.price ?? null,
    market_cap: q.market_cap ?? null,
    volume_24h: q.volume_24h ?? null,
    percent_change_1h: q.percent_change_1h ?? null,
    percent_change_24h: q.percent_change_24h ?? null,
    percent_change_7d: q.percent_change_7d ?? null,
  };
}

async function fetchFearGreed() {
  try {
    const res = await fetch('https://api.alternative.me/fng/?limit=1&format=json');
    const json = await res.json();
    const item = json?.data?.[0];
    if (!item) throw new Error('No fear&greed data');
    const ts = new Date(Number(item.timestamp) * 1000).toISOString();
    return {
      value: Number(item.value),
      value_classification: item.value_classification,
      timestamp: ts,
      source: 'alternative.me'
    };
  } catch (e) {
    return {
      value: null,
      value_classification: null,
      timestamp: nowISO(),
      source: 'fallback'
    };
  }
}

async function downloadLogo(url, id) {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;

    const ct = res.headers.get('content-type') || '';
    const ext = extFromContentType(ct) || path.extname(new URL(url).pathname) || '.png';
    const buf = Buffer.from(await res.arrayBuffer());
    const out = path.join(LOGOS_DIR, `${id}${ext}`);
    await writeFile(out, buf);

    return `./assets/img/coins/${id}${ext}`;
  } catch {
    return null;
  }
}

async function buildTvMap(coreCoins) {
  // Minimal mapping structure; you can extend it manually later.
  const overrides_by_id = {};
  for (const c of coreCoins.slice(0, 200)) {
    overrides_by_id[String(c.id)] = { symbol: `BINANCE:${String(c.symbol).toUpperCase()}USDT` };
  }

  return {
    default: { exchange: 'BINANCE', quote: 'USDT' },
    overrides_by_id,
    overrides_by_symbol: {
      USDC: { symbol: 'COINBASE:USDCUSD' }
    },
    alternatives_by_symbol: {
      TON: [{ exchange: 'OKX', pair: 'TONUSDT' }, { exchange: 'BYBIT', pair: 'TONUSDT' }]
    }
  };
}

function paginate(list, pageSize) {
  const pages = [];
  for (let i = 0; i < list.length; i += pageSize) {
    pages.push(list.slice(i, i + pageSize));
  }
  return pages;
}

async function fetchNews() {
  const all = [];
  for (const src of RSS_SOURCES) {
    try {
      const items = await fetchRssHeadlines(src.url, { sourceName: src.source, limit: 20 });
      all.push(...items);
    } catch {
      // ignore per source
    }
  }
  // Sort by date desc
  all.sort((a, b) => (Date.parse(b.published_at || 0) - Date.parse(a.published_at || 0)));
  return {
    items: all.slice(0, 60),
    last_updated: nowISO()
  };
}

async function buildSparklines(cmc, coins) {
  const out = new Map();
  const top = coins.slice(0, MAX_SPARKLINE_COINS);

  const end = new Date();
  const start = new Date(end.getTime() - SPARKLINE_DAYS * 24 * 3600 * 1000);

  // Downsample: every N hours
  const step = Math.max(1, Math.round(SPARKLINE_INTERVAL_HOURS));

  for (const c of top) {
    try {
      const json = await cmc.ohlcvHistorical({
        id: c.id,
        convert: 'USD',
        interval: 'hourly',
        time_start: start.toISOString(),
        time_end: end.toISOString()
      });

      const rows = json?.data?.quotes || [];
      if (!rows.length) { out.set(c.id, []); continue; }

      const closes = rows
        .map(r => r?.quote?.USD?.close)
        .filter(v => typeof v === 'number' && isFinite(v));

      const sampled = [];
      for (let i = 0; i < closes.length; i += step) sampled.push(closes[i]);

      out.set(c.id, sampled.slice(-Math.ceil((SPARKLINE_DAYS * 24) / step)));
    } catch {
      out.set(c.id, []);
    }
  }
  return out;
}

async function buildAthAtlForTop(cmc, coins, topN = 50) {
  const out = new Map();
  const top = coins.slice(0, topN);

  const end = new Date();
  const start = new Date(end.getTime() - 365 * 24 * 3600 * 1000);

  for (const c of top) {
    try {
      const json = await cmc.ohlcvHistorical({
        id: c.id,
        convert: 'USD',
        interval: 'daily',
        time_start: start.toISOString(),
        time_end: end.toISOString()
      });

      const rows = json?.data?.quotes || [];
      let ath = { price: null, date: null };
      let atl = { price: null, date: null };

      for (const r of rows) {
        const q = r?.quote?.USD;
        if (!q) continue;
        const hi = q.high;
        const lo = q.low;
        const t = r?.time_close || r?.time_open;

        if (typeof hi === 'number' && isFinite(hi) && (ath.price == null || hi > ath.price)) {
          ath = { price: hi, date: t || null };
        }
        if (typeof lo === 'number' && isFinite(lo) && (atl.price == null || lo < atl.price)) {
          atl = { price: lo, date: t || null };
        }
      }

      out.set(c.id, { ath, atl });
    } catch {
      out.set(c.id, { ath: { price: null, date: null }, atl: { price: null, date: null } });
    }
  }

  return out;
}

async function main() {
  if (!API_KEY) {
    console.error('ERROR: Missing env CMC_PRO_API_KEY');
    process.exit(1);
  }

  const cmc = createCmcClient(API_KEY);

  await ensureDir(DATA_DIR);
  await ensureDir(MARKETS_DIR);
  await ensureDir(COINS_DIR);
  await ensureDir(NEWS_DIR);
  await ensureDir(CHARTS_DIR);
  await ensureDir(LOGOS_DIR);

  const generated = {
    generated_at: nowISO(),
    version: unix(),
    source: 'cmc'
  };

  // Global metrics
  const globalRaw = await cmc.globalMetrics({ convert: 'USD' });
  const global = globalRaw?.data || {};
  await writeJson(path.join(DATA_DIR, 'global.json'), {
    btc_dominance: global.btc_dominance ?? null,
    eth_dominance: global.eth_dominance ?? null,
    quote: global.quote ?? {},
    last_updated: global.last_updated ?? generated.generated_at
  });

  // Fear & Greed (no key)
  const fg = await fetchFearGreed();
  await writeJson(path.join(DATA_DIR, 'feargreed.json'), fg);

  // Listings
  const listings = await cmc.listingsLatest({
    start: 1,
    limit: MAX_COINS,
    convert: 'USD'
  });

  const items = (listings?.data || []).map((c) => {
    const q = pickQuoteUSD(c);
    return {
      id: c.id,
      rank: c.cmc_rank ?? null,
      name: c.name,
      symbol: c.symbol,
      slug: c.slug,
      price: q.price,
      percent_change_1h: q.percent_change_1h,
      percent_change_24h: q.percent_change_24h,
      percent_change_7d: q.percent_change_7d,
      market_cap: q.market_cap,
      volume_24h: q.volume_24h,
      circulating_supply: c.circulating_supply ?? null,
      max_supply: c.max_supply ?? null,
      sparkline7d: [],
      last_updated: c.last_updated ?? generated.generated_at
    };
  });

  // Sparklines (top N only)
  const sparkMap = await buildSparklines(cmc, items);
  for (const c of items) {
    const sp = sparkMap.get(c.id);
    if (sp) c.sparkline7d = sp;
  }

  // Trending movers (top gainers/losers 24h)
  const withPct = items.filter(x => typeof x.percent_change_24h === 'number' && isFinite(x.percent_change_24h));
  const gainers = [...withPct].sort((a,b)=>b.percent_change_24h-a.percent_change_24h).slice(0, 6);
  const losers  = [...withPct].sort((a,b)=>a.percent_change_24h-b.percent_change_24h).slice(0, 6);

  await writeJson(path.join(DATA_DIR, 'trending.json'), {
    gainers: gainers.map(c => ({
      id: c.id, rank: c.rank, name: c.name, symbol: c.symbol,
      percent_change_24h: c.percent_change_24h,
      logo: `./assets/img/coins/${c.id}.png`
    })),
    losers: losers.map(c => ({
      id: c.id, rank: c.rank, name: c.name, symbol: c.symbol,
      percent_change_24h: c.percent_change_24h,
      logo: `./assets/img/coins/${c.id}.png`
    })),
    last_updated: generated.generated_at
  });

  // Markets pages
  const pages = paginate(items, BASE_PAGE_SIZE);
  for (let i = 0; i < pages.length; i++) {
    await writeJson(path.join(MARKETS_DIR, `page-${i + 1}.json`), {
      page: i + 1,
      page_size: BASE_PAGE_SIZE,
      coins: pages[i]
    });
  }

  await writeJson(path.join(MARKETS_DIR, 'meta.json'), {
    total_coins: items.length,
    base_page_size: BASE_PAGE_SIZE,
    total_pages: pages.length,
    available_page_sizes: [50, 100, 200],
    last_updated: generated.generated_at
  });

  // Coin info (description + logo) in batches
  const ids = items.map(c => c.id);
  const BATCH = 100;
  const infoById = new Map();

  for (let i = 0; i < ids.length; i += BATCH) {
    const chunk = ids.slice(i, i + BATCH);
    const info = await cmc.info({ id: chunk.join(',') });
    const data = info?.data || {};
    for (const [id, payload] of Object.entries(data)) {
      infoById.set(Number(id), payload);
    }
  }

  // ATH/ATL (top 50)
  const athAtlMap = await buildAthAtlForTop(cmc, items, 50);

  // Logos + coin details files
  for (const c of items) {
    const inf = infoById.get(c.id);
    const logoUrl = inf?.logo || null;

    const savedLogo = await downloadLogo(logoUrl, c.id);

    const details = {
      id: c.id,
      rank: c.rank,
      name: c.name,
      symbol: c.symbol,
      slug: c.slug,
      logo: savedLogo || `./assets/img/coins/${c.id}.png`,
      description: (inf?.description || '').trim(),
      quote: { USD: {
        price: c.price,
        market_cap: c.market_cap,
        volume_24h: c.volume_24h,
        percent_change_24h: c.percent_change_24h
      }},
      supply: {
        circulating: c.circulating_supply ?? null,
        total: inf?.total_supply ?? c.circulating_supply ?? null,
        max: c.max_supply ?? null
      },
      ath: athAtlMap.get(c.id)?.ath || { price: null, date: null },
      atl: athAtlMap.get(c.id)?.atl || { price: null, date: null },
      last_updated: c.last_updated ?? generated.generated_at
    };

    await writeJson(path.join(COINS_DIR, `${c.id}.json`), details);
  }

  // TV map
  const tvMap = await buildTvMap(items);
  await writeJson(path.join(CHARTS_DIR, 'tv-map.json'), tvMap);

  // News
  const news = await fetchNews();
  await writeJson(path.join(NEWS_DIR, 'latest.json'), news);

  // Generated marker
  await writeJson(path.join(DATA_DIR, 'generated.json'), generated);

  // Remove old market pages beyond current pages count
  const files = await fs.readdir(MARKETS_DIR);
  for (const f of files) {
    const m = f.match(/^page-(\d+)\.json$/);
    if (m) {
      const idx = Number(m[1]);
      if (idx > pages.length) await fs.unlink(path.join(MARKETS_DIR, f));
    }
  }

  console.log(`OK: generated v${generated.version} at ${generated.generated_at}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
