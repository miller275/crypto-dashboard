/**
 * Update static snapshots under /data for GitHub Pages.
 * No API keys required (uses CoinGecko + Alternative.me + CryptoCompare).
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

async function fetchJSON(url, {timeoutMs=15000}={}){
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try{
    const res = await fetch(url, { signal: controller.signal, headers: { "accept": "application/json" } });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

function writeJSON(relPath, obj){
  const abs = path.join(ROOT, relPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, JSON.stringify(obj, null, 2));
  console.log("wrote", relPath);
}

function nowISO(){
  return new Date().toISOString();
}

function mapCoins(coins){
  return coins.map((c, idx) => ({
    id: c.id,
    symbol: (c.symbol || "").toUpperCase(),
    name: c.name,
    image: c.image,
    rank: c.market_cap_rank ?? (idx+1),
    price: c.current_price,
    marketCap: c.market_cap,
    volume24h: c.total_volume,
    change1h: c.price_change_percentage_1h_in_currency,
    change24h: c.price_change_percentage_24h_in_currency ?? c.price_change_percentage_24h,
    change7d: c.price_change_percentage_7d_in_currency,
    supply: c.circulating_supply,
    totalSupply: c.total_supply,
    sparkline7d: c.sparkline_in_7d?.price || null,
    ath: c.ath,
    atl: c.atl,
    lastUpdated: c.last_updated
  }));
}

async function main(){
  fs.mkdirSync(DATA_DIR, { recursive: true });

  const [coins, global, fng, news] = await Promise.all([
    fetchJSON("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=true&price_change_percentage=1h,24h,7d"),
    fetchJSON("https://api.coingecko.com/api/v3/global"),
    fetchJSON("https://api.alternative.me/fng/?limit=1&format=json").catch(() => null),
    fetchJSON("https://min-api.cryptocompare.com/data/v2/news/?lang=EN").catch(() => null)
  ]);

  const updatedAt = nowISO();

  const globalMapped = global?.data ? {
    marketCapUsd: global.data.total_market_cap?.usd ?? null,
    marketCapChange24h: global.data.market_cap_change_percentage_24h_usd ?? null,
    volumeUsd24h: global.data.total_volume?.usd ?? null,
    btcDominance: global.data.market_cap_percentage?.btc ?? null,
    ethDominance: global.data.market_cap_percentage?.eth ?? null
  } : null;

  writeJSON("data/markets.latest.json", {
    source: "coingecko",
    updatedAt,
    global: globalMapped,
    coins: mapCoins(coins)
  });

  if (fng?.data){
    writeJSON("data/fear-greed.latest.json", {
      source: "alternative.me",
      updatedAt,
      data: fng.data
    });
  }

  if (news?.Data){
    const items = news.Data.slice(0, 20).map(n => ({
      title: n.title,
      url: n.url,
      source: n.source,
      publishedAt: n.published_on ? new Date(n.published_on * 1000).toISOString() : null
    }));
    writeJSON("data/news.latest.json", { source: "cryptocompare", updatedAt, items });
  }

  console.log("done", updatedAt);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
