// Основные криптовалюты с реальными данными
const majorCryptocurrencies = [
    {
        id: "bitcoin",
        rank: 1,
        name: "Bitcoin",
        symbol: "BTC",
        price: 43250.67,
        change24h: 2.34,
        marketCap: 847256123456,
        volume24h: 25456789012,
        sparkline: [42000, 42500, 41800, 43000, 42800, 43200, 43250],
        circulatingSupply: 19629318,
        maxSupply: 21000000
    },
    {
        id: "ethereum",
        rank: 2,
        name: "Ethereum",
        symbol: "ETH",
        price: 2380.45,
        change24h: 1.78,
        marketCap: 286123456789,
        volume24h: 12567890123,
        sparkline: [2300, 2320, 2350, 2370, 2360, 2385, 2380],
        circulatingSupply: 120245678,
        maxSupply: null
    },
    {
        id: "tether",
        rank: 3,
        name: "Tether",
        symbol: "USDT",
        price: 1.00,
        change24h: 0.01,
        marketCap: 95678901234,
        volume24h: 45678901234,
        sparkline: [1, 1, 1, 1, 1, 1, 1],
        circulatingSupply: 95678901234,
        maxSupply: null
    },
    {
        id: "binancecoin",
        rank: 4,
        name: "BNB",
        symbol: "BNB",
        price: 312.67,
        change24h: -0.45,
        marketCap: 48123456789,
        volume24h: 856789012,
        sparkline: [305, 308, 310, 315, 312, 314, 312],
        circulatingSupply: 153856150,
        maxSupply: 200000000
    },
    {
        id: "solana",
        rank: 5,
        name: "Solana",
        symbol: "SOL",
        price: 102.34,
        change24h: 5.67,
        marketCap: 44123456789,
        volume24h: 3456789012,
        sparkline: [95, 97, 98, 101, 103, 104, 102],
        circulatingSupply: 431234567,
        maxSupply: null
    }
];

