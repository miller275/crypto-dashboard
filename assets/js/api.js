import { sleep } from "./utils.js";

async function fetchJSON(url, { retries=2 } = {}){
  for (let i=0; i<=retries; i++){
    try{
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
      return await res.json();
    }catch(err){
      if (i === retries) throw err;
      await sleep(250 * (i+1));
    }
  }
}

export const API = {
  meta: () => fetchJSON("./data/markets/meta.json"),
  page: (p) => fetchJSON(`./data/markets/page-${p}.json`),
  index: () => fetchJSON("./data/markets/index.json"),
  global: () => fetchJSON("./data/global.latest.json"),
  fng: () => fetchJSON("./data/fear-greed.json"),
  trending: () => fetchJSON("./data/trending.latest.json"),
  news: () => fetchJSON("./data/news.latest.json"),
  coinDetails: (id) => fetchJSON(`./data/coins/${id}.json`, { retries: 0 }),
};
