import { CONFIG } from "../core/config.js";
import { fetchJSON } from "../core/data-client.js";
import { $, on, esc } from "../core/dom.js";
import { fmtUsd, fmtNum, fmtPct, clsPct, fmtTime, fmtInt } from "../core/format.js";
import { initTopbar } from "./shared-ui.js";
import { initSearch } from "./shared-search.js";
import { t, getLang } from "../i18n/i18n.js";

function getId(){
  const u = new URL(window.location.href);
  return u.searchParams.get("id") || "";
}

function kvRow(k, v){
  return `<div class="row"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`;
}

function linkRow(name, url){
  if(!url) return "";
  return `<a class="linkCard" href="${esc(url)}" target="_blank" rel="noopener">
    <div class="linkCard__name">${esc(name)}</div>
    <div style="color:var(--faint)">↗</div>
  </a>`;
}

function tvSymbol(symbol){
  const sym = (symbol||"").toUpperCase().replace(/[^A-Z0-9]/g,"");
  if(!sym) return "BINANCE:BTCUSDT";
  return `${CONFIG.DEFAULT_EXCHANGE}:${sym}${CONFIG.DEFAULT_QUOTE}`;
}

function renderTradingView(symbol){
  const theme = document.documentElement.dataset.theme === "light" ? "light" : "dark";
  const container = $("#tvContainer");
  if(!container || !window.TradingView) return;
  container.innerHTML = "";
  // eslint-disable-next-line no-new
  new window.TradingView.widget({
    autosize: true,
    symbol,
    interval: "60",
    timezone: "Etc/UTC",
    theme,
    style: "1",
    locale: (getLang()==="ru" ? "ru" : "en"),
    enable_publishing: false,
    allow_symbol_change: true,
    container_id: "tvContainer",
    hide_top_toolbar: false,
    hide_legend: false,
    save_image: false
  });
}

function compactDesc(desc){
  if(!desc) return { short:"—", long:"", cut:false };
  const clean = String(desc).replace(/\s+/g," ").trim();
  if(clean.length <= 520) return { short: clean, long: clean, cut:false };
  return { short: clean.slice(0, 520) + "…", long: clean, cut:true };
}

async function boot(){
  await initTopbar();
  await initSearch();

  const id = getId();
  if(!id){
    $("#coinName").textContent = "—";
    $("#description").textContent = t("not_ready");
    return;
  }

  const meta = await fetchJSON(`${CONFIG.DATA_DIR}/meta.json`).catch(()=>null);
  const info = await fetchJSON(`${CONFIG.DATA_DIR}/coins/${id}.json`).catch(()=>null);

  if(!info){
    $("#coinName").textContent = "—";
    $("#description").textContent = t("not_ready");
    return;
  }

  const name = info.name || "—";
  const symbol = info.symbol || "—";

  $("#crumbName").textContent = name;
  $("#coinName").textContent = name;
  $("#coinSymbol").textContent = symbol;
  $("#coinRank").textContent = (info.rank ? `#${info.rank}` : "—");
  $("#updatedAt").textContent = meta?.updatedAt ? `${t("updated")}: ${fmtTime(meta.updatedAt)}` : "—";
  $("#coinBadge").textContent = (symbol||"?").slice(0,3).toUpperCase();

  const price = info.quote?.USD?.price ?? info.price ?? null;
  const pct24 = info.quote?.USD?.percent_change_24h ?? info.pct24h ?? null;

  $("#price").textContent = fmtUsd(price);
  $("#chg24").textContent = fmtPct(pct24);
  $("#chg24").className = `priceLine__chg pct ${clsPct(pct24)}`;

  // quick stats line
  const qs = [
    ["Mkt cap", fmtNum(info.quote?.USD?.market_cap ?? info.mcap)],
    ["Vol 24h", fmtNum(info.quote?.USD?.volume_24h ?? info.vol24h)],
    ["Circulating", fmtNum(info.circulating_supply ?? info.circ)],
    ["Total", fmtNum(info.total_supply ?? info.total)],
  ];
  $("#quickStats").innerHTML = qs.map(([k,v]) => `<div class="qs"><div class="qs__k">${esc(k)}</div><div class="qs__v">${esc(v)}</div></div>`).join("");

  // key-value
  const kv = [];
  kv.push(kvRow("Fully diluted mcap", fmtNum(info.quote?.USD?.fully_diluted_market_cap ?? info.fdv)));
  kv.push(kvRow("Max supply", fmtNum(info.max_supply ?? info.max)));
  kv.push(kvRow("Rank", info.rank ? `#${info.rank}` : "—"));
  kv.push(kvRow("24h change", fmtPct(pct24)));
  kv.push(kvRow("7d change", fmtPct(info.quote?.USD?.percent_change_7d ?? info.pct7d)));
  kv.push(kvRow("Last updated", meta?.updatedAt ? fmtTime(meta.updatedAt) : "—"));
  $("#kv").innerHTML = kv.join("");

  // description
  const d = compactDesc(info.description);
  $("#description").textContent = d.short;
  $("#aboutHint").textContent = info.category ? String(info.category) : "—";
  const moreBtn = $("#moreBtn");
  if(d.cut){
    moreBtn.hidden = false;
    let open = false;
    on(moreBtn, "click", () => {
      open = !open;
      $("#description").textContent = open ? d.long : d.short;
      moreBtn.textContent = open ? (getLang()==="ru" ? "Свернуть" : "Show less") : t("show_more");
    });
  }

  // links
  const urls = info.urls || {};
  const links = [];
  const first = (x) => Array.isArray(x) ? x.filter(Boolean)[0] : x;
  links.push(linkRow("Website", first(urls.website)));
  links.push(linkRow("Explorer", first(urls.explorer)));
  links.push(linkRow("Source code", first(urls.source_code)));
  links.push(linkRow("Tech doc", first(urls.technical_doc)));
  $("#links").innerHTML = links.filter(Boolean).join("") || `<div class="muted">—</div>`;

  // pairs
  const pairs = info.market_pairs || [];
  const pairsEl = $("#pairs");
  if(!pairs.length){
    pairsEl.innerHTML = `<div class="muted">—</div>`;
  }else{
    pairsEl.innerHTML = pairs.slice(0,10).map(p => {
      const market = p.exchange || p.market || "—";
      const pair = p.pair || p.symbol || "—";
      const vol = fmtNum(p.volume_24h ?? p.volume);
      return `<div class="pairRow"><div><div style="font-weight:650">${esc(pair)}</div><div class="muted">${esc(market)}</div></div><div style="text-align:right"><div style="font-weight:650">${esc(vol)}</div><div class="muted">Vol</div></div></div>`;
    }).join("");
  }

  // TradingView
  const tv = tvSymbol(symbol);
  renderTradingView(tv);
  document.addEventListener("cb:theme", () => renderTradingView(tv));
  document.addEventListener("cb:lang", () => renderTradingView(tv));
}

boot();
