import { CONFIG } from '../core/config.js';
import { storage } from '../core/storage.js';

const KEY = 'pm_theme';

function prefersDark() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export const theme = {
  init() {
    const saved = storage.get(KEY, null);
    const initial = saved || (prefersDark() ? 'dark' : 'light') || CONFIG.DEFAULT_THEME;
    this.set(initial);
    return initial;
  },

  get() {
    return document.documentElement.getAttribute('data-theme') || CONFIG.DEFAULT_THEME;
  },

  set(next) {
    const t = next === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', t);
    storage.set(KEY, t);
    return t;
  },

  toggle() {
    return this.set(this.get() === 'dark' ? 'light' : 'dark');
  }
};
