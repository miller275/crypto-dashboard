// ===== КОНФИГУРАЦИЯ ПРИЛОЖЕНИЯ =====
const CONFIG = {
    // Настройки отображения
    coinsPerPage: 20,
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
        priceChange24h: 'Изменение цены за 24ч'
    },
    en: {
        // Main elements
        siteLogo: 'CryptoDrom',
        themeText: 'Dark',
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
        priceChange24h: 'Price Change 24h'
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
        sparkline_in_7d: {
            price: [0.121, 0.1205, 0.1202, 0.1201, 0.1200, 0.1198, 0.1195, 0.1190, 0.1185, 0.12]
        }
    },
    {
        id: "solana",
        name: "Solana",
        symbol: "sol",
        image: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
        current_price: 146.28,
        price_change_percentage_24h: 4.2,
        market_cap: 65000000000,
        total_volume: 2850000000,
        market_cap_rank: 7,
        sparkline_in_7d: {
            price: [140, 142, 143, 144, 145, 145.5, 146, 146.2, 146.25, 146.28]
        }
    },
    {
        id: "polkadot",
        name: "Polkadot",
        symbol: "dot",
        image: "https://assets.coingecko.com/coins/images/12171/small/polkadot.png",
        current_price: 6.98,
        price_change_percentage_24h: -2.1,
        market_cap: 8900000000,
        total_volume: 280000000,
        market_cap_rank: 8,
        sparkline_in_7d: {
            price: [7.10, 7.05, 7.02, 7.00, 6.98, 6.97, 6.96, 6.97, 6.98, 6.98]
        }
    },
    {
        id: "chainlink",
        name: "Chainlink",
        symbol: "link",
        image: "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png",
        current_price: 14.23,
        price_change_percentage_24h: 1.5,
        market_cap: 8100000000,
        total_volume: 350000000,
        market_cap_rank: 9,
        sparkline_in_7d: {
            price: [14.00, 14.05, 14.10, 14.15, 14.18, 14.20, 14.22, 14.23, 14.23, 14.23]
        }
    },
    {
        id: "litecoin",
        name: "Litecoin",
        symbol: "ltc",
        image: "https://assets.coingecko.com/coins/images/2/small/litecoin.png",
        current_price: 68.45,
        price_change_percentage_24h: 0.9,
        market_cap: 5100000000,
        total_volume: 380000000,
        market_cap_rank: 10,
        sparkline_in_7d: {
            price: [67.80, 67.90, 68.00, 68.10, 68.20, 68.30, 68.35, 68.40, 68.43, 68.45]
        }
    }
];

// ===== КОНСТАНТЫ =====
const CONSTANTS = {
    // Цвета для графиков
    CHART_COLORS: {
        positive: '#10b981',
        negative: '#ef4444',
        neutral: '#6b7280'
    },
    
    // Fear & Greed диапазоны
    FEAR_GREED_RANGES: {
        extremeFear: { min: 0, max: 25 },
        fear: { min: 26, max: 45 },
        neutral: { min: 46, max: 55 },
        greed: { min: 56, max: 75 },
        extremeGreed: { min: 76, max: 100 }
    },
    
    // Breakpoints для адаптивности
    BREAKPOINTS: {
        mobile: 768,
        tablet: 1024,
        desktop: 1200
    },
    
    // URL для внешних сервисов
    EXTERNAL_URLS: {
        tradingView: 'https://www.tradingview.com/symbols',
        coinGecko: 'https://www.coingecko.com/en/coins',
        coinMarketCap: 'https://coinmarketcap.com/currencies'
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
                coinsPerPage: CONFIG.coinsPerPage
            };
            localStorage.setItem('cryptoDashboardConfig', JSON.stringify(configToSave));
        } catch (error) {
            console.error('Ошибка сохранения конфигурации:', error);
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
                CONFIG.coinsPerPage = config.coinsPerPage || 20;
            }
        } catch (error) {
            console.error('Ошибка загрузки конфигурации:', error);
        }
    },

    // Сброс настроек к значениям по умолчанию
    resetToDefaults: function() {
        CONFIG.currentLang = 'ru';
        CONFIG.currentTheme = 'dark';
        CONFIG.coinsPerPage = 20;
        CONFIG.currentPage = 1;
        this.saveToStorage();
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
    }
};

// ===== API КОНФИГУРАЦИЯ =====
const API_CONFIG = {
    endpoints: {
        coins: '/coins/markets',
        coinDetails: '/coins/{id}',
        global: '/global',
        trends: '/search/trending'
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
    }
};

// Инициализация конфигурации при загрузке
if (typeof window !== 'undefined') {
    ConfigUtils.loadFromStorage();
}
