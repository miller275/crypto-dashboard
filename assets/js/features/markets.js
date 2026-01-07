// Таблица рынка
export class Markets {
    constructor(dataClient, i18n) {
        this.dataClient = dataClient;
        this.i18n = i18n;
        this.formatter = new (class {
            constructor(i18n) { this.i18n = i18n; }
            currency(v) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v); }
            percent(v) { return `${v > 0 ? '+' : ''}${v.toFixed(2)}%`; }
            number(v) { return new Intl.NumberFormat('en-US').format(v); }
        })(i18n);
        
        this.state = {
            currentPage: 1,
            pageSize: 50,
            totalPages: 1,
            coins: [],
            isLoading: false
        };
        
        this.init();
    }
    
    async init() {
        await this.loadMeta();
        this.setupEventListeners();
        await this.loadPage();
    }
    
    async loadMeta() {
        try {
            const meta = await this.dataClient.getMarketsMeta();
            if (meta) {
                this.state.totalPages = meta.total_pages;
                this.state.totalCoins = meta.total_coins;
            }
        } catch (error) {
            console.error('Failed to load markets meta:', error);
        }
    }
    
    setupEventListeners() {
        // Пагинация
        const prevBtn = document.querySelector('[data-prev]');
        const nextBtn = document.querySelector('[data-next]');
        const pageSizeSelect = document.querySelector('[data-page-size]');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (this.state.currentPage > 1) {
                    this.state.currentPage--;
                    this.loadPage();
                }
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (this.state.currentPage < this.state.totalPages) {
                    this.state.currentPage++;
                    this.loadPage();
                }
            });
        }
        
        if (pageSizeSelect) {
            pageSizeSelect.addEventListener('change', (e) => {
                this.state.pageSize = parseInt(e.target.value);
                this.loadPage();
            });
        }
    }
    
    async loadPage() {
        this.state.isLoading = true;
        this.showLoading();
        
        try {
            const data = await this.dataClient.getMarketsPage(this.state.currentPage);
            if (data && data.coins) {
                this.state.coins = data.coins;
                this.renderTable();
                this.updatePagination();
            }
        } catch (error) {
            console.error('Failed to load markets page:', error);
            this.showError();
        } finally {
            this.state.isLoading = false;
            this.hideLoading();
        }
    }
    
    renderTable() {
        const tbody = document.querySelector('[data-markets-body]');
        if (!tbody) return;
        
        tbody.innerHTML = this.state.coins.map(coin => `
            <tr class="table__row" data-coin-id="${coin.id}">
                <td class="table__cell">${coin.rank}</td>
                <td class="table__cell">
                    <div class="coin-cell">
                        <div class="coin-cell__icon">
                            ${coin.symbol.substring(0, 3)}
                        </div>
                        <div class="coin-cell__info">
                            <div class="coin-cell__name">${coin.name}</div>
                            <div class="coin-cell__symbol">${coin.symbol}</div>
                        </div>
                    </div>
                </td>
                <td class="table__cell">${this.formatter.currency(coin.price)}</td>
                <td class="table__cell">
                    <span class="change ${coin.change1h > 0 ? 'change--up' : coin.change1h < 0 ? 'change--down' : 'change--neutral'}">
                        ${this.formatter.percent(coin.change1h)}
                    </span>
                </td>
                <td class="table__cell">
                    <span class="change ${coin.change24h > 0 ? 'change--up' : coin.change24h < 0 ? 'change--down' : 'change--neutral'}">
                        ${this.formatter.percent(coin.change24h)}
                    </span>
                </td>
                <td class="table__cell">
                    <span class="change ${coin.change7d > 0 ? 'change--up' : coin.change7d < 0 ? 'change--down' : 'change--neutral'}">
                        ${this.formatter.percent(coin.change7d)}
                    </span>
                </td>
                <td class="table__cell">${this.formatter.currency(coin.market_cap)}</td>
                <td class="table__cell">${this.formatter.currency(coin.volume_24h)}</td>
                <td class="table__cell">${this.formatter.number(coin.circulating_supply || 0)}</td>
                <td class="table__cell">
                    <div class="sparkline">
                        <canvas class="sparkline__canvas" width="100" height="32"></canvas>
                    </div>
                </td>
            </tr>
        `).join('');
        
        // Обработчики кликов
        tbody.querySelectorAll('.table__row').forEach(row => {
            row.addEventListener('click', () => {
                const coinId = row.getAttribute('data-coin-id');
                if (coinId) {
                    window.location.href = `coin.html?id=${coinId}`;
                }
            });
        });
        
        // Отрисовка спарклайнов
        this.renderSparklines();
    }
    
    renderSparklines() {
        const canvases = document.querySelectorAll('.sparkline__canvas');
        
        canvases.forEach((canvas, index) => {
            const ctx = canvas.getContext('2d');
            const coin = this.state.coins[index];
            
            if (!coin || !coin.sparkline7d || coin.sparkline7d.length === 0) {
                // Показ плейсхолдера
                const parent = canvas.parentElement;
                parent.innerHTML = '<div class="sparkline__placeholder">—</div>';
                return;
            }
            
            const data = coin.sparkline7d;
            const width = canvas.width;
            const height = canvas.height;
            const padding = 2;
            
            // Очистка
            ctx.clearRect(0, 0, width, height);
            
            // Расчет min/max
            const min = Math.min(...data);
            const max = Math.max(...data);
            const range = max - min || 1;
            
            // Цвет
            const isUp = data[data.length - 1] >= data[0];
            const color = isUp ? '#2ecc71' : '#e74c3c';
            
            // Рисование линии
            ctx.beginPath();
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = color;
            
            data.forEach((value, i) => {
                const x = padding + (i * (width - padding * 2)) / (data.length - 1);
                const y = height - padding - ((value - min) / range) * (height - padding * 2);
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.stroke();
            
            // Градиент
            ctx.beginPath();
            ctx.moveTo(padding, height - padding);
            
            data.forEach((value, i) => {
                const x = padding + (i * (width - padding * 2)) / (data.length - 1);
                const y = height - padding - ((value - min) / range) * (height - padding * 2);
                ctx.lineTo(x, y);
            });
            
            ctx.lineTo(width - padding, height - padding);
            ctx.closePath();
            
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, isUp ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60, 0.2)');
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = gradient;
            ctx.fill();
        });
    }
    
    updatePagination() {
        const prevBtn = document.querySelector('[data-prev]');
        const nextBtn = document.querySelector('[data-next]');
        const pageInfo = document.querySelector('[data-page-info]');
        const pageSizeSelect = document.querySelector('[data-page-size]');
        
        if (prevBtn) {
            prevBtn.disabled = this.state.currentPage <= 1;
        }
        
        if (nextBtn) {
            nextBtn.disabled = this.state.currentPage >= this.state.totalPages;
        }
        
        if (pageInfo) {
            pageInfo.textContent = `${this.i18n.t('pagination.page')} ${this.state.currentPage} ${this.i18n.t('pagination.of')} ${this.state.totalPages}`;
        }
        
        if (pageSizeSelect) {
            pageSizeSelect.value = this.state.pageSize;
        }
    }
    
    showLoading() {
        const loading = document.querySelector('[data-loading]');
        const tbody = document.querySelector('[data-markets-body]');
        
        if (loading) loading.style.display = 'flex';
        if (tbody) tbody.innerHTML = '';
    }
    
    hideLoading() {
        const loading = document.querySelector('[data-loading]');
        if (loading) loading.style.display = 'none';
    }
    
    showError() {
        const tbody = document.querySelector('[data-markets-body]');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td class="table__cell" colspan="10" style="text-align: center; padding: var(--spacing-2xl);">
                        <div class="error-state">
                            <p>${this.i18n.t('error.loadData')}</p>
                            <button class="button" onclick="location.reload()">${this.i18n.t('error.retry')}</button>
                        </div>
                    </td>
                </tr>
            `;
        }
    }
    
    // Сортировка
    sort(column, direction = 'asc') {
        const sorted = [...this.state.coins].sort((a, b) => {
            let aVal = a[column];
            let bVal = b[column];
            
            if (column.includes('change')) {
                aVal = aVal || 0;
                bVal = bVal || 0;
            }
            
            if (direction === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });
        
        this.state.coins = sorted;
        this.renderTable();
    }
    
    // Фильтрация
    filter(query) {
        // Реализация фильтрации при необходимости
    }
}