import { CONFIG } from "../core/config.js";
import { fetchJSON } from "../core/data-client.js";
import { $, on, esc } from "../core/dom.js";
import { fmtUsd, fmtNum, fmtPct, clsPct, fmtTime } from "../core/format.js";
import { drawSpark } from "../core/sparkline.js";
import { initTopbar } from "./shared-ui.js";
import { initSearch } from "./shared-search.js";
import { t, getLang } from "../i18n/i18n.js";

let meta = null;
let page = 1;
let pagesTotal = 1;
let pageCache = new Map();

async function loadMeta(){
  meta = await fetchJSON(`${CONFIG.DATA_DIR}/meta.json`).catch(()=>null);
  if(meta){
    pagesTotal = meta.pages || 1;
    $("#metaLine").textContent = `${t("updated")}: ${fmtTime(meta.updatedAt)} · ${meta.totalCoins} coins`;
  }else{
    $("#metaLine").textContent = t("not_ready");
  }
}

function pctCell(x){
  const cls = clsPct(x);
  return `<span class="pct ${cls}">${esc(fmtPct(x))}</span>`;
}

function coinCell(c){
  const b = esc((c.symbol||"?").slice(0,3).toUpperCase());
  return `<a href="./coin.html?id=${encodeURIComponent(c.id)}" class="coinCell">
    <div class="badge">${b}</div>
    <div>
      <div class="coinCell__name">${esc(c.name||"")}</div>
      <div class="coinCell__sym">${esc(c.symbol||"")}</div>
    </div>
  </a>`;
}

function rowHtml(c){
  return `<tr>
    <td class="col-rank">${esc(c.rank ?? "—")}</td>
    <td class="col-coin">${coinCell(c)}</td>
    <td class="col-num">${esc(fmtUsd(c.price))}</td>
    <td class="col-num">${pctCell(c.pct1h)}</td>
    <td class="col-num">${pctCell(c.pct24h)}</td>
    <td class="col-num">${pctCell(c.pct7d)}</td>
    <td class="col-num">${esc(fmtNum(c.mcap))}</td>
    <td class="col-num">${esc(fmtNum(c.vol24h))}</td>
    <td class="col-spark"><canvas class="spark" data-id="${esc(c.id)}"></canvas></td>
  </tr>`;
}

async function loadPage(n){
  if(pageCache.has(n)) return pageCache.get(n);
  const data = await fetchJSON(`${CONFIG.DATA_DIR}/pages/listings-${n}.json`).catch(()=>null);
  pageCache.set(n, data);
  return data;
}

function setPager(){
  $("#pagePill").textContent = `${page} / ${pagesTotal}`;
  $("#prevBtn").disabled = page <= 1;
  $("#nextBtn").disabled = page >= pagesTotal;
  $("#tableMeta").textContent = meta ? `${meta.pageSize} per page` : "—";
}

function paintLeaders(items){
  const g = [...items].sort((a,b)=> (b.pct24h??-Infinity)-(a.pct24h??-Infinity)).slice(0, CONFIG.LEADERS_LIMIT);
  const l = [...items].sort((a,b)=> (a.pct24h??Infinity)-(b.pct24h??Infinity)).slice(0, CONFIG.LEADERS_LIMIT);
  $("#leadersHint").textContent = meta ? fmtTime(meta.updatedAt) : "—";

  const make = (arr) => arr.map(c => {
    const cls = clsPct(c.pct24h);
    return `<li>
      <a href="./coin.html?id=${encodeURIComponent(c.id)}">
        <span style="font-weight:650">${esc(c.symbol||"")}</span>
        <span style="color:var(--muted);font-size:12px">${esc(c.name||"")}</span>
      </a>
      <span class="pct ${cls}">${esc(fmtPct(c.pct24h))}</span>
    </li>`;
  }).join("");
  $("#gainers").innerHTML = make(g);
  $("#losers").innerHTML = make(l);
}

function paintNews(news){
  const list = $("#newsList");
  if(!list) return;
  const items = (news?.items || []).slice(0, CONFIG.NEWS_LIMIT);
  if(!items.length){
    list.innerHTML = `<div class="muted">${esc(t("not_ready"))}</div>`;
    return;
  }
  list.innerHTML = items.map(it => {
    const when = it.publishedAt ? fmtTime(it.publishedAt) : "";
    return `<a class="newsItem" href="${esc(it.url)}" target="_blank" rel="noopener">
      <div>
        <div class="newsItem__title">${esc(it.title||"")}</div>
        <div class="newsItem__meta">${esc(it.source||"")} ${when ? "· "+esc(when):""}</div>
      </div>
      <div style="color:var(--faint)">↗</div>
    </a>`;
  }).join("");
}

function paintFng(fng){
  const v = Number(fng?.value);
  if(!Number.isFinite(v)){
    $("#fngValue").textContent = "—";
    $("#fngLabel").textContent = "—";
    $("#fngBar").style.width = "0%";
    return;
  }
  $("#fngValue").textContent = String(v);
  $("#fngLabel").textContent = fng?.classification || "—";
  $("#fngBar").style.width = Math.max(0, Math.min(100, v)) + "%";

  const good = getComputedStyle(document.documentElement).getPropertyValue("--good").trim();
  const bad = getComputedStyle(document.documentElement).getPropertyValue("--bad").trim();
  const warn = getComputedStyle(document.documentElement).getPropertyValue("--warn").trim();
  const fill = $("#fngBar");
  if(v <= 25) fill.style.background = bad;
  else if(v <= 50) fill.style.background = warn;
  else fill.style.background = good;
}

function drawAllSparks(items){
  // after table is in DOM
  for(const c of items){
    const canvas = document.querySelector(`canvas[data-id="${c.id}"]`);
    if(!canvas) continue;
    drawSpark(canvas, c.spark7d || null, c.pct7d);
  }
}

async function render(){
  setPager();
  const tbody = $("#tbody");
  tbody.innerHTML = `<tr><td colspan="9" class="loading">${esc(t("loading"))}</td></tr>`;

  const pageData = await loadPage(page);
  const items = pageData?.items || [];
  if(!items.length){
    tbody.innerHTML = `<tr><td colspan="9" class="loading">${esc(t("not_ready"))}</td></tr>`;
    return;
  }
  tbody.innerHTML = items.map(rowHtml).join("");

  // leaders from current page (fast + fine for UX)
  paintLeaders(items);
  drawAllSparks(items);

  // prefetch next page for smoother UX
  if(page < pagesTotal) loadPage(page+1).catch(()=>{});
}

async function boot(){
  await initTopbar();
  await initSearch();
  await loadMeta();

  const [fng, news] = await Promise.all([
    fetchJSON(`${CONFIG.DATA_DIR}/fng.json`).catch(()=>null),
    fetchJSON(`${CONFIG.DATA_DIR}/news.json`).catch(()=>null)
  ]);
  paintFng(fng);
  paintNews(news);

  setPager();
  on($("#prevBtn"), "click", async ()=>{ page = Math.max(1, page-1); await render(); });
  on($("#nextBtn"), "click", async ()=>{ page = Math.min(pagesTotal, page+1); await render(); });

  // redraw sparks on theme switch
  document.addEventListener("cb:theme", async ()=>{ await render(); });

  // relabel UI on language switch
  document.addEventListener("cb:lang", async ()=>{ 
    $("#metaLine").textContent = meta ? `${t("updated")}: ${fmtTime(meta.updatedAt)} · ${meta.totalCoins} coins` : t("not_ready");
    await render();
  });

  await render();
}

boot();
