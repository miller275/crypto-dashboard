import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const API_BASE = "https://pro-api.coinmarketcap.com";
const API_KEY = process.env.CMC_PRO_API_KEY;

if(!API_KEY){
  console.error("Missing CMC_PRO_API_KEY in env.");
  process.exit(1);
}

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "data");
const PAGES_DIR = path.join(DATA_DIR, "pages");
const COINS_DIR = path.join(DATA_DIR, "coins");

const PAGE_SIZE = 200;
const LISTINGS_CHUNK = 1000;       // safer than 5000 in one call
const MAX_LISTINGS = 5000;         // adjust if your plan allows more

function ensureDir(p){ fs.mkdirSync(p, { recursive:true }); }
ensureDir(DATA_DIR); ensureDir(PAGES_DIR); ensureDir(COINS_DIR);

function nowISO(){
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

async function cmc(endpoint, params={}){
  const url = new URL(API_BASE + endpoint);
  for(const [k,v] of Object.entries(params)){
    if(v === undefined || v === null) continue;
    url.searchParams.set(k, String(v));
  }
  const res = await fetch(url, {
    headers: {
      "X-CMC_PRO_API_KEY": API_KEY,
      "Accept": "application/json"
    }
  });
  const text = await res.text();
  let json;
  try{ json = JSON.parse(text); }catch(_){
    throw new Error(`CMC invalid JSON (${res.status}): ${text.slice(0,200)}`);
  }
  if(!res.ok){
    throw new Error(`CMC ${endpoint} failed (${res.status}): ${json?.status?.error_message || text.slice(0,200)}`);
  }
  return json;
}

// deterministic synthetic sparkline (if real sparkline isn't available yet)
function synthSpark(id, pct7d){
  const n = 30;
  const seed = Number(id) || 1;
  const h = crypto.createHash("sha1").update(String(seed)).digest();
  const amp = (h[0] % 7) / 10 + 0.5;
  const drift = ((h[1] % 13) - 6) / 40;
  const base = 100 + (h[2] % 70);

  const out = [];
  for(let i=0;i<n;i++){
    const t = i/(n-1);
    const wave = Math.sin(t*6.283 + (h[3]%10)) * amp;
    const trend = (t - 0.5) * drift * 100;
    // map pct7d a bit into the series direction
    const p = Number(pct7d);
    const tilt = Number.isFinite(p) ? (t-0.5) * (p/8) : 0;
    out.push(Number((base + wave + trend + tilt).toFixed(4)));
  }
  return out;
}

function writeJSON(file, obj){
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(obj, null, 2));
}

function readJSON(file, fallback){
  try{ return JSON.parse(fs.readFileSync(file, "utf-8")); }catch(_){ return fallback; }
}

function pick(obj, pathStr, fallback=null){
  const parts = pathStr.split(".");
  let cur = obj;
  for(const p of parts){
    if(cur && Object.prototype.hasOwnProperty.call(cur, p)) cur = cur[p];
    else return fallback;
  }
  return cur ?? fallback;
}

async function fetchAllListings(){
  const out = [];
  for(let start=1; start<=MAX_LISTINGS; start += LISTINGS_CHUNK){
    const limit = Math.min(LISTINGS_CHUNK, MAX_LISTINGS - start + 1);
    const json = await cmc("/v1/cryptocurrency/listings/latest", {
      start, limit, convert: "USD"
    });
    const arr = json?.data || [];
    out.push(...arr);
    if(arr.length < limit) break;
    // small courtesy delay
    await new Promise(r => setTimeout(r, 250));
  }
  return out;
}

async function fetchInfoBatched(ids){
  // /v2/cryptocurrency/info supports multiple ids (comma-separated)
  const out = {};
  const BATCH = 100;
  for(let i=0;i<ids.length;i+=BATCH){
    const batch = ids.slice(i, i+BATCH);
    const json = await cmc("/v2/cryptocurrency/info", { id: batch.join(",") });
    const data = json?.data || {};
    for(const [id, arr] of Object.entries(data)){
      const info = Array.isArray(arr) ? arr[0] : arr;
      out[id] = info;
    }
    await new Promise(r => setTimeout(r, 250));
  }
  return out;
}

