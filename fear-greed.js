// Fear & Greed Index Module
class FearGreedIndex {
    constructor(dashboard) {
        this.dashboard = dashboard;
        this.currentValue = 75;
        this.currentState = 'greed';
        this.states = {
            'extreme-fear': { min: 0, max: 24, label: 'Крайний страх' },
            'fear': { min: 25, max: 49, label: 'Страх' },
            'neutral': { min: 50, max: 50, label: 'Нейтрально' },
            'greed': { min: 51, max: 74, label: 'Жадность' },
            'extreme-greed': { min: 75, max: 100, label: 'Крайняя жадность' }
        };
    }

    async init() {
        await this.loadData();
        this.render();
        this.startAutoUpdate();
    }

    async loadData() {
        try {
            // В реальном приложении здесь будет запрос к API
            // const response = await fetch(CONFIG.FEAR_GREED_API);
            // const data = await response.json();
            
            // Имитация реальных данных с небольшими колебаниями
            const baseValue = 65 + Math.random() * 30;
            this.currentValue = Math.max(0, Math.min(100, Math.round(baseValue)));
            this.updateState();
            
        } catch (error) {
            console.error('Error loading Fear & Greed data:', error);
            // Fallback данные
            this.currentValue = 75;
            this.updateState();
        }
    }

    updateState() {
        for (const [state, range] of Object.entries(this.states)) {
            if (this.currentValue >= range.min && this.currentValue <= range.max) {
                this.currentState = state;
                break;
            }
        }
    }

    render() {
        this.updateGauge();
        this.updateText();
    }

    updateGauge() {
        const indicator = document.getElementById('fearGreedIndicator');
        const valueElement = document.getElementById('fearGreedValue');
        const textElement = document.getElementById('fearGreedText');
        
        if (!indicator) return;

        // Позиция индикатора (0-100% от ширины контейнера)
        const position = (this.currentValue / 100) * 100;
        indicator.style.left = `${position}%`;

        // Обновление текстовых значений
        if (valueElement) {
            valueElement.textContent = this.currentValue;
        }
        
        if (textElement) {
            const t = this.dashboard.translations[this.dashboard.currentLanguage];
            textElement.textContent = this.states[this.currentState].label;
        }

        // Анимация
        this.animateGauge();
    }

    animateGauge() {
        const indicator = document.getElementById('fearGreedIndicator');
        if (!indicator) return;

        // Сброс предыдущей анимации
        indicator.style.transition = 'none';
        indicator.style.transform = 'translateX(-50%) scale(0.8)';
        
        // Запуск новой анимации
        setTimeout(() => {
            indicator.style.transition = 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
            indicator.style.transform = 'translateX(-50%) scale(1)';
        }, 50);
    }

    updateText() {
        const updateElement = document.getElementById('fearGreedUpdate');
        if (updateElement) {
            const t = this.dashboard.translations[this.dashboard.currentLanguage];
            updateElement.textContent = t.updatedJustNow;
        }
    }

    startAutoUpdate() {
        // Обновление данных каждые 5 минут
        setInterval(() => {
            this.loadData().then(() => {
                this.render();
                this.dashboard.showNotification(this.dashboard.translations[this.dashboard.currentLanguage].dataUpdated);
            });
        }, 300000);
    }
}
