import { Storage } from '../core/storage.js';
import { CONFIG } from '../core/config.js';

let dict = {};
let currentLang = Storage.get('lang', CONFIG.DEFAULT_LANG);

export async function loadLocale(lang){
  const res = await fetch(`./assets/js/i18n/locales/${lang}.json`, { cache: 'no-store' });
  dict = await res.json();
  currentLang = lang;
  Storage.set('lang', lang);
  document.documentElement.lang = lang;
}

export function t(key, vars){
  const v = dict[key] ?? key;
  if (!vars) return v;
  return Object.keys(vars).reduce((s,k)=>s.replaceAll(`{${k}}`, String(vars[k])), v);
}

export function getLang(){ return currentLang; }
