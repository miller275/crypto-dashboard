export const CONFIG = {
  APP_NAME: 'PulseMarkets',
  DEFAULT_LANG: 'en',
  DEFAULT_THEME: 'dark',

  PATHS: {
    DATA: './data',
    LOCALES: './assets/js/i18n/locales',
    COIN_LOGOS: './assets/img/coins',
  },

  MARKETS: {
    // Front-end supports "virtual" page sizes; files in /data/markets are generated with meta.base_page_size
    DEFAULT_VIRTUAL_PAGE_SIZE: 100,
    VIRTUAL_PAGE_SIZES_FALLBACK: [50, 100, 200],
  },

  SW: {
    ENABLED: true,
    PATH: './sw.js',
  },
};
