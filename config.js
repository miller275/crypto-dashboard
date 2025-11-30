// ===== КОНФИГУРАЦИЯ ПРИЛОЖЕНИЯ =====
const CONFIG = {
  coinsPerPage: 20,
  currentPage: 1,
  currentLang: 'ru',
  currentTheme: 'dark',
  sortField: 'market_cap_rank',
  sortDirection: 'asc',
  apiUrl: 'https://api.coingecko.com/api/v3',
  fearGreedValue: 75,
  fearGreedState: 'greed'
};

// ===== ДАННЫЕ ДЛЯ ПОИСКА =====
let allCoinsCache = [];
let filteredCoins = [];
let currentCoins = [];
let charts = new Map();

// ===== ПЕРЕВОДЫ =====
const TRANSLATIONS = {
  ru: {
    siteLogo: 'CryptoDrom',
    themeText: 'Тёмная',
    promoTitle: 'Добро пожаловать в Crypto Dashboard',
    promoSubtitle: 'Ваш центр для анализа рынка и кастомизации интерфейса.',
    promoBtn: 'Вперёд',
    coinsTitle: 'Топ Криптовалют',
    searchPlaceholder: 'Поиск криптовалют...',
    fearGreedTitle: 'Индекс Страха и Жадности',
    footerText: '© 2024 CryptoDashboard. Все права защищены.',
    page: 'Страница',
    tradingView: 'TradingView',
    details: 'Детали',
    loading: 'Загрузка...',
    error: 'Ошибка загрузки',
    retry: 'Повторить',
    noResults: 'Ничего не найдено',
    changeSearch: 'Попробуйте изменить запрос',
    marketCap: 'Капитализация',
    volume: 'Объем 24ч',
    lastUpdate: 'Обновлено',
    extremeFear: 'Крайний страх',
    fear: 'Страх',
    neutral: 'Нейтрально',
    greed: 'Жадность',
    extremeGreed: 'Крайняя жадность',
    currentValue: 'Текущее значение',
    marketState: 'Состояние рынка',
    price: 'Цена',
    change24h: 'Изменение 24ч',
    rank: 'Ранг',
    actions: 'Действия',
    sparkline: 'График 7д',
    showMore: 'Показать еще',
    showing: 'Показано',
    of: 'из',
    results: 'результатов'
  },
  en: {
    siteLogo: 'CryptoDrom',
    themeText: 'Dark',
    promoTitle: 'Welcome to Crypto Dashboard',
    promoSubtitle: 'Your hub for market analysis and interface customization.',
    promoBtn: 'Get Started',
    coinsTitle: 'Top Cryptocurrencies',
    searchPlaceholder: 'Search cryptocurrencies...',
    fearGreedTitle: 'Fear & Greed Index',
    footerText: '© 2024 CryptoDashboard. All rights reserved.',
    page: 'Page',
    tradingView: 'TradingView',
    details: 'Details',
    loading: 'Loading...',
    error: 'Load error',
    retry: 'Retry',
    noResults: 'No results found',
    changeSearch: 'Try changing your search',
    marketCap: 'Market Cap',
    volume: '24h Volume',
    lastUpdate: 'Last update',
    extremeFear: 'Extreme Fear',
    fear: 'Fear',
    neutral: 'Neutral',
    greed: 'Greed',
    extremeGreed: 'Extreme Greed',
    currentValue: 'Current Value',
    marketState: 'Market State',
    price: 'Price',
    change24h: '24h Change',
    rank: 'Rank',
    actions: 'Actions',
    sparkline: '7D Chart',
    showMore: 'Show more',
    showing: 'Showing',
    of: 'of',
    results: 'results'
  }
};

