import { CONFIG } from '../core/config.js';
import { storage } from '../core/storage.js';

const KEY = 'pm_lang';
let current = CONFIG.DEFAULT_LANG;
let dict = {};

async function loadLocale(lang) {
  const url = `${CONFIG.PATHS.LOCALES}/${lang}.json`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Locale load failed: ${lang}`);
  return res.json();
}

function getByPath(obj, path) {
  return path.split('.').reduce((acc, k) => (acc && k in acc ? acc[k] : undefined), obj);
}

function template(str, vars = {}) {
  return String(str).replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}

export const i18n = {
  async init() {
    const saved = storage.get(KEY, null);
    const nav = (navigator.language || 'en').toLowerCase().startsWith('ru') ? 'ru' : 'en';
    current = saved || nav || CONFIG.DEFAULT_LANG;

    dict = await loadLocale(current).catch(async () => {
      current = CONFIG.DEFAULT_LANG;
      return loadLocale(current);
    });

    document.documentElement.lang = current;
    return current;
  },

  lang() { return current; },

  async setLang(lang) {
    if (lang === current) return current;
    current = lang;
    storage.set(KEY, current);
    dict = await loadLocale(current);
    document.documentElement.lang = current;
    return current;
  },

  t(key, vars) {
    const v = getByPath(dict, key);
    if (v == null) return key;
    return template(v, vars);
  },

  apply(root = document) {
    // text nodes
    root.querySelectorAll('[data-i18n]').forEach((node) => {
      const key = node.getAttribute('data-i18n');
      node.textContent = this.t(key);
    });
    // placeholders
    root.querySelectorAll('[data-i18n-placeholder]').forEach((node) => {
      const key = node.getAttribute('data-i18n-placeholder');
      node.setAttribute('placeholder', this.t(key));
    });
    // titles/aria labels (optional)
    root.querySelectorAll('[data-i18n-title]').forEach((node) => {
      const key = node.getAttribute('data-i18n-title');
      node.setAttribute('title', this.t(key));
    });
  }
};
