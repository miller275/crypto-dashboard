import { APP } from "./config.js";

let cache = new Map();

async function fetchJson(url){
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function loadMarket(currency){
  const file = APP.marketFile(currency);
  const key = `market:${currency}`;
  if (cache.has(key)) return cache.get(key);
  const data = await fetchJson(`${APP.dataBasePath}/${file}?t=${Date.now()}`);
  cache.set(key, data);
  return data;
}

export async function loadHistory(currency){
  const file = APP.historyFile(currency);
  const key = `hist:${currency}`;
  if (cache.has(key)) return cache.get(key);
  try{
    const data = await fetchJson(`${APP.dataBasePath}/${file}?t=${Date.now()}`);
    cache.set(key, data);
    return data;
  }catch{
    return { updatedAt: null, points: {} };
  }
}

export function clearCache(){
  cache = new Map();
}
