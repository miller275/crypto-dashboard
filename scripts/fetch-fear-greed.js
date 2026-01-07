// scripts/fetch-fear-greed.js
import { fetchJson, writeJson } from "./utils.js";
const OUT = "data/fear-greed.json";
const URL = "https://api.alternative.me/fng/?limit=1&format=json";

export async function runFearGreed(){
  const data = await fetchJson(URL, { retries: 3 });
  // store as-is (small)
  await writeJson(OUT, { ...data, updatedAt: Date.now() });
  return true;
}

if (import.meta.url === `file://${process.argv[1]}`){
  runFearGreed().then(()=>console.log("fear-greed ok"));
}
