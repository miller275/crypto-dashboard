// Новости
export class News {
    constructor(dataClient, i18n) {
        this.dataClient = dataClient;
        this.i18n = i18n;
    }
    
    async load() {
        try {
            const newsData = await this.dataClient.getNews();
            if (newsData && newsData.articles) {
                this.render(newsData.articles.slice(0, 10));
            }
        } catch (error) {
            console.error('Failed to load news:', error);
            this.render([]);
        }
    }
    
    render(articles) {
        const container = document.querySelector('[data-news-list]');
        if (!container) return;
        
        if (articles.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>${this.i18n.t('news.noNews')}</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = articles.map(article => `
            <div class="news-item" data-news-id="${article.id}">
                <div class="news-item__title">${this.truncate(article.title, 80)}</div>
                <div class="news-item__meta">
                    <span class="news-item__source">${article.source}</span>
                    <span class="news-item__time">${this.formatTime(article.published_at)}</span>
                </div>
                ${article.currencies && article.currencies.length > 0 ? `
                    <div class="news-tags">
                        ${article.currencies.slice(0, 3).map(currency => `
                            <span class="news-tag">${currency}</span>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `).join('');
        
        // Обработчики кликов
        container.querySelectorAll('.news-item').forEach(item => {
            item.addEventListener('click', () => {
                const newsId = item.getAttribute('data-news-id');
                if (newsId && articles.find(a => a.id === newsId)?.url) {
                    const article = articles.find(a => a.id === newsId);
                    if (article.url !== '#') {
                        window.open(article.url, '_blank', 'noopener,noreferrer');
                    }
                }
            });
        });
    }
    
    truncate(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    }
    
    formatTime(timestamp) {
        if (!timestamp) return '';
        
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        
        if (minutes < 1) {
            return this.i18n.t('time.justNow');
        } else if (minutes < 60) {
            return `${minutes} ${this.i18n.t('time.minutesAgo')}`;
        } else if (hours < 24) {
            return `${hours} ${this.i18n.t('time.hoursAgo')}`;
        } else {
            const date = new Date(timestamp);
            return date.toLocaleDateString(this.i18n.current === 'ru' ? 'ru-RU' : 'en-US', {
                month: 'short',
                day: 'numeric'
            });
        }
    }
    
    // Кэширование новостей
    async getCachedNews() {
        const cacheKey = 'news_cache';
        const cached = localStorage.getItem(cacheKey);
        
        if (cached) {
            try {
                const data = JSON.parse(cached);
                if (Date.now() - data.timestamp < 5 * 60 * 1000) { // 5 минут
                    return data.articles;
                }
            } catch (error) {
                console.error('Failed to parse cached news:', error);
            }
        }
        
        return null;
    }
    
    // Сохранение в кэш
    cacheNews(articles) {
        const cacheData = {
            timestamp: Date.now(),
            articles: articles.slice(0, 20) // Сохраняем только 20 статей
        };
        
        try {
            localStorage.setItem('news_cache', JSON.stringify(cacheData));
        } catch (error) {
            console.error('Failed to cache news:', error);
        }
    }
}