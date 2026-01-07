// Управление избранным
export class Favorites {
    constructor(storage, dataClient, i18n) {
        this.storage = storage;
        this.dataClient = dataClient;
        this.i18n = i18n;
        this.favorites = [];
        this.favoritesData = new Map();
        
        this.init();
    }
    
    init() {
        this.loadFavorites();
        this.setupEventListeners();
        this.updateBadge();
    }
    
    loadFavorites() {
        this.favorites = this.storage.getFavorites();
        console.log('Loaded favorites:', this.favorites.length);
    }
    
    setupEventListeners() {
        // Кнопка избранного в шапке
        const favoritesButton = document.querySelector('[data-favorites-button]');
        if (favoritesButton) {
            favoritesButton.addEventListener('click', () => {
                this.showFavoritesModal();
            });
        }
        
        // Кнопка переключения избранного на странице монеты
        const favoriteToggle = document.querySelector('[data-favorite-toggle]');
        if (favoriteToggle) {
            const coinId = new URLSearchParams(window.location.search).get('id');
            if (coinId) {
                this.updateToggleButton(coinId, favoriteToggle);
                
                favoriteToggle.addEventListener('click', () => {
                    this.toggleFavorite(coinId);
                    this.updateToggleButton(coinId, favoriteToggle);
                });
            }
        }
        
        // Модальное окно избранного
        document.addEventListener('modalOpened', (e) => {
            if (e.detail.modalId === 'favorites-modal') {
                this.loadFavoritesModal();
            }
        });
    }
    