async function fetchMarketPairs(id){
  // optional: might not be available for all plans; keep it best-effort
  try{
    const json = await cmc("/v1/cryptocurrency/market-pairs/latest", {
      id, limit: 10, convert: "USD"
    });
    const pairs = json?.data?.market_pairs || [];
    return pairs.map(p => ({
      exchange: pick(p, "exchange.name", null),
      pair: pick(p, "market_pair", null),
      volume_24h: pick(p, "quote.USD.volume_24h", null)
    })).filter(x => x.exchange && x.pair);
  }catch(_){
    return [];
  }
}

async function updateSparklines(ids){
  // Rotate through the universe over time to avoid huge API usage.
  const stateFile = path.join(DATA_DIR, "state.json");
  const state = readJSON(stateFile, { idx: 0 });
  const batchSize = 200; // update 200 sparklines per hour
  const start = state.idx % ids.length;
  const batch = [];
  for(let i=0;i<batchSize;i++){
    batch.push(ids[(start + i) % ids.length]);
  }

  const outDir = path.join(DATA_DIR, "sparklines");
  ensureDir(outDir);

  const now = Date.now();
  const time_end = new Date(now).toISOString();
  const time_start = new Date(now - 7*24*60*60*1000).toISOString();

  for(const id of batch){
    try{
      const json = await cmc("/v1/cryptocurrency/ohlcv/historical", {
        id,
        convert: "USD",
        time_start,
        time_end,
        interval: "hourly"
      });
      const quotes = json?.data?.quotes || [];
      const points = quotes.map(q => pick(q, "quote.USD.close", null)).filter(v => typeof v === "number");
      if(points.length >= 10){
        writeJSON(path.join(outDir, `${id}.json`), { id, points, interval:"hourly", approx:false, updatedAt: nowISO() });
      }
      await new Promise(r => setTimeout(r, 220));
    }catch(err){
      // keep going
      console.warn("sparkline failed for id", id, err.message?.slice(0,120));
    }
  }

  writeJSON(stateFile, { idx: (start + batchSize) % ids.length, updatedAt: nowISO() });
}

async function fetchFearGreed(){
  // alternative.me (public) - allowed ONLY in Actions; frontend reads local file
  try{
    const res = await fetch("https://api.alternative.me/fng/?limit=1&format=json");
    const json = await res.json();
    const d = json?.data?.[0];
    if(!d) return null;
    return {
      value: Number(d.value),
      classification: d.value_classification,
      updatedAt: nowISO()
    };
  }catch(_){
    return null;
  }
}

async function fetchNewsRss(){
  // Compact news list from RSS (no keys). Best-effort.
  const urls = [
    "https://www.coindesk.com/arc/outboundfeeds/rss/?outputType=xml",
    "https://cointelegraph.com/rss"
  ];
  for(const u of urls){
    try{
      const res = await fetch(u, { headers: { "User-Agent":"cryptoboard-bot" }});
      if(!res.ok) continue;
      const xml = await res.text();
      const items = [];
      // extremely small RSS parser (no deps)
      const itemRe = /<item>([\s\S]*?)<\/item>/g;
      let m;
      while((m = itemRe.exec(xml)) && items.length < 10){
        const block = m[1];
        const title = (block.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) || block.match(/<title>([\s\S]*?)<\/title>/))?.[1]?.trim();
        const link = (block.match(/<link>([\s\S]*?)<\/link>/))?.[1]?.trim();
        const pub = (block.match(/<pubDate>([\s\S]*?)<\/pubDate>/))?.[1]?.trim();
        if(title && link){
          items.push({ title, url: link, source: new URL(u).hostname, publishedAt: pub ? new Date(pub).toISOString() : null });
        }
      }
      if(items.length){
        return { updatedAt: nowISO(), items };
      }
    }catch(_){}
  }
  return { updatedAt: nowISO(), items: [] };
}