// Переводы интерфейса
const TRANSLATIONS = {
    ru: {
        // Header
        themeDark: "Тёмная",
        themeLight: "Светлая",
        
        // Promo section
        promoTitle: "Добро пожаловать в Crypto Dashboard",
        promoSubtitle: "Реальный мониторинг крипторынка с продвинутой аналитикой",
        totalMarketCap: "Общая капитализация",
        totalVolume: "Объем 24ч",
        activeCoins: "Активные монеты",
        btcDominance: "Доминирование BTC",
        exploreMarket: "Исследовать рынок",
        features: "Возможности",
        
        // Fear & Greed
        fearGreedTitle: "Индекс Страха и Жадности",
        fearGreedSubtitle: "Индикатор настроений крипторынка в реальном времени",
        currentValue: "Текущее значение",
        marketState: "Состояние рынка",
        updatedJustNow: "Обновлено только что",
        fearGreedDescription: "Индекс показывает текущие настроения на крипторынке. Значения ниже 25 указывают на страх, выше 75 - на жадность.",
        
        // Coins table
        coinsTitle: "Топ Криптовалют",
        coinsSubtitle: "Рейтинг по рыночной капитализации в реальном времени",
        searchPlaceholder: "Поиск по названию или символу...",
        refresh: "Обновить",
        sort: "Сортировка",
        foundCoins: "Найдено {count} монет",
        
        // Table headers
        rank: "#",
        coin: "Монета",
        price: "Цена",
        change24h: "Изменение 24ч",
        marketCap: "Капитализация",
        volume24h: "Объем 24ч",
        chart7d: "График 7д",
        action: "",
        
        // Buttons
        details: "Детали",
        showChart: "Показать график",
        detailedInfo: "Подробное описание",
        
        // Market overview
        marketOverviewTitle: "Обзор рынка",
        marketOverviewSubtitle: "Ключевые метрики и показатели крипторынка",
        totalMarketCapOverview: "Общая капитализация",
        totalVolume24h: "Общий объем 24ч",
        btcDominanceOverview: "Доминирование BTC",
        ethDominance: "Доминирование ETH",
        
        // Pagination
        previous: "← Назад",
        next: "Вперёд →",
        pageInfo: "Страница {current} из {total}",
        pageStats: "Показано {start}-{end} из {total}",
        
        // Modal
        capitalization: "Капитализация",
        volume24hModal: "Объем 24ч",
        circulatingSupply: "Циркулирующее предложение",
        maxSupply: "Максимальное предложение",
        
        // Footer
        copyright: "© 2024 CryptoDashboard. Все права защищены.",
        product: "Продукт",
        company: "Компания",
        support: "Поддержка",
        functions: "Функции",
        mobileApp: "Мобильное приложение",
        about: "О нас",
        blog: "Блог",
        career: "Карьера",
        help: "Помощь",
        contacts: "Контакты",
        community: "Сообщество",
        
        // States
        loading: "Загрузка данных...",
        errorTitle: "Ошибка загрузки",
        errorText: "Не удалось загрузить данные. Пожалуйста, проверьте подключение к интернету.",
        retry: "Повторить попытку",
        
        // Notifications
        dataUpdated: "Данные обновлены",
        copiedToClipboard: "Информация скопирована в буфер обмена"
    },
    en: {
        // Header
        themeDark: "Dark",
        themeLight: "Light",
        
        // Promo section
        promoTitle: "Welcome to Crypto Dashboard",
        promoSubtitle: "Real-time cryptocurrency market monitoring with advanced analytics",
        totalMarketCap: "Total Market Cap",
        totalVolume: "24h Volume",
        activeCoins: "Active Coins",
        btcDominance: "BTC Dominance",
        exploreMarket: "Explore Market",
        features: "Features",
        
        // Fear & Greed
        fearGreedTitle: "Fear & Greed Index",
        fearGreedSubtitle: "Real-time cryptocurrency market sentiment indicator",
        currentValue: "Current Value",
        marketState: "Market State",
        updatedJustNow: "Updated just now",
        fearGreedDescription: "The index shows current market sentiment. Values below 25 indicate fear, above 75 indicate greed.",
        
        // Coins table
        coinsTitle: "Top Cryptocurrencies",
        coinsSubtitle: "Real-time ranking by market capitalization",
        searchPlaceholder: "Search by name or symbol...",
        refresh: "Refresh",
        sort: "Sort",
        foundCoins: "Found {count} coins",
        
        // Table headers
        rank: "#",
        coin: "Coin",
        price: "Price",
        change24h: "24h Change",
        marketCap: "Market Cap",
        volume24h: "24h Volume",
        chart7d: "7d Chart",
        action: "",
        
        // Buttons
        details: "Details",
        showChart: "Show Chart",
        detailedInfo: "Detailed Info",
        
        // Market overview
        marketOverviewTitle: "Market Overview",
        marketOverviewSubtitle: "Key cryptocurrency market metrics and indicators",
        totalMarketCapOverview: "Total Market Cap",
        totalVolume24h: "Total 24h Volume",
        btcDominanceOverview: "BTC Dominance",
        ethDominance: "ETH Dominance",
        
        // Pagination
        previous: "← Previous",
        next: "Next →",
        pageInfo: "Page {current} of {total}",
        pageStats: "Showing {start}-{end} of {total}",
        
        // Modal
        capitalization: "Capitalization",
        volume24hModal: "24h Volume",
        circulatingSupply: "Circulating Supply",
        maxSupply: "Max Supply",
        
        // Footer
        copyright: "© 2024 CryptoDashboard. All rights reserved.",
        product: "Product",
        company: "Company",
        support: "Support",
        functions: "Features",
        mobileApp: "Mobile App",
        about: "About",
        blog: "Blog",
        career: "Career",
        help: "Help",
        contacts: "Contacts",
        community: "Community",
        
        // States
        loading: "Loading data...",
        errorTitle: "Loading Error",
        errorText: "Failed to load data. Please check your internet connection.",
        retry: "Try Again",
        
        // Notifications
        dataUpdated: "Data updated",
        copiedToClipboard: "Information copied to clipboard"
    }
};

