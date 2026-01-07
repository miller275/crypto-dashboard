// scripts/fetch-coins-list.js
import { fetchJson, writeJson } from "./utils.js";

const OUT = "data/coins-list.json";
const URL = "https://api.coingecko.com/api/v3/coins/list?include_platform=false";

export async function runCoinsList(){
  const apiKey = process.env.COINGECKO_API_KEY;
  const headers = apiKey ? { "x-cg-pro-api-key": apiKey } : {};
  const list = await fetchJson(URL, { headers });
  // keep only required fields
  const trimmed = Array.isArray(list) ? list.map(x => ({ id:x.id, symbol:x.symbol, name:x.name })) : [];
  await writeJson(OUT, trimmed);
  return trimmed.length;
}

if (import.meta.url === `file://${process.argv[1]}`){
  runCoinsList().then(n=>console.log(`coins-list: ${n}`));
}
