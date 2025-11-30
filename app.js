// Основные криптовалюты
const majorCryptocurrencies = [
    {
        id: "bitcoin",
        rank: 1,
        name: "Bitcoin",
        symbol: "BTC",
        price: 43250.67,
        change24h: 2.34,
        marketCap: 847256123456,
        volume24h: 25456789012,
        sparkline: [42000, 42500, 41800, 43000, 42800, 43200, 43250],
        circulatingSupply: 19629318,
        maxSupply: 21000000
    },
    {
        id: "ethereum",
        rank: 2,
        name: "Ethereum",
        symbol: "ETH",
        price: 2380.45,
        change24h: 1.78,
        marketCap: 286123456789,
        volume24h: 12567890123,
        sparkline: [2300, 2320, 2350, 2370, 2360, 2385, 2380],
        circulatingSupply: 120245678,
        maxSupply: null
    },
    {
        id: "tether",
        rank: 3,
        name: "Tether",
        symbol: "USDT",
        price: 1.00,
        change24h: 0.01,
        marketCap: 95678901234,
        volume24h: 45678901234,
        sparkline: [1, 1, 1, 1, 1, 1, 1],
        circulatingSupply: 95678901234,
        maxSupply: null
    },
    {
        id: "binancecoin",
        rank: 4,
        name: "BNB",
        symbol: "BNB",
        price: 312.67,
        change24h: -0.45,
        marketCap: 48123456789,
        volume24h: 856789012,
        sparkline: [305, 308, 310, 315, 312, 314, 312],
        circulatingSupply: 153856150,
        maxSupply: 200000000
    },
    {
        id: "solana",
        rank: 5,
        name: "Solana",
        symbol: "SOL",
        price: 102.34,
        change24h: 5.67,
        marketCap: 44123456789,
        volume24h: 3456789012,
        sparkline: [95, 97, 98, 101, 103, 104, 102],
        circulatingSupply: 431234567,
        maxSupply: null
    },
    {
        id: "ripple",
        rank: 6,
        name: "XRP",
        symbol: "XRP",
        price: 0.57,
        change24h: -1.23,
        marketCap: 31123456789,
        volume24h: 1234567890,
        sparkline: [0.58, 0.575, 0.57, 0.572, 0.568, 0.571, 0.57],
        circulatingSupply: 54345678901,
        maxSupply: 100000000000
    },
    {
        id: "cardano",
        rank: 7,
        name: "Cardano",
        symbol: "ADA",
        price: 0.52,
        change24h: 3.45,
        marketCap: 18234567890,
        volume24h: 567890123,
        sparkline: [0.50, 0.51, 0.52, 0.515, 0.518, 0.525, 0.52],
        circulatingSupply: 35000123456,
        maxSupply: 45000000000
    },
    {
        id: "dogecoin",
        rank: 8,
        name: "Dogecoin",
        symbol: "DOGE",
        price: 0.083,
        change24h: -2.34,
        marketCap: 11876543210,
        volume24h: 678901234,
        sparkline: [0.085, 0.084, 0.083, 0.082, 0.084, 0.083, 0.083],
        circulatingSupply: 143076046384,
        maxSupply: null
    },
    {
        id: "polkadot",
        rank: 9,
        name: "Polkadot",
        symbol: "DOT",
        price: 7.23,
        change24h: 1.56,
        marketCap: 9234567890,
        volume24h: 345678901,
        sparkline: [7.10, 7.15, 7.20, 7.25, 7.22, 7.24, 7.23],
        circulatingSupply: 1274567890,
        maxSupply: null
    },
    {
        id: "chainlink",
        rank: 10,
        name: "Chainlink",
        symbol: "LINK",
        price: 14.56,
        change24h: 4.32,
        marketCap: 8234567890,
        volume24h: 456789012,
        sparkline: [13.90, 14.00, 14.20, 14.40, 14.50, 14.55, 14.56],
        circulatingSupply: 567890123,
        maxSupply: 1000000000
    },
    {
        id: "litecoin",
        rank: 11,
        name: "Litecoin",
        symbol: "LTC",
        price: 68.90,
        change24h: -0.78,
        marketCap: 5123456789,
        volume24h: 345678901,
        sparkline: [69.50, 69.20, 68.80, 69.00, 68.70, 68.90, 68.90],
        circulatingSupply: 74123456,
        maxSupply: 84000000
    },
    {
        id: "bitcoin-cash",
        rank: 12,
        name: "Bitcoin Cash",
        symbol: "BCH",
        price: 245.67,
        change24h: 2.12,
        marketCap: 4812345678,
        volume24h: 234567890,
        sparkline: [240, 242, 243, 245, 246, 247, 245],
        circulatingSupply: 19645678,
        maxSupply: 21000000
    },
    {
        id: "stellar",
        rank: 13,
        name: "Stellar",
        symbol: "XLM",
        price: 0.115,
        change24h: 1.89,
        marketCap: 3234567890,
        volume24h: 123456789,
        sparkline: [0.112, 0.113, 0.114, 0.115, 0.116, 0.115, 0.115],
        circulatingSupply: 28123456789,
        maxSupply: 50000000000
    },
    {
        id: "uniswap",
        rank: 14,
        name: "Uniswap",
        symbol: "UNI",
        price: 6.45,
        change24h: -1.23,
        marketCap: 4856789012,
        volume24h: 156789012,
        sparkline: [6.50, 6.48, 6.45, 6.42, 6.44, 6.46, 6.45],
        circulatingSupply: 753456789,
        maxSupply: 1000000000
    },
    {
        id: "monero",
        rank: 15,
        name: "Monero",
        symbol: "XMR",
        price: 165.78,
        change24h: 0.89,
        marketCap: 3012345678,
        volume24h: 56789012,
        sparkline: [164, 164.5, 165, 165.5, 166, 165.8, 165.78],
        circulatingSupply: 18123456,
        maxSupply: null
    },
    {
        id: "ethereum-classic",
        rank: 16,
        name: "Ethereum Classic",
        symbol: "ETC",
        price: 23.45,
        change24h: 3.21,
        marketCap: 3456789012,
        volume24h: 234567890,
        sparkline: [22.70, 22.90, 23.10, 23.30, 23.40, 23.45, 23.45],
        circulatingSupply: 147456789,
        maxSupply: 210700000
    },
    {
        id: "vechain",
        rank: 17,
        name: "VeChain",
        symbol: "VET",
        price: 0.028,
        change24h: 2.56,
        marketCap: 2034567890,
        volume24h: 67890123,
        sparkline: [0.027, 0.0275, 0.028, 0.0282, 0.0281, 0.028, 0.028],
        circulatingSupply: 72710527846,
        maxSupply: 86712634466
    },
    {
        id: "filecoin",
        rank: 18,
        name: "Filecoin",
        symbol: "FIL",
        price: 5.67,
        change24h: -2.34,
        marketCap: 2789012345,
        volume24h: 123456789,
        sparkline: [5.80, 5.75, 5.70, 5.65, 5.68, 5.67, 5.67],
        circulatingSupply: 491234567,
        maxSupply: null
    },
    {
        id: "tezos",
        rank: 19,
        name: "Tezos",
        symbol: "XTZ",
        price: 1.02,
        change24h: 1.23,
        marketCap: 956789012,
        volume24h: 45678901,
        sparkline: [1.00, 1.01, 1.02, 1.015, 1.018, 1.02, 1.02],
        circulatingSupply: 937456789,
        maxSupply: null
    },
    {
        id: "eos",
        rank: 20,
        name: "EOS",
        symbol: "EOS",
        price: 0.78,
        change24h: -0.89,
        marketCap: 756789012,
        volume24h: 34567890,
        sparkline: [0.79, 0.785, 0.78, 0.775, 0.777, 0.779, 0.78],
        circulatingSupply: 970123456,
        maxSupply: null
    }
];