class CryptoDashboard {
    constructor() {
        this.currentLanguage = 'ru';
        this.translations = TRANSLATIONS;
        
        // Initialize modules
        this.fearGreedIndex = new FearGreedIndex(this);
        this.coinsManager = new CoinsManager(this);
        this.modalManager = new ModalManager(this);
        
        this.init();
    }

    init() {
        this.initializeEventListeners();
        this.initializeLanguage();
        this.initializeTheme();
        this.loadData();
    }

    initializeEventListeners() {
        // Language switcher
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.changeLanguage(e.target.dataset.lang);
            });
        });

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('change', (e) => {
            this.toggleTheme(e.target.checked);
        });

        // Refresh functionality
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.refreshData();
        });

        // Error retry
        document.getElementById('retryBtn').addEventListener('click', () => {
            this.loadData();
        });

        // Promo buttons
        document.getElementById('exploreBtn').addEventListener('click', () => {
            this.scrollToSection('.coins-section');
        });

        document.getElementById('featuresBtn').addEventListener('click', () => {
            this.showNotification('Функции будут доступны в следующем обновлении');
        });

        // Footer links
        document.querySelectorAll('.footer-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.showNotification('Функция будет доступна в следующем обновлении');
            });
        });

        // Initialize modules
        this.coinsManager.init();
        this.modalManager.init();
    }

    initializeLanguage() {
        const savedLanguage = localStorage.getItem(CONFIG.STORAGE_KEYS.LANGUAGE) || CONFIG.DEFAULT_LANGUAGE;
        this.changeLanguage(savedLanguage);
    }

    initializeTheme() {
        const savedTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME) || CONFIG.DEFAULT_THEME;
        const themeToggle = document.getElementById('themeToggle');
        
        document.documentElement.setAttribute('data-theme', savedTheme);
        themeToggle.checked = savedTheme === 'dark';
        this.updateThemeText();
    }

    changeLanguage(lang) {
        this.currentLanguage = lang;
        localStorage.setItem(CONFIG.STORAGE_KEYS.LANGUAGE, lang);
        this.applyTranslations();
        this.updateLanguageSwitcher();
        this.coinsManager.updatePagination();
    }

    applyTranslations() {
        const t = this.translations[this.currentLanguage];
        
        // Update all text content
        this.updateTextContent('#themeText', document.documentElement.getAttribute('data-theme') === 'dark' ? t.themeDark : t.themeLight);
        this.updateTextContent('#promoTitle', t.promoTitle);
        this.updateTextContent('#promoSubtitle', t.promoSubtitle);
        this.updateTextContent('#fearGreedTitle', t.fearGreedTitle);
        this.updateTextContent('#fearGreedTitle + .section-subtitle', t.fearGreedSubtitle);
        this.updateTextContent('#coinsTitle', t.coinsTitle);
        this.updateTextContent('#coinsTitle + .section-subtitle', t.coinsSubtitle);
        this.updateTextContent('#marketOverviewTitle', t.marketOverviewTitle);
        this.updateTextContent('#marketOverviewTitle + .section-subtitle', t.marketOverviewSubtitle);
        
        // Update labels and buttons
        this.updateStatLabels();
        this.updateTableHeaders();
        this.updateButtons();
        this.updateFooter();
        this.updateErrorState();
    }

    updateTextContent(selector, text) {
        const element = document.querySelector(selector);
        if (element) element.textContent = text;
    }

    updateStatLabels() {
        const t = this.translations[this.currentLanguage];
        const statLabels = document.querySelectorAll('.stat-label');
        if (statLabels.length >= 4) {
            statLabels[0].textContent = t.totalMarketCap;
            statLabels[1].textContent = t.totalVolume;
            statLabels[2].textContent = t.activeCoins;
            statLabels[3].textContent = t.btcDominance;
        }
    }

    updateTableHeaders() {
        const t = this.translations[this.currentLanguage];
        const headerRow = document.querySelector('.header-row');
        if (headerRow) {
            const headers = headerRow.querySelectorAll('div[role="columnheader"]');
            headers[0].textContent = t.rank;
            headers[1].textContent = t.coin;
            headers[2].textContent = t.price;
            headers[3].textContent = t.change24h;
            headers[4].textContent = t.marketCap;
            headers[5].textContent = t.volume24h;
            headers[6].textContent = t.chart7d;
        }
    }

    updateButtons() {
        const t = this.translations[this.currentLanguage];
        document.getElementById('searchInput').placeholder = t.searchPlaceholder;
        this.updateTextContent('#refreshBtn span', t.refresh);
        this.updateTextContent('#sortBtn span', t.sort);
        this.updateTextContent('#exploreBtn span', t.exploreMarket);
        this.updateTextContent('#featuresBtn span', t.features);
        this.updateTextContent('#retryBtn span', t.retry);
    }

    updateFooter() {
        const t = this.translations[this.currentLanguage];
        this.updateTextContent('#footerText', t.copyright);
        
        const footerTitles = document.querySelectorAll('.footer-title');
        if (footerTitles.length >= 3) {
            footerTitles[0].textContent = t.product;
            footerTitles[1].textContent = t.company;
            footerTitles[2].textContent = t.support;
        }
    }

    updateErrorState() {
        const t = this.translations[this.currentLanguage];
        this.updateTextContent('.error-title', t.errorTitle);
        this.updateTextContent('.error-text', t.errorText);
        this.updateTextContent('#retryBtn span', t.retry);
        this.updateTextContent('#loadingState p', t.loading);
    }

    updateLanguageSwitcher() {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === this.currentLanguage);
        });
    }

    toggleTheme(isDark) {
        const theme = isDark ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, theme);
        this.updateThemeText();
    }

    updateThemeText() {
        const t = this.translations[this.currentLanguage];
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        this.updateTextContent('#themeText', isDark ? t.themeDark : t.themeLight);
    }

    async loadData() {
        this.showLoadingState();
        
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Initialize Fear & Greed Index
            await this.fearGreedIndex.init();
            
            this.hideLoadingState();
            this.hideErrorState();
        } catch (error) {
            this.showErrorState();
        }
    }

    showLoadingState() {
        document.getElementById('loadingState').style.display = 'block';
        document.getElementById('errorState').style.display = 'none';
    }

    hideLoadingState() {
        document.getElementById('loadingState').style.display = 'none';
    }

    showErrorState() {
        document.getElementById('errorState').style.display = 'block';
        document.getElementById('loadingState').style.display = 'none';
    }

    hideErrorState() {
        document.getElementById('errorState').style.display = 'none';
    }

    refreshData() {
        this.coinsManager.refreshData();
        this.fearGreedIndex.loadData().then(() => {
            this.fearGreedIndex.render();
        });
    }

    scrollToSection(selector) {
        const section = document.querySelector(selector);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--accent-color);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: var(--shadow-lg);
            z-index: 10001;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Utility functions
    formatPrice(price) {
        return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    formatNumber(num, decimals = 2) {
        if (num === null || num === undefined) return 'N/A';
        
        if (num >= 1e9) {
            return '$' + (num / 1e9).toFixed(decimals) + 'B';
        } else if (num >= 1e6) {
            return '$' + (num / 1e6).toFixed(decimals) + 'M';
        } else if (num >= 1e3) {
            return '$' + (num / 1e3).toFixed(decimals) + 'K';
        } else {
            return '$' + num.toFixed(decimals);
        }
    }

    formatPercent(num) {
        if (num === null || num === undefined) return 'N/A';
        return (num > 0 ? '+' : '') + num.toFixed(2) + '%';
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CryptoDashboard();
});
