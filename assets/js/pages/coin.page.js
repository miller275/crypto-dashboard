import { initTheme, toggleTheme } from '../theme/theme.js';
import { loadLocale, getLang } from '../i18n/i18n.js';
import { Storage } from '../core/storage.js';
import { CONFIG } from '../core/config.js';

import { renderCoin } from '../features/markets.js';
import { mountTradingView } from '../features/tradingview.js';

async function registerSW(){
  if (!('serviceWorker' in navigator)) return;
  try{ await navigator.serviceWorker.register('./service-worker.js'); }catch(e){}
}

function getCoinId(){
  const url = new URL(location.href);
  return url.searchParams.get('id') || '1';
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

  const id = getCoinId();
  await renderCoin(id);
  await mountTradingView(id);

  await registerSW();
}

init();