// ===== ТЕСТОВЫЕ ДАННЫЕ =====
const TEST_COINS = [
  {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "btc",
    image: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
    current_price: 58728.42,
    price_change_percentage_24h: 2.5,
    market_cap: 1150000000000,
    total_volume: 28500000000,
    market_cap_rank: 1,
    sparkline_in_7d: {
      price: generateSparklineData(58728.42, 2.5)
    }
  },
  {
    id: "ethereum",
    name: "Ethereum", 
    symbol: "eth",
    image: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
    current_price: 2935.51,
    price_change_percentage_24h: -1.2,
    market_cap: 352000000000,
    total_volume: 15200000000,
    market_cap_rank: 2,
    sparkline_in_7d: {
      price: generateSparklineData(2935.51, -1.2)
    }
  },
  {
    id: "tether",
    name: "Tether",
    symbol: "usdt",
    image: "https://assets.coingecko.com/coins/images/325/small/Tether.png",
    current_price: 1.00,
    price_change_percentage_24h: 0.0,
    market_cap: 95600000000,
    total_volume: 45200000000,
    market_cap_rank: 3,
    sparkline_in_7d: {
      price: generateSparklineData(1.00, 0.0)
    }
  },
  {
    id: "ripple",
    name: "XRP",
    symbol: "xrp",
    image: "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png",
    current_price: 0.52,
    price_change_percentage_24h: 0.39,
    market_cap: 28500000000,
    total_volume: 1250000000,
    market_cap_rank: 4,
    sparkline_in_7d: {
      price: generateSparklineData(0.52, 0.39)
    }
  },
  {
    id: "cardano",
    name: "Cardano",
    symbol: "ada",
    image: "https://assets.coingecko.com/coins/images/975/small/cardano.png",
    current_price: 0.48,
    price_change_percentage_24h: 1.8,
    market_cap: 17000000000,
    total_volume: 450000000,
    market_cap_rank: 5,
    sparkline_in_7d: {
      price: generateSparklineData(0.48, 1.8)
    }
  },
  {
    id: "dogecoin",
    name: "Dogecoin",
    symbol: "doge",
    image: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png",
    current_price: 0.12,
    price_change_percentage_24h: -0.5,
    market_cap: 17200000000,
    total_volume: 850000000,
    market_cap_rank: 6,
    sparkline_in_7d: {
      price: generateSparklineData(0.12, -0.5)
    }
  }
];

// ===== УТИЛИТЫ =====
function formatCurrency(amount) {
  if (amount >= 1e12) return `$${(amount / 1e12).toFixed(2)}T`;
  if (amount >= 1e9) return `$${(amount / 1e9).toFixed(2)}B`;
  if (amount >= 1e6) return `$${(amount / 1e6).toFixed(2)}M`;
  if (amount >= 1e3) return `$${(amount / 1e3).toFixed(2)}K`;
  return `$${amount.toFixed(2)}`;
}

