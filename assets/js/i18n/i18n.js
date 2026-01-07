// i18n.js
import { store } from "../core/storage.js";
import { $,$$ } from "../core/dom.js";

const SUPPORTED = ["en","ru"];
let dict = {};
let lang = "en";

export async function loadI18n() {
  lang = store.get("lang", detectLang());
  if (!SUPPORTED.includes(lang)) lang = "en";
  dict = await fetch(`assets/js/i18n/locales/${lang}.json`).then(r => r.json());
  applyI18n();
  return lang;
}

export function getLang(){ return lang; }

export async function toggleLang() {
  lang = (lang === "en") ? "ru" : "en";
  store.set("lang", lang);
  dict = await fetch(`assets/js/i18n/locales/${lang}.json`).then(r => r.json());
  applyI18n();
  return lang;
}

export function t(key, fallback="") {
  return key.split(".").reduce((o,k)=> (o && k in o) ? o[k] : undefined, dict) ?? fallback ?? key;
}

function detectLang(){
  const nav = (navigator.language || "en").slice(0,2).toLowerCase();
  return SUPPORTED.includes(nav) ? nav : "en";
}

export function applyI18n(){
  document.documentElement.lang = lang;
  // inner text
  $$("[data-i18n]").forEach(node=>{
    const key = node.getAttribute("data-i18n");
    node.textContent = t(key, node.textContent);
  });
  // placeholder
  $$("[data-i18n-placeholder]").forEach(node=>{
    const key = node.getAttribute("data-i18n-placeholder");
    node.setAttribute("placeholder", t(key, node.getAttribute("placeholder")||""));
  });
}
