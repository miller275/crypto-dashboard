import { $, on } from "../core/dom.js";
import { setTheme, toggleTheme, getTheme } from "../core/theme.js";
import { getLang, setLang, toggleLang } from "../i18n/i18n.js";

export async function initTopbar(){
  // theme
  const savedTheme = getTheme();
  setTheme(savedTheme);
  const themeBtn = $("#themeBtn");
  const paintTheme = () => {
    const t = getTheme();
    if(themeBtn) themeBtn.textContent = t === "dark" ? "Dark" : "Light";
  };
  paintTheme();
  on(themeBtn, "click", () => { toggleTheme(); paintTheme(); document.dispatchEvent(new CustomEvent("cb:theme")); });

  // lang
  const langBtn = $("#langBtn");
  const savedLang = getLang();
  await setLang(savedLang);
  const paintLang = () => { if(langBtn) langBtn.textContent = (getLang() || "en").toUpperCase(); };
  paintLang();
  on(langBtn, "click", async () => { await toggleLang(); paintLang(); document.dispatchEvent(new CustomEvent("cb:lang")); });

  // placeholder localized
  const search = $("#search");
  if(search) search.placeholder = (getLang()==="ru" ? "Поиск монет…" : "Search coins…");
  document.addEventListener("cb:lang", () => { if(search) search.placeholder = (getLang()==="ru" ? "Поиск монет…" : "Search coins…"); });

  return { themeBtn, langBtn };
}
