import { Utils } from "./utils.js";
import { Theme } from "./theme.js";
import { I18N } from "./i18n.js";
import { API } from "./api.js";
import { UI } from "./ui.js";

let state = {
  coins: [],
  global: null,
  page: 1,
  perPage: 50,
  query: ""
};

async function loadAll({silent=false}={}){
  if (!silent) UI.toast(I18N.get()==="ru" ? "Загрузка…" : "Loading…");

  try{
    const [markets, fng, news] = await Promise.all([
      API.loadMarkets(),
      API.loadFearGreed(),
      API.loadNews()
    ]);

    state.coins = markets.coins || [];
    state.global = markets.global || null;

    UI.renderHeader({ source: markets.source, updatedAt: markets.updatedAt });
    UI.renderMarketOverview(state.global);
    UI.renderFearGreed(fng);
    UI.renderTrending(state.coins);
    UI.renderNews(news);

    const result = UI.renderCoinsTable(state);
    if (result){
      state.page = result.page;
      const prev = Utils.qs("#prevBtn");
      const next = Utils.qs("#nextBtn");
      prev.disabled = state.page <= 1;
      next.disabled = state.page >= result.pages;
    }

    const updatedLine = Utils.qs("#updatedLine");
    if (updatedLine && markets.updatedAt){
      updatedLine.textContent = (I18N.get()==="ru" ? "Обновлено: " : "Updated: ") + new Date(markets.updatedAt).toLocaleString();
    }

    UI.toast(I18N.get()==="ru" ? "Готово" : "Done");
  }catch(err){
    console.error(err);
    UI.toast(I18N.get()==="ru" ? "Ошибка загрузки" : "Load failed");
    const tbody = Utils.qs("#coinsTbody");
    if (tbody){
      tbody.innerHTML = `<tr><td colspan="9" class="muted" style="text-align:center;padding:22px">
        ${(I18N.get()==="ru" ? "Не удалось загрузить данные. Открой DevTools → Console." : "Failed to load data. Check DevTools → Console.")}
      </td></tr>`;
    }
  }
}

function bind(){
  const themeBtn = Utils.qs("#themeBtn");
  if (themeBtn) themeBtn.addEventListener("click", () => Theme.toggle());

  const lang = Utils.qs("#langSelect");
  if (lang){
    lang.value = I18N.get();
    lang.addEventListener("change", () => {
      I18N.set(lang.value);
      // re-render UI text + table hint
      UI.renderCoinsTable(state);
      UI.toast(I18N.get()==="ru" ? "Язык: RU" : "Language: EN");
    });
  }

  const refreshBtn = Utils.qs("#refreshBtn");
  if (refreshBtn) refreshBtn.addEventListener("click", () => loadAll());

  const per = Utils.qs("#perPageSelect");
  if (per){
    per.value = String(state.perPage);
    per.addEventListener("change", () => {
      state.perPage = parseInt(per.value, 10);
      state.page = 1;
      UI.renderCoinsTable(state);
    });
  }

  const prev = Utils.qs("#prevBtn");
  const next = Utils.qs("#nextBtn");
  if (prev) prev.addEventListener("click", () => { state.page -= 1; UI.renderCoinsTable(state); });
  if (next) next.addEventListener("click", () => { state.page += 1; UI.renderCoinsTable(state); });

  const search = Utils.qs("#searchInput");
  if (search){
    const on = Utils.debounce(() => {
      state.query = search.value;
      state.page = 1;
      UI.renderCoinsTable(state);
    }, 150);
    search.addEventListener("input", on);
  }

  const yearEl = Utils.qs("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
}

document.addEventListener("DOMContentLoaded", async () => {
  Theme.set(Theme.get());
  I18N.apply();
  bind();
  const isDashboard = !!Utils.qs("#coinsTbody");
  if (isDashboard) {
    await loadAll({silent:true});
  }
});