    async loadFavoritesModal() {
        const container = document.querySelector('[data-favorites-list]');
        if (!container) return;
        
        if (this.favorites.length === 0) {
            container.innerHTML = `
                <div class="favorites-empty">
                    <div class="favorites-empty__icon">★</div>
                    <h3>${this.i18n.t('favorites.emptyTitle')}</h3>
                    <p>${this.i18n.t('favorites.emptyDescription')}</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div class="loading">
                <div class="loading__spinner"></div>
                <span>${this.i18n.t('loading')}</span>
            </div>
        `;
        
        try {
            const favoritesData = await this.getFavoritesData();
            
            container.innerHTML = favoritesData.map(coin => `
                <div class="favorite-item" data-coin-id="${coin.id}">
                    <div class="favorite-item__info">
                        <div class="coin-cell__icon">${coin.symbol.substring(0, 3)}</div>
                        <div>
                            <div class="coin-cell__name">${coin.name}</div>
                            <div class="coin-cell__symbol">${coin.symbol}</div>
                        </div>
                    </div>
                    <div class="favorite-item__price">
                        $${coin.price.toFixed(2)}
                        <div class="change ${coin.change24h >= 0 ? 'change--up' : 'change--down'}">
                            ${coin.change24h >= 0 ? '+' : ''}${coin.change24h.toFixed(2)}%
                        </div>
                    </div>
                </div>
            `).join('');
            
            // Обработчики кликов
            container.querySelectorAll('.favorite-item').forEach(item => {
                item.addEventListener('click', () => {
                    const coinId = item.getAttribute('data-coin-id');
                    window.location.href = `coin.html?id=${coinId}`;
                });
            });
            
        } catch (error) {
            console.error('Failed to load favorites data:', error);
            container.innerHTML = `
                <div class="error-state">
                    <p>${this.i18n.t('favorites.loadError')}</p>
                    <button class="button">${this.i18n.t('error.retry')}</button>
                </div>
            `;
        }
    }
    
    async getFavoritesData() {
        const data = [];
        
        for (const coinId of this.favorites) {
            // Проверка кэша
            if (this.favoritesData.has(coinId)) {
                const cached = this.favoritesData.get(coinId);
                if (Date.now() - cached.timestamp < 5 * 60 * 1000) { // 5 минут
                    data.push(cached.data);
                    continue;
                }
            }
            
            // Загрузка данных
            try {
                const coinData = await this.dataClient.getCoin(coinId);
                if (coinData) {
                    const simplified = {
                        id: coinData.id,
                        name: coinData.name,
                        symbol: coinData.symbol,
                        price: coinData.price,
                        change24h: coinData.change24h,
                        market_cap: coinData.market_cap
                    };
                    
                    this.favoritesData.set(coinId, {
                        data: simplified,
                        timestamp: Date.now()
                    });
                    
                    data.push(simplified);
                }
            } catch (error) {
                console.error(`Failed to load favorite coin ${coinId}:`, error);
            }
        }
        
        return data;
    }
    
    isFavorite(coinId) {
        return this.favorites.includes(coinId);
    }
    
    toggleFavorite(coinId) {
        const wasFavorite = this.isFavorite(coinId);
        
        if (wasFavorite) {
            this.removeFavorite(coinId);
            this.showNotification(this.i18n.t('favorites.removed'));
        } else {
            this.addFavorite(coinId);
            this.showNotification(this.i18n.t('favorites.added'));
        }
        
        this.updateBadge();
        
        // Событие изменения избранного
        document.dispatchEvent(new CustomEvent('favoritesChanged', {
            detail: { 
                coinId, 
                isFavorite: !wasFavorite,
                favorites: this.favorites.length 
            }
        }));
        
        return !wasFavorite;
    }
    
    addFavorite(coinId) {
        if (!this.favorites.includes(coinId)) {
            this.favorites.push(coinId);
            this.storage.setFavorites(this.favorites);
        }
    }
    
    removeFavorite(coinId) {
        const index = this.favorites.indexOf(coinId);
        if (index > -1) {
            this.favorites.splice(index, 1);
            this.storage.setFavorites(this.favorites);
            this.favoritesData.delete(coinId);
        }
    }
    
    updateToggleButton(coinId, button) {
        const isFavorite = this.isFavorite(coinId);
        
        if (isFavorite) {
            button.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <span>${this.i18n.t('favorites.remove')}</span>
            `;
            button.classList.add('favorite-toggle--active');
        } else {
            button.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
                          stroke="currentColor" stroke-width="1.5"/>
                </svg>
                <span>${this.i18n.t('favorites.add')}</span>
            `;
            button.classList.remove('favorite-toggle--active');
        }
    }
    
    updateBadge() {
        const badge = document.querySelector('[data-favorites-count]');
        if (badge) {
            badge.textContent = this.favorites.length;
            badge.style.display = this.favorites.length > 0 ? 'flex' : 'none';
        }
    }
    
    showFavoritesModal() {
        document.getElementById('favorites-modal')?.setAttribute('aria-hidden', 'false');
    }
    
    showNotification(message) {
        // Создание временного уведомления
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <div class="notification__content">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12L11 14L15 10M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" 
                          stroke="currentColor" stroke-width="2"/>
                </svg>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Стили для уведомления
        Object.assign(notification.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
            padding: 'var(--spacing-md) var(--spacing-lg)',
            borderRadius: 'var(--border-radius)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 'var(--z-toast)',
            animation: 'slideInRight var(--transition)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-sm)'
        });
        
        // Удаление через 3 секунды
        setTimeout(() => {
            notification.style.animation = 'slideOutRight var(--transition)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // Получение списка избранных с дополнительными данными
    async getDetailedFavorites() {
        const detailed = [];
        
        for (const coinId of this.favorites) {
            try {
                const coinData = await this.dataClient.getCoin(coinId);
                if (coinData) {
                    detailed.push(coinData);
                }
            } catch (error) {
                console.error(`Failed to load detailed data for favorite ${coinId}:`, error);
            }
        }
        
        return detailed;
    }
    
    // Экспорт избранного
    exportFavorites() {
        return JSON.stringify({
            version: '1.0',
            timestamp: Date.now(),
            favorites: this.favorites
        }, null, 2);
    }
    
    // Импорт избранного
    importFavorites(json) {
        try {
            const data = JSON.parse(json);
            if (data.favorites && Array.isArray(data.favorites)) {
                this.favorites = [...new Set([...this.favorites, ...data.favorites])];
                this.storage.setFavorites(this.favorites);
                this.updateBadge();
                return true;
            }
        } catch (error) {
            console.error('Failed to import favorites:', error);
        }
        
        return false;
    }
}