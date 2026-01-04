#!/usr/bin/env node
/**
 * CryptoWatch v9 — CryptoRank snapshot + local history builder
 *
 * Outputs:
 *   data/market_usd.json
 *   data/history_usd.json
 *
 * Works on GitHub Actions (Node 20). Uses only public CryptoRank endpoint:
 *   GET https://api.cryptorank.io/v2/currencies?limit=100&sortBy=marketCap&sortDirection=DESC
 *
 * If API doesn't include % changes, they are computed from our own history.
 */

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(process.cwd(), "data");
const MARKET_FILE = path.join(DATA_DIR, "market_usd.json");
const HIST_FILE   = path.join(DATA_DIR, "history_usd.json");

const API_KEY = process.env.CRYPTORANK_API_KEY || "";
const API_URL = "https://api.cryptorank.io/v2/currencies?limit=100&sortBy=marketCap&sortDirection=DESC";

function ensureDir(p){ if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive:true }); }

function readJson(p, fallback){
  try{ return JSON.parse(fs.readFileSync(p, "utf8")); }catch{ return fallback; }
}

function writeJson(p, obj){
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + "\n", "utf8");
}

function hourFloor(ts){
  const ms = 3600 * 1000;
  return Math.floor(ts / ms) * ms;
}

function safeNum(x){
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

function pickImage(cur){
  const c = cur || {};
  const candidates = [
    c.logo,
    c.icon,
    c.image,
    c.images?.small,
    c.images?.thumb,
    c.images?.large,
    c.images?.[0]?.url,
  ].filter(Boolean);

  let url = candidates[0] || null;
  if (url && typeof url === "string" && url.startsWith("/")) url = "https://cryptorank.io" + url;
  return url;
}

function getUsd(cur){
  // CryptoRank often exposes values in cur.values.USD
  const usd = cur?.values?.USD || cur?.values?.usd || {};
  return usd;
}

function computeChangeFromHistory(points, horizonMs){
  // points: [[ts, price], ...], sorted asc
  if (!Array.isArray(points) || points.length < 2) return null;
  const now = points[points.length - 1][0];
  const target = now - horizonMs;

  // find closest point <= target
  let best = null;
  for (let i = points.length - 1; i >= 0; i--){
    const [ts, price] = points[i];
    if (ts <= target) { best = price; break; }
  }
  if (best === null || best === undefined) return null;
  const last = points[points.length - 1][1];
  if (!last || !best) return null;
  return ((last - best) / best) * 100;
}

async function fetchCurrencies(){
  const headers = { "Accept": "application/json" };
  if (API_KEY) headers["X-Api-Key"] = API_KEY;

  const res = await fetch(API_URL, { headers });
  if (!res.ok) throw new Error(`CryptoRank HTTP ${res.status}`);
  const json = await res.json();
  const items = json?.data || json?.result || json?.items || [];
  if (!Array.isArray(items)) throw new Error("Unexpected API payload: items not array");
  return items;
}

(async function main(){
  ensureDir(DATA_DIR);

  const now = hourFloor(Date.now());

  const hist = readJson(HIST_FILE, { updatedAt: null, points: {} });
  hist.points = hist.points || {};

  const currencies = await fetchCurrencies();

  const marketItems = currencies.map((cur, idx)=>{
    const usd = getUsd(cur);
    const id = cur.id ?? cur.currencyId ?? cur._id ?? idx + 1;

    return {
      id: Number(id),
      rank: Number(cur.rank ?? (idx + 1)),
      name: cur.name ?? cur.fullName ?? cur.title ?? "—",
      symbol: cur.symbol ?? cur.code ?? "—",
      image: pickImage(cur),
      price: safeNum(usd.price ?? usd.rate ?? usd.value),
      market_cap: safeNum(usd.marketCap ?? usd.market_cap ?? cur.marketCap),
      volume_24h: safeNum(usd.volume24h ?? usd.volume_24h ?? usd.volume),
      circulating_supply: safeNum(cur.circulatingSupply ?? cur.circulating_supply ?? cur.circulating),
      total_supply: safeNum(cur.totalSupply ?? cur.total_supply),
      max_supply: safeNum(cur.maxSupply ?? cur.max_supply),
      // % changes from API if present
      change_1h: safeNum(usd.percentChange1h ?? usd.change1h ?? usd.percent_change_1h),
      change_24h: safeNum(usd.percentChange24h ?? usd.change24h ?? usd.percent_change_24h),
      change_7d: safeNum(usd.percentChange7d ?? usd.change7d ?? usd.percent_change_7d),
      // will be filled later:
      sparkline_in_7d: { price: [] },
    };
  }).filter(x => x.price !== null);

  // update history points
  for (const c of marketItems){
    const key = String(c.id);
    const arr = Array.isArray(hist.points[key]) ? hist.points[key] : [];
    const last = arr.length ? arr[arr.length - 1] : null;

    if (!last || last[0] !== now){
      arr.push([now, c.price]);
    } else {
      // overwrite same hour
      arr[arr.length - 1] = [now, c.price];
    }

    // keep last 4000 points (~166 days hourly)
    if (arr.length > 4000) arr.splice(0, arr.length - 4000);
    hist.points[key] = arr;
  }

  hist.updatedAt = now;

  // derive sparkline and compute missing % changes
  const MS_1H  = 3600 * 1000;
  const MS_24H = 24 * MS_1H;
  const MS_7D  = 7  * 24 * MS_1H;

  for (const c of marketItems){
    const arr = hist.points[String(c.id)] || [];
    const last7d = arr.filter(p => p[0] >= now - MS_7D);
    c.sparkline_in_7d = { price: last7d.map(p => p[1]) };

    if (c.change_1h === null)  c.change_1h  = computeChangeFromHistory(arr, MS_1H);
    if (c.change_24h === null) c.change_24h = computeChangeFromHistory(arr, MS_24H);
    if (c.change_7d === null)  c.change_7d  = computeChangeFromHistory(arr, MS_7D);
  }

  const market = {
    updatedAt: now,
    source: "cryptorank",
    currency: "USD",
    items: marketItems,
  };

  writeJson(HIST_FILE, hist);
  writeJson(MARKET_FILE, market);

  console.log(`OK: ${marketItems.length} coins, updatedAt=${new Date(now).toISOString()}`);
})();
