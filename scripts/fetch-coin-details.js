// scripts/fetch-coin-details.js
import { fetchJson, writeJson, sleep } from "./utils.js";
import fs from "node:fs/promises";

const LIMIT = Number(process.env.DETAILS_LIMIT || 300);
const VS = (process.env.VS_CURRENCY || "usd").toLowerCase();
const CACHE_PATH = "data/coin-cache.json";
const OUT_DIR = "data/coins";

function coinUrl(id){
  const params = new URLSearchParams({
    localization: "true",
    tickers: "false",
    market_data: "false",
    community_data: "false",
    developer_data: "false",
    sparkline: "false"
  });
  return `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(id)}?${params.toString()}`;
}

export async function runCoinDetails(){
  const apiKey = process.env.COINGECKO_API_KEY;
  const headers = apiKey ? { "x-cg-pro-api-key": apiKey } : {};

  const cacheRaw = await fs.readFile(CACHE_PATH, "utf8");
  const cache = JSON.parse(cacheRaw || "{}");
  const ids = Object.keys(cache).slice(0, LIMIT);

  let ok = 0;
  for (let i=0; i<ids.length; i++){
    const id = ids[i];
    try{
      const data = await fetchJson(coinUrl(id), { headers, retries: 3, backoffMs: 900 });
      // store as-is but trimmed
      const trimmed = {
        id: data.id,
        symbol: data.symbol,
        name: data.name,
        description: data.description || {},
        categories: data.categories || [],
        links: data.links || {}
      };
      await writeJson(`${OUT_DIR}/${id}.json`, trimmed);
      ok++;
      if (i % 25 === 0) console.log(`details ${i}/${ids.length}`);
      await sleep(250); // be gentle with rate limits
    }catch(e){
      console.warn(`details failed for ${id}:`, e.message);
      await sleep(600);
    }
  }
  return ok;
}

if (import.meta.url === `file://${process.argv[1]}`){
  runCoinDetails().then(n=>console.log(`coin details ok: ${n}`));
}
