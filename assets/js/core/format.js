// Форматирование данных
export class Formatter {
    constructor(i18n) {
        this.i18n = i18n;
    }
    
    // Форматирование чисел
    number(value, options = {}) {
        if (value === null || value === undefined || isNaN(value)) {
            return '—';
        }
        
        const {
            decimals = 2,
            prefix = '',
            suffix = '',
            compact = false,
            sign = false
        } = options;
        
        let formattedValue = value;
        
        // Добавление знака
        let signPrefix = '';
        if (sign && value > 0) {
            signPrefix = '+';
        }
        
        // Компактное отображение
        if (compact && Math.abs(value) >= 1000) {
            const suffixes = ['', 'K', 'M', 'B', 'T'];
            const tier = Math.floor(Math.log10(Math.abs(value)) / 3);
            
            if (tier > 0 && tier < suffixes.length) {
                const suffix = suffixes[tier];
                const scale = Math.pow(10, tier * 3);
                formattedValue = value / scale;
                
                return `${signPrefix}${prefix}${formattedValue.toFixed(decimals)}${suffix}${suffixes[0] ? suffix : ''}`;
            }
        }
        
        // Форматирование с локалью
        const locale = this.i18n?.current === 'ru' ? 'ru-RU' : 'en-US';
        const formatter = new Intl.NumberFormat(locale, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
        
        return `${signPrefix}${prefix}${formatter.format(formattedValue)}${suffix}`;
    }
    
    // Форматирование валюты
    currency(value, currency = 'USD') {
        if (value === null || value === undefined || isNaN(value)) {
            return '—';
        }
        
        const locale = this.i18n?.current === 'ru' ? 'ru-RU' : 'en-US';
        
        // Компактное отображение для больших чисел
        if (Math.abs(value) >= 1000000) {
            return this.number(value, { 
                prefix: '$', 
                decimals: 2, 
                compact: true 
            });
        }
        
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: value < 1 ? 6 : 2
        }).format(value);
    }
    
    // Форматирование процентов
    percent(value, decimals = 2) {
        if (value === null || value === undefined || isNaN(value)) {
            return '—';
        }
        
        return this.number(value, { 
            decimals, 
            suffix: '%', 
            sign: true 
        });
    }
    
    // Форматирование изменения с цветом
    change(value, decimals = 2) {
        if (value === null || value === undefined || isNaN(value)) {
            return {
                text: '—',
                class: 'change--neutral'
            };
        }
        
        const text = this.percent(value, decimals);
        const changeClass = value > 0 ? 'change--up' : value < 0 ? 'change--down' : 'change--neutral';
        
        return {
            text,
            class: changeClass
        };
    }
    
    // Форматирование рыночной капитализации
    marketCap(value) {
        return this.currency(value);
    }
    
    // Форматирование объема
    volume(value) {
        return this.currency(value);
    }
    
    // Форматирование предложения
    supply(value) {
        return this.number(value, { 
            decimals: 0,
            compact: true 
        });
    }
    
    // Относительное время
    relativeTime(timestamp) {
        if (!timestamp) return '—';
        
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        const locale = this.i18n?.current === 'ru' ? 'ru-RU' : 'en-US';
        const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
        
        if (minutes < 1) {
            return this.i18n.t('time.justNow');
        } else if (minutes < 60) {
            return rtf.format(-minutes, 'minute');
        } else if (hours < 24) {
            return rtf.format(-hours, 'hour');
        } else {
            return rtf.format(-days, 'day');
        }
    }
    
    // Форматирование даты
    date(timestamp, options = {}) {
        if (!timestamp) return '—';
        
        const locale = this.i18n?.current === 'ru' ? 'ru-RU' : 'en-US';
        const date = new Date(timestamp);
        
        return new Intl.DateTimeFormat(locale, {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            ...options
        }).format(date);
    }
    
    // Обрезка текста
    truncate(text, maxLength = 100, ellipsis = '...') {
        if (!text || text.length <= maxLength) return text;
        
        return text.substring(0, maxLength).trim() + ellipsis;
    }
    
    // URL иконки монеты
    coinIcon(id, symbol) {
        // Попытка загрузить локальную иконку
        const localIcon = `/assets/img/coins/${id}.png`;
        
        // Fallback на генерацию иконки
        return localIcon;
    }
    
    // Форматирование времени обновления
    updateTime(timestamp) {
        if (!timestamp) return '—';
        
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        
        if (minutes < 1) {
            return this.i18n.t('time.justNow');
        } else if (minutes < 60) {
            return `${minutes} ${this.i18n.t('time.minutesAgo')}`;
        } else {
            return this.date(timestamp, { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        }
    }
    
    // Форматирование индекса страха и жадности
    fearGreed(value) {
        if (value === null || value === undefined) {
            return '—';
        }
        
        let classification = 'neutral';
        let color = 'neutral';
        
        if (value <= 20) {
            classification = 'extremeFear';
            color = 'danger';
        } else if (value <= 40) {
            classification = 'fear';
            color = 'warning';
        } else if (value <= 60) {
            classification = 'neutral';
            color = 'neutral';
        } else if (value <= 80) {
            classification = 'greed';
            color = 'success';
        } else {
            classification = 'extremeGreed';
            color = 'success';
        }
        
        return {
            value,
            classification: this.i18n.t(`feargreed.${classification}`),
            color
        };
    }
}