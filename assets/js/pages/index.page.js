import { initTheme, toggleTheme } from '../theme/theme.js';
import { loadLocale, getLang } from '../i18n/i18n.js';
import { Storage } from '../core/storage.js';
import { CONFIG } from '../core/config.js';

import { renderGlobal } from '../features/global.js';
import { renderFearGreed } from '../features/feargreed.js';
import { renderNews } from '../features/news.js';
import { renderMarkets } from '../features/markets.js';
import { initSearch } from '../features/search.js';
import { initFavorites } from '../features/favorites.js';

// Local small helper: register SW from root
async function registerSW(){
  if (!('serviceWorker' in navigator)) return;
  try{ await navigator.serviceWorker.register('./service-worker.js'); }catch(e){}
}

async function init(){
  initTheme();
  await loadLocale(Storage.get('lang', CONFIG.DEFAULT_LANG));

  document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
  document.getElementById('langToggle')?.addEventListener('click', async () => {
    const next = getLang() === 'en' ? 'ru' : 'en';
    await loadLocale(next);
    location.reload();
  });

  await Promise.allSettled([
    renderGlobal(),
    renderFearGreed(),
    renderNews(),
    renderMarkets(1),
  ]);

  initFavorites();
  initSearch();
  await registerSW();
}

init();
