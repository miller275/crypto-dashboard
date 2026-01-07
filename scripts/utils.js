// scripts/utils.js
import fs from "node:fs/promises";
import path from "node:path";

export async function ensureDir(p){ await fs.mkdir(p, { recursive: true }); }

export async function writeJson(filePath, obj){
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, JSON.stringify(obj), "utf8");
}

export async function writeJsonPretty(filePath, obj){
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, JSON.stringify(obj, null, 2), "utf8");
}

export const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export async function fetchJson(url, {headers={}, retries=4, backoffMs=800} = {}){
  let lastErr = null;
  for (let i=0; i<=retries; i++){
    try{
      const res = await fetch(url, { headers });
      if (res.status === 429 || res.status >= 500){
        throw new Error(`HTTP ${res.status}`);
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    }catch(e){
      lastErr = e;
      const wait = backoffMs * Math.pow(2, i);
      await sleep(wait);
    }
  }
  throw lastErr;
}
