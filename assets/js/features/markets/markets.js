import { el } from '../../core/dom.js';
import { formatCurrencyUSD, formatCompactNumber, formatPercent, clsForPercent, clamp } from '../../core/format.js';

function coinLogoSrc(coin) {
  if (coin?.logo) return coin.logo;
  if (coin?.id) return `./assets/img/coins/${coin.id}.png`;
  return './assets/img/coin-placeholder.svg';
}

function drawSparkline(canvas, data, positive = true) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width = canvas.clientWidth * devicePixelRatio;
  const h = canvas.height = canvas.clientHeight * devicePixelRatio;

  ctx.clearRect(0, 0, w, h);

  // Placeholder background line
  ctx.lineWidth = 1 * devicePixelRatio;
  ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border').trim() || 'rgba(255,255,255,.08)';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.55);
  ctx.lineTo(w, h * 0.55);
  ctx.stroke();

  if (!Array.isArray(data) || data.length < 2) {
    // Simple placeholder "wave"
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--muted').trim() || '#9aa7c2';
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const x = (i / 9) * w;
      const y = h * (0.45 + 0.08 * Math.sin(i));
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    return;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const pad = 3 * devicePixelRatio;
  const range = max - min || 1;

  const color = positive
    ? getComputedStyle(document.documentElement).getPropertyValue('--pos').trim() || '#2ee59d'
    : getComputedStyle(document.documentElement).getPropertyValue('--neg').trim() || '#ff5c7a';

  ctx.strokeStyle = color;
  ctx.lineWidth = 2 * devicePixelRatio;
  ctx.beginPath();

  const n = data.length;
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * (w - 2 * pad) + pad;
    const yNorm = (data[i] - min) / range;
    const y = (1 - yNorm) * (h - 2 * pad) + pad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function row(coin) {
  const pct1h = Number(coin?.percent_change_1h);
  const pct24h = Number(coin?.percent_change_24h);
  const pct7d = Number(coin?.percent_change_7d);

  const spark = el('canvas', { class: 'spark', 'aria-label': 'sparkline' });

  // Sparkline color by 7d change if available, else 24h, else neutral
  const ref = isFinite(pct7d) ? pct7d : isFinite(pct24h) ? pct24h : 0;

  // Defer draw until next frame for correct sizing
  requestAnimationFrame(() => drawSparkline(spark, coin?.sparkline7d, ref >= 0));

  return el('tr', {}, [
    el('td', { class: 'td td--sticky td--rank td--num' }, [document.createTextNode(String(coin?.rank ?? '—'))]),
    el('td', { class: 'td td--sticky td--coin' }, [
      el('a', { class: 'link', href: `coin.html?id=${encodeURIComponent(coin.id)}` }, [
        el('div', { class: 'coin-cell' }, [
          el('img', { class: 'coin-cell__logo', src: coinLogoSrc(coin), alt: '' }),
          el('div', { class: 'coin-cell__meta' }, [
            el('div', { class: 'coin-cell__name', text: coin?.name || '—' }),
            el('div', { class: 'coin-cell__sym', text: (coin?.symbol || '—').toUpperCase() })
          ])
        ])
      ])
    ]),
    el('td', { class: 'td ta-r td--num', text: formatCurrencyUSD(coin?.price) }),
    el('td', { class: 'td ta-r' }, [el('span', { class: `badge ${clsForPercent(pct1h)}`, text: formatPercent(pct1h) })]),
    el('td', { class: 'td ta-r' }, [el('span', { class: `badge ${clsForPercent(pct24h)}`, text: formatPercent(pct24h) })]),
    el('td', { class: 'td ta-r' }, [el('span', { class: `badge ${clsForPercent(pct7d)}`, text: formatPercent(pct7d) })]),
    el('td', { class: 'td ta-r td--num', text: formatCompactNumber(coin?.market_cap) }),
    el('td', { class: 'td ta-r td--num', text: formatCompactNumber(coin?.volume_24h) }),
    el('td', { class: 'td ta-r td--num', text: `${formatCompactNumber(coin?.circulating_supply)} ${coin?.symbol || ''}`.trim() }),
    el('td', { class: 'td ta-c' }, [spark]),
  ]);
}

export function createMarketsController({
  tbody,
  tableMetaEl,
  pageStatusEl,
  prevBtn,
  nextBtn,
  pageInput,
  goBtn,
  pageSizeSelect,
  searchInput,
  searchHint,
  onNavigateToPage, // async (virtualPage) => { coins, meta }
}) {
  let meta = null;
  let state = {
    virtualPage: 1,
    virtualPageSize: 100,
    totalVirtualPages: 1,
    coins: [],
    query: ''
  };

  function applySearch(coins) {
    const q = state.query.trim().toLowerCase();
    if (!q) return coins;
    return coins.filter(c =>
      String(c.name || '').toLowerCase().includes(q) ||
      String(c.symbol || '').toLowerCase().includes(q)
    );
  }

  function render() {
    const filtered = applySearch(state.coins);

    tbody.innerHTML = '';
    for (const c of filtered) tbody.append(row(c));

    const totalCoins = meta?.total_coins ?? filtered.length;
    const shown = filtered.length;

    tableMetaEl.textContent = meta
      ? `${shown} / ${totalCoins} • base page size ${meta.base_page_size}`
      : `${shown}`;

    pageStatusEl.textContent = `Page ${state.virtualPage} of ${state.totalVirtualPages}`;
    pageInput.value = String(state.virtualPage);

    prevBtn.disabled = state.virtualPage <= 1;
    nextBtn.disabled = state.virtualPage >= state.totalVirtualPages;

    // Search hint
    if (state.query.trim()) {
      searchHint.textContent = `${shown} match(es)`;
    } else {
      searchHint.textContent = '';
    }
  }

  async function loadPage(virtualPage) {
    state.virtualPage = clamp(Number(virtualPage) || 1, 1, state.totalVirtualPages);
    const res = await onNavigateToPage(state.virtualPage, state.virtualPageSize);
    state.coins = res.coins || [];
    meta = res.meta || meta;

    if (meta) {
      // virtual pages depend on total_coins and chosen page size
      state.totalVirtualPages = Math.max(1, Math.ceil(meta.total_coins / state.virtualPageSize));
    } else {
      state.totalVirtualPages = Math.max(1, state.totalVirtualPages);
    }
    render();
  }

  function setPageSizes(available, selected) {
    pageSizeSelect.innerHTML = '';
    for (const s of available) {
      pageSizeSelect.append(el('option', { value: String(s), text: String(s) }));
    }
    pageSizeSelect.value = String(selected);
  }

  return {
    async init(initialMeta) {
      meta = initialMeta || meta;

      const available = meta?.available_page_sizes?.length ? meta.available_page_sizes : [50, 100, 200];
      const defaultSize = meta?.default_virtual_page_size || 100;
      state.virtualPageSize = defaultSize;
      state.totalVirtualPages = Math.max(1, Math.ceil((meta?.total_coins || 1) / state.virtualPageSize));

      setPageSizes(available, defaultSize);

      prevBtn.addEventListener('click', () => loadPage(state.virtualPage - 1));
      nextBtn.addEventListener('click', () => loadPage(state.virtualPage + 1));
      goBtn.addEventListener('click', () => loadPage(pageInput.value));
      pageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') loadPage(pageInput.value);
      });

      pageSizeSelect.addEventListener('change', async () => {
        state.virtualPageSize = Number(pageSizeSelect.value) || state.virtualPageSize;
        state.totalVirtualPages = Math.max(1, Math.ceil((meta?.total_coins || 1) / state.virtualPageSize));
        await loadPage(1);
      });

      searchInput.addEventListener('input', () => {
        state.query = searchInput.value || '';
        render();
      });

      await loadPage(1);
    },

    async refresh(metaNew) {
      if (metaNew) meta = metaNew;
      state.totalVirtualPages = Math.max(1, Math.ceil((meta?.total_coins || 1) / state.virtualPageSize));
      await loadPage(state.virtualPage);
    },

    getState() { return { ...state }; }
  };
}
