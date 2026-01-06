import { CONFIG } from '../core/config.js';
import { dataClient } from '../core/data-client.js';
import { $, safeText } from '../core/dom.js';
import { theme } from '../theme/theme.js';
import { i18n } from '../i18n/i18n.js';

import { renderGlobalKpis, renderGlobalUpdated } from '../features/global/global.js';
import { renderFearGreed } from '../features/feargreed/feargreed.js';
import { renderNews } from '../features/news/news.js';
import { renderMovers } from '../features/trending/trending.js';
import { createMarketsController } from '../features/markets/markets.js';

async function main() {
  // Theme & i18n
  theme.init();
  await i18n.init();
  i18n.apply(document);

  // SW + generated version
  await dataClient.registerSW();
  const generated = await dataClient.init();

  const buildInfo = $('#buildInfo');
  if (generated?.generated_at) {
    safeText(buildInfo, i18n.t('ui.build', { time: new Date(generated.generated_at).toLocaleString() }));
  } else {
    safeText(buildInfo, 'Data: —');
  }

  // Header controls
  const langLabel = $('#langLabel');
  const langToggle = $('#langToggle');
  const themeToggle = $('#themeToggle');
  const refreshBtn = $('#refreshBtn');

  langLabel.textContent = i18n.lang().toUpperCase();
  langToggle.addEventListener('click', async () => {
    const next = i18n.lang() === 'en' ? 'ru' : 'en';
    await i18n.setLang(next);
    i18n.apply(document);
    langLabel.textContent = i18n.lang().toUpperCase();
    // feargreed labels depend on language
    await loadSidePanels();
  });

  themeToggle.addEventListener('click', async () => {
    theme.toggle();
    // redraw sparklines for correct color variables
    requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
  });

  refreshBtn.addEventListener('click', async () => {
    // Clear caches and reload generated + rerender
    await dataClient.purgeDataCaches({ hard: true });
    await dataClient.init();
    await bootstrap();
  });

  // Bootstrap content
  async function loadSidePanels() {
    const [global, fg, trending, news] = await Promise.all([
      dataClient.getData('global.json').catch(() => null),
      dataClient.getData('feargreed.json').catch(() => null),
      dataClient.getData('trending.json').catch(() => null),
      dataClient.getData('news/latest.json').catch(() => null),
    ]);

    renderGlobalKpis($('#globalKpis'), global);
    renderGlobalUpdated($('#globalUpdated'), dataClient.getGenerated());
    renderFearGreed($('#feargreedInline'), fg);

    renderMovers($('#gainersList'), $('#losersList'), trending);
    renderNews($('#newsList'), news?.items || []);
  }

  async function bootstrap() {
    await loadSidePanels();

    const meta = await dataClient.getData('markets/meta.json').catch(() => null);

    const marketsController = createMarketsController({
      tbody: $('#marketsTbody'),
      tableMetaEl: $('#tableMeta'),
      pageStatusEl: $('#pageStatus'),
      prevBtn: $('#prevPage'),
      nextBtn: $('#nextPage'),
      pageInput: $('#pageInput'),
      goBtn: $('#goPage'),
      pageSizeSelect: $('#pageSizeSelect'),
      searchInput: $('#searchInput'),
      searchHint: $('#searchHint'),
      onNavigateToPage: async (virtualPage, virtualPageSize) => {
        // Data files are generated with base_page_size: meta.base_page_size
        // We compute which base pages to load and slice.
        const m = meta || await dataClient.getData('markets/meta.json');
        const baseSize = m.base_page_size;

        const offset = (virtualPage - 1) * virtualPageSize;
        const need = virtualPageSize;

        const basePage1 = Math.floor(offset / baseSize) + 1;
        const inPageOffset = offset % baseSize;

        const page1 = await dataClient.getData(`markets/page-${basePage1}.json`);
        let coins = page1?.coins || [];

        // If slice spans across pages
        if (inPageOffset + need > coins.length && basePage1 < m.total_pages) {
          const page2 = await dataClient.getData(`markets/page-${basePage1 + 1}.json`);
          coins = coins.concat(page2?.coins || []);
        }

        const sliced = coins.slice(inPageOffset, inPageOffset + need);

        return { coins: sliced, meta: m };
      }
    });

    // Pick default virtual size from meta, else config
    if (meta) {
      meta.default_virtual_page_size = CONFIG.MARKETS.DEFAULT_VIRTUAL_PAGE_SIZE;
      meta.available_page_sizes = meta.available_page_sizes?.length ? meta.available_page_sizes : CONFIG.MARKETS.VIRTUAL_PAGE_SIZES_FALLBACK;
    }

    await marketsController.init(meta);

    // Keep sparklines crisp on resize/theme
    let rAF = 0;
    window.addEventListener('resize', () => {
      cancelAnimationFrame(rAF);
      rAF = requestAnimationFrame(() => {
        // Re-render current page by forcing refresh (cheap: DOM rebuild)
        marketsController.refresh(meta);
      });
    });
  }

  await bootstrap();
}

main().catch((err) => {
  console.error(err);
});