function formatPrice(price) {
  if (price >= 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  if (price >= 1) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(8)}`;
}

function generateSparklineData(currentPrice, changePercent, points = 25) {
  const data = [];
  const volatility = Math.abs(changePercent) / 100 * 3;
  const trend = changePercent >= 0 ? 1 : -1;
  let startingPrice = currentPrice * (1 - (trend * volatility * 0.5));
  
  for (let i = 0; i < points; i++) {
    const progress = i / (points - 1);
    const trendEffect = trend * volatility * currentPrice * progress;
    const randomEffect = (Math.random() - 0.5) * volatility * currentPrice * 0.3;
    const price = startingPrice + trendEffect + randomEffect;
    data.push(Math.max(price, currentPrice * 0.1));
  }
  
  return data;
}

function getFearGreedState(value) {
  if (value <= 25) return 'extremeFear';
  if (value <= 45) return 'fear';
  if (value <= 55) return 'neutral';
  if (value <= 75) return 'greed';
  return 'extremeGreed';
}

function getFearGreedPosition(value) {
  return `${value}%`;
}

// ===== РЕНДЕРИНГ =====
function renderFearGreedIndex() {
  const value = CONFIG.fearGreedValue;
  const state = getFearGreedState(value);
  const t = TRANSLATIONS[CONFIG.currentLang];
  
  const indicator = document.getElementById('fearGreedIndicator');
  const valueElement = document.getElementById('fearGreedValue');
  const textElement = document.getElementById('fearGreedText');
  const updateElement = document.querySelector('.update-text');
  
  if (indicator) indicator.style.left = getFearGreedPosition(value);
  if (valueElement) valueElement.textContent = value;
  if (textElement) textElement.textContent = t[state];
  if (updateElement) {
    updateElement.textContent = `${t.lastUpdate}: ${new Date().toLocaleTimeString()}`;
  }
}

function renderCoinCard(coin, index) {
  const t = TRANSLATIONS[CONFIG.currentLang];
  const change = coin.price_change_percentage_24h || 0;
  const changeClass = change >= 0 ? 'change-positive' : 'change-negative';
  const changeSymbol = change >= 0 ? '+' : '';
  const chartId = `chart-${coin.id}-${index}`;
  
  return `
    <div class="coin-card" data-coin-id="${coin.id}">
      <div class="coin-rank">${coin.market_cap_rank}</div>
      <div class="coin-header">
        <img src="${coin.image}" alt="${coin.name}" class="coin-icon" 
             onerror="this.src='https://via.placeholder.com/48/2962ff/ffffff?text=${coin.symbol.substring(0, 3).toUpperCase()}'">
        <div class="coin-info">
          <div class="coin-name">${coin.name}</div>
          <div class="coin-symbol">${coin.symbol.toUpperCase()}</div>
        </div>
      </div>
      <div class="coin-price">${formatPrice(coin.current_price)}</div>
      <div class="coin-change ${changeClass}">
        ${changeSymbol}${change.toFixed(2)}%
      </div>
      <div class="coin-stats">
        <div class="coin-stat">
          <div class="stat-value">${formatCurrency(coin.market_cap)}</div>
          <div class="stat-label">${t.marketCap}</div>
        </div>
        <div class="coin-stat">
          <div class="stat-value">${formatCurrency(coin.total_volume)}</div>
          <div class="stat-label">${t.volume}</div>
        </div>
      </div>
      <div class="coin-sparkline">
        <canvas id="${chartId}"></canvas>
      </div>
      <div class="coin-actions">
        <a href="https://www.tradingview.com/symbols/${coin.symbol.toUpperCase()}USD/" 
           target="_blank" class="action-btn">
          📊 ${t.tradingView}
        </a>
        <a href="https://www.coingecko.com/en/coins/${coin.id}" 
           target="_blank" class="action-btn secondary">
          🔍 ${t.details}
        </a>
      </div>
    </div>
  `;
}

function renderCoinGrid(coins) {
  const grid = document.getElementById('coinGrid');
  if (!grid) return;
  
  const t = TRANSLATIONS[CONFIG.currentLang];
  
  if (!coins || coins.length === 0) {
    grid.innerHTML = `
      <div class="search-no-results">
        <div class="no-results-icon">🔍</div>
        <h3 class="no-results-title">${t.noResults}</h3>
        <p class="no-results-text">${t.changeSearch}</p>
      </div>
    `;
    return;
  }
  
  grid.innerHTML = coins.map((coin, index) => renderCoinCard(coin, index)).join('');
  
  // Создаем графики после рендеринга
  setTimeout(() => {
    coins.forEach((coin, index) => {
      const chartId = `chart-${coin.id}-${index}`;
      createSparklineChart(chartId, coin.sparkline_in_7d.price, coin.price_change_percentage_24h >= 0);
    });
  }, 100);
}

function createSparklineChart(canvasId, data, isPositive) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  
  // Удаляем существующий график
  const existingChart = charts.get(canvasId);
  if (existingChart) {
    existingChart.destroy();
  }
  
  const ctx = canvas.getContext('2d');
  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map((_, i) => ''),
      datasets: [{
        data: data,
        borderColor: isPositive ? '#10b981' : '#ef4444',
        backgroundColor: 'transparent',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      },
      scales: {
        x: { display: false },
        y: { display: false }
      },
      interaction: { intersect: false }
    }
  });
  
  charts.set(canvasId, chart);
}

function updatePagination() {
  const prevBtn = document.getElementById('prevPage');
  const nextBtn = document.getElementById('nextPage');
  const pageInfo = document.getElementById('pageInfo');
  const t = TRANSLATIONS[CONFIG.currentLang];
  
  if (pageInfo) {
    pageInfo.textContent = `${t.page} ${CONFIG.currentPage}`;
  }
  
  if (prevBtn) {
    prevBtn.disabled = CONFIG.currentPage === 1;
    prevBtn.classList.toggle('disabled', CONFIG.currentPage === 1);
  }
  
  if (nextBtn) {
    const totalPages = Math.ceil(filteredCoins.length / CONFIG.coinsPerPage);
    nextBtn.disabled = CONFIG.currentPage >= totalPages;
    nextBtn.classList.toggle('disabled', CONFIG.currentPage >= totalPages);
  }
}

// ===== ПОИСК И ФИЛЬТРАЦИЯ =====
function performSearch(query = '') {
  if (!allCoinsCache.length) {
    allCoinsCache = TEST_COINS;
  }
  
  if (!query.trim()) {
    filteredCoins = [...allCoinsCache];
  } else {
    const searchTerm = query.toLowerCase();
    filteredCoins = allCoinsCache.filter(coin => 
      coin.name.toLowerCase().includes(searchTerm) ||
      coin.symbol.toLowerCase().includes(searchTerm)
    );
  }
  
  CONFIG.currentPage = 1;
  updateCurrentCoins();
  updatePagination();
  
  // Обновляем счетчик результатов
  const resultsCount = document.getElementById('searchResultsCount');
  const t = TRANSLATIONS[CONFIG.currentLang];
  if (resultsCount) {
    resultsCount.textContent = `${t.showing} ${Math.min(filteredCoins.length, CONFIG.coinsPerPage)} ${t.of} ${filteredCoins.length} ${t.results}`;
  }
}

function updateCurrentCoins() {
  const startIndex = (CONFIG.currentPage - 1) * CONFIG.coinsPerPage;
  const endIndex = startIndex + CONFIG.coinsPerPage;
  currentCoins = filteredCoins.slice(startIndex, endIndex);
  renderCoinGrid(currentCoins);
}

// ===== УПРАВЛЕНИЕ ТЕМОЙ И ЯЗЫКОМ =====
function updateTranslations() {
  const t = TRANSLATIONS[CONFIG.currentLang];
  
  // Обновляем тексты
  const elements = {
    'siteLogo': t.siteLogo,
    'coinsTitle': t.coinsTitle,
    'mainSearch': t.searchPlaceholder,
    'fearGreedTitle': t.fearGreedTitle,
    'promoTitle': t.promoTitle,
    'promoSubtitle': t.promoSubtitle,
    'promoBtn': t.promoBtn
  };
  
  Object.entries(elements).forEach(([id, text]) => {
    const element = document.getElementById(id);
    if (element) {
      if (element.placeholder !== undefined) {
        element.placeholder = text;
      } else {
        element.textContent = text;
      }
    }
  });
  
  // Обновляем тему
  const themeText = document.getElementById('themeText');
  if (themeText) {
    themeText.textContent = CONFIG.currentTheme === 'dark' ? 
      (CONFIG.currentLang === 'ru' ? 'Тёмная' : 'Dark') : 
      (CONFIG.currentLang === 'ru' ? 'Светлая' : 'Light');
  }
  
  // Перерисовываем компоненты
  renderFearGreedIndex();
  renderCoinGrid(currentCoins);
  updatePagination();
}

function toggleTheme() {
  CONFIG.currentTheme = CONFIG.currentTheme === 'dark' ? 'light' : 'dark';
  document.body.setAttribute('data-theme', CONFIG.currentTheme);
  updateTranslations();
  
  // Обновляем графики
  setTimeout(() => {
    charts.forEach((chart, chartId) => {
      if (chart) chart.update();
    });
  }, 100);
}

function changeLanguage(lang) {
  CONFIG.currentLang = lang;
  updateTranslations();
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
function initEventListeners() {
  // Поиск
  const searchInput = document.getElementById('mainSearch');
  const searchClear = document.getElementById('searchClear');
  
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      if (searchClear) {
        searchClear.style.display = e.target.value ? 'block' : 'none';
      }
      
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        performSearch(e.target.value);
      }, 300);
    });
    
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        performSearch(e.target.value);
      }
    });
  }
  
  if (searchClear) {
    searchClear.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
        searchClear.style.display = 'none';
        performSearch('');
      }
    });
  }
  
  // Переключатель темы
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.checked = CONFIG.currentTheme === 'dark';
    themeToggle.addEventListener('change', toggleTheme);
  }
  
  // Переключатель языка
  const langButtons = document.querySelectorAll('.lang-btn');
  langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      langButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      changeLanguage(lang);
    });
  });
  
  // Пагинация
  const prevBtn = document.getElementById('prevPage');
  const nextBtn = document.getElementById('nextPage');
  
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (CONFIG.currentPage > 1) {
        CONFIG.currentPage--;
        updateCurrentCoins();
        updatePagination();
      }
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const totalPages = Math.ceil(filteredCoins.length / CONFIG.coinsPerPage);
      if (CONFIG.currentPage < totalPages) {
        CONFIG.currentPage++;
        updateCurrentCoins();
        updatePagination();
      }
    });
  }
  
  // Промо кнопка
  const promoBtn = document.querySelector('.promo-btn');
  if (promoBtn) {
    promoBtn.addEventListener('click', () => {
      document.getElementById('coinsSection')?.scrollIntoView({ 
        behavior: 'smooth' 
      });
    });
  }
}

function initApp() {
  console.log('🚀 Инициализация Crypto Dashboard...');
  
  // Устанавливаем начальную тему
  document.body.setAttribute('data-theme', CONFIG.currentTheme);
  
  // Загружаем данные
  allCoinsCache = TEST_COINS;
  filteredCoins = [...TEST_COINS];
  
  // Инициализируем отображение
  updateCurrentCoins();
  renderFearGreedIndex();
  updateTranslations();
  initEventListeners();
  
  console.log('✅ Crypto Dashboard успешно запущен!');
}

// ===== API ФУНКЦИИ (для будущего расширения) =====
async function fetchCoinsFromAPI() {
  try {
    const response = await fetch(`${CONFIG.apiUrl}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true`);
    if (!response.ok) throw new Error('API request failed');
    return await response.json();
  } catch (error) {
    console.error('❌ Ошибка загрузки данных:', error);
    return TEST_COINS; // Fallback на тестовые данные
  }
}

async function fetchFearGreedIndex() {
  try {
    // В реальном приложении здесь был бы вызов к API Fear & Greed Index
    return {
      value: 75,
      value_classification: "Greed",
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Ошибка загрузки индекса:', error);
    return { value: 50, value_classification: "Neutral" };
  }
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', initApp);

// Глобальные функции для использования в HTML
window.toggleTheme = toggleTheme;
window.changeLanguage = changeLanguage;
window.performSearch = performSearch;
