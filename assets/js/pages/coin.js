// pages/coin.js
import { $, el, escapeHtml } from "../core/dom.js";
import { fmt, clsForChange } from "../core/format.js";
import { loadMeta, loadCoinCache, loadCoinsList, loadCoinDetails } from "../core/data-client.js";
import { initTheme, toggleTheme } from "../core/theme.js";
import { loadI18n, toggleLang } from "../i18n/i18n.js";
import { sparklineBigSvg } from "../ui/sparkline.js";
import { registerServiceWorker } from "../core/service-worker.js";

function qparam(name){
  const u = new URL(window.location.href);
  return u.searchParams.get(name);
}

function setChange(elId, n){
  const node = $(elId);
  node.textContent = fmt.percent(n);
  node.classList.remove("positive","negative");
  const cls = clsForChange(n);
  if (cls) node.classList.add(cls);
}

function tvSymbol(exchange, baseSym, quote){
  // TradingView expects: EXCHANGE:BASEQUOTE, e.g. BINANCE:BTCUSDT
  const base = (baseSym || "").toUpperCase();
  const q = (quote || "USDT").toUpperCase();
  return `${exchange}:${base}${q}`;
}

function mountTradingView({exchange="BINANCE", baseSym="", quote="USDT"}){
  const container = $("#tvContainer");
  container.innerHTML = "";

  const script = document.createElement("script");
  script.type = "text/javascript";
  script.src = "https://s3.tradingview.com/tv.js";
  script.onload = () => {
    // eslint-disable-next-line no-undef
    new TradingView.widget({
      autosize: true,
      symbol: tvSymbol(exchange, baseSym, quote),
      interval: "60",
      timezone: "Etc/UTC",
      theme: document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark",
      style: "1",
      locale: document.documentElement.lang === "ru" ? "ru" : "en",
      enable_publishing: false,
      hide_side_toolbar: false,
      allow_symbol_change: true,
      container_id: "tvContainer"
    });
  };
  container.append(script);

  $("#tvHint").hidden = false;
}

function linkPill(url, label){
  return el("a", { class:"linkPill", href:url, target:"_blank", rel:"noreferrer" }, [
    document.createTextNode(label)
  ]);
}

