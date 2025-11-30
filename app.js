// ===== ОСНОВНОЙ JavaScript =====

// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =====
let allCoinsCache = [];
let currentCharts = new Map();

// ===== СИСТЕМА ТЕМ =====
function initTheme() {
  try {
    const savedTheme = localStorage.getItem('cryptoTheme') || 'dark';
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const theme = savedTheme === 'system' ? systemTheme : savedTheme;
    
    CONFIG.currentTheme = theme;
    
    document.documentElement.setAttribute('data-theme', theme);
    
    const themeToggle = document.getElementById('themeToggle');
    const themeText = document.getElementById('themeText');
    
    if (themeToggle) themeToggle.checked = theme === 'dark';
    updateThemeText();
    
  } catch (e) {
    console.error('Ошибка инициализации темы:', e);
  }
}

function toggleTheme() {
  const newTheme = CONFIG.currentTheme === 'light' ? 'dark' : 'light';
  CONFIG.currentTheme = newTheme;
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('cryptoTheme', newTheme);
  
  updateThemeText();
  updateCharts();
}

function updateThemeText() {
  const themeText = document.getElementById('themeText');
  if (themeText) {
    const text = CONFIG.currentTheme === 'dark' 
      ? (CONFIG.currentLang === 'ru' ? 'Тёмная' : 'Dark')
      : (CONFIG.currentLang === 'ru' ? 'Светлая' : 'Light');
    themeText.textContent = text;
  }
}

// ===== СИСТЕМА ЯЗЫКА =====
function initLanguage() {
  try {
    const savedLang = localStorage.getItem('cryptoLang') || 'ru';
    CONFIG.currentLang = savedLang;
    
    updateLanguageButtons();
    updateAllTranslations();
    
  } catch (e) {
    console.error('Ошибка инициализации языка:', e);
  }
}

function updateLanguageButtons() {
  const langButtons = document.querySelectorAll('.lang-btn');
  langButtons.forEach(btn => {
    const isActive = btn.dataset.lang === CONFIG.currentLang;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive);
  });
}

function changeLanguage(lang) {
  CONFIG.currentLang = lang;
  localStorage.setItem('cryptoLang', lang);
  
  updateLanguageButtons();
  updateAllTranslations();
  loadCoins();
  loadFearGreedIndex();
}

function updateAllTranslations() {
  try {
    const t = TRANSLATIONS[CONFIG.currentLang];
    if (!t) return;
    
    // Обновляем все тексты
    updateElementText('#siteLogo', t.siteLogo);
    updateElementText('#themeText', CONFIG.currentTheme === 'dark' 
      ? (CONFIG.currentLang === 'ru' ? 'Тёмная' : 'Dark')
      : (CONFIG.currentLang === 'ru' ? 'Светлая' : 'Light'));
    updateElementText('#promoTitle', t.promoTitle);
    updateElementText('#promoSubtitle', t.promoSubtitle);
    updateElementText('#promoBtn', t.promoBtn);
    updateElementText('#coinsTitle', t.coinsTitle);
    updateElementText('#mainSearch', t.searchPlaceholder, 'placeholder');
    updateElementText('.fear-greed-title', t.fearGreedTitle);
    updateElementText('#prevPage', '← ' + (CONFIG.currentLang === 'ru' ? 'Назад' : 'Previous'));
    updateElementText('#nextPage', (CONFIG.currentLang === 'ru' ? 'Вперёд' : 'Next') + ' →');
    updateElementText('#pageInfo', `${t.page} ${CONFIG.currentPage}`);
    updateElementText('#fearGreedValue', CONFIG.fearGreedValue.toString());
    updateElementText('#fearGreedText', t[CONFIG.fearGreedState]);
    
    // Обновляем состояния Fear & Greed
    updateFearGreedStates();
    
  } catch (e) {
    console.error('Ошибка обновления переводов:', e);
  }
}

