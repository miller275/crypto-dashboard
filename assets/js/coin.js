import { API } from "./api.js";
import { UI } from "./ui.js";
import { getParam, isCoinPage, clamp } from "./utils.js";
import { renderTradingView } from "./tradingview.js";

async function loadCoin(){
  const id = getParam("id");
  const page = clamp(Number(getParam("p") || 1), 1, 99999);
  if (!id) throw new Error("Missing id");

  const pageData = await API.page(page);
  const coin = (pageData.items || []).find(x => String(x.id) === String(id));
  if (!coin){
    const idx = await API.index().catch(()=>null);
    const found = idx?.items?.find(x=>String(x.id)===String(id));
    if (found){
      const pd = await API.page(found.page);
      const c = (pd.items||[]).find(x=>String(x.id)===String(id));
      if (c){
        UI.renderCoinHeader(c);
        UI.renderCoinStats(c);
        renderTradingView({ baseSymbol: c.symbol, interval: "60", theme: "dark" });
      }
    }
    return;
  }

  UI.renderCoinHeader(coin);
  UI.renderCoinStats(coin);
  renderTradingView({ baseSymbol: coin.symbol, interval: "60", theme: "dark" });

  const details = await API.coinDetails(id).catch(()=>null);
  UI.renderDescription(details);
}

document.addEventListener("DOMContentLoaded", async ()=>{
  if (!isCoinPage()) return;
  try{ await loadCoin(); }
  catch(err){
    console.error(err);
    const el = document.querySelector("#coinDesc");
    if (el) el.textContent = "Не удалось загрузить данные монеты. Проверь /data и параметр ?id=";
  }
});
