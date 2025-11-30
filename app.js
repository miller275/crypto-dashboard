// ===== ОСНОВНОЙ JavaScript =====

// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =====
let allCoinsCache = [];
let currentCharts = new Map();
let refreshInterval = null;

// ===== СИСТЕМА ТЕМ =====
function initTheme() {
  try {
    const savedTheme = localStorage.getItem('cryptoTheme') || CONFIG.currentTheme;
    CONFIG.currentTheme = savedTheme;
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.checked = savedTheme === 'dark';
    }
    
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
  ConfigUtils.saveToStorage();
}

function updateThemeText() {
  const themeText = document.getElementById('themeText');
  if (themeText) {
    const t = TRANSLATIONS[CONFIG.currentLang];
    const text = CONFIG.currentTheme === 'dark' ? t.themeText : t.lightThemeText;
    themeText.textContent = text;
  }
}

// ===== СИСТЕМА ЯЗЫКА =====
function initLanguage() {
  try {
    const savedLang = localStorage.getItem('cryptoLang') || CONFIG.currentLang;
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
  ConfigUtils.saveToStorage();
}

function updateAllTranslations() {
  try {
    const t = TRANSLATIONS[CONFIG.currentLang];
    if (!t) return;
    
    // Обновляем все тексты
    updateElementText('#siteLogo', t.siteLogo);
    updateElementText('#themeText', CONFIG.currentTheme === 'dark' ? t.themeText : t.lightThemeText);
    updateElementText('#promoTitle', t.promoTitle);
    updateElementText('#promoSubtitle', t.promoSubtitle);
    updateElementText('#promoBtn', t.promoBtn);
    updateElementText('#coinsTitle', t.coinsTitle);
    updateElementText('.fear-greed-title', t.fearGreedTitle);
    updateElementText('#prevPage', '← ' + t.prevPage);
    updateElementText('#nextPage', t.nextPage + ' →');
    updateElementText('#pageInfo', `${t.page} ${CONFIG.currentPage}`);
    
    // Обновляем состояния Fear & Greed
    updateFearGreedStates();
    
    // Обновляем значения Fear & Greed
    const valueDisplay = document.getElementById('fearGreedValue');
    const textDisplay = document.getElementById('fearGreedText');
    if (valueDisplay) valueDisplay.textContent = CONFIG.fearGreedValue;
    if (textDisplay) textDisplay.textContent = t[CONFIG.fearGreedState];
    
  } catch (e) {
    console.error('Ошибка обновления переводов:', e);
  }
}

function updateFearGreedStates() {
  const t = TRANSLATIONS[CONFIG.currentLang];
  const stateLabels = document.querySelectorAll('.scale-states .state-label');
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
  
  const skeletonCount = CONFIG.coinsPerPage;
  let skeletonHTML = '';
  
  for (let i = 0; i < skeletonCount; i++) {
    skeletonHTML += `
      <div class="coin-card loading" aria-label="Loading cryptocurrency data">
        <div class="coin-rank skeleton" style="background: var(--skeleton-bg);"></div>
        <div class="coin-header">
          <div class="skeleton" style="width: 48px; height: 48px; border-radius: 50%; background: var(--skeleton-bg);"></div>
          <div class="coin-info">
            <div class="skeleton" style="width: 120px; height: 20px; background: var(--skeleton-bg); margin-bottom: 8px;"></div>
            <div class="skeleton" style="width: 60px; height: 16px; background: var(--skeleton-bg);"></div>
          </div>
        </div>
        <div class="skeleton" style="width: 100px; height: 28px; background: var(--skeleton-bg); margin-bottom: 12px;"></div>
        <div class="skeleton" style="width: 80px; height: 32px; border-radius: 8px; background: var(--skeleton-bg); margin-bottom: 16px;"></div>
        <div class="coin-stats">
          <div class="coin-stat">
            <div class="skeleton" style="width: 100%; height: 16px; background: var(--skeleton-bg); margin-bottom: 4px;"></div>
            <div class="skeleton" style="width: 60%; height: 14px; background: var(--skeleton-bg);"></div>
          </div>
          <div class="coin-stat">
            <div class="skeleton" style="width: 100%; height: 16px; background: var(--skeleton-bg); margin-bottom: 4px;"></div>
            <div class="skeleton" style="width: 60%; height: 14px; background: var(--skeleton-bg);"></div>
          </div>
        </div>
        <div class="skeleton" style="width: 100%; height: 60px; border-radius: 8px; background: var(--skeleton-bg);"></div>
      </div>
    `;
  }
  
  coinGrid.innerHTML = skeletonHTML;
}

// ===== ЗАГРУЗКА МОНЕТ =====
async function loadCoins(showLoading = true) {
  const coinGrid = document.getElementById('coinGrid');
  if (!coinGrid) return;
  
  try {
    if (showLoading) {
      createSkeletonLoader();
    }
    
    // Пробуем API, если не получается - используем тестовые данные
    try {
      const apiUrl = API_CONFIG.methods.buildRequest('coins', {}, {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: CONFIG.coinsPerPage,
        page: CONFIG.currentPage,
        sparkline: true,
        price_change_percentage: '24h'
      });
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: API_CONFIG.headers,
        signal: AbortSignal.timeout(CONFIG.apiTimeout)
      });
      
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
        
        // Сохраняем в кэш если включено
        if (CONFIG.enableCache) {
          const cacheData = {
            coins: allCoinsCache,
            timestamp: Date.now()
          };
          localStorage.setItem('cryptoCoinsCache', JSON.stringify(cacheData));
        }
        
        return;
      }
    } catch (apiError) {
      console.log('API недоступен, пробуем кэш или тестовые данные:', apiError);
    }
    
    // Пробуем загрузить из кэша
    if (CONFIG.enableCache) {
      const cachedData = localStorage.getItem('cryptoCoinsCache');
      if (cachedData) {
        const { coins, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CONFIG.cacheDuration) {
          allCoinsCache = coins;
          renderCoins(allCoinsCache);
          updatePagination();
          return;
        }
      }
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
      const changeClass = DataUtils.getChangeClass(change);
      const changeSymbol = change >= 0 ? '+' : '';
      const chartId = `chart-${coin.id}-${index}`;
      
      return `
        <div class="coin-card" data-coin-id="${coin.id}" role="article" 
             onclick="handleCoinClick('${coin.id}')" 
             onkeypress="if(event.key === 'Enter') handleCoinClick('${coin.id}')"
             tabindex="0">
          <div class="coin-rank" aria-label="${t.rank} ${coin.market_cap_rank}">${coin.market_cap_rank}</div>
          <div class="coin-header">
            <img src="${coin.image}" alt="${coin.name}" class="coin-icon" 
                 onerror="this.src='https://via.placeholder.com/48/2962ff/ffffff?text=${coin.symbol.substring(0, 3).toUpperCase()}'">
            <div class="coin-info">
              <div class="coin-name">${coin.name}</div>
              <div class="coin-symbol">${coin.symbol.toUpperCase()}</div>
            </div>
          </div>
          <div class="coin-price" aria-label="${t.price}: ${DataUtils.formatCurrency(coin.current_price)}">
            ${DataUtils.formatCurrency(coin.current_price)}
          </div>
          <div class="coin-change ${changeClass}" aria-label="${t.change24h}: ${changeSymbol}${change.toFixed(2)}%">
            ${changeSymbol}${change.toFixed(2)}%
          </div>
          <div class="coin-stats">
            <div class="coin-stat">
              <div class="stat-value">${DataUtils.formatNumber(coin.market_cap)}</div>
              <div class="stat-label">${t.marketCap}</div>
            </div>
            <div class="coin-stat">
              <div class="stat-value">${DataUtils.formatNumber(coin.total_volume)}</div>
              <div class="stat-label">${t.volume}</div>
            </div>
          </div>
          <div class="coin-sparkline" aria-label="${t.sparkline}">
            <canvas id="${chartId}" role="img" aria-label="${coin.name} price chart"></canvas>
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
          borderColor: isPositive ? CONSTANTS.CHART_COLORS.positive : CONSTANTS.CHART_COLORS.negative,
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
      <div class="error-state" role="alert" style="text-align: center; padding: 3rem; color: var(--text-secondary); grid-column: 1 / -1;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
        <h3 style="margin-bottom: 1rem; color: var(--text-primary);">${t.error}</h3>
        <p style="margin-bottom: 1.5rem; opacity: 0.8;">${t.changeSearch}</p>
        <button onclick="loadCoins()" class="action-btn">${t.retry}</button>
      </div>
    `;
  }
}

