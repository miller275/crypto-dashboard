// Modal Management Module
class ModalManager {
    constructor(dashboard) {
        this.dashboard = dashboard;
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Modal close
        document.getElementById('modalClose').addEventListener('click', () => {
            this.closeModal();
        });

        // Modal backdrop close
        document.getElementById('coinModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('coinModal')) {
                this.closeModal();
            }
        });

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    showCoinModal(coin) {
        const modal = document.getElementById('coinModal');
        const isPositive = coin.change24h >= 0;
        const changeClass = isPositive ? 'positive' : 'negative';
        const t = this.dashboard.translations[this.dashboard.currentLanguage];

        // Set modal content
        const coinIcon = document.getElementById('modalCoinIcon');
        coinIcon.src = `https://assets.coincap.io/assets/icons/${coin.symbol.toLowerCase()}@2x.png`;
        coinIcon.alt = coin.name;
        coinIcon.onerror = function() {
            this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIzMiIgZmlsbD0iIzMzMyIvPjx0ZXh0IHg9IjMyIiB5PSI0MiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMjgiIGZvbnQtZmFtaWx5PSJBcmlhbCI+${coin.symbol.charAt(0)}</dGV4dD48L3N2Zz4=';
        };
        
        document.getElementById('modalCoinName').textContent = coin.name;
        document.getElementById('modalCoinSymbol').textContent = coin.symbol;
        document.getElementById('modalCoinRank').textContent = `#${coin.rank}`;
        document.getElementById('modalCoinPrice').textContent = `$${this.dashboard.formatPrice(coin.price)}`;
        
        const changeElement = document.getElementById('modalCoinChange');
        changeElement.textContent = this.dashboard.formatPercent(coin.change24h);
        changeElement.className = `price-change ${changeClass}`;
        
        // Update modal labels
        const statLabels = document.querySelectorAll('.stat-item .stat-label');
        statLabels[0].textContent = t.capitalization;
        statLabels[1].textContent = t.volume24hModal;
        statLabels[2].textContent = t.circulatingSupply;
        statLabels[3].textContent = t.maxSupply;
        
        document.getElementById('modalCoinMarketCap').textContent = this.dashboard.formatNumber(coin.marketCap);
        document.getElementById('modalCoinVolume').textContent = this.dashboard.formatNumber(coin.volume24h);
        document.getElementById('modalCoinSupply').textContent = coin.circulatingSupply ? coin.circulatingSupply.toLocaleString() : 'N/A';
        document.getElementById('modalCoinMaxSupply').textContent = coin.maxSupply ? coin.maxSupply.toLocaleString() : 'N/A';
        
        // Update modal buttons
        document.getElementById('modalChartBtn').querySelector('span').textContent = t.showChart;
        document.getElementById('modalDetailsBtn').querySelector('span').textContent = t.detailedInfo;
        
        // Add modal button handlers
        document.getElementById('modalChartBtn').onclick = () => this.showChart(coin);
        document.getElementById('modalDetailsBtn').onclick = () => this.showDetailedInfo(coin);
        
        // Show modal
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        const modal = document.getElementById('coinModal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    showChart(coin) {
        this.dashboard.showNotification(`График для ${coin.name} будет открыт в новом окне`);
        // Здесь можно добавить логику для открытия графика
        this.closeModal();
    }

    showDetailedInfo(coin) {
        this.dashboard.showNotification(`Подробная информация о ${coin.name} будет показана`);
        // Здесь можно добавить логику для показа детальной информации
        this.closeModal();
    }
}
