// ===== КОНФИГУРАЦИЯ ПРИЛОЖЕНИЯ =====
const CONFIG = {
    // Настройки отображения
    coinsPerPage: 10,
    currentPage: 1,
    
    // Язык и тема
    currentLang: 'ru',
    currentTheme: 'dark',
    
    // Сортировка
    sortField: 'market_cap_rank',
    sortDirection: 'asc',
    
    // API настройки
    apiUrl: 'https://api.coingecko.com/api/v3',
    apiTimeout: 10000,
    
    // Fear & Greed Index
    fearGreedValue: 75,
    fearGreedState: 'greed',
    
    // Настройки кэширования
    cacheDuration: 5 * 60 * 1000, // 5 минут
    enableCache: true,
    
    // Настройки обновления
    autoRefresh: true,
    refreshInterval: 60 * 1000, // 1 минута
};

// ===== ПЕРЕВОДЫ =====
const TRANSLATIONS = {
    ru: {
        // Основные элементы
        siteLogo: 'CryptoDrom',
        themeText: 'Тёмная',
        lightThemeText: 'Светлая',
        promoTitle: 'Добро пожаловать в Crypto Dashboard',
        promoSubtitle: 'Ваш центр для анализа рынка и кастомизации интерфейса.',
        promoBtn: 'Вперёд',
        coinsTitle: 'Топ Криптовалют',
        fearGreedTitle: 'Индекс Страха и Жадности',
        footerText: '© 2024 CryptoDashboard. Все права защищены.',
        
        // Пагинация
        page: 'Страница',
        prevPage: 'Назад',
        nextPage: 'Вперёд',
        
        // Действия
        tradingView: 'TradingView',
        details: 'Детали',
        close: 'Закрыть',
        loading: 'Загрузка...',
        error: 'Ошибка загрузки',
        retry: 'Повторить',
        noResults: 'Ничего не найдено',
        changeSearch: 'Попробуйте изменить запрос',
        showAll: 'Показать все',
        
        // Статистика
        marketCap: 'Капитализация',
        volume: 'Объем 24ч',
        lastUpdate: 'Обновлено',
        price: 'Цена',
        change24h: 'Изменение 24ч',
        rank: 'Ранг',
        sparkline: 'График 7д',
        
        // Fear & Greed состояния
        extremeFear: 'Крайний страх',
        fear: 'Страх',
        neutral: 'Нейтрально',
        greed: 'Жадность',
        extremeGreed: 'Крайняя жадность',
        currentValue: 'Текущее значение',
        marketState: 'Состояние рынка',
        
        // Поиск
        showing: 'Показано',
        of: 'из',
        results: 'результатов',
        for: 'для',
        
        // Модальное окно
        marketShare: 'Рыночная доля',
        priceChange24h: 'Изменение цены за 24ч',
        totalVolume: 'Общий объем',
        high24h: 'Макс за 24ч',
        low24h: 'Мин за 24ч'
    },
    en: {
        // Main elements
        siteLogo: 'CryptoDrom',
        themeText: 'Dark',
        lightThemeText: 'Light',
        promoTitle: 'Welcome to Crypto Dashboard',
        promoSubtitle: 'Your hub for market analysis and interface customization.',
        promoBtn: 'Get Started',
        coinsTitle: 'Top Cryptocurrencies',
        fearGreedTitle: 'Fear & Greed Index',
        footerText: '© 2024 CryptoDashboard. All rights reserved.',
        
        // Pagination
        page: 'Page',
        prevPage: 'Previous',
        nextPage: 'Next',
        
        // Actions
        tradingView: 'TradingView',
        details: 'Details',
        close: 'Close',
        loading: 'Loading...',
        error: 'Load error',
        retry: 'Retry',
        noResults: 'No results found',
        changeSearch: 'Try changing your search',
        showAll: 'Show all',
        
        // Statistics
        marketCap: 'Market Cap',
        volume: '24h Volume',
        lastUpdate: 'Last update',
        price: 'Price',
        change24h: '24h Change',
        rank: 'Rank',
        sparkline: '7D Chart',
        
        // Fear & Greed states
        extremeFear: 'Extreme Fear',
        fear: 'Fear',
        neutral: 'Neutral',
        greed: 'Greed',
        extremeGreed: 'Extreme Greed',
        currentValue: 'Current Value',
        marketState: 'Market State',
        
        // Search
        showing: 'Showing',
        of: 'of',
        results: 'results',
        for: 'for',
        
        // Modal
        marketShare: 'Market Share',
        priceChange24h: 'Price Change 24h',
        totalVolume: 'Total Volume',
        high24h: '24h High',
        low24h: '24h Low'
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
        price_change_percentage_24h: 2.5,
        market_cap: 1150000000000,
        total_volume: 28500000000,
        market_cap_rank: 1,
        high_24h: 59000,
        low_24h: 58000,
        sparkline_in_7d: {
            price: [56900, 57200, 57500, 57800, 58100, 58300, 58500, 58600, 58700, 58728]
        }
    },
    {
        id: "ethereum",
        name: "Ethereum", 
        symbol: "eth",
        image: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
        current_price: 2935.51,
        price_change_percentage_24h: -1.2,
        market_cap: 352000000000,
        total_volume: 15200000000,
        market_cap_rank: 2,
        high_24h: 2980,
        low_24h: 2900,
        sparkline_in_7d: {
            price: [2980, 2970, 2960, 2950, 2945, 2940, 2938, 2936, 2935, 2935.51]
        }
    },
    {
        id: "tether",
        name: "Tether",
        symbol: "usdt",
        image: "https://assets.coingecko.com/coins/images/325/small/Tether.png",
        current_price: 1.00,
        price_change_percentage_24h: 0.0,
        market_cap: 95600000000,
        total_volume: 45200000000,
        market_cap_rank: 3,
        high_24h: 1.001,
        low_24h: 0.999,
        sparkline_in_7d: {
            price: [1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00]
        }
    },
    {
        id: "ripple",
        name: "XRP",
        symbol: "xrp",
        image: "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png",
        current_price: 0.52,
        price_change_percentage_24h: 0.39,
        market_cap: 28500000000,
        total_volume: 1250000000,
        market_cap_rank: 4,
        high_24h: 0.525,
        low_24h: 0.515,
        sparkline_in_7d: {
            price: [0.51, 0.515, 0.518, 0.519, 0.520, 0.521, 0.522, 0.521, 0.520, 0.52]
        }
    },
    {
        id: "cardano",
        name: "Cardano",
        symbol: "ada",
        image: "https://assets.coingecko.com/coins/images/975/small/cardano.png",
        current_price: 0.48,
        price_change_percentage_24h: 1.8,
        market_cap: 17000000000,
        total_volume: 450000000,
        market_cap_rank: 5,
        high_24h: 0.485,
        low_24h: 0.475,
        sparkline_in_7d: {
            price: [0.47, 0.472, 0.474, 0.476, 0.477, 0.478, 0.479, 0.480, 0.481, 0.48]
        }
    },
    {
        id: "dogecoin",
        name: "Dogecoin",
        symbol: "doge",
        image: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png",
        current_price: 0.12,
        price_change_percentage_24h: -0.5,
        market_cap: 17200000000,
        total_volume: 850000000,
        market_cap_rank: 6,
        high_24h: 0.122,
        low_24h: 0.118,
        sparkline_in_7d: {
            price: [0.121, 0.1205, 0.1202, 0.1201, 0.1200, 0.1198, 0.1195, 0.1190, 0.1185, 0.12]
        }
    }
];

