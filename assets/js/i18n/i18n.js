import { storage } from "../core/storage.js";
import { fetchJSON } from "../core/data-client.js";
import { $$ } from "../core/dom.js";

const KEY = "cb_lang";
const FALLBACK = "en";

let dict = {};
let current = FALLBACK;

export function getLang(){
  return storage.get(KEY, null) || document.documentElement.lang || FALLBACK;
}

export async function setLang(lang){
  const l = (lang === "ru") ? "ru" : "en";
  current = l;
  document.documentElement.lang = l;
  storage.set(KEY, l);
  dict = await fetchJSON(`./assets/js/i18n/locales/${l}.json`, { bust:false }).catch(()=> ({}));
  applyI18n();
  return l;
}

export function toggleLang(){
  const next = getLang() === "en" ? "ru" : "en";
  return setLang(next);
}

export function t(key){
  return dict[key] || key;
}

export function applyI18n(){
  const nodes = $$("[data-i18n]");
  for(const el of nodes){
    const k = el.getAttribute("data-i18n");
    el.innerHTML = t(k);
  }
}
