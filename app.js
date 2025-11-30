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
    },
    {
        id: "ripple",
        rank: 6,
        name: "XRP",
        symbol: "XRP",
        price: 0.57,
        change24h: -1.23,
        marketCap: 31123456789,
        volume24h: 1234567890,
        sparkline: [0.58, 0.575, 0.57, 0.572, 0.568, 0.571, 0.57],
        circulatingSupply: 54345678901,
        maxSupply: 100000000000
    },
    {
        id: "cardano",
        rank: 7,
        name: "Cardano",
        symbol: "ADA",
        price: 0.52,
        change24h: 3.45,
        marketCap: 18234567890,
        volume24h: 567890123,
        sparkline: [0.50, 0.51, 0.52, 0.515, 0.518, 0.525, 0.52],
        circulatingSupply: 35000123456,
        maxSupply: 45000000000
    },
    {
        id: "dogecoin",
        rank: 8,
        name: "Dogecoin",
        symbol: "DOGE",
        price: 0.083,
        change24h: -2.34,
        marketCap: 11876543210,
        volume24h: 678901234,
        sparkline: [0.085, 0.084, 0.083, 0.082, 0.084, 0.083, 0.083],
        circulatingSupply: 143076046384,
        maxSupply: null
    },
    {
        id: "polkadot",
        rank: 9,
        name: "Polkadot",
        symbol: "DOT",
        price: 7.23,
        change24h: 1.56,
        marketCap: 9234567890,
        volume24h: 345678901,
        sparkline: [7.10, 7.15, 7.20, 7.25, 7.22, 7.24, 7.23],
        circulatingSupply: 1274567890,
        maxSupply: null
    },
    {
        id: "chainlink",
        rank: 10,
        name: "Chainlink",
        symbol: "LINK",
        price: 14.56,
        change24h: 4.32,
        marketCap: 8234567890,
        volume24h: 456789012,
        sparkline: [13.90, 14.00, 14.20, 14.40, 14.50, 14.55, 14.56],
        circulatingSupply: 567890123,
        maxSupply: 1000000000
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
        addToWatchlist: "Добавить в отслеживаемые",
        share: "Поделиться",
        
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
        addedToWatchlist: "добавлен в список отслеживаемых",
        alreadyInWatchlist: "уже в списке отслеживаемых",
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
        addToWatchlist: "Add to Watchlist",
        share: "Share",
        
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
        addedToWatchlist: "added to watchlist",
        alreadyInWatchlist: "already in watchlist",
        dataUpdated: "Data updated",
        copiedToClipboard: "Information copied to clipboard"
    }
};