function updateFearGreedStates() {
  const t = TRANSLATIONS[CONFIG.currentLang];
  const stateLabels = document.querySelectorAll('.state-label');
  if (stateLabels.length === 5) {
    stateLabels[0].textContent = t.extremeFear;
    stateLabels[1].textContent = t.fear;
    stateLabels[2].textContent = t.neutral;
    stateLabels[3].textContent = t.greed;
    stateLabels[4].textContent = t.extremeGreed;
  }
}

function updateElementText(selector, text, attribute = 'textContent') {
  const element = document.querySelector(selector);
  if (element) {
    if (attribute === 'placeholder') {
      element.placeholder = text;
    } else {
      element.textContent = text;
    }
  }
}

// ===== СКЕЛЕТОН ЗАГРУЗКИ =====
function createSkeletonLoader() {
  const coinGrid = document.getElementById('coinGrid');
  if (!coinGrid) return;
  
  const skeletonCount = 6;
  let skeletonHTML = '';
  
  for (let i = 0; i < skeletonCount; i++) {
    skeletonHTML += `
      <div class="coin-card loading" aria-label="Loading cryptocurrency data">
        <div class="coin-rank skeleton"></div>
        <div class="coin-header">
          <div class="coin-icon-skeleton skeleton"></div>
          <div class="coin-info">
            <div class="coin-name-skeleton skeleton"></div>
            <div class="coin-symbol-skeleton skeleton"></div>
          </div>
        </div>
        <div class="coin-price-skeleton skeleton"></div>
        <div class="coin-change-skeleton skeleton"></div>
        <div class="coin-stats">
          <div class="coin-stat">
            <div class="stat-value skeleton"></div>
            <div class="stat-label skeleton"></div>
          </div>
          <div class="coin-stat">
            <div class="stat-value skeleton"></div>
            <div class="stat-label skeleton"></div>
          </div>
        </div>
        <div class="coin-actions">
          <div class="action-btn-skeleton skeleton"></div>
          <div class="action-btn-skeleton skeleton"></div>
        </div>
      </div>
    `;
  }
  
  coinGrid.innerHTML = skeletonHTML;
}

// ===== ПОИСК =====
function initSearch() {
  const searchInput = document.getElementById('mainSearch');
  const searchClear = document.getElementById('searchClear');
  
  if (!searchInput) return;
  
  // Поиск с задержкой
  let searchTimeout;
  searchInput.addEventListener('input', function(e) {
    const hasValue = this.value.length > 0;
    
    if (searchClear) {
      searchClear.style.display = hasValue ? 'block' : 'none';
      searchClear.setAttribute('aria-hidden', !hasValue);
    }
    
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      performSearch(this.value.trim());
    }, 300);
  });
  
  // Очистка поиска
  if (searchClear) {
    searchClear.addEventListener('click', function() {
      searchInput.value = '';
      searchInput.focus();
      this.style.display = 'none';
      this.setAttribute('aria-hidden', 'true');
      performSearch('');
    });
    
    // Скрыть кнопку очистки изначально
    searchClear.style.display = 'none';
    searchClear.setAttribute('aria-hidden', 'true');
  }
  
  // Обработка клавиш
  searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      this.value = '';
      performSearch('');
      if (searchClear) {
        searchClear.style.display = 'none';
        searchClear.setAttribute('aria-hidden', 'true');
      }
    }
  });
}

function performSearch(query) {
  if (!allCoinsCache.length) {
    allCoinsCache = TEST_COINS;
  }
  
  const coinGrid = document.getElementById('coinGrid');
  if (!coinGrid) return;
  
  if (!query) {
    renderCoins(allCoinsCache);
    updateSearchResultsCount(allCoinsCache.length);
    return;
  }
  
  const searchTerm = query.toLowerCase();
  const filteredCoins = allCoinsCache.filter(coin => 
    coin.name.toLowerCase().includes(searchTerm) ||
    coin.symbol.toLowerCase().includes(searchTerm)
  );
  
  renderFilteredCoins(filteredCoins, query);
  updateSearchResultsCount(filteredCoins.length, query);
}

