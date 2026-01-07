// pages/index.js
import { $, el } from "../core/dom.js";
import { fmt, clsForChange } from "../core/format.js";
import { loadMeta, loadMarketPage, loadFearGreed, loadNews } from "../core/data-client.js";
import { attachSearch } from "../ui/search.js";
import { sparklineSvg } from "../ui/sparkline.js";
import { initTheme, toggleTheme } from "../core/theme.js";
import { loadI18n, toggleLang } from "../i18n/i18n.js";
import { registerServiceWorker } from "../core/service-worker.js";

const state = { page: 1, pages: 1, currency: "USD", meta: null };

function setText(id, text){ const n = $(id); if(n) n.textContent = text; }
function setHtml(id, html){ const n = $(id); if(n) n.innerHTML = html; }

function changeCell(n){
  const td = el("td", { class: "col-change mono" });
  td.textContent = fmt.percent(n);
  td.classList.add(clsForChange(n));
  return td;
}

function coinRow(c){
  const tr = el("tr", {});

  const rank = el("td", { class:"col-rank mono muted" }, [document.createTextNode(c.market_cap_rank ?? "—")]);

  const coin = el("td", { class:"col-coin" });
  const cell = el("div", { class:"coinCell" }, [
    el("img", { class:"coinCell__icon", src: c.image || "", alt: "" }),
    el("div", { class:"coinCell__name" }, [
      el("div", { class:"coinCell__top" }, [
        el("a", { class:"coinCell__title link", href:`coin.html?id=${encodeURIComponent(c.id)}` }, [document.createTextNode(c.name || c.id)]),
        el("span", { class:"badge mono" }, [document.createTextNode((c.symbol||"").toUpperCase())])
      ]),
      el("div", { class:"coinCell__sub mono" }, [document.createTextNode(c.id)])
    ])
  ]);
  coin.append(cell);

  const price = el("td", { class:"col-price mono" }, [document.createTextNode(fmt.money(c.current_price, state.currency))]);
  const ch24 = changeCell(c.price_change_percentage_24h_in_currency ?? c.price_change_percentage_24h);
  const mcap = el("td", { class:"col-mcap mono" }, [document.createTextNode(fmt.compactMoney(c.market_cap, state.currency))]);
  const vol = el("td", { class:"col-vol mono" }, [document.createTextNode(fmt.compactMoney(c.total_volume, state.currency))]);

  const sparkTd = el("td", { class:"col-spark" });
  const s = c.sparkline_in_7d?.price || null;
  sparkTd.append(sparklineSvg(s));

  tr.append(rank, coin, price, ch24, mcap, vol, sparkTd);
  return tr;
}

async function renderPage(page){
  const tbody = $("#coinsTbody");
  const empty = $("#tableEmpty");
  tbody.innerHTML = "";
  empty.hidden = true;

  try {
    const items = await loadMarketPage(page);
    if (!Array.isArray(items) || items.length === 0){
      empty.hidden = false;
      return;
    }
    const frag = document.createDocumentFragment();
    items.forEach(c => frag.append(coinRow(c)));
    tbody.append(frag);
  } catch (e) {
    console.warn(e);
    empty.hidden = false;
  }
}

async function initMeta(){
  try {
    const meta = await loadMeta();
    state.meta = meta;
    state.pages = meta.pages || 1;
    state.currency = (meta.currency || "usd").toUpperCase();
    setText("#pageTotal", String(state.pages));
    setText("#lastUpdated", meta.updatedAt ? fmt.dateTime(meta.updatedAt) : "—");
  } catch (e) {
    console.warn("Meta load failed", e);
    setText("#pageTotal", "—");
  }
}

function wirePager(){
  const prev = $("#prevPage");
  const next = $("#nextPage");
  const now = $("#pageNow");

  function updateButtons(){
    prev.disabled = state.page <= 1;
    next.disabled = state.page >= state.pages;
    now.textContent = String(state.page);
  }

  prev.addEventListener("click", async ()=>{
    if (state.page <= 1) return;
    state.page--;
    updateButtons();
    await renderPage(state.page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  next.addEventListener("click", async ()=>{
    if (state.page >= state.pages) return;
    state.page++;
    updateButtons();
    await renderPage(state.page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  updateButtons();
}

async function initFearGreed(){
  try{
    const data = await loadFearGreed();
    const item = data?.data?.[0] || data?.data || data?.[0];
    const v = Number(item?.value);
    const cls = item?.value_classification || item?.valueClassification;
    $("#fngValue").textContent = Number.isFinite(v) ? String(v) : "—";
    $("#fngLabel").textContent = cls || "—";
    $("#fngFill").style.width = Number.isFinite(v) ? `${Math.max(0, Math.min(100, v))}%` : "0%";
    $("#fngDate").textContent = item?.timestamp ? fmt.date(Number(item.timestamp)*1000) : (data?.updatedAt ? fmt.dateTime(data.updatedAt) : "—");
  }catch(e){
    console.warn("FNG load failed", e);
  }
}

function newsItem(n){
  const a = el("a", { class:"newsItem link", href: n.url, target:"_blank", rel:"noreferrer" });
  a.classList.remove("link"); // keep style but not underlined
  a.append(
    el("div", { class:"newsItem__top" }, [
      el("div", { class:"newsItem__title" }, [document.createTextNode(n.title || "—")]),
      el("div", { class:"newsItem__meta" }, [
        el("span", {}, [document.createTextNode(n.source || "RSS")]),
        el("span", {}, [document.createTextNode(n.publishedAt ? fmt.dateTime(n.publishedAt) : "—")])
      ])
    ])
  );
  return a;
}

async function initNews(){
  const list = $("#newsList");
  const empty = $("#newsEmpty");
  list.innerHTML = "";
  empty.hidden = true;

  try{
    const data = await loadNews();
    const items = Array.isArray(data) ? data : (data.items || []);
    const top = items.slice(0, 6);
    if (!top.length){ empty.hidden = false; return; }
    const frag = document.createDocumentFragment();
    top.forEach(n => frag.append(newsItem(n)));
    list.append(frag);
  }catch(e){
    console.warn("News load failed", e);
    empty.hidden = false;
  }
}

function initTopbar(theme, lang){
  $("#themeBtn")?.addEventListener("click", ()=>toggleTheme());
  $("#langBtn")?.addEventListener("click", async ()=>{
    const l = await toggleLang();
    $("#langLabel").textContent = l.toUpperCase();
  });
  $("#langLabel").textContent = (lang || "en").toUpperCase();
}

function initYear(){
  $("#yearNow").textContent = String(new Date().getFullYear());
}

async function main(){
  initYear();
  const theme = initTheme();
  const lang = await loadI18n();
  initTopbar(theme, lang);
  attachSearch();

  await initMeta();
  wirePager();
  await renderPage(state.page);

  await initFearGreed();
  await initNews();
  $("#newsRefresh")?.addEventListener("click", (e)=>{ e.preventDefault(); initNews(); });

  await registerServiceWorker();
}

main();