// ===== КОНСТАНТЫ =====
const CONSTANTS = {
    // Цвета для графиков
    CHART_COLORS: {
        positive: '#10b981',
        negative: '#ef4444',
        neutral: '#6b7280',
        background: 'transparent',
        border: '#3b82f6'
    },
    
    // Fear & Greed диапазоны
    FEAR_GREED_RANGES: {
        extremeFear: { min: 0, max: 25, color: '#dc2626' },
        fear: { min: 26, max: 45, color: '#f59e0b' },
        neutral: { min: 46, max: 55, color: '#eab308' },
        greed: { min: 56, max: 75, color: '#84cc16' },
        extremeGreed: { min: 76, max: 100, color: '#16a34a' }
    },
    
    // Breakpoints для адаптивности
    BREAKPOINTS: {
        mobile: 768,
        tablet: 1024,
        desktop: 1200
    },
    
    // URL для внешних сервисов
    EXTERNAL_URLS: {
        tradingView: 'https://www.tradingview.com/chart',
        coinGecko: 'https://www.coingecko.com/en/coins',
        coinMarketCap: 'https://coinmarketcap.com/currencies'
    },
    
    // Форматы чисел
    NUMBER_FORMATS: {
        currency: {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        },
        percentage: {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        },
        compact: {
            notation: 'compact',
            compactDisplay: 'short'
        }
    }
};

