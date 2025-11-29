// ===== КОНФИГУРАЦИЯ ПРИЛОЖЕНИЯ =====
const CONFIG = {
  coinsPerPage: 20,
  currentPage: 1,
  currentLang: 'ru',
  currentTheme: 'dark'
};

// ===== ДАННЫЕ ДЛЯ ПОИСКА =====
let allCoinsCache = [];

// ===== ПЕРЕВОДЫ =====
const TRANSLATIONS = {
  ru: {
    siteLogo: 'CryptoDrom',
    themeText: 'Тёмная',
    promoTitle: 'Добро пожаловать в Crypto Dashboard',
    promoSubtitle: 'Ваш центр для анализа рынка и кастомизации интерфейса.',
    promoBtn: 'Вперёд',
    coinsTitle: 'Топ Криптовалют',
    searchPlaceholder: 'Поиск криптовалют...',
    fearGreedTitle: 'Индекс Страха и Жадности',
    footerText: '© 2024 CryptoDashboard. Все права защищены.',
    page: 'Страница',
    tradingView: 'TradingView',
    details: 'Детали',
    loading: 'Загрузка...',
    error: 'Ошибка загрузки',
    retry: 'Повторить',
    noResults: 'Ничего не найдено',
    changeSearch: 'Попробуйте изменить запрос'
  },
  en: {
    siteLogo: 'CryptoDrom',
    themeText: 'Dark',
    promoTitle: 'Welcome to Crypto Dashboard',
    promoSubtitle: 'Your hub for market analysis and interface customization.',
    promoBtn: 'Get Started',
    coinsTitle: 'Top Cryptocurrencies',
    searchPlaceholder: 'Search cryptocurrencies...',
    fearGreedTitle: 'Fear & Greed Index',
    footerText: '© 2024 CryptoDashboard. All rights reserved.',
    page: 'Page',
    tradingView: 'TradingView',
    details: 'Details',
    loading: 'Loading...',
    error: 'Load error',
    retry: 'Retry',
    noResults: 'No results found',
    changeSearch: 'Try changing your search'
  }
};

// ===== ТЕСТОВЫЕ ДАННЫЕ =====
const TEST_COINS = [
  {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "btc",
    image: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
    current_price: 58728.42,
    price_change_percentage_24h: 2.5
  },
  {
    id: "ethereum",
    name: "Ethereum", 
    symbol: "eth",
    image: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
    current_price: 2935.51,
    price_change_percentage_24h: -1.2
  },
  {
    id: "tether",
    name: "Tether",
    symbol: "usdt",
    image: "https://assets.coingecko.com/coins/images/325/small/Tether.png",
    current_price: 1.00,
    price_change_percentage_24h: 0.0
  },
  {
    id: "ripple",
    name: "XRP",
    symbol: "xrp",
    image: "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png",
    current_price: 0.52,
    price_change_percentage_24h: 0.39
  },
  {
    id: "cardano",
    name: "Cardano",
    symbol: "ada",
    image: "https://assets.coingecko.com/coins/images/975/small/cardano.png",
    current_price: 0.48,
    price_change_percentage_24h: 1.8
  },
  {
    id: "dogecoin",
    name: "Dogecoin",
    symbol: "doge",
    image: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png",
    current_price: 0.12,
    price_change_percentage_24h: -0.5
  }
];
