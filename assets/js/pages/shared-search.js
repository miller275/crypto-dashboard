import { $, on, esc } from "../core/dom.js";
import { fetchJSON } from "../core/data-client.js";
import { CONFIG } from "../core/config.js";

let index = null;
let timer = null;

export async function initSearch(){
  const input = $("#search");
  const suggest = $("#searchSuggest");
  if(!input || !suggest) return;

  async function loadIndex(){
    if(index) return index;
    index = await fetchJSON(`${CONFIG.DATA_DIR}/search-index.json`).catch(()=> ({ items: [] }));
    return index;
  }

  function hide(){ suggest.hidden = true; suggest.innerHTML=""; }
  function show(html){ suggest.hidden = false; suggest.innerHTML = html; }

  function render(items){
    if(!items.length){ hide(); return; }
    const html = items.map(it => {
      const b = esc((it.symbol||"?").slice(0,3).toUpperCase());
      return `<div class="suggest__item" data-id="${it.id}">
        <div class="suggest__left">
          <div class="badge">${b}</div>
          <div>
            <div style="font-weight:600">${esc(it.name||"")}</div>
            <div style="font-size:12px;color:var(--faint);font-family:var(--mono)">${esc(it.symbol||"")}</div>
          </div>
        </div>
        <div style="font-size:12px;color:var(--faint)">#${esc(it.rank ?? "—")}</div>
      </div>`;
    }).join("");
    show(html);
  }

  function pick(q){
    const qq = q.trim().toLowerCase();
    if(!qq) return [];
    const items = index?.items || [];
    const res = [];
    for(const it of items){
      const s = (it.symbol||"").toLowerCase();
      const n = (it.name||"").toLowerCase();
      if(s.startsWith(qq) || n.includes(qq)){
        res.push(it);
        if(res.length >= CONFIG.SEARCH_SUGGEST_LIMIT) break;
      }
    }
    return res;
  }

  on(document, "click", (e) => {
    if(!suggest.contains(e.target) && e.target !== input) hide();
  });

  on(suggest, "click", (e) => {
    const item = e.target.closest(".suggest__item");
    if(!item) return;
    const id = item.getAttribute("data-id");
    window.location.href = `./coin.html?id=${encodeURIComponent(id)}`;
  });

  on(input, "input", async () => {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      await loadIndex();
      render(pick(input.value));
    }, 90);
  });

  on(input, "keydown", (e) => {
    if(e.key === "Escape") hide();
  });
}
