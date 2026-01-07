#!/usr/bin/env node

/**
 * Обновление данных для CryptoDash
 */

const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const { URL } = require('url');

class DataUpdater {
    constructor() {
        this.config = {
            API_KEY: process.env.CMC_PRO_API_KEY,
            CRYPTOPANIC_API_KEY: process.env.CRYPTOPANIC_API_KEY,
            API_BASE: 'https://pro-api.coinmarketcap.com',
            DATA_DIR: path.join(__dirname, '..', 'data'),
            ASSETS_DIR: path.join(__dirname, '..', 'assets', 'img', 'coins'),
            PAGE_SIZE: 100,
            MAX_COINS: 500,
            CACHE_DIR: path.join(__dirname, '..', '.cache')
        };
    }
    
    async ensureDirectories() {
        const dirs = [
            this.config.DATA_DIR,
            path.join(this.config.DATA_DIR, 'markets'),
            path.join(this.config.DATA_DIR, 'coins'),
            path.join(this.config.DATA_DIR, 'news'),
            path.join(this.config.DATA_DIR, 'charts'),
            this.config.ASSETS_DIR,
            this.config.CACHE_DIR
        ];
        
        for (const dir of dirs) {
            await fs.mkdir(dir, { recursive: true });
        }
    }
    
    async apiRequest(endpoint, params = {}) {
        return new Promise((resolve, reject) => {
            const url = new URL(this.config.API_BASE + endpoint);
            Object.entries(params).forEach(([key, value]) => {
                url.searchParams.append(key, value);
            });
            
            const options = {
                headers: {
                    'X-CMC_PRO_API_KEY': this.config.API_KEY,
                    'Accept': 'application/json',
                    'User-Agent': 'CryptoDash/1.0'
                },
                timeout: 30000
            };
            
            const req = https.get(url.toString(), options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    try {
                        const json = JSON.parse(data);
                        
                        if (json.status.error_code !== 0) {
                            reject(new Error(`API Error ${json.status.error_code}: ${json.status.error_message}`));
                        } else {
                            resolve(json.data);
                        }
                    } catch (error) {
                        reject(new Error(`Failed to parse response: ${error.message}`));
                    }
                });
            });
            