function updateSearchResultsCount(count, query = '') {
  const resultsElement = document.getElementById('searchResultsCount');
  if (!resultsElement) return;
  
  const t = TRANSLATIONS[CONFIG.currentLang];
  let text = '';
  
  if (query) {
    text = `${t.showing} ${count} ${t.results} ${t.for} "${query}"`;
  } else {
    text = `${t.showing} ${count} ${t.results}`;
  }
  
  resultsElement.textContent = text;
  resultsElement.setAttribute('aria-live', 'polite');
}

function renderFilteredCoins(coins, query) {
  const coinGrid = document.getElementById('coinGrid');
  if (!coinGrid) return;
  
  const t = TRANSLATIONS[CONFIG.currentLang];
  
  if (coins.length === 0) {
    coinGrid.innerHTML = `
      <div class="search-no-results" role="status" aria-live="polite">
        <div class="no-results-icon" aria-hidden="true">🔍</div>
        <h3 class="no-results-title">${t.noResults}</h3>
        <p class="no-results-text">${t.changeSearch} "<span class="search-highlight">${query}</span>"</p>
        <button onclick="performSearch('')" class="action-btn" style="margin-top: 1rem;">
          ${t.showAll}
        </button>
      </div>
    `;
    return;
  }
  
  renderCoins(coins);
}