async function main(){
  $("#yearNow").textContent = String(new Date().getFullYear());

  initTheme();
  const lang = await loadI18n();
  $("#langLabel").textContent = (lang||"en").toUpperCase();
  $("#themeBtn")?.addEventListener("click", ()=>{ toggleTheme(); reloadTv(); });
  $("#langBtn")?.addEventListener("click", async ()=>{ const l = await toggleLang(); $("#langLabel").textContent = l.toUpperCase(); reloadTv(); });

  const id = qparam("id");
  if (!id){
    $("#coinName").textContent = "—";
    $("#coinSub").textContent = "Missing ?id=";
    return;
  }

  const [meta, cache] = await Promise.allSettled([loadMeta(), loadCoinCache()]);
  const metaVal = meta.status === "fulfilled" ? meta.value : null;
  const cacheVal = cache.status === "fulfilled" ? cache.value : null;

  const updatedAt = metaVal?.updatedAt || null;
  $("#coinUpdated").textContent = updatedAt ? fmt.dateTime(updatedAt) : "—";

  const c = cacheVal?.[id] || null;

  // Fallback name/symbol
  let fallbackName = id;
  let fallbackSym = "";
  try{
    const list = await loadCoinsList();
    const arr = Array.isArray(list) ? list : (list.items || []);
    const found = arr.find(x => x.id === id);
    if(found){ fallbackName = found.name; fallbackSym = found.symbol; }
  }catch{}

  $("#coinName").textContent = c?.name || fallbackName || id;
  $("#coinSymbol").textContent = (c?.symbol || fallbackSym || "").toUpperCase() || "—";
  $("#coinRank").textContent = c?.market_cap_rank ? `#${c.market_cap_rank}` : "#—";
  $("#coinIcon").src = c?.image || "assets/img/icon-192.png";
  $("#coinSub").textContent = id;
  $("#docTitle").textContent = `${c?.name || fallbackName || id} — CryptoBoard`;

  // stats
  $("#coinPrice").textContent = fmt.money(c?.current_price, (metaVal?.currency || "usd").toUpperCase());
  setChange("#coinChange24h", c?.price_change_percentage_24h_in_currency ?? c?.price_change_percentage_24h);
  setChange("#coinChange7d", c?.price_change_percentage_7d_in_currency);
  setChange("#coinChange30d", c?.price_change_percentage_30d_in_currency);

  $("#statMcap").textContent = fmt.compactMoney(c?.market_cap, (metaVal?.currency || "usd").toUpperCase());
  $("#statVol").textContent = fmt.compactMoney(c?.total_volume, (metaVal?.currency || "usd").toUpperCase());
  $("#statHigh").textContent = fmt.money(c?.high_24h, (metaVal?.currency || "usd").toUpperCase());
  $("#statLow").textContent = fmt.money(c?.low_24h, (metaVal?.currency || "usd").toUpperCase());
  $("#statAth").textContent = c?.ath ? `${fmt.money(c.ath, (metaVal?.currency || "usd").toUpperCase())} (${fmt.percent(c.ath_change_percentage)})` : "—";
  $("#statAtl").textContent = c?.atl ? `${fmt.money(c.atl, (metaVal?.currency || "usd").toUpperCase())} (${fmt.percent(c.atl_change_percentage)})` : "—";

  // Performance
  $("#p1h").textContent = fmt.percent(c?.price_change_percentage_1h_in_currency);
  $("#p24h").textContent = fmt.percent(c?.price_change_percentage_24h_in_currency ?? c?.price_change_percentage_24h);
  $("#p7d").textContent = fmt.percent(c?.price_change_percentage_7d_in_currency);
  $("#p30d").textContent = fmt.percent(c?.price_change_percentage_30d_in_currency);
  $("#p1y").textContent = fmt.percent(c?.price_change_percentage_1y_in_currency);

  // Sparkline big
  const big = sparklineBigSvg(c?.sparkline_in_7d?.price || null);
  const box = $("#sparklineBig");
  if (big) box.append(big);
  else box.innerHTML = `<div class="muted">—</div>`;

  // About snapshot
  try{
    const det = await loadCoinDetails(id);
    const en = det?.description?.en || "";
    const ru = det?.description?.ru || "";
    const text = (document.documentElement.lang === "ru" ? (ru || en) : (en || ru)) || "";
    if (text){
      $("#coinAbout").innerHTML = text;
    }
    const links = $("#coinLinks");
    const homepage = det?.links?.homepage?.find(Boolean);
    const explorer = det?.links?.blockchain_site?.find(Boolean);
    const twitter = det?.links?.twitter_screen_name ? `https://twitter.com/${det.links.twitter_screen_name}` : null;
    const subreddit = det?.links?.subreddit_url || null;
    const pills = [];
    if (homepage) pills.push(linkPill(homepage, "Website"));
    if (explorer) pills.push(linkPill(explorer, "Explorer"));
    if (twitter) pills.push(linkPill(twitter, "Twitter"));
    if (subreddit) pills.push(linkPill(subreddit, "Reddit"));
    if (pills.length){
      links.hidden = false;
      links.innerHTML = "";
      pills.forEach(p=>links.append(p));
    }
  }catch(e){
    // keep placeholder
  }

  // TradingView
  const exchangeSel = $("#exchangeSelect");
  const pairSel = $("#pairSelect");
  exchangeSel.value = "BINANCE";
  pairSel.value = "USDT";

  function reloadTv(){
    mountTradingView({ exchange: exchangeSel.value, baseSym: $("#coinSymbol").textContent, quote: pairSel.value });
  }
  $("#reloadTv").addEventListener("click", reloadTv);
  exchangeSel.addEventListener("change", reloadTv);
  pairSel.addEventListener("change", reloadTv);

  reloadTv();
  await registerServiceWorker();
}

main();
