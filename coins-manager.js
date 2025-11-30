// Coins Management Module
class CoinsManager {
    constructor(dashboard) {
        this.dashboard = dashboard;
        this.coins = [...majorCryptocurrencies];
        this.filteredCoins = [...majorCryptocurrencies];
        this.currentPage = 1;
        this.coinsPerPage = CONFIG.ITEMS_PER_PAGE;
        this.currentSort = 'rank';
        this.currentSortAscending = true;
    }

    init() {
        this.renderTable();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        document.getElementById('searchClear').addEventListener('click', () => {
            this.clearSearch();
        });

        // Sort functionality
        document.getElementById('sortBtn').addEventListener('click', () => {
            this.toggleSort();
        });

        // Pagination
        document.getElementById('prevPage').addEventListener('click', () => {
            this.previousPage();
        });

        document.getElementById('nextPage').addEventListener('click', () => {
            this.nextPage();
        });
    }

    handleSearch(query) {
        const searchClear = document.getElementById('searchClear');
        const searchResultsCount = document.getElementById('searchResultsCount');
        
        if (query.trim()) {
            searchClear.style.display = 'flex';
            this.filteredCoins = this.searchCoins(query);
            this.currentPage = 1;
            this.renderTable();
            this.updatePagination();
            
            // Show results count
            searchResultsCount.style.display = 'block';
            const t = this.dashboard.translations[this.dashboard.currentLanguage];
            document.getElementById('resultsCount').textContent = this.filteredCoins.length;
            searchResultsCount.innerHTML = t.foundCoins.replace('{count}', `<span id="resultsCount">${this.filteredCoins.length}</span>`);
        } else {
            this.clearSearch();
        }
    }

    searchCoins(query) {
        const lowerQuery = query.toLowerCase();
        return this.coins.filter(coin => 
            coin.name.toLowerCase().includes(lowerQuery) || 
            coin.symbol.toLowerCase().includes(lowerQuery)
        );
    }

    clearSearch() {
        document.getElementById('searchInput').value = '';
        document.getElementById('searchClear').style.display = 'none';
        document.getElementById('searchResultsCount').style.display = 'none';
        this.filteredCoins = [...this.coins];
        this.currentPage = 1;
        this.renderTable();
        this.updatePagination();
    }

    toggleSort() {
        const sortOptions = ['rank', 'name', 'price', 'change', 'marketCap'];
        const currentIndex = sortOptions.indexOf(this.currentSort);
        const nextIndex = (currentIndex + 1) % sortOptions.length;
        
        this.currentSort = sortOptions[nextIndex];
        this.currentSortAscending = !this.currentSortAscending;
        
        this.filteredCoins = this.sortCoins(this.filteredCoins, this.currentSort, this.currentSortAscending);
        this.renderTable();
        
        const t = this.dashboard.translations[this.dashboard.currentLanguage];
        this.dashboard.showNotification(`${t.sort}: ${this.getSortLabel(this.currentSort)}`);
    }

    sortCoins(coins, sortBy, ascending = true) {
        const sortedCoins = [...coins];
        
        switch(sortBy) {
            case 'rank':
                sortedCoins.sort((a, b) => ascending ? a.rank - b.rank : b.rank - a.rank);
                break;
            case 'name':
                sortedCoins.sort((a, b) => {
                    const nameA = a.name.toLowerCase();
                    const nameB = b.name.toLowerCase();
                    return ascending ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
                });
                break;
            case 'price':
                sortedCoins.sort((a, b) => ascending ? a.price - b.price : b.price - a.price);
                break;
            case 'change':
                sortedCoins.sort((a, b) => ascending ? a.change24h - b.change24h : b.change24h - a.change24h);
                break;
            case 'marketCap':
                sortedCoins.sort((a, b) => ascending ? a.marketCap - b.marketCap : b.marketCap - a.marketCap);
                break;
        }
        
        return sortedCoins;
    }

    getSortLabel(sortBy) {
        const t = this.dashboard.translations[this.dashboard.currentLanguage];
        const labels = {
            'rank': t.rank,
            'name': t.coin,
            'price': t.price,
            'change': t.change24h,
            'marketCap': t.marketCap
        };
        return labels[sortBy] || t.rank;
    }

    renderTable() {
        const coinsTable = document.getElementById('coinsTable');
        const startIndex = (this.currentPage - 1) * this.coinsPerPage;
        const endIndex = startIndex + this.coinsPerPage;
        const coinsToShow = this.filteredCoins.slice(startIndex, endIndex);

        coinsTable.innerHTML = '';

        coinsToShow.forEach(coin => {
            const row = this.createCoinRow(coin);
            coinsTable.appendChild(row);
        });
    }