class CryptoDashboard {
    constructor() {
        this.currentLanguage = 'ru';
        this.currentPage = 1;
        this.coinsPerPage = 10;
        this.currentSort = 'rank';
        this.currentSortAscending = true;
        this.filteredCoins = [...majorCryptocurrencies];
        
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

        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        document.getElementById('searchClear').addEventListener('click', () => {
            this.clearSearch();
        });

        // Table actions
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.refreshData();
        });

        document.getElementById('sortBtn').addEventListener('click', () => {
            this.toggleSort();
        });

        // Pagination
        document.getElementById('prevPage').addEventListener('click', () => {
            this.previousPage();
        });

        document.getElementById('nextPage').addEventListener('click', () => {
            this.nextPage();
        });

        // Error retry
        document.getElementById('retryBtn').addEventListener('click', () => {
            this.loadData();
        });

        // Modal close
        document.getElementById('modalClose').addEventListener('click', () => {
            this.closeModal();
        });

        // Modal backdrop close
        document.getElementById('coinModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('coinModal')) {
                this.closeModal();
            }
        });

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    initializeLanguage() {
        const savedLanguage = localStorage.getItem('crypto_dashboard_language') || 'ru';
        this.changeLanguage(savedLanguage);
    }

    initializeTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        const themeToggle = document.getElementById('themeToggle');
        
        document.documentElement.setAttribute('data-theme', savedTheme);
        themeToggle.checked = savedTheme === 'dark';
        this.updateThemeText();
    }

    changeLanguage(lang) {
        this.currentLanguage = lang;
        localStorage.setItem('crypto_dashboard_language', lang);
        this.applyTranslations();
        this.updateLanguageSwitcher();
        this.updatePaginationText();
    }

    applyTranslations() {
        const t = TRANSLATIONS[this.currentLanguage];
        
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
        const t = TRANSLATIONS[this.currentLanguage];
        const statLabels = document.querySelectorAll('.stat-label');
        if (statLabels.length >= 4) {
            statLabels[0].textContent = t.totalMarketCap;
            statLabels[1].textContent = t.totalVolume;
            statLabels[2].textContent = t.activeCoins;
            statLabels[3].textContent = t.btcDominance;
        }
    }

    updateTableHeaders() {
        const t = TRANSLATIONS[this.currentLanguage];
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
        const t = TRANSLATIONS[this.currentLanguage];
        this.updateTextContent('#searchInput', '', t.searchPlaceholder);
        document.getElementById('searchInput').placeholder = t.searchPlaceholder;
        this.updateTextContent('#refreshBtn span', t.refresh);
        this.updateTextContent('#sortBtn span', t.sort);
        this.updateTextContent('#exploreBtn span', t.exploreMarket);
        this.updateTextContent('#featuresBtn span', t.features);
        this.updateTextContent('#retryBtn span', t.retry);
    }

    updateFooter() {
        const t = TRANSLATIONS[this.currentLanguage];
        this.updateTextContent('#footerText', t.copyright);
        
        const footerTitles = document.querySelectorAll('.footer-title');
        if (footerTitles.length >= 3) {
            footerTitles[0].textContent = t.product;
            footerTitles[1].textContent = t.company;
            footerTitles[2].textContent = t.support;
        }
    }

    updateErrorState() {
        const t = TRANSLATIONS[this.currentLanguage];
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
        localStorage.setItem('theme', theme);
        this.updateThemeText();
    }

    updateThemeText() {
        const t = TRANSLATIONS[this.currentLanguage];
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        this.updateTextContent('#themeText', isDark ? t.themeDark : t.themeLight);
    }

    async loadData() {
        this.showLoadingState();
        
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            this.renderCoinsTable();
            this.updatePagination();
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

    renderCoinsTable() {
        const coinsTable = document.getElementById('coinsTable');
        const startIndex = (this.currentPage - 1) * this.coinsPerPage;
        const endIndex = startIndex + this.coinsPerPage;
        const coinsToShow = this.filteredCoins.slice(startIndex, endIndex);

        coinsTable.innerHTML = '';

        coinsToShow.forEach(coin => {
            const row = this.createCoinRow(coin);
            coinsTable.appendChild(row);
        });
    }

    createCoinRow(coin) {
        const isPositive = coin.change24h >= 0;
        const changeClass = isPositive ? 'positive' : 'negative';
        const t = TRANSLATIONS[this.currentLanguage];

        const row = document.createElement('div');
        row.className = 'table-row coin-row';
        row.setAttribute('data-coin-id', coin.id);

        row.innerHTML = `
            <div class="col-rank">${coin.rank}</div>
            <div class="col-name">
                <img class="coin-icon-table" 
                     src="https://coinicons-api.vercel.app/api/icon/${coin.symbol.toLowerCase()}" 
                     alt="${coin.name}"
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iIzMzMyIvPjx0ZXh0IHg9IjE2IiB5PSIyMSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtZmFtaWx5PSJBcmlhbCI+${coin.symbol.charAt(0)}</dGV4dD48L3N2Zz4='">
                <div class="coin-name-table">
                    <span class="coin-name-main">${coin.name}</span>
                    <span class="coin-symbol-table">${coin.symbol}</span>
                </div>
            </div>
            <div class="col-price">$${this.formatPrice(coin.price)}</div>
            <div class="col-change">
                <span class="change-table ${changeClass}">${this.formatPercent(coin.change24h)}</span>
            </div>
            <div class="col-marketcap">${this.formatNumber(coin.marketCap)}</div>
            <div class="col-volume">${this.formatNumber(coin.volume24h)}</div>
            <div class="col-sparkline"></div>
            <div class="col-action">
                <button class="action-btn-table" data-coin-id="${coin.id}">${t.details}</button>
            </div>
        `;

        // Add sparkline
        const sparklineContainer = row.querySelector('.col-sparkline');
        this.createSparkline(coin.sparkline, sparklineContainer, isPositive);

        // Add event listeners
        row.addEventListener('click', (e) => {
            if (!e.target.classList.contains('action-btn-table')) {
                this.showCoinModal(coin);
            }
        });

        const detailsBtn = row.querySelector('.action-btn-table');
        detailsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showCoinModal(coin);
        });

        return row;
    }

    createSparkline(data, element, isPositive) {
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 30;
        canvas.className = 'sparkline-chart';
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Set colors
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        if (isPositive) {
            gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
            gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
            ctx.strokeStyle = '#10b981';
        } else {
            gradient.addColorStop(0, 'rgba(239, 68, 68, 0.3)');
            gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
            ctx.strokeStyle = '#ef4444';
        }
        
        // Calculate scale
        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min || 1;
        
        // Draw line
        ctx.beginPath();
        data.forEach((value, index) => {
            const x = (index / (data.length - 1)) * canvas.width;
            const y = canvas.height - ((value - min) / range) * canvas.height;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();
        
        // Fill area
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
        
        element.appendChild(canvas);
    }

    showCoinModal(coin) {
        const modal = document.getElementById('coinModal');
        const isPositive = coin.change24h >= 0;
        const changeClass = isPositive ? 'positive' : 'negative';
        const t = TRANSLATIONS[this.currentLanguage];

        // Set modal content
        document.getElementById('modalCoinIcon').src = `https://coinicons-api.vercel.app/api/icon/${coin.symbol.toLowerCase()}`;
        document.getElementById('modalCoinIcon').alt = coin.name;
        document.getElementById('modalCoinName').textContent = coin.name;
        document.getElementById('modalCoinSymbol').textContent = coin.symbol;
        document.getElementById('modalCoinRank').textContent = `#${coin.rank}`;
        document.getElementById('modalCoinPrice').textContent = `$${this.formatPrice(coin.price)}`;
        
        const changeElement = document.getElementById('modalCoinChange');
        changeElement.textContent = this.formatPercent(coin.change24h);
        changeElement.className = `price-change ${changeClass}`;
        
        // Update modal labels
        const statLabels = document.querySelectorAll('.stat-item .stat-label');
        statLabels[0].textContent = t.capitalization;
        statLabels[1].textContent = t.volume24hModal;
        statLabels[2].textContent = t.circulatingSupply;
        statLabels[3].textContent = t.maxSupply;
        
        document.getElementById('modalCoinMarketCap').textContent = this.formatNumber(coin.marketCap);
        document.getElementById('modalCoinVolume').textContent = this.formatNumber(coin.volume24h);
        document.getElementById('modalCoinSupply').textContent = coin.circulatingSupply ? coin.circulatingSupply.toLocaleString() : 'N/A';
        document.getElementById('modalCoinMaxSupply').textContent = coin.maxSupply ? coin.maxSupply.toLocaleString() : 'N/A';
        
        // Update modal buttons
        document.getElementById('modalWatchlistBtn').querySelector('span').textContent = t.addToWatchlist;
        document.getElementById('modalShareBtn').querySelector('span').textContent = t.share;
        
        // Add modal button handlers
        document.getElementById('modalWatchlistBtn').onclick = () => this.addToWatchlist(coin);
        document.getElementById('modalShareBtn').onclick = () => this.shareCoin(coin);
        
        // Show modal
        modal.style.display = 'flex';
    }

    closeModal() {
        document.getElementById('coinModal').style.display = 'none';
    }

    handleSearch(query) {
        const searchClear = document.getElementById('searchClear');
        const searchResultsCount = document.getElementById('searchResultsCount');
        
        if (query.trim()) {
            searchClear.style.display = 'flex';
            this.filteredCoins = this.searchCoins(query);
            this.currentPage = 1;
            this.renderCoinsTable();
            this.updatePagination();
            
            // Show results count
            searchResultsCount.style.display = 'block';
            const t = TRANSLATIONS[this.currentLanguage];
            document.getElementById('resultsCount').textContent = this.filteredCoins.length;
            searchResultsCount.innerHTML = t.foundCoins.replace('{count}', `<span id="resultsCount">${this.filteredCoins.length}</span>`);
        } else {
            this.clearSearch();
        }
    }

    searchCoins(query) {
        const lowerQuery = query.toLowerCase();
        return majorCryptocurrencies.filter(coin => 
            coin.name.toLowerCase().includes(lowerQuery) || 
            coin.symbol.toLowerCase().includes(lowerQuery)
        );
    }

    clearSearch() {
        document.getElementById('searchInput').value = '';
        document.getElementById('searchClear').style.display = 'none';
        document.getElementById('searchResultsCount').style.display = 'none';
        this.filteredCoins = [...majorCryptocurrencies];
        this.currentPage = 1;
        this.renderCoinsTable();
        this.updatePagination();
    }

    toggleSort() {
        const sortOptions = ['rank', 'name', 'price', 'change', 'marketCap'];
        const currentIndex = sortOptions.indexOf(this.currentSort);
        const nextIndex = (currentIndex + 1) % sortOptions.length;
        
        this.currentSort = sortOptions[nextIndex];
        this.currentSortAscending = !this.currentSortAscending;
        
        this.filteredCoins = this.sortCoins(this.filteredCoins, this.currentSort, this.currentSortAscending);
        this.renderCoinsTable();
        
        this.showNotification(`Сортировка по: ${this.getSortLabel(this.currentSort)} (${this.currentSortAscending ? 'по возрастанию' : 'по убыванию'})`);
    }

    sortCoins(coins, sortBy, ascending = true) {
        const sortedCoins = [...coins];
        
        switch(sortBy) {
            case 'rank':
                sortedCoins.sort((a, b) => ascending ? a.rank - b.rank : b.rank - a.rank);
                break;
            case 'name':
                sortedCoins.sort((a, b) => {
                    const nameA = a.name.toLowerCase();
                    const nameB = b.name.toLowerCase();
                    return ascending ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
                });
                break;
            case 'price':
                sortedCoins.sort((a, b) => ascending ? a.price - b.price : b.price - a.price);
                break;
            case 'change':
                sortedCoins.sort((a, b) => ascending ? a.change24h - b.change24h : b.change24h - a.change24h);
                break;
            case 'marketCap':
                sortedCoins.sort((a, b) => ascending ? a.marketCap - b.marketCap : b.marketCap - a.marketCap);
                break;
        }
        
        return sortedCoins;
    }

    getSortLabel(sortBy) {
        const labels = {
            'rank': 'Рейтингу',
            'name': 'Названию', 
            'price': 'Цене',
            'change': 'Изменению',
            'marketCap': 'Капитализации'
        };
        return labels[sortBy] || 'Рейтингу';
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.updatePagination();
            this.scrollToCoinsSection();
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.filteredCoins.length / this.coinsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.updatePagination();
            this.scrollToCoinsSection();
        }
    }

    updatePagination() {
        const totalCoins = this.filteredCoins.length;
        const totalPages = Math.ceil(totalCoins / this.coinsPerPage);
        const startCoin = (this.currentPage - 1) * this.coinsPerPage + 1;
        const endCoin = Math.min(this.currentPage * this.coinsPerPage, totalCoins);

        const t = TRANSLATIONS[this.currentLanguage];
        document.getElementById('pageInfo').textContent = t.pageInfo.replace('{current}', this.currentPage).replace('{total}', totalPages);
        document.getElementById('pageStats').textContent = t.pageStats.replace('{start}', startCoin).replace('{end}', endCoin).replace('{total}', totalCoins);

        // Update button states
        const prevPage = document.getElementById('prevPage');
        const nextPage = document.getElementById('nextPage');
        
        prevPage.disabled = this.currentPage === 1;
        nextPage.disabled = this.currentPage === totalPages;
        
        prevPage.classList.toggle('disabled', this.currentPage === 1);
        nextPage.classList.toggle('disabled', this.currentPage === totalPages);

        this.renderCoinsTable();
    }

    updatePaginationText() {
        const t = TRANSLATIONS[this.currentLanguage];
        document.getElementById('prevPage').querySelector('span').textContent = t.previous;
        document.getElementById('nextPage').querySelector('span').textContent = t.next;
    }

    scrollToCoinsSection() {
        const coinsSection = document.querySelector('.coins-section');
        if (coinsSection) {
            coinsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    refreshData() {
        this.loadData();
        this.showNotification(TRANSLATIONS[this.currentLanguage].dataUpdated);
    }

    addToWatchlist(coin) {
        let watchlist = JSON.parse(localStorage.getItem('cryptoWatchlist') || '[]');
        
        if (!watchlist.find(item => item.id === coin.id)) {
            watchlist.push({
                id: coin.id,
                name: coin.name,
                symbol: coin.symbol
            });
            
            localStorage.setItem('cryptoWatchlist', JSON.stringify(watchlist));
            this.showNotification(`${coin.name} ${TRANSLATIONS[this.currentLanguage].addedToWatchlist}`);
        } else {
            this.showNotification(`${coin.name} ${TRANSLATIONS[this.currentLanguage].alreadyInWatchlist}`);
        }
    }

    shareCoin(coin) {
        const shareText = `${coin.name} (${coin.symbol}) - $${this.formatPrice(coin.price)}`;
        
        if (navigator.share) {
            navigator.share({
                title: coin.name,
                text: shareText,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(shareText).then(() => {
                this.showNotification(TRANSLATIONS[this.currentLanguage].copiedToClipboard);
            });
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