async function main(){
  const updatedAt = nowISO();
  console.log("Fetching listings…");
  const listings = await fetchAllListings();
  console.log("Listings:", listings.length);

  const ids = listings.map(x => x.id);

  // update a rotating batch of sparklines (best-effort)
  await updateSparklines(ids);

  // load existing sparklines to inject into pages
  const sparkDir = path.join(DATA_DIR, "sparklines");
  ensureDir(sparkDir);
  const sparkCache = new Map();
  try{
    for(const file of fs.readdirSync(sparkDir)){
      if(!file.endsWith(".json")) continue;
      const sp = readJSON(path.join(sparkDir, file), null);
      if(sp && sp.id && Array.isArray(sp.points)) sparkCache.set(String(sp.id), sp.points);
    }
  }catch(_){}

  // build search index
  writeJSON(path.join(DATA_DIR, "search-index.json"), {
    items: listings
      .map(c => ({ id:c.id, symbol:c.symbol, name:c.name, rank:c.cmc_rank }))
      .sort((a,b)=> (a.rank??1e9)-(b.rank??1e9))
  });

  // fetch global metrics (optional but useful for meta)
  let global = null;
  try{
    const g = await cmc("/v1/global-metrics/quotes/latest", { convert:"USD" });
    global = g?.data || null;
    writeJSON(path.join(DATA_DIR, "global.json"), { updatedAt, data: global });
  }catch(_){}

  // fear & greed
  const fng = await fetchFearGreed();
  if(fng) writeJSON(path.join(DATA_DIR, "fng.json"), fng);

  // news
  const news = await fetchNewsRss();
  writeJSON(path.join(DATA_DIR, "news.json"), news);

  // meta + paginated listings
  const totalCoins = listings.length;
  const pages = Math.max(1, Math.ceil(totalCoins / PAGE_SIZE));
  writeJSON(path.join(DATA_DIR, "meta.json"), {
    updatedAt,
    totalCoins,
    pageSize: PAGE_SIZE,
    pages,
    fiat: "USD",
    source: "CoinMarketCap Pro API (snapshotted by GitHub Actions)"
  });

  console.log("Writing pages…");
  for(let p=1;p<=pages;p++){
    const slice = listings.slice((p-1)*PAGE_SIZE, p*PAGE_SIZE);
    const items = slice.map(c => {
      const q = c?.quote?.USD || {};
      const id = c.id;
      const pct7d = q.percent_change_7d ?? null;
      const spark = sparkCache.get(String(id)) || synthSpark(id, pct7d);
      return {
        id,
        name: c.name,
        symbol: c.symbol,
        rank: c.cmc_rank,
        price: q.price ?? null,
        pct1h: q.percent_change_1h ?? null,
        pct24h: q.percent_change_24h ?? null,
        pct7d: pct7d,
        mcap: q.market_cap ?? null,
        vol24h: q.volume_24h ?? null,
        spark7d: spark
      };
    });
    writeJSON(path.join(PAGES_DIR, `listings-${p}.json`), { items });
  }

  console.log("Writing coin details (info + market pairs)…");
  const infoMap = await fetchInfoBatched(ids);
  // optional: pairs only for top 200 to control quota
  const PAIRS_FOR_TOP = 200;
  for(let i=0;i<ids.length;i++){
    const id = ids[i];
    const c = listings[i];
    const q = c?.quote?.USD || {};
    const info = infoMap[String(id)] || {};
    const pairs = i < PAIRS_FOR_TOP ? await fetchMarketPairs(id) : [];

    writeJSON(path.join(COINS_DIR, `${id}.json`), {
      id,
      name: c.name,
      symbol: c.symbol,
      rank: c.cmc_rank,
      category: info.category ?? null,
      description: info.description ?? null,
      urls: info.urls ?? null,
      tags: info.tags ?? null,
      circulating_supply: c.circulating_supply ?? null,
      total_supply: c.total_supply ?? null,
      max_supply: c.max_supply ?? null,
      quote: { USD: {
        price: q.price ?? null,
        volume_24h: q.volume_24h ?? null,
        market_cap: q.market_cap ?? null,
        fully_diluted_market_cap: q.fully_diluted_market_cap ?? null,
        percent_change_1h: q.percent_change_1h ?? null,
        percent_change_24h: q.percent_change_24h ?? null,
        percent_change_7d: q.percent_change_7d ?? null
      }},
      market_pairs: pairs
    });
    if(i % 50 === 0) console.log("coins:", i, "/", ids.length);
  }

  console.log("Done.");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
