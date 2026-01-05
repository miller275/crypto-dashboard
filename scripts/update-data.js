import fs from "fs";
import path from "path";
import crypto from "crypto";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "data");
const COINS_DIR = path.join(DATA_DIR, "coins");
const CHART_DIR = path.join(DATA_DIR, "market_chart");
const OHLC_DIR = path.join(DATA_DIR, "ohlc");
const LOGOS_DIR = path.join(ROOT, "assets", "img", "coins");

const API_KEY = process.env.CMC_PRO_API_KEY;
if (!API_KEY) {
  console.error("Missing env CMC_PRO_API_KEY (GitHub Actions secret). Aborting.");
  process.exit(1);
}

const TOP_LIMIT = Number(process.env.TOP_LIMIT || 150);
const CHART_LIMIT = Number(process.env.CHART_LIMIT || 50);
const LOGO_LIMIT = Number(process.env.LOGO_LIMIT || 150);

const CMC_BASE = "https://pro-api.coinmarketcap.com";

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function sha1(s) {
  return crypto.createHash("sha1").update(String(s)).digest("hex");
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchJSON(url, { retries = 3, timeoutMs = 20000 } = {}) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "X-CMC_PRO_API_KEY": API_KEY,
          "User-Agent": "crypto-dashboard-snapshots/1.0",
        },
        signal: controller.signal,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${url} :: ${text.slice(0, 140)}`);
      }
      return await res.json();
    } catch (e) {
      if (attempt === retries) throw e;
      await sleep(700 * attempt);
    } finally {
      clearTimeout(t);
    }
  }
}

async function fetchText(url, { retries = 2, timeoutMs = 20000 } = {}) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: controller.signal, headers: { "User-Agent": "crypto-dashboard-snapshots/1.0" } });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
      return await res.text();
    } catch (e) {
      if (attempt === retries) throw e;
      await sleep(500 * attempt);
    } finally {
      clearTimeout(t);
    }
  }
}

function writeJsonIfChanged(filePath, obj) {
  const json = JSON.stringify(obj, null, 2);
  if (fs.existsSync(filePath)) {
    const old = fs.readFileSync(filePath, "utf8");
    if (old === json) return false;
  }
  fs.writeFileSync(filePath, json);
  return true;
}

function nowRoundedToHour() {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  return d.getTime();
}

function genPrices({ seed, startPrice, endPrice, points, volatility = 0.02 }) {
  const rnd = mulberry32(seed);
  const s = Math.max(1e-12, Number(startPrice) || 1e-12);
  const e = Math.max(1e-12, Number(endPrice) || s);
  const logS = Math.log(s);
  const logE = Math.log(e);

  const out = new Array(points);
  for (let i = 0; i < points; i++) {
    const t = points === 1 ? 1 : i / (points - 1);
    const base = logS * (1 - t) + logE * t;
    const noise = (rnd() - 0.5) * volatility; // log-noise
    out[i] = Math.exp(base + noise);
  }

  // scale to match endPrice exactly
  const scale = e / out[out.length - 1];
  for (let i = 0; i < out.length; i++) out[i] *= scale;

  // clean
  for (let i = 0; i < out.length; i++) {
    if (!Number.isFinite(out[i]) || out[i] <= 0) out[i] = e;
  }

  return out;
}

function genOHLC({ seed, timestamps, prices, wickPct = 0.006 }) {
  const rnd = mulberry32(seed ^ 0xA5A5A5A5);
  const out = [];
  for (let i = 0; i < timestamps.length; i++) {
    const ts = timestamps[i];
    const close = prices[i];
    const open = i === 0 ? close : prices[i - 1];
    const baseHigh = Math.max(open, close);
    const baseLow = Math.min(open, close);
    const upWick = 1 + rnd() * wickPct;
    const downWick = 1 - rnd() * wickPct;
    const high = baseHigh * upWick;
    const low = baseLow * downWick;
    out.push([ts, open, high, low, close]);
  }
  return out;
}

function makeMarketChart({ seed, endTsMs, stepMs, points, startPrice, endPrice, volatility }) {
  const pricesOnly = genPrices({ seed, startPrice, endPrice, points, volatility });
  const ts = new Array(points);
  for (let i = 0; i < points; i++) {
    ts[i] = endTsMs - (points - 1 - i) * stepMs;
  }
  const prices = ts.map((t, idx) => [t, Number(pricesOnly[idx].toFixed(10))]);
  return { ts, pricesOnly, prices };
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
    change1h: c.change1h,
    change24h: c.change24h,
    change7d: c.change7d,
    sparkline7d: c.sparkline7d,
    supply: c.supply,
    totalSupply: c.totalSupply,
  };
}

function toCoinDetailsShape(c, info) {
  const descRaw = (info?.description || "").trim();
  const description = descRaw ? descRaw.slice(0, 1200) : "";

  // estimate ATH/ATL from generated long series if present
  const ath = c.ath ?? null;
  const atl = c.atl ?? null;

  return {
    id: String(c.id),
    symbol: c.symbol,
    name: c.name,
    market_cap_rank: c.rank,
    image: {
      small: c.image,
      large: c.image,
    },
    description: {
      en: description,
    },
    market_data: {
      current_price: { usd: c.price },
      market_cap: { usd: c.marketCap },
      total_volume: { usd: c.volume24h },
      circulating_supply: c.supply,
      total_supply: c.totalSupply,
      ath: { usd: ath },
      atl: { usd: atl },
      price_change_percentage_24h: c.change24h,
      last_updated: new Date().toISOString(),
    },
  };
}

function parseRSS(xml, sourceName) {
  const items = [];
  const itemMatches = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];
  for (const block of itemMatches.slice(0, 30)) {
    const title = (block.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || "").replace(/<!\[CDATA\[|\]\]>/g, "").trim();
    const link = (block.match(/<link>([\s\S]*?)<\/link>/i)?.[1] || "").replace(/<!\[CDATA\[|\]\]>/g, "").trim();
    const pub = (block.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1] || "").trim();
    if (!title || !link) continue;
    const publishedAt = pub ? new Date(pub).toISOString() : null;
    items.push({ title, url: link, source: sourceName, publishedAt });
  }
  return items;
}

async function fetchNewsSnapshot() {
  const feeds = [
    { name: "CryptoPotato", url: "https://cryptopotato.com/feed/" },
    { name: "Cointelegraph", url: "https://cointelegraph.com/rss" },
    { name: "Decrypt", url: "https://decrypt.co/feed" },
  ];
  let items = [];
  for (const f of feeds) {
    try {
      const xml = await fetchText(f.url);
      items = items.concat(parseRSS(xml, f.name));
    } catch (_) {
      // ignore
    }
  }

  // de-dup
  const seen = new Set();
  const uniq = [];
  for (const it of items) {
    const key = sha1(it.url);
    if (seen.has(key)) continue;
    seen.add(key);
    uniq.push(it);
  }

  // newest first
  uniq.sort((a, b) => {
    const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return tb - ta;
  });

  // Fallback to sample if feeds are blocked
  if (!uniq.length) {
    uniq.push(
      { title: "Sample headline: Bitcoin volatility returns", url: "#", source: "sample", publishedAt: new Date().toISOString() },
      { title: "Sample headline: Altcoins rally on macro news", url: "#", source: "sample", publishedAt: new Date().toISOString() }
    );
  }

  return { source: "rss", updatedAt: new Date().toISOString(), items: uniq.slice(0, 30) };
}

async function fetchFearGreedSnapshot() {
  try {
    const j = await fetchJSON("https://api.alternative.me/fng/?limit=1", { retries: 2 });
    const d = j?.data?.[0];
    if (!d) throw new Error("No data");
    return {
      source: "alternative.me",
      updatedAt: new Date().toISOString(),
      data: [
        {
          value: Number(d.value),
          value_classification: d.value_classification,
          timestamp: Number(d.timestamp),
          time_until_update: d.time_until_update,
        },
      ],
    };
  } catch (_) {
    return {
      source: "sample",
      updatedAt: new Date().toISOString(),
      data: [
        {
          value: 55,
          value_classification: "Neutral",
          timestamp: Math.floor(Date.now() / 1000),
          time_until_update: 0,
        },
      ],
    };
  }
}

async function downloadLogo(url, id) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "crypto-dashboard-snapshots/1.0" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 100) throw new Error("logo too small");
    const out = path.join(LOGOS_DIR, `${id}.png`);
    fs.writeFileSync(out, buf);
    return true;
  } catch (_) {
    return false;
  }
}

function findLogoRel(id) {
  const exts = ["png", "svg", "jpg", "jpeg", "webp", "gif"];
  for (const ext of exts) {
    const fp = path.join(LOGOS_DIR, `${id}.${ext}`);
    if (fs.existsSync(fp)) return `assets/img/coins/${id}.${ext}`;
  }
  return "assets/img/coin.svg";
}

async function main() {
  ensureDir(DATA_DIR);
  ensureDir(COINS_DIR);
  ensureDir(CHART_DIR);
  ensureDir(OHLC_DIR);
  ensureDir(LOGOS_DIR);

  const updatedAt = new Date().toISOString();

  console.log(`[update-data] TOP_LIMIT=${TOP_LIMIT} CHART_LIMIT=${CHART_LIMIT} LOGO_LIMIT=${LOGO_LIMIT}`);

  // 1) Listings
  const listingsUrl = `${CMC_BASE}/v1/cryptocurrency/listings/latest?start=1&limit=${TOP_LIMIT}&convert=USD`;
  const listings = await fetchJSON(listingsUrl);
  const list = listings?.data || [];

  // 2) Global
  const globalUrl = `${CMC_BASE}/v1/global-metrics/quotes/latest?convert=USD`;
  const global = await fetchJSON(globalUrl);
  const g = global?.data;

  // 3) Info for top LOGO_LIMIT coins
  const infoIds = list.slice(0, LOGO_LIMIT).map((x) => x.id).join(",");
  const infoUrl = `${CMC_BASE}/v1/cryptocurrency/info?id=${infoIds}`;
  let infoData = {};
  try {
    const info = await fetchJSON(infoUrl);
    infoData = info?.data || {};
  } catch (e) {
    console.warn("[info] failed to fetch CMC info (continuing):", e.message);
  }

  // 4) Download logos (best effort)
  let logoOk = 0;
  for (const x of list.slice(0, LOGO_LIMIT)) {
    const i = infoData?.[x.id];
    const url = i?.logo;
    if (!url) continue;
    const ok = await downloadLogo(url, x.id);
    if (ok) logoOk++;
    await sleep(70);
  }
  console.log(`[logos] saved/exists (best effort): ${logoOk}`);

  // Build coins base
  const coins = list.map((x) => {
    const q = x.quote?.USD || {};
    return {
      id: x.id,
      symbol: x.symbol,
      name: x.name,
      image: findLogoRel(x.id),
      rank: x.cmc_rank ?? null,
      price: q.price ?? null,
      marketCap: q.market_cap ?? null,
      volume24h: q.volume_24h ?? null,
      change1h: q.percent_change_1h ?? null,
      change24h: q.percent_change_24h ?? null,
      change7d: q.percent_change_7d ?? null,
      // Some CMC plans provide 30d; keep optional
      change30d: q.percent_change_30d ?? null,
      supply: x.circulating_supply ?? null,
      totalSupply: x.total_supply ?? null,
      sparkline7d: [],
      ath: null,
      atl: null,
    };
  });

  // 5) Generate sparklines for ALL coins, and full charts for top CHART_LIMIT
  const endTsMs = nowRoundedToHour();
  const oneHour = 60 * 60 * 1000;
  const oneDay = 24 * oneHour;

  // helper to compute start price from pct
  const priceFromPct = (pNow, pct) => {
    const p = Number(pNow);
    const c = Number(pct);
    if (!Number.isFinite(p) || p <= 0) return 1;
    if (!Number.isFinite(c)) return p;
    const denom = 1 + c / 100;
    if (!Number.isFinite(denom) || denom <= 0.01) return p;
    return p / denom;
  };

  for (let idx = 0; idx < coins.length; idx++) {
    const c = coins[idx];
    const seed = (Number(c.id) || 0) ^ parseInt(sha1(c.symbol).slice(0, 8), 16);

    const pNow = Number(c.price) || 1;
    const p1d = priceFromPct(pNow, c.change24h);
    const p7d = priceFromPct(pNow, c.change7d);
    const p30d = c.change30d != null ? priceFromPct(pNow, c.change30d) : p7d;

    // 7d sparkline (hourly 168 points)
    const spark = makeMarketChart({
      seed: seed ^ 0x7d7d7d7d,
      endTsMs,
      stepMs: oneHour,
      points: 7 * 24,
      startPrice: p7d,
      endPrice: pNow,
      volatility: 0.035,
    });
    c.sparkline7d = spark.pricesOnly.map((v) => Number(v.toFixed(2)));

    // Only top CHART_LIMIT get full chart+ohlc snapshots
    if (idx >= CHART_LIMIT) continue;

    // 1 day (hourly 24)
    const mc1 = makeMarketChart({
      seed: seed ^ 0x11111111,
      endTsMs,
      stepMs: oneHour,
      points: 24,
      startPrice: p1d,
      endPrice: pNow,
      volatility: 0.02,
    });

    // 7 day (hourly 168)
    const mc7 = spark; // reuse

    // 30 day (daily 30)
    const mc30 = makeMarketChart({
      seed: seed ^ 0x30303030,
      endTsMs,
      stepMs: oneDay,
      points: 30,
      startPrice: p30d,
      endPrice: pNow,
      volatility: 0.05,
    });

    // 365 day (daily 365) — extrapolate using 30d momentum if available
    const pct30 = Number(c.change30d);
    const safePct30 = Number.isFinite(pct30) ? clamp(pct30, -80, 300) : 0;
    const growthMonthly = 1 + safePct30 / 100;
    const growthYear = clamp(Math.pow(Math.max(0.2, growthMonthly), 365 / 30), 0.05, 20);
    const p1y = pNow / growthYear;

    const mc365 = makeMarketChart({
      seed: seed ^ 0x36536536,
      endTsMs,
      stepMs: oneDay,
      points: 365,
      startPrice: p1y,
      endPrice: pNow,
      volatility: 0.06,
    });

    // max (daily 2000)
    const pMax = p1y * (0.5 + mulberry32(seed)() * 0.6);
    const mcMax = makeMarketChart({
      seed: seed ^ 0x0f0f0f0f,
      endTsMs,
      stepMs: oneDay,
      points: 2000,
      startPrice: Math.max(1e-8, pMax),
      endPrice: pNow,
      volatility: 0.08,
    });

    // compute ath/atl from max series
    const seriesAll = mcMax.pricesOnly;
    c.ath = Number(Math.max(...seriesAll).toFixed(10));
    c.atl = Number(Math.min(...seriesAll).toFixed(10));

    // write chart snapshots
    writeJsonIfChanged(path.join(CHART_DIR, `${c.id}-1.json`), { updatedAt, prices: mc1.prices });
    writeJsonIfChanged(path.join(CHART_DIR, `${c.id}-7.json`), { updatedAt, prices: mc7.prices });
    writeJsonIfChanged(path.join(CHART_DIR, `${c.id}-30.json`), { updatedAt, prices: mc30.prices });
    writeJsonIfChanged(path.join(CHART_DIR, `${c.id}-365.json`), { updatedAt, prices: mc365.prices });
    writeJsonIfChanged(path.join(CHART_DIR, `${c.id}-max.json`), { updatedAt, prices: mcMax.prices });

    // ohlc snapshots (same time bases)
    const o1 = genOHLC({ seed: seed ^ 0x01010101, timestamps: mc1.ts, prices: mc1.pricesOnly, wickPct: 0.003 });
    const o7 = genOHLC({ seed: seed ^ 0x07070707, timestamps: mc7.ts, prices: mc7.pricesOnly, wickPct: 0.006 });
    const o30 = genOHLC({ seed: seed ^ 0x30303033, timestamps: mc30.ts, prices: mc30.pricesOnly, wickPct: 0.01 });
    const o365 = genOHLC({ seed: seed ^ 0x36500000, timestamps: mc365.ts, prices: mc365.pricesOnly, wickPct: 0.012 });
    const oMax = genOHLC({ seed: seed ^ 0x0f00f00f, timestamps: mcMax.ts, prices: mcMax.pricesOnly, wickPct: 0.014 });

    writeJsonIfChanged(path.join(OHLC_DIR, `${c.id}-1.json`), o1);
    writeJsonIfChanged(path.join(OHLC_DIR, `${c.id}-7.json`), o7);
    writeJsonIfChanged(path.join(OHLC_DIR, `${c.id}-30.json`), o30);
    writeJsonIfChanged(path.join(OHLC_DIR, `${c.id}-365.json`), o365);
    writeJsonIfChanged(path.join(OHLC_DIR, `${c.id}-max.json`), oMax);

    if ((idx + 1) % 10 === 0) console.log(`[charts] generated ${idx + 1}/${Math.min(coins.length, CHART_LIMIT)}`);
  }

  // 6) Write per-coin details snapshots for ALL coins (cheap)
  let coinWritten = 0;
  for (const c of coins) {
    const info = infoData?.[c.id];
    const out = toCoinDetailsShape(c, info);
    const changed = writeJsonIfChanged(path.join(COINS_DIR, `${c.id}.json`), out);
    if (changed) coinWritten++;
  }
  console.log(`[coins] updated files: ${coinWritten}`);

  // 7) Markets snapshot
  const marketsSnap = {
    source: "CMC PRO (listings/info) + synthetic charts",
    updatedAt,
    global: g
      ? {
          marketCap: g.quote?.USD?.total_market_cap ?? null,
          volume24h: g.quote?.USD?.total_volume_24h ?? null,
          btcDominance: g.btc_dominance ?? null,
          ethDominance: g.eth_dominance ?? null,
          marketCapChange24h: g.quote?.USD?.total_market_cap_yesterday_percentage_change ?? null,
        }
      : null,
    coins: coins.map(toCoinRowShape),
  };
  writeJsonIfChanged(path.join(DATA_DIR, "markets.latest.json"), marketsSnap);

  // 8) Fear & Greed snapshot
  const fng = await fetchFearGreedSnapshot();
  writeJsonIfChanged(path.join(DATA_DIR, "fear-greed.latest.json"), fng);

  // 9) News snapshot
  const news = await fetchNewsSnapshot();
  writeJsonIfChanged(path.join(DATA_DIR, "news.latest.json"), news);

  console.log("[update-data] done");
}

main().catch((err) => {
  console.error("[update-data] ERROR:", err);
  process.exit(1);
});
