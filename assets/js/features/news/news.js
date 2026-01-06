import { el } from '../../core/dom.js';
import { timeAgo } from '../../core/format.js';

export function renderNews(listEl, newsItems) {
  listEl.innerHTML = '';

  const items = Array.isArray(newsItems) ? newsItems : [];
  if (!items.length) {
    listEl.append(el('div', { class: 'news-item' }, [
      el('div', { class: 'news-item__title', text: '—' }),
      el('div', { class: 'news-item__meta' }, [
        el('span', { class: 'news-item__src', text: 'No data' })
      ])
    ]));
    return;
  }

  for (const n of items.slice(0, 40)) {
    const a = el('a', {
      class: 'link news-item__title',
      href: n.url || '#',
      target: '_blank',
      rel: 'noopener',
      text: n.title || '—'
    });

    listEl.append(
      el('div', { class: 'news-item', role: 'listitem' }, [
        a,
        el('div', { class: 'news-item__meta' }, [
          el('span', { class: 'news-item__src', text: n.source || '—' }),
          el('span', { class: 'news-item__time', text: timeAgo(n.published_at) })
        ])
      ])
    );
  }
}