// Функция форматирования чисел
function formatNumber(num, decimals = 2) {
    if (num === null || num === undefined) return 'N/A';
    
    if (num >= 1e9) {
        return '$' + (num / 1e9).toFixed(decimals) + 'B';
    } else if (num >= 1e6) {
        return '$' + (num / 1e6).toFixed(decimals) + 'M';
    } else if (num >= 1e3) {
        return '$' + (num / 1e3).toFixed(decimals) + 'K';
    } else {
        return '$' + num.toFixed(decimals);
    }
}

// Функция форматирования процентов
function formatPercent(num) {
    if (num === null || num === undefined) return 'N/A';
    return (num > 0 ? '+' : '') + num.toFixed(2) + '%';
}

// Функция создания sparkline графика
function createSparkline(data, element, isPositive) {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 30;
    canvas.className = 'sparkline-chart';
    
    const ctx = canvas.getContext('2d');
    
    // Очистка canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Настройка цветов
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
    
    // Находим минимальное и максимальное значения
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;
    
    // Рисуем график
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
    
    // Заливка под графиком
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
    
    element.appendChild(canvas);
}

// Функция отображения монет в таблице
function renderCoinsTable(coins, container) {
    container.innerHTML = '';
    
    coins.forEach(coin => {
        const isPositive = coin.change24h >= 0;
        const changeClass = isPositive ? 'positive' : 'negative';
        
        const row = document.createElement('div');
        row.className = 'table-row coin-row';
        row.setAttribute('data-coin-id', coin.id);
        
        row.innerHTML = `
            <div class="col-rank">${coin.rank}</div>
            <div class="col-name">
                <img class="coin-icon-table" src="https://cryptoicons.org/api/icon/${coin.symbol.toLowerCase()}/50" alt="${coin.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiMzMzMiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTggMTZMMTIgOEg0TDggMTZaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4KPC9zdmc+'">
                <div class="coin-name-table">
                    <span class="coin-name-main">${coin.name}</span>
                    <span class="coin-symbol-table">${coin.symbol}</span>
                </div>
            </div>
            <div class="col-price">$${coin.price.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            <div class="col-change">
                <span class="change-table ${changeClass}">${formatPercent(coin.change24h)}</span>
            </div>
            <div class="col-marketcap">${formatNumber(coin.marketCap)}</div>
            <div class="col-volume">${formatNumber(coin.volume24h)}</div>
            <div class="col-sparkline"></div>
            <div class="col-action">
                <button class="action-btn-table" data-coin-id="${coin.id}">Детали</button>
            </div>
        `;
        
        container.appendChild(row);
        
        // Добавляем sparkline график
        const sparklineContainer = row.querySelector('.col-sparkline');
        createSparkline(coin.sparkline, sparklineContainer, isPositive);
        
        // Добавляем обработчик клика на строку
        row.addEventListener('click', (e) => {
            if (!e.target.classList.contains('action-btn-table')) {
                showCoinModal(coin);
            }
        });
        
        // Добавляем обработчик клика на кнопку "Детали"
        const detailsBtn = row.querySelector('.action-btn-table');
        detailsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showCoinModal(coin);
        });
    });
}

