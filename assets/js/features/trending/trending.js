import { el } from '../../core/dom.js';
import { formatPercent, clsForPercent } from '../../core/format.js';

function renderMiniList(root, items) {
  root.innerHTML = '';
  const list = Array.isArray(items) ? items : [];
  for (const it of list.slice(0, 6)) {
    const pct = Number(it?.percent_change_24h);
    const row = el('a', {
      class: 'mini-item',
      href: `coin.html?id=${encodeURIComponent(it.id)}`,
      title: it.name || it.symbol || '',
    }, [
      el('div', { class: 'mini-item__left' }, [
        el('img', { class: 'mini-item__logo', src: it.logo || './assets/img/coin-placeholder.svg', alt: '' }),
        el('div', { class: 'mini-item__name', text: it.symbol ? `${it.symbol}` : (it.name || '—') })
      ]),
      el('div', { class: `mini-item__pct ${clsForPercent(pct)}`, text: formatPercent(pct) })
    ]);
    root.append(row);
  }
}

export function renderMovers(gainersEl, losersEl, trending) {
  renderMiniList(gainersEl, trending?.gainers);
  renderMiniList(losersEl, trending?.losers);
}
