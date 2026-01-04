import { Store } from "../store.js";
import { t, applyI18n } from "../i18n.js";
import { applyTheme, toggleTheme } from "../theme.js";
import { qs, fmtMoney, fmtNumber, fmtPct, pctClass, coinImage, safeUrl } from "../utils.js";
import { loadMarket, loadHistory } from "../data.js";
import { bigLineChart } from "../charts.js";

function getParam(name){
  const u = new URL(location.href);
  return u.searchParams.get(name);
}

function normalizeMarket(raw){
  return (raw?.items || []).map(x=>({
    id: x.id,
    rank: x.rank,
    name: x.name,
    symbol: x.symbol,
    image: x.image,
    price: x.price,
    market_cap: x.market_cap,
    volume_24h: x.volume_24h,
    circulating_supply: x.circulating_supply,
    total_supply: x.total_supply,
    max_supply: x.max_supply,
    change_1h: x.change_1h,
    change_24h: x.change_24h,
    change_7d: x.change_7d,
  }));
}

function pickSeries(points, ms){
  const now = Date.now();
  const start = now - ms;
  return points.filter(p=>p[0] >= start);
}

async function boot(){
  applyTheme();
  applyI18n();

  qs("#themeBtn").onclick = ()=> toggleTheme();

  const langSel = qs("#lang");
  const s = Store.get();
  langSel.value = s.lang;
  langSel.onchange = ()=>{
    Store.set({ lang: langSel.value });
    applyI18n();
    renderStaticTexts();
  };

  qs("#backBtn").onclick = ()=> history.length > 1 ? history.back() : location.href="index.html";

  const id = getParam("id");
  const marketRaw = await loadMarket(s.currency);
  const items = normalizeMarket(marketRaw);
  const coin = items.find(x=>String(x.id)===String(id)) || items[0];

  if (!coin){
    qs("#title").textContent = "—";
    return;
  }

  // header
  const img = qs("#coinImg");
  img.src = coinImage(coin.image);
  img.onerror = ()=>{ img.src = "./assets/img/coin-placeholder.svg"; };

  qs("#title").textContent = `${coin.name} (${coin.symbol})`;
  qs("#rank").textContent = `#${coin.rank ?? "—"}`;
  qs("#cid").textContent = String(coin.id);
  qs("#price").textContent = fmtMoney(coin.price, s.currency);

  const pct = (el, v)=>{ el.textContent = fmtPct(v); el.className = "pct " + pctClass(v); };
  pct(qs("#chg1h"), coin.change_1h);
  pct(qs("#chg24h"), coin.change_24h);
  pct(qs("#chg7d"), coin.change_7d);

  qs("#mcap").textContent = fmtNumber(coin.market_cap);
  qs("#vol").textContent = fmtNumber(coin.volume_24h);
  qs("#supply").textContent = fmtNumber(coin.circulating_supply);
  qs("#total").textContent = fmtNumber(coin.total_supply);
  qs("#max").textContent = fmtNumber(coin.max_supply);

  // chart from history
  const hist = await loadHistory(s.currency);
  const seriesAll = (hist?.points?.[String(coin.id)] || []).map(p=>[p[0], p[1]]);
  const chartCanvas = qs("#chart");
  const hint = qs("#hint");

  const periods = [
    ["24h", 24*3600*1000],
    ["7d", 7*24*3600*1000],
    ["30d", 30*24*3600*1000],
    ["90d", 90*24*3600*1000],
    ["1y", 365*24*3600*1000],
  ];

  let current = "7d";
  function setActive(key){
    periods.forEach(([k])=>{
      const b = qs(`#p_${k}`);
      b.classList.toggle("secondary", k !== current);
    });
  }

  function renderChart(){
    if (!seriesAll.length){
      hint.textContent = t("not_enough_history");
      hint.style.display = "block";
      bigLineChart(chartCanvas, []);
      return;
    }
    const ms = periods.find(([k])=>k===current)?.[1] || periods[1][1];
    const slice = pickSeries(seriesAll, ms);
    if (slice.length < 2){
      hint.textContent = t("not_enough_history");
      hint.style.display = "block";
    }else{
      hint.style.display = "none";
    }
    bigLineChart(chartCanvas, slice.length>=2 ? slice : seriesAll.slice(-2));
    setActive(current);
  }

  periods.forEach(([k])=>{
    qs(`#p_${k}`).onclick = ()=>{ current = k; renderChart(); };
  });

  renderChart();

  function renderStaticTexts(){
    applyI18n();
  }
  renderStaticTexts();
}

boot();
