// Управление хранилищем
export class Storage {
    constructor() {
        this.prefix = 'cryptodash';
        this.keys = {
            THEME: `${this.prefix}-theme`,
            LANGUAGE: `${this.prefix}-language`,
            FAVORITES: `${this.prefix}-favorites`,
            SETTINGS: `${this.prefix}-settings`,
            CACHE: `${this.prefix}-cache`
        };
    }
    
    init() {
        // Проверка поддержки localStorage
        if (!this.isSupported()) {
            console.warn('localStorage не поддерживается');
            return false;
        }
        
        // Очистка устаревших данных
        this.cleanup();
        
        return true;
    }
    
    isSupported() {
        try {
            const testKey = '__test__';
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            return false;
        }
    }
    
    // Основные методы
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Ошибка чтения из localStorage:', error);
            return defaultValue;
        }
    }
    
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Ошибка записи в localStorage:', error);
            return false;
        }
    }
    
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Ошибка удаления из localStorage:', error);
            return false;
        }
    }
    
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Ошибка очистки localStorage:', error);
            return false;
        }
    }
    
    // Управление темой
    getTheme() {
        return this.get(this.keys.THEME) || 
               (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }
    
    setTheme(theme) {
        return this.set(this.keys.THEME, theme);
    }
    
    // Управление языком
    getLanguage() {
        return this.get(this.keys.LANGUAGE) || 
               (navigator.language.startsWith('ru') ? 'ru' : 'en');
    }
    
    setLanguage(lang) {
        return this.set(this.keys.LANGUAGE, lang);
    }
    
    // Управление избранным
    getFavorites() {
        return this.get(this.keys.FAVORITES, []);
    }
    
    setFavorites(favorites) {
        return this.set(this.keys.FAVORITES, favorites);
    }
    
    addFavorite(id) {
        const favorites = this.getFavorites();
        if (!favorites.includes(id)) {
            favorites.push(id);
            return this.setFavorites(favorites);
        }
        return true;
    }
    
    removeFavorite(id) {
        const favorites = this.getFavorites();
        const index = favorites.indexOf(id);
        if (index > -1) {
            favorites.splice(index, 1);
            return this.setFavorites(favorites);
        }
        return true;
    }
    
    isFavorite(id) {
        const favorites = this.getFavorites();
        return favorites.includes(id);
    }
    
    toggleFavorite(id) {
        if (this.isFavorite(id)) {
            return this.removeFavorite(id);
        } else {
            return this.addFavorite(id);
        }
    }
    
    // Управление настройками
    getSettings() {
        return this.get(this.keys.SETTINGS, {
            notifications: true,
            sound: false,
            autoRefresh: true,
            refreshInterval: 60,
            defaultView: 'table',
            showSparklines: true
        });
    }
    
    updateSettings(updates) {
        const settings = this.getSettings();
        return this.set(this.keys.SETTINGS, { ...settings, ...updates });
    }
    
    // Кэширование данных
    getCache(key, defaultValue = null) {
        const cache = this.get(this.keys.CACHE, {});
        const item = cache[key];
        
        if (item && item.expiry > Date.now()) {
            return item.data;
        }
        
        // Удаление просроченного элемента
        if (item) {
            delete cache[key];
            this.set(this.keys.CACHE, cache);
        }
        
        return defaultValue;
    }
    
    setCache(key, data, ttl = 5 * 60 * 1000) {
        const cache = this.get(this.keys.CACHE, {});
        cache[key] = {
            data,
            expiry: Date.now() + ttl
        };
        return this.set(this.keys.CACHE, cache);
    }
    
    clearCache(pattern = '') {
        const cache = this.get(this.keys.CACHE, {});
        
        if (pattern) {
            for (const key in cache) {
                if (key.includes(pattern)) {
                    delete cache[key];
                }
            }
        } else {
            // Очистка всего кэша
            return this.remove(this.keys.CACHE);
        }
        
        return this.set(this.keys.CACHE, cache);
    }
    
    // Очистка устаревших данных
    cleanup() {
        const cache = this.get(this.keys.CACHE, {});
        const now = Date.now();
        let changed = false;
        
        for (const key in cache) {
            if (cache[key].expiry < now) {
                delete cache[key];
                changed = true;
            }
        }
        
        if (changed) {
            this.set(this.keys.CACHE, cache);
        }
    }
    
    // Статистика хранилища
    getStats() {
        let totalSize = 0;
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            totalSize += key.length + value.length;
        }
        
        return {
            items: localStorage.length,
            size: totalSize,
            quota: 5 * 1024 * 1024 // 5MB стандартный лимит
        };
    }
    
    // Экспорт/импорт данных
    exportData() {
        const data = {};
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(this.prefix)) {
                data[key] = localStorage.getItem(key);
            }
        }
        
        return JSON.stringify(data, null, 2);
    }
    
    importData(json) {
        try {
            const data = JSON.parse(json);
            
            for (const key in data) {
                if (key.startsWith(this.prefix)) {
                    localStorage.setItem(key, data[key]);
                }
            }
            
            return true;
        } catch (error) {
            console.error('Ошибка импорта данных:', error);
            return false;
        }
    }
}