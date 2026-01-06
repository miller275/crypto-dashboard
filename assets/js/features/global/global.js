import { el, safeText } from '../../core/dom.js';
import { formatCompactNumber } from '../../core/format.js';
import { i18n } from '../../i18n/i18n.js';

export function renderGlobalKpis(container, global) {
  container.innerHTML = '';

  const items = [
    { key: 'global.marketCap', value: formatCompactNumber(global?.quote?.USD?.total_market_cap), sub: 'USD' },
    { key: 'global.volume24h', value: formatCompactNumber(global?.quote?.USD?.total_volume_24h), sub: 'USD' },
    { key: 'global.btcDom', value: isFinite(global?.btc_dominance) ? `${global.btc_dominance.toFixed(2)}%` : '—', sub: '' },
    { key: 'global.ethDom', value: isFinite(global?.eth_dominance) ? `${global.eth_dominance.toFixed(2)}%` : '—', sub: '' }
  ];

  for (const it of items) {
    container.append(
      el('div', { class: 'kpi' }, [
        el('div', { class: 'kpi__label', text: i18n.t(it.key) }),
        el('div', { class: 'kpi__value', text: it.value }),
        el('div', { class: 'kpi__sub', text: it.sub || ' ' })
      ])
    );
  }
}

export function renderGlobalUpdated(node, generated) {
  const iso = generated?.generated_at;
  if (!iso) return safeText(node, '');
  const t = new Date(iso);
  safeText(node, i18n.t('ui.updated', { time: t.toLocaleString() }));
}
