// Поиск с подсказками
export class Search {
    constructor(dataClient, i18n) {
        this.dataClient = dataClient;
        this.i18n = i18n;
        this.searchIndex = [];
        this.suggestions = [];
        this.selectedIndex = -1;
        
        this.init();
    }
    
    async init() {
        this.cache = new Map();
        await this.loadSearchIndex();
        this.setupEventListeners();
    }
    
    async loadSearchIndex() {
        try {
            const data = await this.dataClient.getSearchIndex();
            if (data && data.coins) {
                this.searchIndex = data.coins;
                console.log('Search index loaded:', this.searchIndex.length, 'coins');
            }
        } catch (error) {
            console.error('Failed to load search index:', error);
        }
    }
    
    setupEventListeners() {
        const searchInput = document.querySelector('[data-search-input]');
        const searchButton = document.querySelector('[data-search-button]');
        const suggestionsContainer = document.querySelector('[data-search-suggestions]');
        
        if (!searchInput || !suggestionsContainer) return;
        
        // Поиск при вводе
        searchInput.addEventListener('input', this.handleInput.bind(this));
        
        // Поиск по кнопке
        if (searchButton) {
            searchButton.addEventListener('click', () => {
                this.performSearch(searchInput.value);
            });
        }
        
        // Поиск по Enter
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.performSearch(searchInput.value);
            }
            
            // Навигация по подсказкам
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateSuggestions(1);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateSuggestions(-1);
            } else if (e.key === 'Escape') {
                this.hideSuggestions();
            }
        });
        
        // Закрытие подсказок при клике вне
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search')) {
                this.hideSuggestions();
            }
        });
        
        // Фокус на поле поиска по /
        document.addEventListener('keydown', (e) => {
            if (e.key === '/' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                searchInput.focus();
            }
        });
    }
    
    handleInput(e) {
        const query = e.target.value.trim();
        
        if (query.length < 2) {
            this.hideSuggestions();
            return;
        }
        
        this.showSuggestions(query);
    }
    
    showSuggestions(query) {
        const suggestionsContainer = document.querySelector('[data-search-suggestions]');
        if (!suggestionsContainer) return;
        
        const results = this.search(query);
        
        if (results.length === 0) {
            suggestionsContainer.innerHTML = `
                <div class="search-suggestion">
                    <div class="search-suggestion__info">
                        <div class="search-suggestion__name">${this.i18n.t('search.noResults')}</div>
                    </div>
                </div>
            `;
        } else {
            suggestionsContainer.innerHTML = results.map((coin, index) => `
                <div class="search-suggestion ${index === this.selectedIndex ? 'search-suggestion--focused' : ''}" 
                     data-coin-id="${coin.id}" data-index="${index}">
                    <div class="search-suggestion__icon">
                        ${coin.symbol.substring(0, 3)}
                    </div>
                    <div class="search-suggestion__info">
                        <div class="search-suggestion__name">${coin.name}</div>
                        <div class="search-suggestion__symbol">${coin.symbol}</div>
                    </div>
                    <div class="search-suggestion__price">
                        $${coin.price.toFixed(2)}
                    </div>
                </div>
            `).join('');
            
            // Обработчики кликов
            suggestionsContainer.querySelectorAll('.search-suggestion').forEach(suggestion => {
                suggestion.addEventListener('click', () => {
                    this.selectSuggestion(suggestion);
                });
                
                suggestion.addEventListener('mouseenter', () => {
                    this.selectedIndex = parseInt(suggestion.getAttribute('data-index'));
                    this.updateSelectedSuggestion();
                });
            });
        }
        
        suggestionsContainer.classList.add('search-suggestions--visible');
        this.suggestions = results;
    }
    
    hideSuggestions() {
        const suggestionsContainer = document.querySelector('[data-search-suggestions]');
        if (suggestionsContainer) {
            suggestionsContainer.classList.remove('search-suggestions--visible');
            this.selectedIndex = -1;
            this.suggestions = [];
        }
    }
    
    navigateSuggestions(direction) {
        if (this.suggestions.length === 0) return;
        
        const newIndex = this.selectedIndex + direction;
        
        if (newIndex >= 0 && newIndex < this.suggestions.length) {
            this.selectedIndex = newIndex;
            this.updateSelectedSuggestion();
            
            // Прокрутка к выбранному элементу
            const selectedEl = document.querySelector(`.search-suggestion[data-index="${this.selectedIndex}"]`);
            if (selectedEl) {
                selectedEl.scrollIntoView({ block: 'nearest' });
            }
        }
    }
    
    updateSelectedSuggestion() {
        document.querySelectorAll('.search-suggestion').forEach(el => {
            el.classList.remove('search-suggestion--focused');
        });
        
        const selectedEl = document.querySelector(`.search-suggestion[data-index="${this.selectedIndex}"]`);
        if (selectedEl) {
            selectedEl.classList.add('search-suggestion--focused');
        }
    }
    
    selectSuggestion(suggestion) {
        const coinId = suggestion.getAttribute('data-coin-id');
        if (coinId) {
            window.location.href = `coin.html?id=${coinId}`;
        }
        
        this.hideSuggestions();
    }
    
    performSearch(query) {
        if (!query.trim()) return;
        
        const results = this.search(query);
        
        if (results.length > 0) {
            // Переход к первой найденной монете
            window.location.href = `coin.html?id=${results[0].id}`;
        } else {
            // Показать сообщение об отсутствии результатов
            alert(this.i18n.t('search.noResults'));
        }
        
        this.hideSuggestions();
    }
    
    search(query) {
        const normalizedQuery = query.toLowerCase().trim();
        
        if (!normalizedQuery) {
            return [];
        }
        
        // Проверка кэша
        const cacheKey = `search:${normalizedQuery}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        const results = this.searchIndex.filter(coin => {
            const name = coin.name.toLowerCase();
            const symbol = coin.symbol.toLowerCase();
            
            // Поиск по названию и символу
            return name.includes(normalizedQuery) || 
                   symbol.includes(normalizedQuery) ||
                   symbol === normalizedQuery;
        }).slice(0, 10); // Ограничение результатов
        
        // Сортировка по релевантности
        results.sort((a, b) => {
            const aNameMatch = a.name.toLowerCase().indexOf(normalizedQuery);
            const bNameMatch = b.name.toLowerCase().indexOf(normalizedQuery);
            const aSymbolMatch = a.symbol.toLowerCase() === normalizedQuery ? 0 : 1;
            const bSymbolMatch = b.symbol.toLowerCase() === normalizedQuery ? 0 : 1;
            
            // Приоритет: точное совпадение символа > совпадение в названии > ранг
            if (aSymbolMatch !== bSymbolMatch) {
                return aSymbolMatch - bSymbolMatch;
            }
            
            if (aNameMatch !== bNameMatch) {
                return aNameMatch - bNameMatch;
            }
            
            return a.rank - b.rank;
        });
        
        // Кэширование результатов
        this.cache.set(cacheKey, results);
        
        return results;
    }
    
    // Быстрый поиск по символу
    quickSearch(symbol) {
        const normalizedSymbol = symbol.toUpperCase();
        return this.searchIndex.find(coin => coin.symbol === normalizedSymbol);
    }
    
    // Обновление поискового индекса
    updateSearchIndex(newIndex) {
        this.searchIndex = newIndex;
        this.cache.clear(); // Очистка кэша при обновлении индекса
    }
}