// ===== УТИЛИТЫ КОНФИГУРАЦИИ =====
const ConfigUtils = {
    // Сохранение настроек в localStorage
    saveToStorage: function() {
        try {
            const configToSave = {
                currentLang: CONFIG.currentLang,
                currentTheme: CONFIG.currentTheme,
                coinsPerPage: CONFIG.coinsPerPage,
                sortField: CONFIG.sortField,
                sortDirection: CONFIG.sortDirection,
                autoRefresh: CONFIG.autoRefresh
            };
            localStorage.setItem('cryptoDashboardConfig', JSON.stringify(configToSave));
            return true;
        } catch (error) {
            console.error('Ошибка сохранения конфигурации:', error);
            return false;
        }
    },

    // Загрузка настроек из localStorage
    loadFromStorage: function() {
        try {
            const savedConfig = localStorage.getItem('cryptoDashboardConfig');
            if (savedConfig) {
                const config = JSON.parse(savedConfig);
                CONFIG.currentLang = config.currentLang || 'ru';
                CONFIG.currentTheme = config.currentTheme || 'dark';
                CONFIG.coinsPerPage = config.coinsPerPage || 10;
                CONFIG.sortField = config.sortField || 'market_cap_rank';
                CONFIG.sortDirection = config.sortDirection || 'asc';
                CONFIG.autoRefresh = config.autoRefresh !== undefined ? config.autoRefresh : true;
                return true;
            }
        } catch (error) {
            console.error('Ошибка загрузки конфигурации:', error);
        }
        return false;
    },

    // Сброс настроек к значениям по умолчанию
    resetToDefaults: function() {
        CONFIG.currentLang = 'ru';
        CONFIG.currentTheme = 'dark';
        CONFIG.coinsPerPage = 10;
        CONFIG.currentPage = 1;
        CONFIG.sortField = 'market_cap_rank';
        CONFIG.sortDirection = 'asc';
        CONFIG.autoRefresh = true;
        this.saveToStorage();
        return true;
    },

    // Проверка поддержки localStorage
    isStorageSupported: function() {
        try {
            const test = 'test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    },

    // Обновление конфигурации
    updateConfig: function(newConfig) {
        Object.keys(newConfig).forEach(key => {
            if (CONFIG.hasOwnProperty(key)) {
                CONFIG[key] = newConfig[key];
            }
        });
        return this.saveToStorage();
    },

    // Получение текущей конфигурации
    getConfig: function() {
        return { ...CONFIG };
    }
};

// ===== API КОНФИГУРАЦИЯ =====
const API_CONFIG = {
    endpoints: {
        coins: '/coins/markets',
        coinDetails: '/coins/{id}',
        global: '/global',
        trends: '/search/trending',
        fearGreed: '/fear_and_greed'
    },
    
    parameters: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 250,
        page: 1,
        sparkline: true,
        price_change_percentage: '24h,7d,30d'
    },
    
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },

    // Методы для работы с API
    methods: {
        // Получение URL для endpoint
        getUrl: function(endpoint, params = {}) {
            let url = CONFIG.apiUrl + this.endpoints[endpoint];
            
            // Замена параметров в URL
            Object.keys(params).forEach(key => {
                url = url.replace(`{${key}}`, params[key]);
            });
            
            return url;
        },

        // Получение параметров запроса
        getParams: function(additionalParams = {}) {
            return { ...this.parameters, ...additionalParams };
        },

        // Создание полного URL с параметрами
        buildRequest: function(endpoint, urlParams = {}, queryParams = {}) {
            const url = this.getUrl(endpoint, urlParams);
            const params = this.getParams(queryParams);
            
            const queryString = new URLSearchParams(params).toString();
            return queryString ? `${url}?${queryString}` : url;
        }
    }
};

// ===== УТИЛИТЫ ДЛЯ РАБОТЫ С ДАННЫМИ =====
const DataUtils = {
    // Форматирование валюты
    formatCurrency: function(value, currency = 'USD') {
        return new Intl.NumberFormat(CONFIG.currentLang === 'ru' ? 'ru-RU' : 'en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: value < 1 ? 6 : 2
        }).format(value);
    },

    // Форматирование процентов
    formatPercentage: function(value) {
        return new Intl.NumberFormat(CONFIG.currentLang === 'ru' ? 'ru-RU' : 'en-US', {
            style: 'percent',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value / 100);
    },

    // Форматирование больших чисел
    formatNumber: function(value) {
        if (value >= 1000000000) {
            return (value / 1000000000).toFixed(2) + 'B';
        } else if (value >= 1000000) {
            return (value / 1000000).toFixed(2) + 'M';
        } else if (value >= 1000) {
            return (value / 1000).toFixed(2) + 'K';
        }
        return value.toString();
    },

    // Получение класса для изменения цены
    getChangeClass: function(change) {
        if (change > 0) return 'change-positive';
        if (change < 0) return 'change-negative';
        return 'change-neutral';
    },

    // Получение состояния Fear & Greed по значению
    getFearGreedState: function(value) {
        const ranges = CONSTANTS.FEAR_GREED_RANGES;
        if (value <= ranges.extremeFear.max) return 'extremeFear';
        if (value <= ranges.fear.max) return 'fear';
        if (value <= ranges.neutral.max) return 'neutral';
        if (value <= ranges.greed.max) return 'greed';
        return 'extremeGreed';
    }
};

// Инициализация конфигурации при загрузке
if (typeof window !== 'undefined') {
    ConfigUtils.loadFromStorage();
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CONFIG,
        TRANSLATIONS,
        TEST_COINS,
        CONSTANTS,
        ConfigUtils,
        API_CONFIG,
        DataUtils
    };
}
