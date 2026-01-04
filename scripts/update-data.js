/**
 * Update static snapshots under /data for GitHub Pages.
 * Uses CoinMarketCap PRO API (key via GitHub Secrets) + a couple of free sources.
 *
 * Required env:
 *   CMC_PRO_API_KEY
 *
 * Run:
 *   node scripts/update-data.js
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "data");
const COINS_DIR = path.join(DATA_DIR, "coins");
const OHLC_DIR = path.join(DATA_DIR, "ohlc");
const MC_DIR = path.join(DATA_DIR, "market_chart");
const COIN_IMG_DIR = path.join(ROOT, "assets", "img", "coins");

const CMC_BASE = "https://pro-api.coinmarketcap.com";
const CMC_KEY = process.env.CMC_PRO_API_KEY;

const TOP_LIMIT = parseInt(process.env.TOP_LIMIT || "150", 10);      // how many coins on main table
const CHART_LIMIT = parseInt(process.env.CHART_LIMIT || "25", 10);   // how many coins get charts + sparklines
const LOGO_LIMIT = parseInt(process.env.LOGO_LIMIT || "150", 10);    // how many logos to download

function ensureDir(p){
  fs.mkdirSync(p, { recursive: true });
}

function writeJSON(rel, obj){
  const p = path.join(ROOT, rel);
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, JSON.stringify(obj, null, 2), "utf-8");
}

function readJSON(rel){
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

async function fetchJSON(url, {headers={}, timeoutMs=25000, retry=3} = {}){
  let lastErr = null;
  for (let attempt=0; attempt<=retry; attempt++){
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);

    try{
      const res = await fetch(url, { headers, signal: controller.signal });
      clearTimeout(t);

      if (!res.ok){
        const txt = await res.text().catch(() => "");
        const err = new Error(`HTTP ${res.status} for ${url} :: ${txt.slice(0, 200)}`);
        err.status = res.status;
        throw err;
      }
      return await res.json();
    }catch(e){
      clearTimeout(t);
      lastErr = e;
      // Backoff on 429 / 5xx / network
      const backoff = (attempt + 1) * 1200;
      if (attempt < retry){
        await sleep(backoff);
        continue;
      }
    }
  }
  throw lastErr;
}

function qs(params){
  const usp = new URLSearchParams();
  Object.entries(params || {}).forEach(([k,v]) => {
    if (v === undefined || v === null || v === "") return;
    usp.set(k, String(v));
  });
  return usp.toString();
}

async function cmc(pathname, params){
  if (!CMC_KEY) throw new Error("Missing env CMC_PRO_API_KEY. Add it as a GitHub Secret and map to workflow env.");
  const url = `${CMC_BASE}${pathname}?${qs(params)}`;
  return fetchJSON(url, {
    headers: {
      "Accept": "application/json",
      "X-CMC_PRO_API_KEY": CMC_KEY
    }
  });
}

function pickFirst(arr){
  return Array.isArray(arr) && arr.length ? arr[0] : null;
}

function isoDaysAgo(days){
  const d = new Date(Date.now() - days*24*60*60*1000);
  return d.toISOString();
}

function normalizeImageExt(url){
  const m = String(url || "").match(/\.([a-zA-Z0-9]{3,4})(?:\?|$)/);
  const ext = m ? m[1].toLowerCase() : "png";
  if (ext === "jpeg") return "jpg";
  if (!["png","jpg","svg","webp","gif"].includes(ext)) return "png";
  return ext;
}

async function downloadBinary(url, outPath){
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Logo download failed ${res.status}: ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  ensureDir(path.dirname(outPath));
  fs.writeFileSync(outPath, buf);
}

function mapGlobal(globalRes){
  const g = globalRes?.data || {};
  const q = g?.quote?.USD || {};

  const marketCapUsd = q.total_market_cap ?? q.total_market_cap_yesterday ?? null;
  const marketCapChange24h =
    q.total_market_cap_yesterday_percentage_change ??
    q.total_market_cap_yesterday_percentage_change ??
    q.total_market_cap_change_24h ?? null;

  return {
    marketCapUsd: typeof marketCapUsd === "number" ? marketCapUsd : null,
    marketCapChange24h: typeof marketCapChange24h === "number" ? marketCapChange24h : null,
    volumeUsd24h: typeof q.total_volume_24h === "number" ? q.total_volume_24h : null,
    btcDominance: typeof g.btc_dominance === "number" ? g.btc_dominance : null,
    ethDominance: typeof g.eth_dominance === "number" ? g.eth_dominance : null
  };
}

function mapCoinDetails({listing, info, localLogoPath}){
  const usd = listing?.quote?.USD || {};
  const platform = info?.platform || null;

  // Shape similar to CoinGecko "coin" endpoint so existing UI works.
  return {
    id: listing.id,
    symbol: listing.symbol,
    name: listing.name,
    image: {
      large: localLogoPath || null,
      small: localLogoPath || null,
      thumb: localLogoPath || null
    },
    market_cap_rank: listing.cmc_rank ?? null,
    asset_platform_id: platform ? (platform.name || platform.slug || platform.symbol || null) : null,
    description: {
      en: (info?.description || "") // CoinMarketCap provides plain text
    },
    links: {
      homepage: info?.urls?.website || [],
      blockchain_site: info?.urls?.explorer || [],
      official_forum_url: info?.urls?.message_board || [],
      chat_url: info?.urls?.chat || [],
      announcement_url: info?.urls?.announcement || [],
      twitter_screen_name: pickFirst(info?.urls?.twitter)?.replace(/^https?:\/\/(www\.)?twitter\.com\//i, "") || "",
      facebook_username: pickFirst(info?.urls?.facebook) || "",
      subreddit_url: pickFirst(info?.urls?.reddit) || "",
      repos_url: {
        github: info?.urls?.source_code || []
      }
    },
    market_data: {
      current_price: { usd: typeof usd.price === "number" ? usd.price : null },
      market_cap: { usd: typeof usd.market_cap === "number" ? usd.market_cap : null },
      total_volume: { usd: typeof usd.volume_24h === "number" ? usd.volume_24h : null },
      price_change_percentage_1h_in_currency: { usd: typeof usd.percent_change_1h === "number" ? usd.percent_change_1h : null },
      price_change_percentage_24h: typeof usd.percent_change_24h === "number" ? usd.percent_change_24h : null,
      price_change_percentage_7d: typeof usd.percent_change_7d === "number" ? usd.percent_change_7d : null,
      circulating_supply: typeof listing.circulating_supply === "number" ? listing.circulating_supply : null,
      total_supply: typeof listing.total_supply === "number" ? listing.total_supply : null,
      max_supply: typeof listing.max_supply === "number" ? listing.max_supply : null
    },
    last_updated: listing.last_updated || null
  };
}

// Convert CMC OHLCV quotes -> CoinGecko-like OHLC array: [ts_ms, open, high, low, close]
function toOhlcArray(quotes){
  return (quotes || []).map(q => {
    const t = q.time_open || q.time_close || q.timestamp;
    const usd = q.quote?.USD || {};
    const ts = t ? Date.parse(t) : null;
    return [
      ts || null,
      usd.open ?? null,
      usd.high ?? null,
      usd.low ?? null,
      usd.close ?? null
    ];
  }).filter(r => r[0] && r[1] != null && r[4] != null);
}

// Convert OHLC array to market_chart-like {prices:[[ts,close]]}
function ohlcToMarketChart(ohlc){
  const prices = (ohlc || []).map(o => [o[0], o[4]]).filter(p => p[0] && p[1] != null);
  return { prices };
}

function sliceLastDays(ohlc, days){
  const cutoff = Date.now() - days*24*60*60*1000;
  return (ohlc || []).filter(o => o[0] >= cutoff);
}

async function main(){
  ensureDir(DATA_DIR);
  ensureDir(COINS_DIR);
  ensureDir(OHLC_DIR);
  ensureDir(MC_DIR);
  ensureDir(COIN_IMG_DIR);

  const updatedAt = new Date().toISOString();

  // 1) listings + global metrics
  const [listingsRes, globalRes] = await Promise.all([
    cmc("/v1/cryptocurrency/listings/latest", { start: 1, limit: TOP_LIMIT, convert: "USD" }),
    cmc("/v1/global-metrics/quotes/latest", { convert: "USD" })
  ]);

  const listings = (listingsRes?.data || []).filter(Boolean);
  const ids = listings.map(c => c.id);
  const infoIds = ids.slice(0, LOGO_LIMIT);

  // 2) metadata/info (batch)
  const infoRes = await cmc("/v2/cryptocurrency/info", { id: infoIds.join(",") });
  const infoMap = infoRes?.data || {};

  // 3) download logos (only if missing)
  const logoLocalById = {};
  for (const id of infoIds){
    const inf = infoMap?.[String(id)] || infoMap?.[id] || null;
    const logoUrl = inf?.logo;
    if (!logoUrl) continue;

    const ext = normalizeImageExt(logoUrl);
    const rel = `assets/img/coins/${id}.${ext}`;
    const abs = path.join(ROOT, rel);

    if (!fs.existsSync(abs)){
      try{
        await downloadBinary(logoUrl, abs);
      }catch(e){
        // ignore logo errors; keep placeholder
      }
    }
    logoLocalById[id] = rel;
    // be gentle
    await sleep(80);
  }

  // 4) charts for top N coins (2 calls per coin: hourly 7d + daily ~5y)
  const chartIds = ids.slice(0, Math.min(CHART_LIMIT, ids.length));
  const sparklineById = {};

  for (const id of chartIds){
    // Hourly (last 7 days)
    let hourlyQuotes = [];
    try{
      const hRes = await cmc("/v1/cryptocurrency/ohlcv/historical", {
        id,
        convert: "USD",
        time_period: "hourly",
        time_start: isoDaysAgo(7)
      });
      hourlyQuotes = hRes?.data?.quotes || [];
    }catch(e){
      hourlyQuotes = [];
    }

    const hourlyOhlc = toOhlcArray(hourlyQuotes);
    const ohlc7 = hourlyOhlc;
    const ohlc1 = sliceLastDays(hourlyOhlc, 1);

    if (ohlc7.length){
      writeJSON(`data/ohlc/${id}-7.json`, ohlc7);
      writeJSON(`data/market_chart/${id}-7.json`, ohlcToMarketChart(ohlc7));
      sparklineById[id] = ohlcToMarketChart(ohlc7).prices.map(p => p[1]).filter(n => typeof n === "number");
    }
    if (ohlc1.length){
      writeJSON(`data/ohlc/${id}-1.json`, ohlc1);
      writeJSON(`data/market_chart/${id}-1.json`, ohlcToMarketChart(ohlc1));
    }

    // Daily (last ~2000 days)
    let dailyQuotes = [];
    try{
      const dRes = await cmc("/v1/cryptocurrency/ohlcv/historical", {
        id,
        convert: "USD",
        time_period: "daily",
        time_start: isoDaysAgo(2000)
      });
      dailyQuotes = dRes?.data?.quotes || [];
    }catch(e){
      dailyQuotes = [];
    }

    const dailyOhlc = toOhlcArray(dailyQuotes);

    if (dailyOhlc.length){
      const ohlc30 = sliceLastDays(dailyOhlc, 30);
      const ohlc365 = sliceLastDays(dailyOhlc, 365);
      const ohlcMax = dailyOhlc;

      writeJSON(`data/ohlc/${id}-30.json`, ohlc30);
      writeJSON(`data/market_chart/${id}-30.json`, ohlcToMarketChart(ohlc30));

      writeJSON(`data/ohlc/${id}-365.json`, ohlc365);
      writeJSON(`data/market_chart/${id}-365.json`, ohlcToMarketChart(ohlc365));

      writeJSON(`data/ohlc/${id}-max.json`, ohlcMax);
      writeJSON(`data/market_chart/${id}-max.json`, ohlcToMarketChart(ohlcMax));
    }

    await sleep(300); // rate-limit friendly
  }

  // 5) coin details snapshots
  for (const listing of listings){
    const id = listing.id;
    const inf = infoMap?.[String(id)] || infoMap?.[id] || null;
    const localLogoPath = logoLocalById[id] || null;

    const coinDetails = mapCoinDetails({ listing, info: inf, localLogoPath });
    writeJSON(`data/coins/${id}.json`, coinDetails);
  }

  // 6) main markets snapshot (same shape as before)
  const mappedCoins = listings.map((c, idx) => {
    const usd = c.quote?.USD || {};
    const id = c.id;

    return {
      id: String(id),
      symbol: (c.symbol || "").toUpperCase(),
      name: c.name,
      image: logoLocalById[id] || "assets/img/coin.svg",
      rank: c.cmc_rank ?? (idx + 1),
      price: usd.price ?? null,
      marketCap: usd.market_cap ?? null,
      volume24h: usd.volume_24h ?? null,
      change1h: usd.percent_change_1h ?? null,
      change24h: usd.percent_change_24h ?? null,
      change7d: usd.percent_change_7d ?? null,
      sparkline7d: sparklineById[id] || null
    };
  });

  writeJSON("data/markets.latest.json", {
    source: "coinmarketcap",
    updatedAt,
    global: mapGlobal(globalRes),
    coins: mappedCoins
  });

  // 7) Fear & Greed (server-side, client reads /data only)
  try{
    const fng = await fetchJSON("https://api.alternative.me/fng/?limit=1&format=json", { retry: 2 });
    writeJSON("data/fear-greed.latest.json", { source: "alternative.me", updatedAt, ...fng });
  }catch(e){
    // keep previous if any
  }

  // 8) News (server-side) – keep current behavior
  try{
    const news = await fetchJSON("https://min-api.cryptocompare.com/data/v2/news/?lang=EN", { retry: 2 });
    const items = (news?.Data || []).slice(0, 50).map(n => ({
      title: n.title,
      url: n.url,
      source: n.source,
      publishedAt: n.published_on ? new Date(n.published_on * 1000).toISOString() : null
    }));
    writeJSON("data/news.latest.json", { source: "cryptocompare", updatedAt, items });
  }catch(e){
    // keep previous if any
  }

  console.log("done", updatedAt, {
    listings: listings.length,
    charts: chartIds.length
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