    createCoinRow(coin) {
        const isPositive = coin.change24h >= 0;
        const changeClass = isPositive ? 'positive' : 'negative';
        const t = this.dashboard.translations[this.dashboard.currentLanguage];

        const row = document.createElement('div');
        row.className = 'table-row coin-row';
        row.setAttribute('data-coin-id', coin.id);

        row.innerHTML = `
            <div class="col-rank">${coin.rank}</div>
            <div class="col-name">
                <img class="coin-icon-table" 
                     src="https://assets.coincap.io/assets/icons/${coin.symbol.toLowerCase()}@2x.png" 
                     alt="${coin.name}"
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iIzMzMyIvPjx0ZXh0IHg9IjE2IiB5PSIyMSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtZmFtaWx5PSJBcmlhbCI>${coin.symbol.charAt(0)}</text></svg>'">
                <div class="coin-name-table">
                    <span class="coin-name-main">${coin.name}</span>
                    <span class="coin-symbol-table">${coin.symbol}</span>
                </div>
            </div>
            <div class="col-price">$${this.dashboard.formatPrice(coin.price)}</div>
            <div class="col-change">
                <span class="change-table ${changeClass}">${this.dashboard.formatPercent(coin.change24h)}</span>
            </div>
            <div class="col-marketcap">${this.dashboard.formatNumber(coin.marketCap)}</div>
            <div class="col-volume">${this.dashboard.formatNumber(coin.volume24h)}</div>
            <div class="col-sparkline"></div>
            <div class="col-action">
                <button class="action-btn-table" data-coin-id="${coin.id}">${t.details}</button>
            </div>
        `;

        // Add sparkline
        const sparklineContainer = row.querySelector('.col-sparkline');
        this.createSparkline(coin.sparkline, sparklineContainer, isPositive);

        // Add event listeners
        row.addEventListener('click', (e) => {
            if (!e.target.classList.contains('action-btn-table')) {
                this.dashboard.modalManager.showCoinModal(coin);
            }
        });

        const detailsBtn = row.querySelector('.action-btn-table');
        detailsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.dashboard.modalManager.showCoinModal(coin);
        });

        return row;
    }

    createSparkline(data, element, isPositive) {
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 30;
        canvas.className = 'sparkline-chart';
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Set colors
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        if (isPositive) {
            gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
            gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
            ctx.strokeStyle = '#10b981';
        } else {
            gradient.addColorStop(0, 'rgba(239, 68, 68, 0.3)');
            gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
            ctx.strokeStyle = '#ef4444';
        }
        
        // Calculate scale
        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min || 1;
        
        // Draw line
        ctx.beginPath();
        data.forEach((value, index) => {
            const x = (index / (data.length - 1)) * canvas.width;
            const y = canvas.height - ((value - min) / range) * canvas.height;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();
        
        // Fill area
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
        
        element.appendChild(canvas);
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.updatePagination();
            this.scrollToCoinsSection();
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.filteredCoins.length / this.coinsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.updatePagination();
            this.scrollToCoinsSection();
        }
    }

    updatePagination() {
        const totalCoins = this.filteredCoins.length;
        const totalPages = Math.ceil(totalCoins / this.coinsPerPage);
        const startCoin = (this.currentPage - 1) * this.coinsPerPage + 1;
        const endCoin = Math.min(this.currentPage * this.coinsPerPage, totalCoins);

        const t = this.dashboard.translations[this.dashboard.currentLanguage];
        document.getElementById('pageInfo').textContent = t.pageInfo.replace('{current}', this.currentPage).replace('{total}', totalPages);
        document.getElementById('pageStats').textContent = t.pageStats.replace('{start}', startCoin).replace('{end}', endCoin).replace('{total}', totalCoins);

        // Update button states
        const prevPage = document.getElementById('prevPage');
        const nextPage = document.getElementById('nextPage');
        
        prevPage.disabled = this.currentPage === 1;
        nextPage.disabled = this.currentPage === totalPages;
        
        prevPage.classList.toggle('disabled', this.currentPage === 1);
        nextPage.classList.toggle('disabled', this.currentPage === totalPages);

        this.renderTable();
    }

    scrollToCoinsSection() {
        const coinsSection = document.querySelector('.coins-section');
        if (coinsSection) {
            coinsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    refreshData() {
        // В реальном приложении здесь будет обновление данных с API
        this.renderTable();
        this.updatePagination();
        this.dashboard.showNotification(this.dashboard.translations[this.dashboard.currentLanguage].dataUpdated);
    }
}
