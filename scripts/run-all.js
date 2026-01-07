// scripts/run-all.js
import { runMarkets } from "./fetch-markets.js";
import { runCoinsList } from "./fetch-coins-list.js";
import { runFearGreed } from "./fetch-fear-greed.js";
import { runNews } from "./fetch-news.js";
import { runCoinDetails } from "./fetch-coin-details.js";

async function main(){
  console.log("== markets ==");
  await runMarkets();

  console.log("== coins list (search) ==");
  await runCoinsList();

  console.log("== fear & greed ==");
  await runFearGreed();

  console.log("== news ==");
  await runNews();

  console.log("== coin details (about/links) ==");
  await runCoinDetails();

  console.log("done.");
}

main().catch((e)=>{
  console.error(e);
  process.exit(1);
});
