// Главный класс приложения
import { Config } from './config.js';
import { DataClient } from './data-client.js';
import { I18n } from './i18n.js';
import { Theme } from './theme.js';
import { Storage } from './storage.js';
import { Search } from '../features/search.js';
import { Favorites } from '../features/favorites.js';
import { Markets } from '../features/markets.js';
import { GlobalStats } from '../features/global.js';
import { News } from '../features/news.js';
import { TradingView } from '../features/tradingview.js';

export class App {
    constructor() {
        this.config = new Config();
        this.dataClient = new DataClient();
        this.i18n = new I18n();
        this.theme = new Theme();
        this.storage = new Storage();
        this.modules = {};
    }
    
    async init() {
        try {
            // Инициализация базовых модулей
            await this.initCore();
            
            // Инициализация модулей в зависимости от страницы
            await this.initPageModules();
            
            // Инициализация общих модулей
            await this.initCommonModules();
            
            // Загрузка данных
            await this.loadData();
            
            console.log('Приложение инициализировано');
        } catch (error) {
            console.error('Ошибка инициализации приложения:', error);
            this.showError('Не удалось загрузить приложение');
        }
    }
    
    async initCore() {
        // Инициализация конфигурации
        await this.config.init();
        
        // Инициализация перевода
        await this.i18n.init();
        
        // Инициализация темы
        await this.theme.init();
        
        // Инициализация хранилища
        await this.storage.init();
    }
    
    async initPageModules() {
        const path = window.location.pathname;
        
        if (path === '/' || path === '/index.html') {
            this.modules.markets = new Markets(this.dataClient, this.i18n);
            this.modules.globalStats = new GlobalStats(this.dataClient, this.i18n);
            this.modules.news = new News(this.dataClient, this.i18n);
        } else if (path === '/coin.html') {
            this.modules.tradingView = new TradingView(this.dataClient);
        }
    }
    
    async initCommonModules() {
        // Поиск
        this.modules.search = new Search(this.dataClient, this.i18n);
        
        // Избранное
        this.modules.favorites = new Favorites(this.storage, this.dataClient, this.i18n);
        
        // Инициализация UI компонентов
        this.initUIComponents();
    }
    
    initUIComponents() {
        // Dropdowns
        this.initDropdowns();
        
        // Обновление данных
        this.initRefreshButton();
        
        // Модальные окна
        this.initModals();
    }
    
    initDropdowns() {
        const dropdowns = document.querySelectorAll('[data-dropdown]');
        
        dropdowns.forEach(dropdown => {
            const toggle = dropdown.querySelector('[data-dropdown-toggle]');
            const menu = dropdown.querySelector('.dropdown__menu');
            
            if (toggle && menu) {
                toggle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    dropdown.classList.toggle('dropdown--open');
                });
                
                // Закрытие при клике вне
                document.addEventListener('click', (e) => {
                    if (!dropdown.contains(e.target)) {
                        dropdown.classList.remove('dropdown--open');
                    }
                });
                
                // Выбор языка
                const langItems = menu.querySelectorAll('[data-lang]');
                langItems.forEach(item => {
                    item.addEventListener('click', async () => {
                        const lang = item.getAttribute('data-lang');
                        await this.i18n.setLanguage(lang);
                        dropdown.classList.remove('dropdown--open');
                        
                        // Обновление отображения текущего языка
                        const currentEl = dropdown.querySelector('.dropdown__current');
                        if (currentEl) {
                            currentEl.textContent = this.i18n.t(`lang.${lang}`);
                            currentEl.setAttribute('data-i18n', `lang.${lang}`);
                        }
                    });
                });
            }
        });
    }
    
    initRefreshButton() {
        const refreshBtn = document.querySelector('[data-refresh]');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.dataClient.clearCache();
                
                // Показать индикатор загрузки
                const event = new CustomEvent('refreshStarted');
                document.dispatchEvent(event);
                
                // Перезагрузка страницы через 1 секунду
                setTimeout(() => window.location.reload(), 1000);
            });
        }
    }
    
    initModals() {
        const modals = document.querySelectorAll('.modal');
        
        modals.forEach(modal => {
            const closeBtns = modal.querySelectorAll('[data-modal-close]');
            const modalId = modal.id;
            
            // Открытие модального окна
            document.querySelectorAll(`[data-${modalId}]`).forEach(trigger => {
                trigger.addEventListener('click', () => {
                    this.openModal(modalId);
                });
            });
            
            // Закрытие модального окна
            closeBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    this.closeModal(modalId);
                });
            });
            
            // Закрытие по клавише Escape
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
                    this.closeModal(modalId);
                }
            });
            
            // Закрытие по клику на оверлей
            modal.addEventListener('click', (e) => {
                if (e.target === modal || e.target.classList.contains('modal__overlay')) {
                    this.closeModal(modalId);
                }
            });
        });
    }
    
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            
            // Фокус на кнопке закрытия
            const closeBtn = modal.querySelector('[data-modal-close]:not(.modal__overlay)');
            if (closeBtn) closeBtn.focus();
            
            // Событие открытия модального окна
            const event = new CustomEvent('modalOpened', { detail: { modalId } });
                  document.dispatchEvent(event);
        }
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            
            // Возврат фокуса на элемент, который открыл модальное окно
            const trigger = document.querySelector(`[data-${modalId}]`);
            if (trigger) trigger.focus();
            
            // Событие закрытия модального окна
            const event = new CustomEvent('modalClosed', { detail: { modalId } });
            document.dispatchEvent(event);
        }
    }
    
    async loadData() {
        try {
            // Загрузка глобальных данных
            if (this.modules.globalStats) {
                await this.modules.globalStats.load();
                await this.modules.globalStats.updateTrends();
            }
            
            // Загрузка рынков
            if (this.modules.markets) {
                await this.modules.markets.load();
            }
            
            // Загрузка новостей
            if (this.modules.news) {
                await this.modules.news.load();
            }
            
            // Загрузка TradingView
            if (this.modules.tradingView) {
                await this.modules.tradingView.init();
            }
            
            // Обновление избранного
            if (this.modules.favorites) {
                await this.modules.favorites.updateBadge();
            }
            
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            this.showError('Не удалось загрузить данные');
@@ -257,26 +258,26 @@ export class App {
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" 
                          fill="currentColor"/>
                </svg>
                <span>${message}</span>
                <button class="error-notification__close" aria-label="Закрыть">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
            </div>
        `;
        
        document.body.appendChild(errorEl);
        
        // Автоматическое скрытие через 5 секунд
        setTimeout(() => {
            errorEl.remove();
        }, 5000);
        
        // Закрытие по клику
        errorEl.querySelector('.error-notification__close').addEventListener('click', () => {
            errorEl.remove();
        });
    }
}
