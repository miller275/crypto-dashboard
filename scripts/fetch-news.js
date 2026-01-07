// scripts/fetch-news.js
import Parser from "rss-parser";
import { writeJson } from "./utils.js";

const OUT = "data/news.json";
const parser = new Parser({ timeout: 12000 });

const FEEDS = [
  { name: "CoinDesk", url: "https://www.coindesk.com/arc/outboundfeeds/rss/" },
  { name: "Cointelegraph", url: "https://cointelegraph.com/rss" }
];

function toItem(feedName, item){
  const published = item.isoDate ? Date.parse(item.isoDate) : (item.pubDate ? Date.parse(item.pubDate) : null);
  return {
    source: feedName,
    title: item.title || "",
    url: item.link || "",
    publishedAt: published
  };
}

export async function runNews(){
  const all = [];
  for (const f of FEEDS){
    try{
      const feed = await parser.parseURL(f.url);
      (feed.items || []).slice(0, 12).forEach(it => all.push(toItem(f.name, it)));
      console.log(`news ${f.name}: ${feed.items?.length || 0}`);
    }catch(e){
      console.warn(`news failed ${f.name}`, e.message);
    }
  }
  all.sort((a,b)=>(b.publishedAt||0)-(a.publishedAt||0));
  const dedup = [];
  const seen = new Set();
  for (const it of all){
    const key = `${it.title}|${it.url}`;
    if (seen.has(key)) continue;
    seen.add(key);
    dedup.push(it);
  }
  await writeJson(OUT, { updatedAt: Date.now(), items: dedup.slice(0, 60) });
  return dedup.length;
}

if (import.meta.url === `file://${process.argv[1]}`){
  runNews().then(n=>console.log(`news items: ${n}`));
}
