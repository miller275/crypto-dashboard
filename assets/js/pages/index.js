import { APP } from "../config.js";
import { Store } from "../store.js";
import { t, applyI18n } from "../i18n.js";
import { applyTheme, toggleTheme } from "../theme.js";
import { qs, debounce } from "../utils.js";
import { loadMarket, loadHistory, clearCache } from "../data.js";
import { renderTable, openModal, closeModal } from "../ui.js";

function sortItems(items, mode){
  const arr = [...items];
  if (mode === "mcap_asc") arr.sort((a,b)=>(a.market_cap||0)-(b.market_cap||0));
  else if (mode === "name") arr.sort((a,b)=>String(a.name).localeCompare(String(b.name)));
  else arr.sort((a,b)=>(b.market_cap||0)-(a.market_cap||0));
  return arr;
}

function normalizeMarket(raw){
  const items = raw?.items || [];
  return items.map(x=>({
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
    sparkline_7d: x.sparkline_in_7d?.price || x.sparkline_7d || [],
  }));
}

function attachHistory(items, hist){
  const points = hist?.points || {};
  const now = Date.now();
  const last24h = now - 24*3600*1000;
  const last7d = now - 7*24*3600*1000;

  return items.map(c=>{
    const series = (points[String(c.id)] || []).map(p=>[p[0], p[1]]);
    // for modal, show last 7d or last 24h depending on available
    const s7 = series.filter(p=>p[0]>=last7d);
    const s24 = series.filter(p=>p[0]>=last24h);
    return {
      ...c,
      historySeries: (s7.length>=2 ? s7 : (s24.length>=2 ? s24 : [])),
      sparklineSeries: (c.sparkline_7d || []).map((p,i)=>[now - (c.sparkline_7d.length-i)*3600*1000, p]),
    };
  });
}

async function boot(){
  applyTheme();

  // header controls
  const s = Store.get();
  const langSel = qs("#lang");
  langSel.value = s.lang;
  langSel.onchange = ()=>{
    Store.set({ lang: langSel.value });
    applyI18n();
    render(); // re-render headings if needed
  };

  const themeBtn = qs("#themeBtn");
  themeBtn.onclick = ()=> toggleTheme();

  // filters
  const search = qs("#search");
  const sort = qs("#sort");
  const perPage = qs("#perPage");
  const watchOnly = qs("#watchOnly");
  const refreshBtn = qs("#refreshBtn");

  sort.value = "mcap_desc";
  perPage.value = "25";

  refreshBtn.onclick = async ()=>{
    clearCache();
    await render(true);
  };

  document.getElementById("modalClose").onclick = closeModal;
  document.getElementById("modalBackdrop").addEventListener("click", (e)=>{
    if (e.target.id === "modalBackdrop") closeModal();
  });
  window.addEventListener("keydown", (e)=>{
    if (e.key === "Escape") closeModal();
  });

  const state = { market: null, items: [], hist: null, filtered: [], page: 1 };

  async function render(force=false){
    applyI18n();
    const tbody = qs("#tbody");
    const updated = qs("#updated");

    try{
      const marketRaw = await loadMarket(s.currency);
      const hist = await loadHistory(s.currency);
      state.market = marketRaw;
      state.hist = hist;

      let items = normalizeMarket(marketRaw);
      items = attachHistory(items, hist);

      // apply search
      const q = (search.value || "").trim().toLowerCase();
      if (q){
        items = items.filter(c =>
          String(c.name).toLowerCase().includes(q) ||
          String(c.symbol).toLowerCase().includes(q)
        );
      }

      // sort
      items = sortItems(items, sort.value);

      // watch-only filter before pagination
      if (watchOnly.checked){
        const set = new Set((Store.get().watchlist || []));
        items = items.filter(c => set.has(c.id));
      }

      // paginate (simple)
      const pp = parseInt(perPage.value, 10) || 25;
      const slice = items.slice(0, pp);

      renderTable(tbody, slice, {
        watchOnly: false,
        onQuickView: (coin)=> openModal({ coin })
      });


      const ts = marketRaw?.updatedAt ? new Date(marketRaw.updatedAt).toLocaleString() : "—";
      updated.textContent = `${t("updated")}: ${ts}`;
    }catch(err){
      tbody.innerHTML = `<tr><td colspan="10" style="padding:16px;color:var(--muted)">${t("no_data")}</td></tr>`;
      updated.textContent = `${t("updated")}: —`;
      console.error(err);
    }
  }

  // live re-render on input
  search.addEventListener("input", debounce(()=>render(), 200));
  sort.addEventListener("change", ()=>render());
  perPage.addEventListener("change", ()=>render());
  watchOnly.addEventListener("change", ()=>render());

  // initial
  applyI18n();
  await render();
}

boot();