// ===== ЗАГРУЗКА МОНЕТ =====
async function loadCoins() {
  const coinGrid = document.getElementById('coinGrid');
  if (!coinGrid) return;
  
  try {
    createSkeletonLoader();
    
    // Пробуем API, если не получается - используем тестовые данные
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${CONFIG.coinsPerPage}&page=${CONFIG.currentPage}&sparkline=true&price_change_percentage=24h`
      );
      
      if (response.ok) {
        const coins = await response.json();
        allCoinsCache = coins.map(coin => ({
          ...coin,
          sparkline_in_7d: coin.sparkline_in_7d || {
            price: generateSparklineData(coin.current_price, coin.price_change_percentage_24h)
          }
        }));
        renderCoins(allCoinsCache);
        updatePagination();
        return;
      }
    } catch (apiError) {
      console.log('API недоступен, используем тестовые данные');
    }
    
    // Используем тестовые данные с улучшенными sparkline данными
    allCoinsCache = TEST_COINS.map(coin => ({
      ...coin,
      sparkline_in_7d: {
        price: generateSparklineData(coin.current_price, coin.price_change_percentage_24h)
      }
    }));
    renderCoins(allCoinsCache);
    
    updatePagination();
    
  } catch (error) {
    console.error('Ошибка загрузки монет:', error);
    showErrorState();
  }
}

function generateSparklineData(currentPrice, changePercent, points = 25) {
  const data = [];
  const volatility = Math.abs(changePercent) / 100 * 2;
  const trend = changePercent >= 0 ? 1 : -1;
  let startingPrice = currentPrice * (1 - (trend * volatility * 0.3));
  
  for (let i = 0; i < points; i++) {
    const progress = i / (points - 1);
    const trendEffect = trend * volatility * currentPrice * progress;
    const randomEffect = (Math.random() - 0.5) * volatility * currentPrice * 0.2;
    const price = Math.max(startingPrice + trendEffect + randomEffect, currentPrice * 0.5);
    data.push(parseFloat(price.toFixed(4)));
  }
  
  return data;
}

function renderCoins(coins) {
  const coinGrid = document.getElementById('coinGrid');
  if (!coinGrid) return;
  
  try {
    const t = TRANSLATIONS[CONFIG.currentLang];
    
    // Очищаем предыдущие графики
    currentCharts.forEach(chart => chart.destroy());
    currentCharts.clear();
    
    coinGrid.innerHTML = coins.map((coin, index) => {
      const change = coin.price_change_percentage_24h || 0;
      const changeClass = change >= 0 ? 'change-positive' : 'change-negative';
      const changeSymbol = change >= 0 ? '+' : '';
      const chartId = `chart-${coin.id}-${index}`;
      
      return `
        <div class="coin-card" data-coin-id="${coin.id}" role="article">
          <div class="coin-rank" aria-label="${t.rank} ${coin.market_cap_rank}">${coin.market_cap_rank}</div>
          <div class="coin-header">
            <img src="${coin.image}" alt="${coin.name}" class="coin-icon" 
                 onerror="this.src='https://via.placeholder.com/48/2962ff/ffffff?text=${coin.symbol.substring(0, 3).toUpperCase()}'">
            <div class="coin-info">
              <div class="coin-name">${coin.name}</div>
              <div class="coin-symbol">${coin.symbol.toUpperCase()}</div>
            </div>
          </div>
          <div class="coin-price" aria-label="${t.price}: ${formatPrice(coin.current_price)}">
            ${formatPrice(coin.current_price)}
          </div>
          <div class="coin-change ${changeClass}" aria-label="${t.change24h}: ${changeSymbol}${change.toFixed(2)}%">
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
          <div class="coin-sparkline" aria-label="${t.sparkline}">
            <canvas id="${chartId}" role="img" aria-label="${coin.name} price chart"></canvas>
          </div>
          <div class="coin-actions">
            <a href="https://www.tradingview.com/symbols/${coin.symbol.toUpperCase()}USD/" 
               target="_blank" class="action-btn" rel="noopener noreferrer">
              📊 ${t.tradingView}
            </a>
            <a href="https://www.coingecko.com/en/coins/${coin.id}" 
               target="_blank" class="action-btn secondary" rel="noopener noreferrer">
              🔍 ${t.details}
            </a>
          </div>
        </div>
      `;
    }).join('');
    
    // Создаем графики после рендеринга
    setTimeout(() => {
      coins.forEach((coin, index) => {
        const chartId = `chart-${coin.id}-${index}`;
        if (coin.sparkline_in_7d?.price) {
          createSparklineChart(chartId, coin.sparkline_in_7d.price, coin.price_change_percentage_24h >= 0);
        }
      });
    }, 100);
    
  } catch (e) {
    console.error('Ошибка рендеринга монет:', e);
    showErrorState();
  }
}

function createSparklineChart(canvasId, data, isPositive) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  try {
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
    
    currentCharts.set(canvasId, chart);
  } catch (error) {
    console.error('Ошибка создания графика:', error);
  }
}

function updateCharts() {
  currentCharts.forEach(chart => {
    if (chart) {
      chart.update();
    }
  });
}

function showErrorState() {
  const coinGrid = document.getElementById('coinGrid');
  const t = TRANSLATIONS[CONFIG.currentLang];
  
  if (coinGrid) {
    coinGrid.innerHTML = `
      <div class="error-state" role="alert">
        <div class="error-icon" aria-hidden="true">⚠️</div>
        <h3>${t.error}</h3>
        <p>${t.tryAgain}</p>
        <button onclick="loadCoins()" class="action-btn">${t.retry}</button>
      </div>
    `;
  }
}

// ===== УТИЛИТЫ ФОРМАТИРОВАНИЯ =====
function formatCurrency(amount) {
  if (!amount) return '$0';
  if (amount >= 1e12) return `$${(amount / 1e12).toFixed(2)}T`;
  if (amount >= 1e9) return `$${(amount / 1e9).toFixed(2)}B`;
  if (amount >= 1e6) return `$${(amount / 1e6).toFixed(2)}M`;
  if (amount >= 1e3) return `$${(amount / 1e3).toFixed(2)}K`;
  return `$${amount.toFixed(2)}`;
}

function formatPrice(price) {
  if (!price) return '$0';
  if (price >= 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  if (price >= 1) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(8)}`;
}

// ===== ПАГИНАЦИЯ =====
function updatePagination() {
  try {
    const pageInfo = document.getElementById('pageInfo');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const t = TRANSLATIONS[CONFIG.currentLang];
    
    if (pageInfo) {
      pageInfo.textContent = `${t.page} ${CONFIG.currentPage}`;
    }
    
    if (prevBtn) {
      const isDisabled = CONFIG.currentPage === 1;
      prevBtn.classList.toggle('disabled', isDisabled);
      prevBtn.disabled = isDisabled;
      prevBtn.setAttribute('aria-disabled', isDisabled);
    }
    
    if (nextBtn) {
      const totalPages = Math.ceil(allCoinsCache.length / CONFIG.coinsPerPage);
      const isDisabled = CONFIG.currentPage >= totalPages;
      nextBtn.classList.toggle('disabled', isDisabled);
      nextBtn.disabled = isDisabled;
      nextBtn.setAttribute('aria-disabled', isDisabled);
    }
    
  } catch (e) {
    console.error('Ошибка пагинации:', e);
  }
}

function changePage(direction) {
  if (direction === 'prev' && CONFIG.currentPage > 1) {
    CONFIG.currentPage--;
  } else if (direction === 'next') {
    const totalPages = Math.ceil(allCoinsCache.length / CONFIG.coinsPerPage);
    if (CONFIG.currentPage < totalPages) {
      CONFIG.currentPage++;
    }
  }
  
  loadCoins();
  updatePagination();
}

// ===== FEAR & GREED INDEX =====
async function loadFearGreedIndex() {
  try {
    // В реальном приложении здесь был бы API запрос
    const mockData = {
      value: 75,
      classification: "greed",
      timestamp: new Date().toISOString()
    };
    
    CONFIG.fearGreedValue = mockData.value;
    CONFIG.fearGreedState = mockData.classification;
    
    const indicator = document.getElementById('fearGreedIndicator');
    const valueDisplay = document.getElementById('fearGreedValue');
    const textDisplay = document.getElementById('fearGreedText');
    const updateElement = document.querySelector('.update-text');
    const t = TRANSLATIONS[CONFIG.currentLang];
    
    if (indicator) {
      indicator.style.left = `${mockData.value}%`;
      indicator.setAttribute('aria-valuenow', mockData.value);
    }
    if (valueDisplay) valueDisplay.textContent = mockData.value;
    if (textDisplay) textDisplay.textContent = t[mockData.classification];
    if (updateElement) {
      updateElement.textContent = `${t.lastUpdate}: ${new Date().toLocaleTimeString()}`;
    }
    
  } catch (error) {
    console.error('Ошибка Fear & Greed:', error);
  }
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
function initEventListeners() {
  // Переключатель темы
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('change', toggleTheme);
  }

  // Переключатели языка
  const langButtons = document.querySelectorAll('.lang-btn');
  langButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      changeLanguage(this.dataset.lang);
    });
  });

  // Кнопка промо
  const promoBtn = document.getElementById('promoBtn');
  if (promoBtn) {
    promoBtn.addEventListener('click', function() {
      const coinsSection = document.getElementById('coinsSection');
      if (coinsSection) {
        coinsSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  }

  // Пагинация
  const prevBtn = document.getElementById('prevPage');
  const nextBtn = document.getElementById('nextPage');
  
  if (prevBtn) {
    prevBtn.addEventListener('click', () => changePage('prev'));
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => changePage('next'));
  }
  
  // Обработка изменения размера окна
  window.addEventListener('resize', debounce(() => {
    updateCharts();
  }, 250));
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function initApp() {
  console.log('🚀 Инициализация приложения...');
  
  try {
    initTheme();
    initLanguage();
    initSearch();
    initEventListeners();
    
    loadCoins();
    loadFearGreedIndex();
    
    console.log('✅ Приложение успешно запущено!');
    
  } catch (error) {
    console.error('❌ Ошибка инициализации:', error);
  }
}

// ЗАПУСК ПРИЛОЖЕНИЯ
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Экспорт функций для глобального использования
window.toggleTheme = toggleTheme;
window.changeLanguage = changeLanguage;
window.performSearch = performSearch;
window.changePage = changePage;
window.loadCoins = loadCoins;
