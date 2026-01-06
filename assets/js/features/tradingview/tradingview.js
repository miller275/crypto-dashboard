let tvReadyPromise = null;

export function loadTradingViewScript() {
  if (tvReadyPromise) return tvReadyPromise;

  tvReadyPromise = new Promise((resolve, reject) => {
    // If already loaded
    if (window.TradingView && typeof window.TradingView.widget === 'function') {
      resolve(true);
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://s3.tradingview.com/tv.js';
    s.async = true;
    s.onload = () => resolve(true);
    s.onerror = () => reject(new Error('TradingView script load failed'));
    document.head.appendChild(s);
  });

  return tvReadyPromise;
}

/**
 * Create TradingView widget.
 * Note: We can't reliably detect "pair not found" due to cross-origin iframe.
 * We provide fallback logic via tv-map.json and also a visible hint message when mapping is missing.
 */
export async function mountTradingView(containerId, { symbol, theme = 'dark' }) {
  await loadTradingViewScript();

  // Clear container
  const container = document.getElementById(containerId);
  if (container) container.innerHTML = '';

  // eslint-disable-next-line no-new
  new window.TradingView.widget({
    autosize: true,
    symbol,
    interval: '60',
    timezone: 'Etc/UTC',
    theme: theme === 'light' ? 'light' : 'dark',
    style: '1',
    locale: 'en',
    enable_publishing: false,
    hide_legend: false,
    withdateranges: true,
    allow_symbol_change: true,
    details: true,
    container_id: containerId
  });
}
