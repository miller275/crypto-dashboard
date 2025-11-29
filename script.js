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
            // Пробуем разные эндпоинты API
            await Promise.all([
                this.fetchGlobalData(),
                this.fetchCryptoData()
            ]);
            
            if (this.cryptoData && this.cryptoData.length > 0) {
                this.renderGlobalStats();
                this.renderCryptoGrid();
                this.updateLastUpdateTime();
                this.hideLoading();
            } else {
                throw new Error('Нет данных о криптовалютах');
            }
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            // Пробуем альтернативный метод
            await this.tryAlternativeAPI();
        }
    }

    async fetchGlobalData() {
        try {
            const response = await fetch(`${this.apiUrl}/global`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            this.globalData = data.data;
        } catch (error) {
            console.warn('Не удалось загрузить глобальную статистику:', error);
            this.globalData = {};
        }
    }

    async fetchCryptoData() {
        try {
            const response = await fetch(
                `${this.apiUrl}/coins/markets?vs_currency=${this.currentCurrency}&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=1h,24h,7d`
            );
            if (!response.ok) throw new Error('Network response was not ok');
            this.cryptoData = await response.json();
        } catch (error) {
            console.warn('Не удалось загрузить данные криптовалют:', error);
            this.cryptoData = [];
        }
    }

    async tryAlternativeAPI() {
        try {
            console.log('Пробуем альтернативный метод загрузки...');
            
            // Пробуем упрощенный запрос
            const response = await fetch(
                `${this.apiUrl}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1`
            );
            
            if (response.ok) {
                const data = await response.json();
                if (data && data.length > 0) {
                    this.cryptoData = data;
                    this.renderCryptoGrid();
                    this.updateLastUpdateTime();
                    this.hideLoading();
                    return;
                }
            }
            
            // Если API не работает, показываем демо-данные
            this.showDemoData();
            
        } catch (error) {
            console.error('Альтернативный метод тоже не сработал:', error);
            this.showDemoData();
        }
    }

    showDemoData() {
        console.log('Показываем демо-данные');
        
        // Демо-данные для тестирования
        this.cryptoData = [
            {
                id: 'bitcoin',
                symbol: 'btc',
                name: 'Bitcoin',
                image: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
                current_price: 43423,
                market_cap: 851234567890,
                total_volume: 23456789012,
                price_change_percentage_24h: 2.34,
                price_change_percentage_1h_in_currency: 0.56,
                price_change_percentage_7d_in_currency: 5.67
            },
            {
                id: 'ethereum',
                symbol: 'eth',
                name: 'Ethereum',
                image: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
                current_price: 2387.42,
                market_cap: 287654321098,
                total_volume: 15678904321,
                price_change_percentage_24h: 1.89,
                price_change_percentage_1h_in_currency: 0.23,
                price_change_percentage_7d_in_currency: 3.45
            },
            {
                id: 'binancecoin',
                symbol: 'bnb',
                name: 'Binance Coin',
                image: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
                current_price: 312.56,
                market_cap: 48765432109,
                total_volume: 876543210,
                price_change_percentage_24h: -0.45,
                price_change_percentage_1h_in_currency: -0.12,
                price_change_percentage_7d_in_currency: 1.23
            }
        ];

        this.globalData = {
            total_market_cap: { usd: 1723456789012 },
            total_volume: { usd: 98765432109 },
            market_cap_percentage: { btc: 48.5 },
            active_cryptocurrencies: 13892
        };

        this.renderGlobalStats();
        this.renderCryptoGrid();
        this.updateLastUpdateTime();
        this.hideLoading();
        
        this.showError('Используются демо-данные. API временно недоступно.');
    }

    renderGlobalStats() {
        const statsGrid = document.getElementById('statsGrid');
        const global = this.globalData;

        statsGrid.innerHTML = `
            <div class="stat-card">
                <div class="stat-label">💰 Рыночная капитализация</div>
                <div class="stat-value">${this.formatCurrency(global.total_market_cap?.[this.currentCurrency] || global.total_market_cap?.usd)}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">📊 Объем за 24ч</div>
                <div class="stat-value">${this.formatCurrency(global.total_volume?.[this.currentCurrency] || global.total_volume?.usd)}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">₿ Доминирование BTC</div>
                <div class="stat-value">${global.market_cap_percentage?.btc?.toFixed(1) || '48.5'}%</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">🪙 Активных криптовалют</div>
                <div class="stat-value">${global.active_cryptocurrencies?.toLocaleString() || '13,892'}</div>
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
                    <img src="${crypto.image}" alt="${crypto.name}" class="crypto-icon" onerror="this.src='https://via.placeholder.com/40/667eea/ffffff?text=${crypto.symbol.toUpperCase()}'">
                    <div>
                        <span class="crypto-name">${crypto.name}</span>
                        <span class="crypto-symbol">${crypto.symbol.toUpperCase()}</span>
                    </div>
                </div>
                <div class="crypto-price">
                    ${this.formatPrice(crypto.current_price, this.currentCurrency)}
                </div>
                <div class="crypto-change ${crypto.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}">
                    📈 24ч: ${crypto.price_change_percentage_24h ? crypto.price_change_percentage_24h.toFixed(2) : '0.00'}%
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
                        <span class="${(crypto.price_change_percentage_1h_in_currency || 0) >= 0 ? 'positive' : 'negative'}">
                            ${crypto.price_change_percentage_1h_in_currency ? crypto.price_change_percentage_1h_in_currency.toFixed(2) : '0.00'}%
                        </span>
                    </div>
                    <div class="detail-item">
                        <span>7д:</span>
                        <span class="${(crypto.price_change_percentage_7d_in_currency || 0) >= 0 ? 'positive' : 'negative'}">
                            ${crypto.price_change_percentage_7d_in_currency ? crypto.price_change_percentage_7d_in_currency.toFixed(2) : '0.00'}%
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
                    24ч: ${crypto.price_change_percentage_24h ? crypto.price_change_percentage_24h.toFixed(2) : '0.00'}%
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
        // Создаем временное уведомление
        const notification = document.createElement('div');
        notification.className = 'error-message';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            padding: 15px;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        `;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-exclamation-triangle" style="color: #ef4444;"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Удаляем уведомление через 5 секунд
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
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
