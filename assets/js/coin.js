import { Utils } from "./utils.js";
import { Theme } from "./theme.js";
import { I18N } from "./i18n.js";
import { API } from "./api.js";
// Ensure optional plugins are registered (UMD builds usually self-register, but keep it safe).
try{
  if (window.ChartZoom && window.Chart && Chart.register) Chart.register(window.ChartZoom);
}catch(_){}

let chart = null;
let chartType = "line";
let chartDays = "7";

function setChipActive(groupSelector, key, value){
  Utils.qsa(groupSelector).forEach(btn => {
    const v = btn.getAttribute(key);
    btn.classList.toggle("active", v === value);
  });
}

function badgeDelta(n){
  if (n === null || n === undefined || Number.isNaN(n)) return `<span class="badge">—</span>`;
  const cls = n >= 0 ? "pos" : "neg";
  return `<span class="badge ${cls}">${Utils.fmtPercent(n, 2)}</span>`;
}

function destroyChart(){
  if (chart){
    chart.destroy();
    chart = null;
  }
}

async function drawLine(prices){
  const ctx = Utils.qs("#priceChart");
  destroyChart();

  const data = prices.map(p => ({ x: p[0], y: p[1] }));
  chart = new Chart(ctx, {
    type: "line",
    data: {
      datasets: [{
        label: "USD",
        data,
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.25
      }]
    },
    options: {
      parsing: false,
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      scales: {
        x: { type: "time", time: { unit: "day" }, grid: { display: false } },
        y: { grid: { color: "rgba(120,120,120,0.15)" } }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${Utils.fmtMoney(ctx.parsed.y)}`
          }
        },
        zoom: {
          limits: { x: { min: "original", max: "original" } },
          zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: "x" },
          pan: { enabled: true, mode: "x" }
        }
      }
    }
  });
}

async function drawCandles(ohlc){
  const ctx = Utils.qs("#priceChart");
  destroyChart();

  // CoinGecko OHLC format: [timestamp, open, high, low, close]
  const data = ohlc.map(o => ({ x: o[0], o: o[1], h: o[2], l: o[3], c: o[4] }));

  chart = new Chart(ctx, {
    type: "candlestick",
    data: { datasets: [{ label: "USD", data }] },
    options: {
      parsing: false,
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      scales: {
        x: { type: "time", time: { unit: "day" }, grid: { display: false } },
        y: { grid: { color: "rgba(120,120,120,0.15)" } }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const v = ctx.raw;
              return ` O:${Utils.fmtMoney(v.o)} H:${Utils.fmtMoney(v.h)} L:${Utils.fmtMoney(v.l)} C:${Utils.fmtMoney(v.c)}`;
            }
          }
        },
        zoom: {
          limits: { x: { min: "original", max: "original" } },
          zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: "x" },
          pan: { enabled: true, mode: "x" }
        }
      }
    }
  });
}

async function loadAndRenderChart(id){
  const hint = Utils.qs("#chartHintLine");
  const badge = Utils.qs("#chartSource");

  hint.textContent = (I18N.get()==="ru")
    ? "Подсказка: колесо мыши — зум, зажми и тяни — перемещение."
    : "Tip: mouse wheel to zoom, drag to pan.";

  if (chartType === "line"){
    const res = await API.loadMarketChart(id, chartDays);
    badge.textContent = res.source.toUpperCase();
    await drawLine(res.data.prices || []);
  }else{
    // OHLC supports a subset; map "max" → 365 for candles if needed
    let d = chartDays === "max" ? "365" : chartDays;
    if (!["1","7","14","30","90","180","365","max"].includes(d)) d = "30";
    const res = await API.loadOHLC(id, d);
    badge.textContent = res.source.toUpperCase();
    await drawCandles(res.data || []);
  }
}

function bind(id){
  const themeBtn = Utils.qs("#themeBtn");
  if (themeBtn) themeBtn.addEventListener("click", () => Theme.toggle());

  const lang = Utils.qs("#langSelect");
  if (lang){
    lang.value = I18N.get();
    lang.addEventListener("change", async () => {
      I18N.set(lang.value);
      await hydrate(id, {keepChart:true});
    });
  }

  Utils.qsa(".chip[data-range]").forEach(btn => {
    btn.addEventListener("click", async () => {
      chartDays = btn.getAttribute("data-range");
      setChipActive(".chip[data-range]", "data-range", chartDays);
      await loadAndRenderChart(id);
    });
  });

  Utils.qsa(".chip[data-type]").forEach(btn => {
    btn.addEventListener("click", async () => {
      chartType = btn.getAttribute("data-type");
      setChipActive(".chip[data-type]", "data-type", chartType);
      await loadAndRenderChart(id);
    });
  });

  const reset = Utils.qs("#resetZoomBtn");
  if (reset){
    reset.addEventListener("click", () => chart?.resetZoom?.());
  }

  Utils.qs("#year").textContent = String(new Date().getFullYear());
}

async function hydrate(id, {keepChart=false}={}){
  I18N.apply();

  const bc = Utils.qs("#bcCoin");
  bc.textContent = id;

  const res = await API.loadCoinDetails(id);
  const c = res.data;

  document.title = `${c.name} (${(c.symbol||"").toUpperCase()}) — CryptoWatch`;

  Utils.qs("#coinImg").src = c.image?.large || c.image?.small || "assets/img/coin.svg";
  Utils.qs("#coinImg").alt = c.symbol || "coin";

  Utils.qs("#coinName").textContent = c.name;
  Utils.qs("#bcCoin").textContent = c.name;
  Utils.qs("#coinSymbol").textContent = (c.symbol || "").toUpperCase();

  const rank = c.market_cap_rank ? `#${c.market_cap_rank}` : "—";
  Utils.qs("#coinRank").textContent = rank;

  const chain = c.asset_platform_id ? c.asset_platform_id : (I18N.get()==="ru" ? "сеть: —" : "chain: —");
  Utils.qs("#coinChain").textContent = chain;

  const md = c.market_data || {};
  const price = md.current_price?.usd ?? null;
  Utils.qs("#coinPrice").textContent = Utils.fmtMoney(price);

  const delta24 = md.price_change_percentage_24h ?? null;
  Utils.qs("#coinDelta24h").outerHTML = badgeDelta(delta24);
  // re-select after outerHTML replacement
  const deltaEl = Utils.qs(".price-line .badge");
  if (deltaEl) deltaEl.id = "coinDelta24h";

  const updated = c.last_updated || md.last_updated || null;
  Utils.qs("#coinUpdated").textContent = updated ? (I18N.get()==="ru" ? "Обновлено: " : "Updated: ") + new Date(updated).toLocaleString() : "—";

  Utils.qs("#statMcap").textContent = Utils.fmtCompact(md.market_cap?.usd, null).replace(/^/, "$");
  Utils.qs("#statMcapRank").textContent = c.market_cap_rank ? (I18N.get()==="ru" ? `Ранг: #${c.market_cap_rank}` : `Rank: #${c.market_cap_rank}`) : "—";

  Utils.qs("#statVol").textContent = Utils.fmtCompact(md.total_volume?.usd, null).replace(/^/, "$");
  const vtm = (md.total_volume?.usd && md.market_cap?.usd) ? (md.total_volume.usd / md.market_cap.usd) : null;
  Utils.qs("#statVolToMcap").textContent = vtm ? (I18N.get()==="ru" ? `Vol/MCap: ${Utils.fmtNumber(vtm, 3)}` : `Vol/MCap: ${Utils.fmtNumber(vtm, 3)}`) : "—";

  const supply = md.circulating_supply ?? null;
  const total = md.total_supply ?? null;
  Utils.qs("#statSupply").textContent = supply ? Utils.fmtNumber(supply, 0) : "—";
  Utils.qs("#statSupply2").textContent = total ? (I18N.get()==="ru" ? `Всего: ${Utils.fmtNumber(total,0)}` : `Total: ${Utils.fmtNumber(total,0)}`) : "—";

  Utils.qs("#statAth").textContent = md.ath?.usd ? `ATH: ${Utils.fmtMoney(md.ath.usd)}` : "ATH: —";
  Utils.qs("#statAtl").textContent = md.atl?.usd ? `ATL: ${Utils.fmtMoney(md.atl.usd)}` : "ATL: —";

  const desc = c.description?.en ? c.description.en : "";
  Utils.qs("#coinDesc").innerHTML = desc
    ? Utils.safeHTML(desc)
    : `<span class="muted">${I18N.get()==="ru" ? "Нет описания" : "No description"}</span>`;

  Utils.qs("#aboutHint").textContent = (I18N.get()==="ru")
    ? "Источник описания: CoinGecko"
    : "Description source: CoinGecko";

  Utils.qs("#footNote").textContent = (I18N.get()==="ru")
    ? "Поддержка: GitHub Pages • ES Modules • Chart.js"
    : "Powered by: GitHub Pages • ES Modules • Chart.js";

  if (!keepChart){
    await loadAndRenderChart(id);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  Theme.set(Theme.get());
  const id = Utils.getParam("id") || "bitcoin";
  bind(id);
  await hydrate(id);
});
