// Глобальная статистика
export class GlobalStats {
    constructor(dataClient, i18n) {
        this.dataClient = dataClient;
        this.i18n = i18n;
        this.formatter = new (class {
            constructor(i18n) { this.i18n = i18n; }
            currency(v) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v); }
            percent(v) { return `${v > 0 ? '+' : ''}${v.toFixed(2)}%`; }
        })(i18n);
    }
    
    async load() {
        try {
            const [globalData, fearGreed] = await Promise.all([
                this.dataClient.getGlobalData(),
                this.dataClient.getFearGreed()
            ]);
            
            this.updateGlobalStats(globalData);
            this.updateFearGreed(fearGreed);
            this.updateDominance(globalData);
            
        } catch (error) {
            console.error('Failed to load global stats:', error);
        }
    }
    
    updateGlobalStats(data) {
        if (!data) return;
        
        // Рыночная капитализация
        const marketCapEl = document.querySelector('[data-market-cap]');
        const marketCapChangeEl = document.querySelector('[data-market-cap-change]');
        
        if (marketCapEl && data.total_market_cap) {
            marketCapEl.textContent = this.formatter.currency(data.total_market_cap);
        }
        
        if (marketCapChangeEl && data.market_cap_change_24h !== undefined) {
            const change = data.market_cap_change_24h;
            marketCapChangeEl.textContent = this.formatter.percent(change);
            marketCapChangeEl.className = `stat-card__change ${change >= 0 ? 'text-up' : 'text-down'}`;
        }
        
        // Объем
        const volumeEl = document.querySelector('[data-volume]');
        const volumeChangeEl = document.querySelector('[data-volume-change]');
        
        if (volumeEl && data.total_volume) {
            volumeEl.textContent = this.formatter.currency(data.total_volume);
        }
        
        if (volumeChangeEl && data.volume_change_24h !== undefined) {
            const change = data.volume_change_24h;
            volumeChangeEl.textContent = this.formatter.percent(change);
            volumeChangeEl.className = `stat-card__change ${change >= 0 ? 'text-up' : 'text-down'}`;
        }
    }
    
    updateFearGreed(data) {
        if (!data) return;
        
        const valueEl = document.querySelector('[data-feargreed]');
        const labelEl = document.querySelector('[data-feargreed-label]');
        
        if (valueEl && data.value !== undefined) {
            valueEl.textContent = data.value;
            
            // Цвет в зависимости от значения
            let color = 'var(--color-neutral)';
            if (data.value <= 20) color = 'var(--color-danger)';
            else if (data.value <= 40) color = 'var(--color-warning)';
            else if (data.value <= 60) color = 'var(--color-neutral)';
            else if (data.value <= 80) color = 'var(--color-success)';
            else color = 'var(--color-success)';
            
            valueEl.style.color = color;
        }
        
        if (labelEl && data.value_classification) {
            let translationKey = 'feargreed.neutral';
            
            switch (data.value_classification.toLowerCase()) {
                case 'extreme fear': translationKey = 'feargreed.extremeFear'; break;
                case 'fear': translationKey = 'feargreed.fear'; break;
                case 'neutral': translationKey = 'feargreed.neutral'; break;
                case 'greed': translationKey = 'feargreed.greed'; break;
                case 'extreme greed': translationKey = 'feargreed.extremeGreed'; break;
            }
            
            labelEl.textContent = this.i18n.t(translationKey) || data.value_classification;
        }
    }
    
    updateDominance(data) {
        if (!data || !data.market_cap_percentage) return;
        
        const btcDominance = data.market_cap_percentage.btc;
        const ethDominance = data.market_cap_percentage.eth;
        
        // BTC
        const btcDominanceEl = document.querySelector('[data-btc-dominance]');
        const btcProgressEl = document.querySelector('[data-btc-progress]');
        
        if (btcDominanceEl && btcDominance !== undefined) {
            btcDominanceEl.textContent = `${btcDominance.toFixed(1)}%`;
        }
        
        if (btcProgressEl && btcDominance !== undefined) {
            btcProgressEl.style.width = `${btcDominance}%`;
        }
        
        // ETH
        const ethDominanceEl = document.querySelector('[data-eth-dominance]');
        const ethProgressEl = document.querySelector('[data-eth-progress]');
        
        if (ethDominanceEl && ethDominance !== undefined) {
            ethDominanceEl.textContent = `${ethDominance.toFixed(1)}%`;
        }
        
        if (ethProgressEl && ethDominance !== undefined) {
            ethProgressEl.style.width = `${ethDominance}%`;
        }
    }
    
    // Обновление трендов
    async updateTrends() {
        try {
            const trending = await this.dataClient.getTrending();
            if (!trending || !trending.trending) return;
            
            const container = document.querySelector('[data-trending-list]');
            if (!container) return;
            
            const topTrending = trending.trending.slice(0, 5);
            
            container.innerHTML = topTrending.map((coin, index) => `
                <div class="trending-item" data-coin-id="${coin.id}">
                    <div class="trending-item__info">
                        <span class="trending-item__rank">${index + 1}</span>
                        <span class="trending-item__name">${coin.name}</span>
                    </div>
                    <div class="trending-item__price">
                        $${coin.price.toFixed(2)}
                    </div>
                </div>
            `).join('');
            
            // Обработчики кликов
            container.querySelectorAll('.trending-item').forEach(item => {
                item.addEventListener('click', () => {
                    const coinId = item.getAttribute('data-coin-id');
                    if (coinId) {
                        window.location.href = `coin.html?id=${coinId}`;
                    }
                });
            });
            
        } catch (error) {
            console.error('Failed to load trending:', error);
        }
    }
}