// Конфигурация приложения
export class Config {
    constructor() {
        this.settings = {
            DATA_PATH: 'data',
            ASSETS_PATH: 'assets',
            IMG_PATH: 'assets/img/coins',
            
            // Пагинация
            DEFAULT_PAGE_SIZE: 50,
            MAX_PAGE_SIZE: 200,
            
            // Кэш
            CACHE_TTL: 5 * 60 * 1000, // 5 минут
            
            // Ключи localStorage
            LS_THEME: 'cryptodash-theme',
            LS_LANG: 'cryptodash-language',
            LS_FAVORITES: 'cryptodash-favorites',
            LS_SETTINGS: 'cryptodash-settings',
            
            // Значения по умолчанию
            DEFAULT_THEME: 'dark',
            DEFAULT_LANG: 'ru',
            
            // Эндпоинты
            ENDPOINTS: {
                GLOBAL: 'data/global.json',
                FEARGREED: 'data/feargreed.json',
                NEWS: 'data/news/latest.json',
                TRENDING: 'data/trending.json',
                COIN: (id) => `data/coins/${id}.json`,
                MARKET_PAGE: (page) => `data/markets/page-${page}.json`,
                MARKET_META: 'data/markets/meta.json',
                TV_MAP: 'data/charts/tv-map.json',
                GENERATED: 'data/generated.json',
                SEARCH_INDEX: 'data/search-index.json'
            }
        };
        
        this.state = {
            theme: this.settings.DEFAULT_THEME,
            language: this.settings.DEFAULT_LANG,
            currentPage: 1,
            pageSize: this.settings.DEFAULT_PAGE_SIZE,
            totalPages: 1,
            isLoading: false,
            lastUpdate: null,
            isOnline: navigator.onLine
        };
    }
    
    async init() {
        this.loadState();
        this.setupEventListeners();
    }
    
    loadState() {
        // Загрузка темы
        const savedTheme = localStorage.getItem(this.settings.LS_THEME);
        if (savedTheme) {
            this.state.theme = savedTheme;
        } else {
            // Определение системной темы
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            this.state.theme = systemTheme;
        }
        
        // Загрузка языка
        const savedLang = localStorage.getItem(this.settings.LS_LANG);
        if (savedLang) {
            this.state.language = savedLang;
        } else {
            // Определение языка браузера
            const browserLang = navigator.language.startsWith('ru') ? 'ru' : 'en';
            this.state.language = browserLang;
        }
        
        // Применение состояния
        document.documentElement.setAttribute('data-theme', this.state.theme);
        document.documentElement.setAttribute('lang', this.state.language);
    }
    
    saveState() {
        localStorage.setItem(this.settings.LS_THEME, this.state.theme);
        localStorage.setItem(this.settings.LS_LANG, this.state.language);
    }
    
    setupEventListeners() {
        // Отслеживание изменений системной темы
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem(this.settings.LS_THEME)) {
                this.state.theme = e.matches ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', this.state.theme);
            }
        });
        
        // Отслеживание онлайн/офлайн статуса
        window.addEventListener('online', () => {
            this.state.isOnline = true;
            this.emit('onlineStatusChanged', { isOnline: true });
        });
        
        window.addEventListener('offline', () => {
            this.state.isOnline = false;
            this.emit('onlineStatusChanged', { isOnline: false });
        });
    }
    
    // Геттеры
    get theme() {
        return this.state.theme;
    }
    
    set theme(value) {
        if (['dark', 'light'].includes(value)) {
            this.state.theme = value;
            this.saveState();
            document.documentElement.setAttribute('data-theme', value);
            this.emit('themeChanged', { theme: value });
        }
    }
    
    get language() {
        return this.state.language;
    }
    
    set language(value) {
        if (['ru', 'en'].includes(value)) {
            this.state.language = value;
            this.saveState();
            document.documentElement.setAttribute('lang', value);
            this.emit('languageChanged', { language: value });
        }
    }
    
    get isOnline() {
        return this.state.isOnline;
    }
    
    // События
    emit(eventName, detail = {}) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    }
    
    on(eventName, callback) {
        document.addEventListener(eventName, (e) => callback(e.detail));
    }
}
