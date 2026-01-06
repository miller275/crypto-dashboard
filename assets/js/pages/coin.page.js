import { dataClient } from '../core/data-client.js';
import { $, safeText, setHidden } from '../core/dom.js';
import { theme } from '../theme/theme.js';
import { i18n } from '../i18n/i18n.js';
import { formatCurrencyUSD, formatCompactNumber, formatPercent, clsForPercent } from '../core/format.js';

import { mountTradingView } from '../features/tradingview/tradingview.js';

function getId() {
  const p = new URLSearchParams(location.search);
  const id = p.get('id');
  return id ? String(id) : null;
}

function stat(label, value, sub = '') {
  const d = document.createElement('div');
  d.className = 'stat';
  d.innerHTML = `
    <div class="stat__label"></div>
    <div class="stat__value"></div>
    ${sub ? `<div class="stat__sub"></div>` : ''}
  `;
  d.querySelector('.stat__label').textContent = label;
  d.querySelector('.stat__value').textContent = value;
  if (sub) d.querySelector('.stat__sub').textContent = sub;
  return d;
}

function tvSymbolFromMap({ coin, tvMap }) {
  const symbol = (coin?.symbol || '').toUpperCase();
  const base = tvMap?.default?.exchange || 'BINANCE';
  const quote = tvMap?.default?.quote || 'USDT';

  // Override by id or symbol
  const byId = tvMap?.overrides_by_id?.[String(coin?.id)];
  if (byId?.symbol) return byId.symbol;

  const bySym = tvMap?.overrides_by_symbol?.[symbol];
  if (bySym?.symbol) return bySym.symbol;

  // Alternatives list (used when you know Binance doesn't have it)
  const alts = tvMap?.alternatives_by_symbol?.[symbol];
  if (Array.isArray(alts) && alts.length) {
    const a = alts[0];
    if (a.exchange && a.pair) return `${a.exchange}:${a.pair}`;
    if (a.exchange) return `${a.exchange}:${symbol}${a.quote || quote}`;
  }

  // Default BINANCE:SYMBOLUSDT
  return `${base}:${symbol}${quote}`;
}

async function main() {
  theme.init();
  await i18n.init();
  i18n.apply(document);

  await dataClient.registerSW();
  await dataClient.init();

  const buildInfo = $('#buildInfo');
  const gen = dataClient.getGenerated();
  safeText(buildInfo, gen?.generated_at ? i18n.t('ui.build', { time: new Date(gen.generated_at).toLocaleString() }) : 'Data: —');

  // Header controls
  const langLabel = $('#langLabel');
  const langToggle = $('#langToggle');
  const themeToggle = $('#themeToggle');

  langLabel.textContent = i18n.lang().toUpperCase();
  langToggle.addEventListener('click', async () => {
    const next = i18n.lang() === 'en' ? 'ru' : 'en';
    await i18n.setLang(next);
    i18n.apply(document);
    langLabel.textContent = i18n.lang().toUpperCase();
    // update fallback message if shown
    const id = getId();
    if (id) await render(id);
  });

  themeToggle.addEventListener('click', () => {
    theme.toggle();
    const id = getId();
    if (id) renderTV(id).catch(console.error);
  });

  $('#backBtn').addEventListener('click', () => {
    history.length > 1 ? history.back() : (location.href = 'index.html');
  });

  const id = getId();
  if (!id) {
    safeText($('#coinName'), '—');
    safeText($('#coinSub'), 'Missing id');
    return;
  }

  async function renderTV(id) {
    const coin = await dataClient.getData(`coins/${id}.json`);
    const tvMap = await dataClient.getData('charts/tv-map.json').catch(() => ({}));
    const tvSymbol = tvSymbolFromMap({ coin, tvMap });

    // Update link
    const tvOpen = $('#tvOpen');
    tvOpen.href = `https://www.tradingview.com/symbols/${encodeURIComponent(tvSymbol.replace(':','-'))}/`;

    // If mapping absent and symbol empty, show message
    const fallback = $('#tvFallback');
    if (!coin?.symbol) {
      setHidden(fallback, false);
      safeText(fallback, i18n.t('coin.pairNotFound', { symbol: '—' }));
      return;
    }
    setHidden(fallback, true);

    await mountTradingView('tvContainer', { symbol: tvSymbol, theme: theme.get() });
  }

  async function render(id) {
    const coin = await dataClient.getData(`coins/${id}.json`);

    // Header
    safeText($('#coinName'), coin?.name || '—');
    safeText($('#coinSymbol'), (coin?.symbol || '—').toUpperCase());
    safeText($('#coinRank'), coin?.rank ? `#${coin.rank}` : '#—');

    $('#coinLogo').src = coin?.logo || `./assets/img/coins/${id}.png`;
    $('#coinLogo').onerror = () => { $('#coinLogo').src = './assets/img/coin-placeholder.svg'; };

    const p24 = Number(coin?.quote?.USD?.percent_change_24h);
    const pTxt = isFinite(p24) ? formatPercent(p24) : '—';
    const cls = clsForPercent(p24);
    $('#coinSub').innerHTML = `
      <span class="${cls}" style="font-weight:800">${pTxt}</span>
      <span class="muted"> • </span>
      <span class="muted">${coin?.last_updated ? new Date(coin.last_updated).toLocaleString() : '—'}</span>
    `;

    // Stats
    const stats = $('#statsGrid');
    stats.innerHTML = '';

    const q = coin?.quote?.USD || {};
    const supply = coin?.supply || {};

    stats.append(
      stat('Price', formatCurrencyUSD(q.price)),
      stat('Market Cap', formatCompactNumber(q.market_cap), 'USD'),
      stat('Volume 24h', formatCompactNumber(q.volume_24h), 'USD'),
      stat('Circulating', `${formatCompactNumber(supply.circulating)} ${coin?.symbol || ''}`.trim()),
      stat('Max Supply', supply.max ? `${formatCompactNumber(supply.max)} ${coin?.symbol || ''}`.trim() : '—'),
      stat('24h Change', isFinite(p24) ? formatPercent(p24) : '—'),
      stat('ATH', coin?.ath?.price ? formatCurrencyUSD(coin.ath.price) : '—', coin?.ath?.date ? new Date(coin.ath.date).toLocaleDateString() : ''),
      stat('ATL', coin?.atl?.price ? formatCurrencyUSD(coin.atl.price) : '—', coin?.atl?.date ? new Date(coin.atl.date).toLocaleDateString() : '')
    );

    // Description
    const desc = (coin?.description || '').trim();
    safeText($('#coinDesc'), desc || i18n.t('coin.noDescription'));

    // Chart
    await renderTV(id);
  }

  // Segment UX (doesn't control widget, but keeps UI coherent)
  document.querySelectorAll('.seg__btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.seg__btn').forEach(b => {
        b.classList.toggle('is-active', b === btn);
        b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
      });
    });
  });

  await render(id);
}

main().catch(console.error);
