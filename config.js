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
    ITEMS_PER_PAGE: 10,
    AUTO_REFRESH_INTERVAL: 60000, // 1 минута
    
    // Настройки темы
    DEFAULT_THEME: 'dark',
    THEMES: ['light', 'dark'],
    
    // Настройки языка
    DEFAULT_LANGUAGE: 'ru',
    LANGUAGES: ['ru', 'en'],
    
    // Fear & Greed Index API
    FEAR_GREED_API: 'https://api.alternative.me/fng/',
    
    // Локальное хранилище
    STORAGE_KEYS: {
        THEME: 'crypto_dashboard_theme',
        LANGUAGE: 'crypto_dashboard_language',
        WATCHLIST: 'crypto_dashboard_watchlist',
        FAVORITES: 'crypto_dashboard_favorites'
    }
};
