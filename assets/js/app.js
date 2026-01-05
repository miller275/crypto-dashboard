import { API } from "./api.js";
import { UI } from "./ui.js";
import { getParam, setParam, clamp, isDashboard } from "./utils.js";

let META = null;
let INDEX = null;

async function loadMeta(){
  META = await API.meta();
  UI.renderPager(META, Number(getParam("page") || 1));
}

async function loadIndex(){
  try{ INDEX = await API.index(); }catch{ INDEX = null; }
}

async function loadDashboard(){
  const page = clamp(Number(getParam("page") || 1), 1, 99999);
  if (!META) await loadMeta();
  UI.renderPager(META, page);

  const [global, fng, trending, news, pageData] = await Promise.all([
    API.global().catch(()=>null),
    API.fng().catch(()=>null),
    API.trending().catch(()=>null),
    API.news().catch(()=>null),
    API.page(page).catch(()=>null),
  ]);

  if (global) UI.renderKPIs(global);
  if (fng) UI.renderFearGreed(fng);
  if (trending) UI.renderTrending(trending);
  if (news) UI.renderNews(news);
  if (pageData) UI.renderTable(pageData);

  const shown = document.querySelector("#shownInfo");
  if (shown) shown.textContent = `Показано ${(pageData?.items?.length ?? 0)} из ${META?.total ?? "—"}`;
}

function hookPager(){
  const prev = document.querySelector("#btnPrev");
  const next = document.querySelector("#btnNext");

  prev?.addEventListener("click", async ()=>{
    const p = clamp(Number(getParam("page") || 1)-1, 1, META?.pages ?? 99999);
    setParam("page", p);
    await loadDashboard();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  next?.addEventListener("click", async ()=>{
    const p = clamp(Number(getParam("page") || 1)+1, 1, META?.pages ?? 99999);
    setParam("page", p);
    await loadDashboard();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function hookSearch(){
  const input = document.querySelector("#searchInput");
  const box = document.querySelector("#searchBox");
  if (!input || !box) return;

  let timer = null;
  const close = ()=>{ box.innerHTML=""; box.style.display="none"; };

  input.addEventListener("input", ()=>{
    clearTimeout(timer);
    timer = setTimeout(async ()=>{
      const q = input.value.trim().toLowerCase();
      if (q.length < 2){ close(); return; }

      if (!INDEX) await loadIndex();
      const items = (INDEX?.items ?? [])
        .filter(it => (it.name_lc.includes(q) || it.symbol_lc.includes(q)))
        .slice(0, 8);

      box.innerHTML = "";
      items.forEach(it=>{
        const a = document.createElement("a");
        a.href = `coin.html?id=${encodeURIComponent(it.id)}&p=${encodeURIComponent(it.page)}`;
        a.className = "trend-item";
        a.innerHTML = `
          <div>
            <div class="name">${it.name} (${it.symbol})</div>
            <span class="sub">Стр. ${it.page}</span>
          </div>
          <span class="badge">Открыть</span>
        `;
        box.appendChild(a);
      });
      box.style.display = items.length ? "block" : "none";
    }, 150);
  });

  document.addEventListener("click", (e)=>{
    if (!box.contains(e.target) && e.target !== input) close();
  });
}

document.addEventListener("DOMContentLoaded", async ()=>{
  if (!isDashboard()) return;
  try{
    await loadMeta();
    hookPager();
    hookSearch();
    await loadDashboard();
  }catch(err){
    console.error(err);
    const msg = document.querySelector("#fatal");
    if (msg) msg.textContent = "Ошибка загрузки данных. Проверь /data и кеш (Ctrl+F5).";
  }
});
