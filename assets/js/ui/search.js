// search.js — incremental search with suggestions
import { el, $ } from "../core/dom.js";
import { CONFIG } from "../core/config.js";
import { loadCoinsList } from "../core/data-client.js";

function normalize(s){ return (s||"").toLowerCase().trim(); }

export function attachSearch({inputId="searchInput", dropdownId="searchDropdown"}={}) {
  const input = $(`#${inputId}`);
  const dropdown = $(`#${dropdownId}`);
  if (!input || !dropdown) return;

  let coins = null;
  let loading = false;
  let timer = null;

  async function ensureLoaded(){
    if (coins || loading) return;
    loading = true;
    try {
      const list = await loadCoinsList(); // [{id,symbol,name}]
      coins = Array.isArray(list) ? list : (list.items || []);
    } catch (e) {
      console.warn("Search list load failed", e);
      coins = [];
    } finally {
      loading = false;
    }
  }

  function close(){ dropdown.hidden = true; dropdown.innerHTML = ""; }
  function open(){ dropdown.hidden = false; }
  function render(items){
    dropdown.innerHTML = "";
    if (!items.length) { close(); return; }
    items.forEach(item=>{
      const row = el("div", { class:"searchItem", role:"option" }, [
        el("div", { class:"searchItem__left" }, [
          el("span", { class:"searchItem__icon" }),
          el("div", {}, [
            el("div", { class:"searchItem__name" }, [document.createTextNode(item.name)]),
            el("div", { class:"searchItem__sym" }, [document.createTextNode((item.symbol||"").toUpperCase())])
          ])
        ]),
        el("span", { class:"badge mono" }, [document.createTextNode(item.id)])
      ]);
      row.addEventListener("click", ()=>{
        window.location.href = `coin.html?id=${encodeURIComponent(item.id)}`;
      });
      dropdown.append(row);
    });
    open();
  }

  function query(q){
    q = normalize(q);
    if (!q) { close(); return; }
    const limit = CONFIG.SEARCH_SUGGESTIONS_LIMIT;
    const out = [];
    for (const c of coins) {
      const name = normalize(c.name);
      const sym = normalize(c.symbol);
      const id = normalize(c.id);
      if (name.includes(q) || sym.includes(q) || id.includes(q)) {
        out.push(c);
        if (out.length >= limit) break;
      }
    }
    render(out);
  }

  input.addEventListener("focus", ensureLoaded);
  input.addEventListener("input", async (e)=>{
    await ensureLoaded();
    clearTimeout(timer);
    timer = setTimeout(()=>query(e.target.value), 120);
  });
  input.addEventListener("keydown", (e)=>{
    if (e.key === "Enter") {
      const q = normalize(input.value);
      if (!q) return;
      // best match:
      const best = coins?.find(c => normalize(c.id)===q) || coins?.find(c=>normalize(c.symbol)===q) || coins?.find(c=>normalize(c.name)===q);
      if (best) window.location.href = `coin.html?id=${encodeURIComponent(best.id)}`;
    }
    if (e.key === "Escape") close();
  });
  document.addEventListener("click", (e)=>{
    if (!dropdown.contains(e.target) && e.target !== input) close();
  });
}
