class CryptoDashboard {
    constructor() {
        this.apiUrl = 'https://api.coingecko.com/api/v3';
        this.currentCurrency = 'usd';
        this.cryptoData = [];
        this.globalData = {};
        
        this.initializeApp();
    }

    initializeApp() {
        this.bindEvents();
        this.loadData();
        this.startAutoRefresh();
    }

    bindEvents() {
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.filterCryptos(e.target.value);
        });

        document.getElementById('currencySelect').addEventListener('change', (e) => {
            this.currentCurrency = e.target.value;
            this.loadData();
        });

        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.loadData();
            this.showRefreshAnimation();
        });
    }

    showRefreshAnimation() {
        const btn = document.getElementById('refreshBtn');
        const icon = btn.querySelector('i');
        icon.className = 'fas fa-spinner fa-spin';
        setTimeout(() => {
            icon.className = 'fas fa-sync-alt';
        }, 2000);
    }

    async loadData() {
        this.showLoading();
        
        try {
            await Promise.all([
                this.fetchGlobalData(),
                this.fetchCryptoData()
            ]);
            
            this.renderGlobalStats();
            this.renderCryptoGrid();
            this.updateLastUpdateTime();
            this.hideLoading();
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            this.showError('Ошибка загрузки данных. Попробуйте позже.');
        }
    }

    async fetchGlobalData() {
        const response = await fetch(`${this.apiUrl}/global`);
        const data = await response.json();
        this.globalData = data.data;
    }

    async fetchCryptoData() {
        const response = await fetch(
            `${this.apiUrl}/coins/markets?vs_currency=${this.currentCurrency}&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=1h,24h,7d`
        );
        this.cryptoData = await response.json();
    }

    renderGlobalStats() {
        const statsGrid = document.getElementById('statsGrid');
        const global = this.globalData;

        if (!global || !global.total_market_cap) {
            statsGrid.innerHTML = '<div class="stat-card">Данные недоступны</div>';
            return;
        }

        statsGrid.innerHTML = `
            <div class="stat-card">
                <div class="stat-label">💰 Рыночная капитализация</div>
                <div class="stat-value">${this.formatCurrency(global.total_market_cap[this.currentCurrency])}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">📊 Объем за 24ч</div>
                <div class="stat-value">${this.formatCurrency(global.total_volume[this.currentCurrency])}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">₿ Доминирование BTC</div>
                <div class="stat-value">${global.market_cap_percentage?.btc?.toFixed(1) || 'N/A'}%</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">🪙 Активных криптовалют</div>
                <div class="stat-value">${global.active_cryptocurrencies?.toLocaleString() || 'N/A'}</div>
            </div>
        `;
    }

    renderCryptoGrid() {
        const cryptoGrid = document.getElementById('cryptoGrid');
        
        if (!this.cryptoData || this.cryptoData.length === 0) {
            cryptoGrid.innerHTML = '<div class="error-message">Нет данных о криптовалютах</div>';
            return;
        }
        
        cryptoGrid.innerHTML = this.cryptoData.map(crypto => `
            <div class="crypto-card">
                <div class="crypto-header">
                    <img src="${crypto.image}" alt="${crypto.name}" class="crypto-icon" onerror="this.src='https://via.placeholder.com/40'">
                    <div>
                        <span class="crypto-name">${crypto.name}</span>
                        <span class="crypto-symbol">${crypto.symbol.toUpperCase()}</span>
                    </div>
                </div>
                <div class="crypto-price">
                    ${this.formatPrice(crypto.current_price, this.currentCurrency)}
                </div>
                <div class="crypto-change ${crypto.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}">
                    📈 24ч: ${crypto.price_change_percentage_24h ? crypto.price_change_percentage_24h.toFixed(2) : 'N/A'}%
                </div>
                <div class="crypto-details">
                    <div class="detail-item">
                        <span>Капитализация:</span>
                        <span>${this.formatCurrency(crypto.market_cap)}</span>
                    </div>
                    <div class="detail-item">
                        <span>Объем 24ч:</span>
                        <span>${this.formatCurrency(crypto.total_volume)}</span>
                    </div>
                    <div class="detail-item">
                        <span>1ч:</span>
                        <span class="${crypto.price_change_percentage_1h_in_currency >= 0 ? 'positive' : 'negative'}">
                            ${crypto.price_change_percentage_1h_in_currency ? crypto.price_change_percentage_1h_in_currency.toFixed(2) : 'N/A'}%
                        </span>
                    </div>
                    <div class="detail-item">
                        <span>7д:</span>
                        <span class="${crypto.price_change_percentage_7d_in_currency >= 0 ? 'positive' : 'negative'}">
                            ${crypto.price_change_percentage_7d_in_currency ? crypto.price_change_percentage_7d_in_currency.toFixed(2) : 'N/A'}%
                        </span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    filterCryptos(searchTerm) {
        if (!this.cryptoData) return;
        
        const filteredData = this.cryptoData.filter(crypto => 
            crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        const cryptoGrid = document.getElementById('cryptoGrid');
        
        if (filteredData.length === 0) {
            cryptoGrid.innerHTML = '<div class="error-message">Криптовалюты не найдены</div>';
            return;
        }
        
        cryptoGrid.innerHTML = filteredData.map(crypto => `
            <div class="crypto-card">
                <div class="crypto-header">
                    <img src="${crypto.image}" alt="${crypto.name}" class="crypto-icon">
                    <div>
                        <span class="crypto-name">${crypto.name}</span>
                        <span class="crypto-symbol">${crypto.symbol.toUpperCase()}</span>
                    </div>
                </div>
                <div class="crypto-price">
                    ${this.formatPrice(crypto.current_price, this.currentCurrency)}
                </div>
                <div class="crypto-change ${crypto.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}">
                    24ч: ${crypto.price_change_percentage_24h ? crypto.price_change_percentage_24h.toFixed(2) : 'N/A'}%
                </div>
            </div>
        `).join('');
    }

    formatPrice(price, currency) {
        if (price === null || price === undefined) return 'N/A';
        
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase(),
            minimumFractionDigits: price < 1 ? 4 : 2,
            maximumFractionDigits: price < 1 ? 4 : 2
        }).format(price);
    }

    formatCurrency(value) {
        if (!value) return 'N/A';
        
        if (value >= 1e12) {
            return `$${(value / 1e12).toFixed(2)}T`;
        } else if (value >= 1e9) {
            return `$${(value / 1e9).toFixed(2)}B`;
        } else if (value >= 1e6) {
            return `$${(value / 1e6).toFixed(2)}M`;
        } else {
            return `$${value?.toLocaleString() || 'N/A'}`;
        }
    }

    updateLastUpdateTime() {
        const now = new Date();
        document.getElementById('lastUpdate').textContent = 
            `Последнее обновление: ${now.toLocaleTimeString()}`;
    }

    showLoading() {
        document.getElementById('loading').classList.remove('hidden');
        document.getElementById('cryptoGrid').classList.add('hidden');
        document.getElementById('statsGrid').classList.add('hidden');
    }

    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('cryptoGrid').classList.remove('hidden');
        document.getElementById('statsGrid').classList.remove('hidden');
    }

    showError(message) {
        const cryptoGrid = document.getElementById('cryptoGrid');
        cryptoGrid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>${message}</h3>
                <p>Проверьте подключение к интернету и попробуйте снова</p>
            </div>
        `;
        this.hideLoading();
    }

    startAutoRefresh() {
        // Автообновление каждые 2 минуты
        setInterval(() => {
            this.loadData();
        }, 120000);
    }
}

// Инициализация приложения когда DOM загружен
document.addEventListener('DOMContentLoaded', () => {
    new CryptoDashboard();
});

// Обработка ошибок загрузки изображений
document.addEventListener('error', function(e) {
    if (e.target.tagName === 'IMG' && e.target.classList.contains('crypto-icon')) {
        e.target.src = 'https://via.placeholder.com/40';
    }
}, true);
