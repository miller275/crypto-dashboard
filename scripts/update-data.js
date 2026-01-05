/**
 * Update snapshots for GitHub Pages (no client-side API calls).
 * - Fetch CoinMarketCap listings (paged) -> /data/markets/page-N.json
 * - Build index id -> page for search/navigation -> /data/markets/index.json
 * - Fetch global metrics -> /data/global.latest.json
 * - Fetch Fear & Greed -> /data/fear-greed.json
 * - Fetch news RSS -> /data/news.latest.json
 * - Fetch trending -> /data/trending.latest.json
 * - Download logos for top LOGO_LIMIT -> /assets/img/coins/<id>.png
 * - Fetch details (description/urls) for top DETAILS_LIMIT -> /data/coins/<id>.json
 */
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "data");
const MARKETS_DIR = path.join(DATA_DIR, "markets");
const COINS_DIR = path.join(DATA_DIR, "coins");
const IMG_DIR = path.join(ROOT, "assets", "img", "coins");

const CMC_KEY = process.env.CMC_PRO_API_KEY;
if (!CMC_KEY) {
  console.error("Missing env CMC_PRO_API_KEY");
  process.exit(1);
}

const PAGE_SIZE = Number(process.env.PAGE_SIZE || 50);
const LOGO_LIMIT = Number(process.env.LOGO_LIMIT || 200);
const DETAILS_LIMIT = Number(process.env.DETAILS_LIMIT || 200);
const MAX_COINS = Number(process.env.MAX_COINS || 5000);

const headers = {
  "X-CMC_PRO_API_KEY": CMC_KEY,
  "Accept": "application/json",
};

async function ensureDirs(){
  await fs.mkdir(MARKETS_DIR, { recursive: true });
  await fs.mkdir(COINS_DIR, { recursive: true });
  await fs.mkdir(IMG_DIR, { recursive: true });
}

async function fetchJSON(url){
  const res = await fetch(url, { headers });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url} :: ${text.slice(0, 300)}`);
  return JSON.parse(text);
}

function chunk(arr, size){
  const out = [];
  for (let i=0;i<arr.length;i+=size) out.push(arr.slice(i,i+size));
  return out;
}

function mulberry32(seed){
  let t = seed >>> 0;
  return function(){
    t += 0x6D2B79F5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function genSparkline(price, change7d, id){
  if (!price || !Number.isFinite(price)) return null;
  const pts = 48;
  const chg = Number(change7d || 0) / 100;
  const end = price;
  const start = end / (1 + chg || 1.0000001);
  const rng = mulberry32(Number(id) * 2654435761);

  const series = [];
  for (let i=0;i<pts;i++){
    const t = i/(pts-1);
    let v = start + (end - start) * t;
    const amp = Math.max(0.002, Math.min(0.06, Math.abs(chg) * 0.6));
    const noise = (rng() - 0.5) * 2 * amp;
    v *= (1 + noise);
    series.push(Math.max(0.00000001, v));
  }
  series[pts-1] = end;
  return series.map(x => Number(x.toFixed(8)));
}

async function fetchAllListings(){
  const all = [];
  let start = 1;
  const limit = 5000;
  while (all.length < MAX_COINS){
    const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?start=${start}&limit=${limit}&convert=USD&aux=cmc_rank,circulating_supply,total_supply,max_supply,quote.USD.volume_24h,quote.USD.market_cap,quote.USD.percent_change_1h,quote.USD.percent_change_24h,quote.USD.percent_change_7d,quote.USD.percent_change_30d,quote.USD.price,last_updated`;
    const j = await fetchJSON(url);
    const items = j?.data || [];
    if (!items.length) break;
    all.push(...items);
    start += items.length;
    if (items.length < limit) break;
  }
  return all;
}

async function fetchGlobal(){
  const url = "https://pro-api.coinmarketcap.com/v1/global-metrics/quotes/latest?convert=USD";
  return fetchJSON(url);
}

async function fetchFearGreed(){
  const res = await fetch("https://api.alternative.me/fng/?limit=1&format=json", { headers: { "Accept":"application/json" }});
  const j = await res.json();
  const d = j?.data?.[0];
  return {
    value: Number(d?.value ?? 0),
    value_classification: d?.value_classification ?? "—",
    timestamp: d?.timestamp ? Number(d.timestamp) : null,
    updated_at: new Date().toISOString()
  };
}