// Функция показа модального окна с деталями монеты
function showCoinModal(coin) {
    const modal = document.getElementById('coinModal');
    const isPositive = coin.change24h >= 0;
    const changeClass = isPositive ? 'positive' : 'negative';
    
    // Заполняем данные в модальном окне
    document.getElementById('modalCoinIcon').src = `https://cryptoicons.org/api/icon/${coin.symbol.toLowerCase()}/50`;
    document.getElementById('modalCoinIcon').alt = coin.name;
    document.getElementById('modalCoinName').textContent = coin.name;
    document.getElementById('modalCoinSymbol').textContent = coin.symbol;
    document.getElementById('modalCoinRank').textContent = `#${coin.rank}`;
    document.getElementById('modalCoinPrice').textContent = `$${coin.price.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    
    const changeElement = document.getElementById('modalCoinChange');
    changeElement.textContent = formatPercent(coin.change24h);
    changeElement.className = `price-change ${changeClass}`;
    
    document.getElementById('modalCoinMarketCap').textContent = formatNumber(coin.marketCap);
    document.getElementById('modalCoinVolume').textContent = formatNumber(coin.volume24h);
    document.getElementById('modalCoinSupply').textContent = coin.circulatingSupply ? coin.circulatingSupply.toLocaleString() : 'N/A';
    document.getElementById('modalCoinMaxSupply').textContent = coin.maxSupply ? coin.maxSupply.toLocaleString() : 'N/A';
    
    // Показываем модальное окно
    modal.style.display = 'flex';
    
    // Добавляем обработчик закрытия
    document.getElementById('modalClose').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Добавляем обработчики для кнопок в модальном окне
    document.getElementById('modalWatchlistBtn').onclick = () => {
        addToWatchlist(coin);
    };
    
    document.getElementById('modalShareBtn').onclick = () => {
        shareCoin(coin);
    };
    
    // Закрытие по ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// Функция закрытия модального окна
function closeModal() {
    const modal = document.getElementById('coinModal');
    modal.style.display = 'none';
}

// Функция добавления в список отслеживаемых
function addToWatchlist(coin) {
    let watchlist = JSON.parse(localStorage.getItem('cryptoWatchlist') || '[]');
    
    if (!watchlist.find(item => item.id === coin.id)) {
        watchlist.push({
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol
        });
        
        localStorage.setItem('cryptoWatchlist', JSON.stringify(watchlist));
        
        // Показываем уведомление
        showNotification(`${coin.name} добавлен в список отслеживаемых`);
    } else {
        showNotification(`${coin.name} уже в списке отслеживаемых`);
    }
}

// Функция поделиться монетой
function shareCoin(coin) {
    const shareText = `Посмотри на ${coin.name} (${coin.symbol}) - текущая цена: $${coin.price}`;
    
    if (navigator.share) {
        navigator.share({
            title: coin.name,
            text: shareText,
            url: window.location.href
        });
    } else {
        // Fallback для копирования в буфер обмена
        navigator.clipboard.writeText(shareText).then(() => {
            showNotification('Информация скопирована в буфер обмена');
        });
    }
}

// Функция показа уведомления
function showNotification(message) {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--accent-color);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: var(--shadow-lg);
        z-index: 10001;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Удаляем уведомление через 3 секунды
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Функция поиска монет
function searchCoins(query, coins) {
    if (!query) return coins;
    
    const lowerQuery = query.toLowerCase();
    return coins.filter(coin => 
        coin.name.toLowerCase().includes(lowerQuery) || 
        coin.symbol.toLowerCase().includes(lowerQuery)
    );
}

// Функция сортировки монет
function sortCoins(coins, sortBy, ascending = true) {
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
        default:
            // По умолчанию сортируем по рангу
            sortedCoins.sort((a, b) => a.rank - b.rank);
    }
    
    return sortedCoins;
}

// Инициализация приложения
function initApp() {
    const coinsTable = document.getElementById('coinsTable');
    const searchInput = document.getElementById('searchInput');
    const searchClear = document.getElementById('searchClear');
    const searchResultsCount = document.getElementById('searchResultsCount');
    const resultsCount = document.getElementById('resultsCount');
    const refreshBtn = document.getElementById('refreshBtn');
    const sortBtn = document.getElementById('sortBtn');
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const retryBtn = document.getElementById('retryBtn');
    const prevPage = document.getElementById('prevPage');
    const nextPage = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');
    const pageStats = document.getElementById('pageStats');
    
    let currentSort = 'rank';
    let currentSortAscending = true;
    let currentPage = 1;
    const coinsPerPage = 10;
    
    // Инициализация данных
    function initializeData() {
        loadingState.style.display = 'block';
        errorState.style.display = 'none';
        
        // Имитация загрузки данных
        setTimeout(() => {
            loadingState.style.display = 'none';
            renderCoinsTable(majorCryptocurrencies, coinsTable);
            updatePagination();
        }, 1000);
    }
    
    // Обновление пагинации
    function updatePagination() {
        const totalCoins = majorCryptocurrencies.length;
        const totalPages = Math.ceil(totalCoins / coinsPerPage);
        const startCoin = (currentPage - 1) * coinsPerPage + 1;
        const endCoin = Math.min(currentPage * coinsPerPage, totalCoins);
        
        pageInfo.textContent = `Страница ${currentPage} из ${totalPages}`;
        pageStats.textContent = `Показано ${startCoin}-${endCoin} из ${totalCoins}`;
        
        prevPage.disabled = currentPage === 1;
        nextPage.disabled = currentPage === totalPages;
        
        if (prevPage.disabled) {
            prevPage.classList.add('disabled');
        } else {
            prevPage.classList.remove('disabled');
        }
        
        if (nextPage.disabled) {
            nextPage.classList.add('disabled');
        } else {
            nextPage.classList.remove('disabled');
        }
        
        // Отображаем только монеты для текущей страницы
        const startIndex = (currentPage - 1) * coinsPerPage;
        const endIndex = startIndex + coinsPerPage;
        const coinsToShow = majorCryptocurrencies.slice(startIndex, endIndex);
        renderCoinsTable(coinsToShow, coinsTable);
    }
    
    // Обработчик поиска
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        
        if (query) {
            searchClear.style.display = 'flex';
            const filteredCoins = searchCoins(query, majorCryptocurrencies);
            renderCoinsTable(filteredCoins, coinsTable);
            
            // Показываем количество результатов
            searchResultsCount.style.display = 'block';
            resultsCount.textContent = filteredCoins.length;
        } else {
            searchClear.style.display = 'none';
            searchResultsCount.style.display = 'none';
            renderCoinsTable(majorCryptocurrencies, coinsTable);
        }
    });
    
    // Очистка поиска
    searchClear.addEventListener('click', () => {
        searchInput.value = '';
        searchClear.style.display = 'none';
        searchResultsCount.style.display = 'none';
        renderCoinsTable(majorCryptocurrencies, coinsTable);
    });
    
    // Обновление данных
    refreshBtn.addEventListener('click', () => {
        initializeData();
        showNotification('Данные обновлены');
    });
    
    // Сортировка
    sortBtn.addEventListener('click', () => {
        // Простая реализация переключения сортировки
        const sortOptions = ['rank', 'name', 'price', 'change', 'marketCap'];
        const currentIndex = sortOptions.indexOf(currentSort);
        const nextIndex = (currentIndex + 1) % sortOptions.length;
        
        currentSort = sortOptions[nextIndex];
        currentSortAscending = !currentSortAscending;
        
        const sortedCoins = sortCoins(majorCryptocurrencies, currentSort, currentSortAscending);
        renderCoinsTable(sortedCoins, coinsTable);
        
        showNotification(`Сортировка по: ${getSortLabel(currentSort)} (${currentSortAscending ? 'по возрастанию' : 'по убыванию'})`);
    });
    
    // Получение метки для сортировки
    function getSortLabel(sortBy) {
        switch(sortBy) {
            case 'rank': return 'Рейтингу';
            case 'name': return 'Названию';
            case 'price': return 'Цене';
            case 'change': return 'Изменению';
            case 'marketCap': return 'Капитализации';
            default: return 'Рейтингу';
        }
    }
    
    // Пагинация
    prevPage.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            updatePagination();
        }
    });
    
    nextPage.addEventListener('click', () => {
        const totalPages = Math.ceil(majorCryptocurrencies.length / coinsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            updatePagination();
        }
    });
    
    // Повторная попытка при ошибке
    retryBtn.addEventListener('click', initializeData);
    
    // Инициализация темы
    const themeToggle = document.getElementById('themeToggle');
    const themeText = document.getElementById('themeText');
    
    themeToggle.addEventListener('change', (e) => {
        const isDark = e.target.checked;
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        themeText.textContent = isDark ? 'Тёмная' : 'Светлая';
        
        // Сохраняем выбор темы
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
    
    // Восстановление темы из localStorage
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.checked = savedTheme === 'dark';
    themeText.textContent = savedTheme === 'dark' ? 'Тёмная' : 'Светлая';
    
    // Инициализация данных
    initializeData();
}

// Запуск приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', initApp);
