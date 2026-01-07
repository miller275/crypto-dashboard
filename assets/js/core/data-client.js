// Клиент для работы с данными
import { resolvePath } from './paths.js';

export class DataClient {
    constructor() {
        this.cache = new Map();
        this.baseUrl = new URL('.', window.location.href);
        this.config = {
            CACHE_TTL: 5 * 60 * 1000, // 5 минут
            RETRY_COUNT: 3,
            RETRY_DELAY: 1000
        };
    }

    resolveUrl(path) {
        return new URL(path, this.baseUrl).toString();
    }
    
    async fetch(url, options = {}) {
        const cacheKey = `${url}-${JSON.stringify(options)}`;
        const now = Date.now();
        
        // Проверка кэша
        const cached = this.cache.get(cacheKey);
        if (cached && now - cached.timestamp < this.config.CACHE_TTL) {
            return cached.data;
        }
        
        // Попытка загрузки с повторными попытками
        for (let i = 0; i < this.config.RETRY_COUNT; i++) {
            try {
                const response = await fetch(url, {
                    ...options,
                    headers: {
                        'Accept': 'application/json',
                        'Cache-Control': 'no-cache',
                        ...options.headers
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                
                // Кэширование ответа
                this.cache.set(cacheKey, {
                    timestamp: now,
                    data
                });
                
                return data;
                
            } catch (error) {
                if (i === this.config.RETRY_COUNT - 1) {
                    throw error;
                }
                
                // Задержка перед повторной попыткой
                await this.delay(this.config.RETRY_DELAY * (i + 1));
            }
        }
    }
    
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    clearCache(pattern = '') {
        if (pattern) {
            for (const [key] of this.cache) {
                if (key.includes(pattern)) {
                    this.cache.delete(key);
                }
            }
        } else {
            this.cache.clear();
        }
    }
    
    // Методы для получения конкретных данных
    async getGlobalData() {
        return this.fetch(resolvePath('data/global.json'));
    }
    
    async getFearGreed() {
        return this.fetch(resolvePath('data/feargreed.json'));
    }
    
    async getNews() {
        return this.fetch(resolvePath('data/news/latest.json'));
    }
    
    async getTrending() {
        return this.fetch(resolvePath('data/trending.json'));
    }
    
    async getCoin(id) {
        return this.fetch(resolvePath(`data/coins/${id}.json`));
    }
    
    async getMarketsPage(page = 1) {
        return this.fetch(resolvePath(`data/markets/page-${page}.json`));
    }
    
    async getMarketsMeta() {
        return this.fetch(resolvePath('data/markets/meta.json'));
    }
    
    async getTVMap() {
        return this.fetch(resolvePath('data/charts/tv-map.json'));
    }
    
    async getGenerated() {
        return this.fetch(resolvePath('data/generated.json'));
    }
    
    async getSearchIndex() {
        return this.fetch(resolvePath('data/search-index.json'));
    }
    
    // Пакетная загрузка
    async batch(requests) {
        const results = {};
        
        for (const [key, url] of Object.entries(requests)) {
            try {
                results[key] = await this.fetch(url);
            } catch (error) {
                results[key] = null;
                console.error(`Failed to load ${key}:`, error);
            }
        }
        
        return results;
    }
    
    // Проверка обновлений
    async checkUpdates() {
        try {
            const generated = await this.getGenerated();
            const lastUpdate = localStorage.getItem('last_data_update');
            
            if (!lastUpdate || generated.timestamp > parseInt(lastUpdate)) {
                localStorage.setItem('last_data_update', generated.timestamp);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Failed to check updates:', error);
            return false;
        }
    }
}
