import { Storage } from '../core/storage.js';
import { CONFIG } from '../core/config.js';

export function applyTheme(theme){
  document.documentElement.setAttribute('data-theme', theme);
  Storage.set('theme', theme);
}

export function initTheme(){
  const theme = Storage.get('theme', CONFIG.DEFAULT_THEME);
  applyTheme(theme);
}

export function toggleTheme(){
  const cur = document.documentElement.getAttribute('data-theme') || CONFIG.DEFAULT_THEME;
  applyTheme(cur === 'dark' ? 'light' : 'dark');
}