            req.on('error', reject);
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });
        });
    }
    
    async fetchWithRetry(fn, retries = 3, delay = 1000) {
        for (let i = 0; i < retries; i++) {
            try {
                return await fn();
            } catch (error) {
                if (i === retries - 1) throw error;
                console.log(`Retry ${i + 1}/${retries} after error:`, error.message);
                await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
            }
        }
    }
    
    async updateGlobalData() {
        console.log('🔄 Обновление глобальной статистики...');
        
        try {
            const data = await this.apiRequest('/v1/global-metrics/quotes/latest');
            
            const result = {
                total_market_cap: data.quote.USD.total_market_cap,
                total_volume: data.quote.USD.total_volume_24h,
                market_cap_change_24h: data.quote.USD.total_market_cap_yesterday_percentage_change,
                volume_change_24h: data.quote.USD.total_volume_24h_yesterday_percentage_change,
                market_cap_percentage: {
                    btc: data.btc_dominance,
                    eth: data.eth_dominance
                },
                timestamp: Date.now()
            };
            
            await fs.writeFile(
                path.join(this.config.DATA_DIR, 'global.json'),
                JSON.stringify(result, null, 2)
            );
            
            console.log('✅ Глобальная статистика обновлена');
            return result;
        } catch (error) {
            console.error('❌ Ошибка обновления глобальной статистики:', error.message);
            throw error;
        }
    }
    
    async updateListings() {
        console.log('🔄 Обновление списка монет...');
        
        const totalPages = Math.ceil(this.config.MAX_COINS / this.config.PAGE_SIZE);
        const allCoins = [];
        
        for (let page = 1; page <= totalPages; page++) {
            console.log(`📄 Страница ${page} из ${totalPages}...`);
            
            try {
                const data = await this.apiRequest('/v1/cryptocurrency/listings/latest', {
                    start: (page - 1) * this.config.PAGE_SIZE + 1,
                    limit: this.config.PAGE_SIZE,
                    convert: 'USD',
                    sort: 'market_cap',
                    sort_dir: 'desc'
                });
                
                const coins = data.map(coin => ({
                    id: coin.id,
                    rank: coin.cmc_rank,
                    name: coin.name,
                    symbol: coin.symbol,
                    price: coin.quote.USD.price,
                    change1h: coin.quote.USD.percent_change_1h,
                    change24h: coin.quote.USD.percent_change_24h,
                    change7d: coin.quote.USD.percent_change_7d,
                    market_cap: coin.quote.USD.market_cap,
                    volume_24h: coin.quote.USD.volume_24h,
                    circulating_supply: coin.circulating_supply,
                    max_supply: coin.max_supply,
                    ath: coin.quote.USD.ath,
                    atl: coin.quote.USD.atl,
                    sparkline7d: []
                }));
                
                allCoins.push(...coins);
                
                // Сохранение страницы
                await fs.writeFile(
                    path.join(this.config.DATA_DIR, 'markets', `page-${page}.json`),
                    JSON.stringify({ coins }, null, 2)
                );
                
                // Задержка для избежания rate limit
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                console.error(`❌ Ошибка страницы ${page}:`, error.message);
                break;
            }
        }
        
        // Метаданные
        const meta = {
            total_coins: allCoins.length,
            total_pages: totalPages,
            page_size: this.config.PAGE_SIZE,
            last_updated: Date.now()
        };
        
        await fs.writeFile(
            path.join(this.config.DATA_DIR, 'markets', 'meta.json'),
            JSON.stringify(meta, null, 2)
        );
        
        console.log(`✅ Список монет обновлен: ${allCoins.length} монет`);
        return allCoins;
    }
    
    async updateCoinDetails(coins) {
        console.log('🔄 Обновление деталей монет...');
        
        const batchSize = 50;
        const coinIds = coins.map(coin => coin.id);
        
        for (let i = 0; i < coinIds.length; i += batchSize) {
            const batch = coinIds.slice(i, i + batchSize);
            console.log(`📦 Пакет ${Math.floor(i / batchSize) + 1} из ${Math.ceil(coinIds.length / batchSize)}...`);
            
            try {
                const data = await this.apiRequest('/v2/cryptocurrency/info', {
                    id: batch.join(','),
                    aux: 'description,logo,urls'
                });
                
                for (const [id, info] of Object.entries(data)) {
                    const coin = coins.find(c => c.id === parseInt(id));
                    
                    if (coin && info) {
                        const coinData = {
                            ...coin,
                            description: info.description || '',
                            logo: info.logo || '',
                            urls: info.urls || {},
                            tags: info.tags || [],
                            date_added: info.date_added,
                            platform: info.platform
                        };
                        
                        await fs.writeFile(
                            path.join(this.config.DATA_DIR, 'coins', `${id}.json`),
                            JSON.stringify(coinData, null, 2)
                        );
                    }
                }
                
                // Задержка
                await new Promise(resolve => setTimeout(resolve, 2000));
                
            } catch (error) {
                console.error(`❌ Ошибка пакета начиная с ${i}:`, error.message);
            }
        }
        
        console.log('✅ Детали монет обновлены');
    }
    
    async updateSearchIndex(coins) {
        console.log('🔄 Обновление поискового индекса...');
        
        const searchIndex = {
            coins: coins.map(coin => ({
                id: coin.id,
                name: coin.name,
                symbol: coin.symbol,
                rank: coin.rank,
                price: coin.price,
                change24h: coin.change24h
            })),
            last_updated: Date.now()
        };
        
        await fs.writeFile(
            path.join(this.config.DATA_DIR, 'search-index.json'),
            JSON.stringify(searchIndex, null, 2)
        );
        
        console.log('✅ Поисковый индекс обновлен');
    }
    
    async updateNews() {
        console.log('🔄 Обновление новостей...');
        
        if (!this.config.CRYPTOPANIC_API_KEY) {
            console.log('⚠️  API ключ CryptoPanic не указан, используются тестовые новости');
            await this.generateTestNews();
            return;
        }
        
        try {
            const news = await this.fetchNewsFromCryptoPanic();
            await fs.writeFile(
                path.join(this.config.DATA_DIR, 'news', 'latest.json'),
                JSON.stringify(news, null, 2)
            );
            
            console.log('✅ Новости обновлены');
        } catch (error) {
            console.error('❌ Ошибка обновления новостей:', error.message);
            await this.generateTestNews();
        }
    }
    
    async fetchNewsFromCryptoPanic() {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'cryptopanic.com',
                path: `/api/v1/posts/?auth_token=${this.config.CRYPTOPANIC_API_KEY}&public=true&kind=news&filter=important`,
                headers: {
                    'User-Agent': 'CryptoDash/1.0',
                    'Accept': 'application/json'
                }
            };
            
            https.get(options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    try {
                        const json = JSON.parse(data);
                        
                        if (json.results) {
                            const articles = json.results.slice(0, 20).map(post => ({
                                id: post.id,
                                title: post.title,
                                source: post.domain || 'CryptoPanic',
                                url: post.url,
                                published_at: new Date(post.published_at).getTime(),
                                summary: post.metadata?.description || '',
                                currencies: post.currencies || [],
                                votes: {
                                    positive: post.votes?.positive || 0,
                                    negative: post.votes?.negative || 0,
                                    important: post.votes?.important || 0
                                }
                            }));
                            
                            resolve({
                                articles,
                                source: 'CryptoPanic',
                                last_updated: Date.now()
                            });
                        } else {
                            reject(new Error('Invalid response format'));
                        }
                    } catch (error) {
                        reject(error);
                    }
                });
            }).on('error', reject);
        });
    }
    
    async generateTestNews() {
        const sources = ['CoinDesk', 'CoinTelegraph', 'CryptoSlate', 'NewsBTC', 'Bitcoin.com'];
        const topics = [
            'Bitcoin Surges Past Key Resistance Level',
            'Ethereum Layer 2 Solutions Gain Traction',
            'Regulatory Developments Shape Crypto Market',
            'DeFi Innovation Continues Despite Market Conditions',
            'NFT Market Shows Signs of Recovery'
        ];
        
        const articles = [];
        const now = Date.now();
        
        for (let i = 0; i < 10; i++) {
            articles.push({
                id: `test-${i}`,
                title: topics[i % topics.length],
                source: sources[i % sources.length],
                url: '#',
                published_at: now - (i * 3600000),
                summary: 'This is a test news article. Real news would be fetched from CryptoPanic API with a valid API key.',
                currencies: i % 2 === 0 ? ['BTC'] : ['ETH'],
                votes: {
                    positive: Math.floor(Math.random() * 100),
                    negative: Math.floor(Math.random() * 20),
                    important: Math.floor(Math.random() * 10)
                }
            });
        }
        
        const newsData = {
            articles,
            source: 'Test',
            last_updated: now
        };
        
        await fs.writeFile(
            path.join(this.config.DATA_DIR, 'news', 'latest.json'),
            JSON.stringify(newsData, null, 2)
        );
    }
    
    async updateFearGreed() {
        console.log('🔄 Обновление индекса страха и жадности...');
        
        // В реальном проекте здесь был бы запрос к alternative.me API
        // Генерация тестовых данных
        const value = Math.floor(Math.random() * 100);
        let classification = 'Neutral';
        
        if (value <= 20) classification = 'Extreme Fear';
        else if (value <= 40) classification = 'Fear';
        else if (value <= 60) classification = 'Neutral';
        else if (value <= 80) classification = 'Greed';
        else classification = 'Extreme Greed';
        
        const data = {
            value,
            value_classification: classification,
            timestamp: Date.now(),
            time_until_update: '23'
        };
        
        await fs.writeFile(
            path.join(this.config.DATA_DIR, 'feargreed.json'),
            JSON.stringify(data, null, 2)
        );
        
        console.log('✅ Индекс страха и жадности обновлен');
    }
    
    async updateTVMap(coins) {
        console.log('🔄 Обновление TradingView mapping...');
        
        const tvMap = {};
        const topCoins = coins.slice(0, 50);
        
        // Базовый маппинг для популярных монет
        const exchangeMap = {
            'BTC': ['BINANCE', 'COINBASE', 'KRAKEN'],
            'ETH': ['BINANCE', 'COINBASE', 'KRAKEN'],
            'BNB': ['BINANCE'],
            'ADA': ['BINANCE', 'COINBASE'],
            'SOL': ['BINANCE', 'FTX'],
            'XRP': ['BINANCE', 'KRAKEN'],
            'DOT': ['BINANCE', 'KRAKEN'],
            'DOGE': ['BINANCE', 'COINBASE'],
            'AVAX': ['BINANCE', 'COINBASE'],
            'MATIC': ['BINANCE', 'COINBASE']
        };
        
        topCoins.forEach(coin => {
            const exchanges = exchangeMap[coin.symbol] || ['BINANCE'];
            
            tvMap[coin.symbol] = {
                symbol: coin.symbol,
                exchanges: exchanges.reduce((acc, exchange) => {
                    acc[exchange] = true;
                    return acc;
                }, {})
            };
        });
        
        await fs.writeFile(
            path.join(this.config.DATA_DIR, 'charts', 'tv-map.json'),
            JSON.stringify(tvMap, null, 2)
        );
        
        console.log('✅ TradingView mapping обновлен');
    }
    
    async updateTrending(coins) {
        console.log('🔄 Обновление трендов...');
        
        const sortedByChange = [...coins]
            .sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h))
            .slice(0, 10);
        
        const data = {
            trending: sortedByChange,
            last_updated: Date.now()
        };
        
        await fs.writeFile(
            path.join(this.config.DATA_DIR, 'trending.json'),
            JSON.stringify(data, null, 2)
        );
        
        console.log('✅ Тренды обновлены');
    }
    
    async updateGenerated() {
        console.log('🔄 Обновление метаданных...');
        
        const data = {
            timestamp: Date.now(),
            version: '2.0.0',
            generated_at: new Date().toISOString()
        };
        
        await fs.writeFile(
            path.join(this.config.DATA_DIR, 'generated.json'),
            JSON.stringify(data, null, 2)
        );
        
        console.log('✅ Метаданные обновлены');
    }
    
    async run() {
        console.log('🚀 Запуск обновления данных CryptoDash...');
        console.log(`📊 Максимальное количество монет: ${this.config.MAX_COINS}`);
        console.log(`📄 Размер страницы: ${this.config.PAGE_SIZE}`);
        
        if (!this.config.API_KEY) {
            throw new Error('❌ Не указан CMC_PRO_API_KEY');
        }
        
        try {
            await this.ensureDirectories();
            
            // Параллельная загрузка основных данных
            const [globalData, coins] = await Promise.all([
                this.updateGlobalData(),
                this.updateListings()
            ]);
            
            // Последовательная обработка зависимых данных
            await this.updateCoinDetails(coins);
            await this.updateSearchIndex(coins);
            await this.updateNews();
            await this.updateFearGreed();
            await this.updateTVMap(coins);
            await this.updateTrending(coins);
            await this.updateGenerated();
            
            console.log('🎉 Обновление данных успешно завершено!');
            
        } catch (error) {
            console.error('💥 Критическая ошибка:', error.message);
            process.exit(1);
        }
    }
}

// Запуск
if (require.main === module) {
    const updater = new DataUpdater();
    updater.run();
}

module.exports = DataUpdater;