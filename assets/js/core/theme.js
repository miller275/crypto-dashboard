// Управление темой
export class Theme {
    constructor() {
        this.current = 'dark';
        this.listeners = new Set();
    }
    
    async init() {
        // Загрузка сохраненной темы
        const savedTheme = localStorage.getItem('cryptodash-theme');
        if (savedTheme) {
            this.current = savedTheme;
        } else {
            // Определение системной темы
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            this.current = systemTheme;
        }
        
        // Применение темы
        this.apply();
        
        // Настройка слушателей
        this.setupListeners();
    }
    
    apply() {
        document.documentElement.setAttribute('data-theme', this.current);
        
        // Уведомление слушателей
        this.listeners.forEach(listener => {
            listener(this.current);
        });
        
        // Событие изменения темы
        document.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme: this.current }
        }));
    }
    
    setupListeners() {
        // Кнопка переключения темы
        const toggleBtn = document.querySelector('[data-theme-toggle]');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.toggle();
            });
        }
        
        // Отслеживание изменений системной темы
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
            // Изменение только если тема не была сохранена пользователем
            if (!localStorage.getItem('cryptodash-theme')) {
                this.set(e.matches ? 'dark' : 'light');
            }
        });
    }
    
    set(theme) {
        if (theme !== this.current) {
            this.current = theme;
            localStorage.setItem('cryptodash-theme', theme);
            this.apply();
        }
    }
    
    toggle() {
        const newTheme = this.current === 'dark' ? 'light' : 'dark';
        this.set(newTheme);
    }
    
    get() {
        return this.current;
    }
    
    // Подписка на изменения темы
    subscribe(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }
    
    // Проверка темной темы
    isDark() {
        return this.current === 'dark';
    }
    
    // Проверка светлой темы
    isLight() {
        return this.current === 'light';
    }
    
    // Получение CSS переменных для темы
    getVariables() {
        const root = document.documentElement;
        const computed = getComputedStyle(root);
        
        return {
            background: computed.getPropertyValue('--color-background'),
            surface: computed.getPropertyValue('--color-surface'),
            text: computed.getPropertyValue('--color-text-primary'),
            primary: computed.getPropertyValue('--color-primary')
        };
    }
    
    // Установка кастомных CSS переменных
    setVariable(name, value) {
        document.documentElement.style.setProperty(name, value);
    }
    
    // Сброс кастомных переменных
    resetVariables() {
        const root = document.documentElement;
        const style = root.style;
        
        // Удаление всех кастомных переменных темы
        for (let i = style.length - 1; i >= 0; i--) {
            const property = style[i];
            if (property.startsWith('--color-')) {
                style.removeProperty(property);
            }
        }
    }
}