function parseRSS(xml){
  const items = [];
  const blocks = xml.split(/<item>/i).slice(1);
  for (const b of blocks){
    const title = (b.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/i)?.[1] || b.match(/<title>(.*?)<\/title>/i)?.[1] || "").trim();
    const link = (b.match(/<link>(.*?)<\/link>/i)?.[1] || "").trim();
    const pub = (b.match(/<pubDate>(.*?)<\/pubDate>/i)?.[1] || "").trim();
    if (!title) continue;
    items.push({ title, url: link, published_at: pub ? new Date(pub).toISOString() : null });
  }
  return items;
}

async function fetchNews(){
  const sources = [
    { name:"CryptoPotato", url:"https://cryptopotato.com/feed/" },
    { name:"CoinDesk", url:"https://feeds.feedburner.com/CoinDesk" },
  ];
  const out = [];
  for (const s of sources){
    try{
      const res = await fetch(s.url, { headers: { "User-Agent":"Mozilla/5.0", "Accept":"application/rss+xml,application/xml,text/xml,*/*" }});
      const xml = await res.text();
      const items = parseRSS(xml).slice(0, 6).map(it=>({ ...it, source: s.name }));
      out.push(...items);
    }catch{}
  }
  const seen = new Set();
  const uniq = [];
  for (const n of out){
    const key = n.title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    uniq.push(n);
  }
  return { items: uniq.slice(0, 10), updated_at: new Date().toISOString() };
}

async function downloadFile(url, filePath){
  const res = await fetch(url, { headers: { "User-Agent":"Mozilla/5.0" }});
  if (!res.ok) throw new Error(`Download failed HTTP ${res.status}`);
  const buf = new Uint8Array(await res.arrayBuffer());
  await fs.writeFile(filePath, buf);
}

async function fetchInfoByIds(ids){
  const url = `https://pro-api.coinmarketcap.com/v2/cryptocurrency/info?id=${ids.join(",")}`;
  return fetchJSON(url);
}

