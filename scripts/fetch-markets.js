// scripts/fetch-markets.js
import { fetchJson, writeJson } from "./utils.js";

const PAGES = Number(process.env.COINGECKO_PAGES || 20);     // 20 pages * 250 = 5000 coins
const PER_PAGE = Number(process.env.COINGECKO_PER_PAGE || 250);
const VS = (process.env.VS_CURRENCY || "usd").toLowerCase();

const OUT_DIR = "data/markets";
const META_OUT = "data/meta.json";
const CACHE_OUT = "data/coin-cache.json";

function marketsUrl(page){
  const params = new URLSearchParams({
    vs_currency: VS,
    order: "market_cap_desc",
    per_page: String(PER_PAGE),
    page: String(page),
    sparkline: "true",
    price_change_percentage: "1h,24h,7d,30d,1y"
  });
  return `https://api.coingecko.com/api/v3/coins/markets?${params.toString()}`;
}

export async function runMarkets(){
  const apiKey = process.env.COINGECKO_API_KEY;
  const headers = apiKey ? { "x-cg-pro-api-key": apiKey } : {};

  const cache = {};
  let total = 0;

  for (let page=1; page<=PAGES; page++){
    const url = marketsUrl(page);
    const items = await fetchJson(url, { headers });
    await writeJson(`${OUT_DIR}/page-${page}.json`, items);
    for (const c of items){
      cache[c.id] = c;
    }
    total += Array.isArray(items) ? items.length : 0;
    console.log(`markets page ${page}/${PAGES}: ${items.length}`);
  }

  await writeJson(CACHE_OUT, cache);

  const meta = {
    updatedAt: Date.now(),
    source: "coingecko",
    currency: VS,
    pages: PAGES,
    perPage: PER_PAGE,
    totalCoins: total
  };
  await writeJson(META_OUT, meta);

  return { total, pages: PAGES, perPage: PER_PAGE };
}

if (import.meta.url === `file://${process.argv[1]}`){
  runMarkets().then(r=>console.log(r));
}