// ===== ОБРАБОТЧИК КЛИКА ПО МОНЕТЕ =====
function handleCoinClick(coinId) {
  const coin = allCoinsCache.find(c => c.id === coinId);
  if (!coin) return;
  
  showCoinDetails(coin);
}

// ===== МОДАЛЬНОЕ ОКНО С ДЕТАЛЯМИ МОНЕТЫ =====
function showCoinDetails(coin) {
  const change = coin.price_change_percentage_24h || 0;
  const changeClass = DataUtils.getChangeClass(change);
  const changeSymbol = change >= 0 ? '+' : '';
  const t = TRANSLATIONS[CONFIG.currentLang];
  
  const modalHTML = `
    <div class="modal-overlay" id="coinModal" onclick="closeModal()">
      <div class="modal-content" onclick="event.stopPropagation()">
        <button class="modal-close" onclick="closeModal()" aria-label="${t.close}">
          &times;
        </button>
        
        <div class="modal-header">
          <div class="coin-header">
            <img src="${coin.image}" alt="${coin.name}" class="coin-icon-large"
                 onerror="this.src='https://via.placeholder.com/60/2962ff/ffffff?text=${coin.symbol.substring(0, 3).toUpperCase()}'">
            <div class="coin-info">
              <h2 class="coin-name">${coin.name}</h2>
              <div class="coin-symbol">${coin.symbol.toUpperCase()}</div>
            </div>
          </div>
          <div class="coin-rank-large">#${coin.market_cap_rank}</div>
        </div>
        
        <div class="modal-body">
          <div class="price-section">
            <div class="current-price">${DataUtils.formatCurrency(coin.current_price)}</div>
            <div class="price-change ${changeClass}">
              ${changeSymbol}${change.toFixed(2)}% (24ч)
            </div>
          </div>
          
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-label">${t.marketCap}</div>
              <div class="stat-value">${DataUtils.formatNumber(coin.market_cap)}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">${t.volume}</div>
              <div class="stat-value">${DataUtils.formatNumber(coin.total_volume)}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">${t.marketShare}</div>
              <div class="stat-value">${((coin.market_cap / 2500000000000) * 100).toFixed(2)}%</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">${t.priceChange24h}</div>
              <div class="stat-value ${changeClass}">${changeSymbol}${change.toFixed(2)}%</div>
            </div>
            ${coin.high_24h ? `
            <div class="stat-item">
              <div class="stat-label">${t.high24h}</div>
              <div class="stat-value">${DataUtils.formatCurrency(coin.high_24h)}</div>
            </div>
            ` : ''}
            ${coin.low_24h ? `
            <div class="stat-item">
              <div class="stat-label">${t.low24h}</div>
              <div class="stat-value">${DataUtils.formatCurrency(coin.low_24h)}</div>
            </div>
            ` : ''}
          </div>
          
          <div class="action-buttons">
            <a href="${CONSTANTS.EXTERNAL_URLS.tradingView}?symbol=${coin.symbol.toUpperCase()}USD" 
               target="_blank" class="action-btn" rel="noopener noreferrer">
              📊 ${t.tradingView}
            </a>
            <a href="${CONSTANTS.EXTERNAL_URLS.coinGecko}/${coin.id}" 
               target="_blank" class="action-btn secondary" rel="noopener noreferrer">
              🔍 ${t.details}
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Добавляем модальное окно в DOM
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Блокируем прокрутку body
  document.body.style.overflow = 'hidden';
  
  // Фокусируемся на модальном окне для доступности
  const modal = document.getElementById('coinModal');
  if (modal) {
    modal.focus();
  }
}

function closeModal() {
  const modal = document.getElementById('coinModal');
  if (modal) {
    modal.remove();
    document.body.style.overflow = '';
  }
}

// ===== FEAR & GREED INDEX =====
async function loadFearGreedIndex() {
  try {
    // В реальном приложении здесь был бы API запрос
    const mockData = {
      value: CONFIG.fearGreedValue,
      classification: CONFIG.fearGreedState,
      timestamp: new Date().toISOString()
    };
    
    updateFearGreedDisplay(mockData.value, mockData.classification);
    
  } catch (error) {
    console.error('Ошибка Fear & Greed:', error);
  }
}

function updateFearGreedDisplay(value, classification) {
  const indicator = document.getElementById('fearGreedIndicator');
  const valueDisplay = document.getElementById('fearGreedValue');
  const textDisplay = document.getElementById('fearGreedText');
  const t = TRANSLATIONS[CONFIG.currentLang];
  
  if (indicator) {
    indicator.style.left = `${value}%`;
    indicator.setAttribute('aria-valuenow', value);
  }
  if (valueDisplay) valueDisplay.textContent = value;
  if (textDisplay) textDisplay.textContent = t[classification];
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
      prevBtn.disabled = isDisabled;
      prevBtn.setAttribute('aria-disabled', isDisabled);
    }
    
    if (nextBtn) {
      const totalPages = Math.ceil(allCoinsCache.length / CONFIG.coinsPerPage);
      const isDisabled = CONFIG.currentPage >= totalPages;
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
  ConfigUtils.saveToStorage();
}

// ===== АВТООБНОВЛЕНИЕ =====
function initAutoRefresh() {
  if (CONFIG.autoRefresh && !refreshInterval) {
    refreshInterval = setInterval(() => {
      loadCoins(false); // false - не показывать скелетон при автообновлении
      loadFearGreedIndex();
    }, CONFIG.refreshInterval);
  }
}

function stopAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
}

function toggleAutoRefresh() {
  CONFIG.autoRefresh = !CONFIG.autoRefresh;
  if (CONFIG.autoRefresh) {
    initAutoRefresh();
  } else {
    stopAutoRefresh();
  }
  ConfigUtils.saveToStorage();
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

  // Обработка клавиши Escape для модального окна
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      closeModal();
    }
  });

  // Видимость страницы для автообновления
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      stopAutoRefresh();
    } else if (CONFIG.autoRefresh) {
      initAutoRefresh();
    }
  });
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
    // Загружаем конфигурацию
    ConfigUtils.loadFromStorage();
    
    initTheme();
    initLanguage();
    initEventListeners();
    
    loadCoins();
    loadFearGreedIndex();
    
    // Запускаем автообновление если включено
    if (CONFIG.autoRefresh) {
      initAutoRefresh();
    }
    
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
window.handleCoinClick = handleCoinClick;
window.closeModal = closeModal;
window.changePage = changePage;
window.loadCoins = loadCoins;
window.toggleAutoRefresh = toggleAutoRefresh;
