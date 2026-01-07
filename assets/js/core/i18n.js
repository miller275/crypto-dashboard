// Интернационализация
export class I18n {
    constructor() {
        this.translations = {};
        this.current = 'ru';
        this.fallback = 'en';
    }
    
    async init() {
        await this.loadTranslations('ru');
        await this.loadTranslations('en');
        
        // Установка языка из localStorage или браузера
        const savedLang = localStorage.getItem('cryptodash-language');
        if (savedLang) {
            await this.setLanguage(savedLang);
        } else {
            const browserLang = navigator.language.startsWith('ru') ? 'ru' : 'en';
            await this.setLanguage(browserLang);
        }
    }
    
    async loadTranslations(lang) {
        try {
            const response = await fetch(new URL(`assets/js/i18n/locales/${lang}.json`, window.location.href));
            this.translations[lang] = await response.json();
        } catch (error) {
            console.error(`Failed to load translations for ${lang}:`, error);
            this.translations[lang] = {};
        }
    }
    
    async setLanguage(lang) {
        if (!this.translations[lang]) {
            await this.loadTranslations(lang);
        }
        
        this.current = lang;
        localStorage.setItem('cryptodash-language', lang);
        document.documentElement.setAttribute('lang', lang);
        
        this.updatePage();
        
        // Событие смены языка
        document.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: lang }
        }));
        
        return lang;
    }
    
    t(key, params = {}) {
        const keys = key.split('.');
        let value = this.translations[this.current];
        
        // Поиск перевода
        for (const k of keys) {
            if (value && value[k] !== undefined) {
                value = value[k];
            } else {
                // Fallback на английский
                value = keys.reduce((obj, k) => obj && obj[k], this.translations[this.fallback] || {});
                break;
            }
        }
        
        if (typeof value !== 'string') {
            console.warn(`Translation not found for key: ${key}`);
            return key;
        }
        
        // Замена параметров
        return value.replace(/\{\{(\w+)\}\}/g, (match, param) => {
            return params[param] !== undefined ? params[param] : match;
        });
    }
    
    updatePage() {
        // Обновление элементов с data-i18n
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        });
        
        // Обновление атрибутов placeholder
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.t(key);
        });
        
        // Обновление атрибутов title
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            element.title = this.t(key);
        });
        
        // Обновление aria-label
        document.querySelectorAll('[data-i18n-aria-label]').forEach(element => {
            const key = element.getAttribute('data-i18n-aria-label');
            element.setAttribute('aria-label', this.t(key));
        });
    }
    
    // Форматирование чисел с локалью
    number(value, options = {}) {
        const locale = this.current === 'ru' ? 'ru-RU' : 'en-US';
        return new Intl.NumberFormat(locale, options).format(value);
    }
    
    // Форматирование валюты
    currency(value, currency = 'USD', options = {}) {
        const locale = this.current === 'ru' ? 'ru-RU' : 'en-US';
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency,
            ...options
        }).format(value);
    }
    
    // Форматирование даты
    date(date, options = {}) {
        const locale = this.current === 'ru' ? 'ru-RU' : 'en-US';
        return new Intl.DateTimeFormat(locale, options).format(date);
    }
    
    // Относительное время
    relativeTime(value, unit) {
        const locale = this.current === 'ru' ? 'ru-RU' : 'en-US';
        const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
        return rtf.format(value, unit);
    }
    
    // Список поддерживаемых языков
    getLanguages() {
        return [
            { code: 'ru', name: 'Русский', native: 'Русский' },
            { code: 'en', name: 'English', native: 'English' }
        ];
    }
}
