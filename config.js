// Конфигурация приложения
const CONFIG = {
    // Основные настройки
    APP_NAME: 'CryptoDrom',
    VERSION: '1.0.0',
    
    // Настройки API
    API_BASE_URL: 'https://api.coingecko.com/api/v3',
    API_TIMEOUT: 10000,
    
    // Настройки отображения
    DEFAULT_CURRENCY: 'USD',
    ITEMS_PER_PAGE: 20,
    AUTO_REFRESH_INTERVAL: 60000, // 1 минута
    
    // Настройки темы
    DEFAULT_THEME: 'dark',
    THEMES: ['light', 'dark'],
    
    // Настройки языка
    DEFAULT_LANGUAGE: 'ru',
    LANGUAGES: ['ru', 'en'],
    
    // Ключевые криптовалюты для отслеживания
    MAJOR_CRYPTOCURRENCIES: [
        'bitcoin', 'ethereum', 'tether', 'binancecoin', 'solana',
        'ripple', 'cardano', 'dogecoin', 'polkadot', 'chainlink',
        'litecoin', 'bitcoin-cash', 'stellar', 'uniswap', 'monero',
        'ethereum-classic', 'vechain', 'filecoin', 'tezos', 'eos'
    ],
    
    // Настройки Fear & Greed Index
    FEAR_GREED_API: 'https://api.alternative.me/fng/',
    
    // Локальное хранилище
    STORAGE_KEYS: {
        THEME: 'crypto_dashboard_theme',
        LANGUAGE: 'crypto_dashboard_language',
        WATCHLIST: 'crypto_dashboard_watchlist',
        FAVORITES: 'crypto_dashboard_favorites'
    }
};

// Экспорт конфигурации
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
