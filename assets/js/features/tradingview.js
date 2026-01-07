// TradingView график
export class TradingView {
    constructor(dataClient) {
        this.dataClient = dataClient;
        this.widget = null;
        this.currentSymbol = null;
    }
    
    async init() {
        const coinId = new URLSearchParams(window.location.search).get('id');
        if (!coinId) return;
        
        try {
            const [coinData, tvMap] = await Promise.all([
                this.dataClient.getCoin(coinId),
                this.dataClient.getTVMap()
            ]);
            
            if (!coinData || !tvMap) {
                this.showFallback();
                return;
            }
            
            this.setupChart(coinData, tvMap);
            
        } catch (error) {
            console.error('Failed to initialize TradingView:', error);
            this.showFallback();
        }
    }
    
    setupChart(coinData, tvMap) {
        const symbol = coinData.symbol;
        const mapping = tvMap[symbol];
        
        if (!mapping || !mapping.exchanges) {
            this.showFallback();
            return;
        }
        
        // Поиск доступной биржи
        const exchange = mapping.exchanges.BINANCE ? 'BINANCE' :
                        mapping.exchanges.COINBASE ? 'COINBASE' :
                        mapping.exchanges.KRAKEN ? 'KRAKEN' :
                        Object.keys(mapping.exchanges)[0];
        
        if (!exchange) {
            this.showFallback();
            return;
        }
        
        this.currentSymbol = `${exchange}:${symbol}USDT`;
        this.createWidget();
        this.setupPeriodButtons();
    }
    
    createWidget() {
        if (typeof TradingView === 'undefined') {
            console.error('TradingView widget not loaded');
            this.showFallback();
            return;
        }
        
        const container = document.getElementById('tradingview-chart');
        if (!container) return;
        
        this.widget = new TradingView.widget({
            container_id: 'tradingview-chart',
            symbol: this.currentSymbol,
            interval: 'D',
            timezone: 'exchange',
            theme: document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light',
            style: '1',
            locale: document.documentElement.getAttribute('lang') === 'ru' ? 'ru' : 'en',
            toolbar_bg: '#f1f3f6',
            enable_publishing: false,
            allow_symbol_change: false,
            hide_side_toolbar: false,
            details: true,
            studies: [
                'Volume@tv-basicstudies'
            ],
            show_popup_button: true,
            popup_width: '1000',
            popup_height: '650',
            disabled_features: [
                'header_compare',
                'header_undo_redo'
            ],
            enabled_features: [
                'study_templates',
                'side_toolbar_in_fullscreen_mode'
            ],
            overrides: {
                'mainSeriesProperties.candleStyle.upColor': '#2ecc71',
                'mainSeriesProperties.candleStyle.downColor': '#e74c3c',
                'mainSeriesProperties.candleStyle.borderUpColor': '#2ecc71',
                'mainSeriesProperties.candleStyle.borderDownColor': '#e74c3c',
                'mainSeriesProperties.candleStyle.wickUpColor': '#2ecc71',
                'mainSeriesProperties.candleStyle.wickDownColor': '#e74c3c'
            },
            height: 400,
            width: '100%'
        });
    }
    
    setupPeriodButtons() {
        const periodButtons = document.querySelectorAll('.chart-period');
        
        periodButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Удаление активного класса у всех кнопок
                periodButtons.forEach(btn => btn.classList.remove('chart-period--active'));
                
                // Добавление активного класса
                button.classList.add('chart-period--active');
                
                // Изменение периода
                const period = button.getAttribute('data-period');
                this.changePeriod(period);
            });
        });
    }
    
    changePeriod(period) {
        if (!this.widget) return;
        
        const intervalMap = {
            '24h': '60',
            '7d': 'D',
            '30d': 'D',
            '90d': 'D',
            '1y': 'W',
            'max': 'M'
        };
        
        const interval = intervalMap[period] || 'D';
        
        // TradingView виджет автоматически обрабатывает изменения
        console.log('Changing period to:', period, 'interval:', interval);
    }
    
    showFallback() {
        const fallback = document.querySelector('[data-chart-fallback]');
        const chart = document.getElementById('tradingview-chart');
        
        if (fallback) {
            fallback.style.display = 'flex';
        }
        
        if (chart) {
            chart.style.display = 'none';
        }
    }
    
    hideFallback() {
        const fallback = document.querySelector('[data-chart-fallback]');
        const chart = document.getElementById('tradingview-chart');
        
        if (fallback) {
            fallback.style.display = 'none';
        }
        
        if (chart) {
            chart.style.display = 'block';
        }
    }
    
    // Обновление темы графика
    updateTheme(theme) {
        if (!this.widget) return;
        
        // TradingView виджет не поддерживает динамическое изменение темы
        // Необходимо пересоздать виджет
        this.destroy();
        setTimeout(() => this.createWidget(), 100);
    }
    
    // Уничтожение виджета
    destroy() {
        const container = document.getElementById('tradingview-chart');
        if (container) {
            container.innerHTML = '';
        }
        this.widget = null;
    }
}