async function main(){
  await ensureDirs();

  console.log(`[update-data] PAGE_SIZE=${PAGE_SIZE} LOGO_LIMIT=${LOGO_LIMIT} DETAILS_LIMIT=${DETAILS_LIMIT} MAX_COINS=${MAX_COINS}`);

  const [global, fng, news] = await Promise.all([
    fetchGlobal().catch(err=>({ error: String(err) })),
    fetchFearGreed().catch(()=>({ value:0, value_classification:"—", timestamp:null, updated_at:new Date().toISOString() })),
    fetchNews().catch(()=>({ items:[], updated_at:new Date().toISOString() })),
  ]);

  await fs.writeFile(path.join(DATA_DIR, "global.latest.json"), JSON.stringify(global, null, 2));
  await fs.writeFile(path.join(DATA_DIR, "fear-greed.json"), JSON.stringify(fng, null, 2));
  await fs.writeFile(path.join(DATA_DIR, "news.latest.json"), JSON.stringify(news, null, 2));

  const listingsRaw = await fetchAllListings();
  const listings = listingsRaw.slice(0, MAX_COINS);

  const norm = listings.map(c=>{
    const q = c.quote?.USD || {};
    const price = Number(q.price ?? null);
    const obj = {
      id: c.id,
      symbol: c.symbol,
      name: c.name,
      rank: c.cmc_rank,
      price,
      marketCap: Number(q.market_cap ?? null),
      volume24h: Number(q.volume_24h ?? null),
      change1h: Number(q.percent_change_1h ?? null),
      change24h: Number(q.percent_change_24h ?? null),
      change7d: Number(q.percent_change_7d ?? null),
      change30d: Number(q.percent_change_30d ?? null),
      circulatingSupply: Number(c.circulating_supply ?? null),
      totalSupply: Number(c.total_supply ?? null),
      maxSupply: Number(c.max_supply ?? null),
      lastUpdated: q.last_updated || c.last_updated || null,
      image: "assets/img/coin.svg",
      sparkline7d: null,
    };
    obj.sparkline7d = genSparkline(obj.price, obj.change7d, obj.id);
    return obj;
  });

  const pages = Math.max(1, Math.ceil(norm.length / PAGE_SIZE));
  const meta = { total: norm.length, pageSize: PAGE_SIZE, pages, generated_at: new Date().toISOString(), source:"coinmarketcap" };
  await fs.writeFile(path.join(MARKETS_DIR, "meta.json"), JSON.stringify(meta, null, 2));

  const indexItems = [];
  for (let p=1; p<=pages; p++){
    const slice = norm.slice((p-1)*PAGE_SIZE, p*PAGE_SIZE);
    const pageData = { page: p, pageSize: PAGE_SIZE, items: slice };
    await fs.writeFile(path.join(MARKETS_DIR, `page-${p}.json`), JSON.stringify(pageData, null, 2));
    for (const it of slice){
      indexItems.push({ id: it.id, page: p, name: it.name, symbol: it.symbol, name_lc: it.name.toLowerCase(), symbol_lc: it.symbol.toLowerCase() });
    }
  }
  await fs.writeFile(path.join(MARKETS_DIR, "index.json"), JSON.stringify({ items: indexItems }, null, 2));

  const trending = [...norm].filter(x=>Number.isFinite(x.change24h))
    .sort((a,b)=> (b.change24h ?? -9999) - (a.change24h ?? -9999))
    .slice(0, 20)
    .map(x=>({ id:x.id, symbol:x.symbol, name:x.name, price:x.price, change24h:x.change24h, page:(indexItems.find(i=>i.id===x.id)?.page || 1) }));
  await fs.writeFile(path.join(DATA_DIR, "trending.latest.json"), JSON.stringify({ items: trending, generated_at: new Date().toISOString() }, null, 2));

  const topForInfo = norm.slice().sort((a,b)=> (a.rank ?? 1e9) - (b.rank ?? 1e9)).slice(0, Math.max(LOGO_LIMIT, DETAILS_LIMIT));
  const ids = topForInfo.map(x=>x.id);
  const batches = chunk(ids, 100);

  let infoMap = {};
  for (const batch of batches){
    try{
      const info = await fetchInfoByIds(batch);
      const data = info?.data || {};
      for (const [id, val] of Object.entries(data)){
        const item = Array.isArray(val) ? val[0] : val;
        infoMap[id] = item;
      }
    }catch(err){
      console.log("[info] batch failed:", String(err).slice(0, 200));
    }
  }

  let logosSaved = 0;
  for (const c of topForInfo.slice(0, LOGO_LIMIT)){
    const item = infoMap[String(c.id)];
    const logo = item?.logo;
    if (!logo) continue;
    const ext = (logo.includes(".svg") ? "svg" : "png");
    const out = path.join(IMG_DIR, `${c.id}.${ext}`);
    try{
      await downloadFile(logo, out);
      logosSaved++;
      c.image = `assets/img/coins/${c.id}.${ext}`;
    }catch{}
  }
  console.log(`[logos] saved ${logosSaved}`);

  for (let p=1; p<=pages; p++){
    const file = path.join(MARKETS_DIR, `page-${p}.json`);
    const pageData = JSON.parse(await fs.readFile(file, "utf8"));
    pageData.items = pageData.items.map(it=>{
      const upd = topForInfo.find(x=>String(x.id)===String(it.id));
      if (upd?.image && upd.image !== "assets/img/coin.svg") it.image = upd.image;
      return it;
    });
    await fs.writeFile(file, JSON.stringify(pageData, null, 2));
  }

  for (const c of topForInfo.slice(0, DETAILS_LIMIT)){
    const item = infoMap[String(c.id)];
    const out = path.join(COINS_DIR, `${c.id}.json`);
    const payload = {
      id: c.id,
      symbol: c.symbol,
      name: c.name,
      description: item?.description || "",
      urls: item?.urls || {},
      category: item?.category || null,
      logo: item?.logo || null,
      updated_at: new Date().toISOString()
    };
    await fs.writeFile(out, JSON.stringify(payload, null, 2));
  }

  console.log("[done] snapshots updated");
}

main().catch(err=>{
  console.error(err);
  process.exit(1);
});
