// ===== ОСНОВНОЙ JavaScript =====

// ===== СИСТЕМА ТЕМ =====
function initTheme() {
  try {
    const savedTheme = localStorage.getItem('cryptoTheme') || 'dark';
    CONFIG.currentTheme = savedTheme;
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const themeToggle = document.getElementById('themeToggle');
    const themeText = document.getElementById('themeText');
    
    if (themeToggle) themeToggle.checked = savedTheme === 'dark';
    if (themeText) {
      themeText.textContent = TRANSLATIONS[CONFIG.currentLang].themeText;
    }
  } catch (e) {
    console.log('Ошибка инициализации темы:', e);
  }
}

function toggleTheme() {
  const newTheme = CONFIG.currentTheme === 'light' ? 'dark' : 'light';
  CONFIG.currentTheme = newTheme;
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('cryptoTheme', newTheme);
  
  const themeText = document.getElementById('themeText');
  if (themeText) {
    themeText.textContent = TRANSLATIONS[CONFIG.currentLang].themeText;
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
    console.log('Ошибка инициализации языка:', e);
  }
}

function updateLanguageButtons() {
  const langButtons = document.querySelectorAll('.lang-btn');
  langButtons.forEach(btn => {
    const isActive = btn.dataset.lang === CONFIG.currentLang;
    btn.classList.toggle('active', isActive);
  });
}

function changeLanguage(lang) {
  CONFIG.currentLang = lang;
  localStorage.setItem('cryptoLang', lang);
  
  updateLanguageButtons();
  updateAllTranslations();
  loadCoins();
}

function updateAllTranslations() {
  try {
    const t = TRANSLATIONS[CONFIG.currentLang];
    if (!t) return;
    
    // Обновляем все тексты
    updateElementText('#siteLogo', t.siteLogo);
    updateElementText('#themeText', t.themeText);
    updateElementText('#promoTitle', t.promoTitle);
    updateElementText('#promoSubtitle', t.promoSubtitle);
    updateElementText('#promoBtn', t.promoBtn);
    updateElementText('#coinsTitle', t.coinsTitle);
    updateElementText('#mainSearch', t.searchPlaceholder, 'placeholder');
    updateElementText('.fear-greed-title', t.fearGreedTitle);
    updateElementText('#prevPage', '← ' + (CONFIG.currentLang === 'ru' ? 'Назад' : 'Previous'));
    updateElementText('#nextPage', (CONFIG.currentLang === 'ru' ? 'Вперёд' : 'Next') + ' →');
    updateElementText('#pageInfo', `${t.page} ${CONFIG.currentPage}`);
    
  } catch (e) {
    console.log('Ошибка обновления переводов:', e);
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
      <div class="coin-card loading">
        <div class="coin-header">
          <div class="coin-icon-skeleton"></div>
          <div>
            <div class="coin-name-skeleton"></div>
            <div class="coin-symbol-skeleton"></div>
          </div>
        </div>
        <div class="coin-price-skeleton"></div>
        <div class="coin-change-skeleton"></div>
        <div class="coin-actions">
          <div class="action-btn-skeleton"></div>
          <div class="action-btn-skeleton"></div>
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
    if (searchClear) {
      searchClear.style.display = this.value.length > 0 ? 'block' : 'none';
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
      performSearch('');
    });
  }
}

function performSearch(query) {
  if (!allCoinsCache.length) {
    allCoinsCache = TEST_COINS;
  }
  
  const coinGrid = document.getElementById('coinGrid');
  if (!coinGrid) return;
  
  if (!query) {
    renderCoins(allCoinsCache);
    return;
  }
  
  const searchTerm = query.toLowerCase();
  const filteredCoins = allCoinsCache.filter(coin => 
    coin.name.toLowerCase().includes(searchTerm) ||
    coin.symbol.toLowerCase().includes(searchTerm)
  );
  
  renderFilteredCoins(filteredCoins, query);
}

function renderFilteredCoins(coins, query) {
  const coinGrid = document.getElementById('coinGrid');
  if (!coinGrid) return;
  
  const t = TRANSLATIONS[CONFIG.currentLang];
  
  if (coins.length === 0) {
    coinGrid.innerHTML = `
      <div class="search-no-results">
        <div class="no-results-icon">🔍</div>
        <h3>${t.noResults}</h3>
        <p>${t.changeSearch} "${query}"</p>
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
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${CONFIG.coinsPerPage}&page=${CONFIG.currentPage}`
      );
      
      if (response.ok) {
        const coins = await response.json();
        allCoinsCache = coins;
        renderCoins(coins);
        return;
      }
    } catch (apiError) {
      console.log('API недоступен, используем тестовые данные');
    }
    
    // Используем тестовые данные
    allCoinsCache = TEST_COINS;
    renderCoins(TEST_COINS);
    
    updatePagination();
    
  } catch (error) {
    console.error('Ошибка загрузки монет:', error);
    showErrorState();
  }
}

function renderCoins(coins) {
  const coinGrid = document.getElementById('coinGrid');
  if (!coinGrid) return;
  
  try {
    const t = TRANSLATIONS[CONFIG.currentLang];
    
    coinGrid.innerHTML = coins.map(coin => {
      const change = coin.price_change_percentage_24h || 0;
      const changeClass = change >= 0 ? 'change-positive' : 'change-negative';
      const changeSymbol = change >= 0 ? '+' : '';
      
      return `
        <div class="coin-card" data-coin-id="${coin.id}">
          <div class="coin-header">
            <img src="${coin.image}" alt="${coin.name}" class="coin-icon" onerror="this.src='https://via.placeholder.com/40/2962ff/ffffff?text=?'">
            <div>
              <div class="coin-name">${coin.name}</div>
              <div class="coin-symbol">${coin.symbol.toUpperCase()}</div>
            </div>
          </div>
          <div class="coin-price">$${coin.current_price.toLocaleString()}</div>
          <div class="coin-change ${changeClass}">
            ${changeSymbol}${change.toFixed(2)}%
          </div>
          <div class="coin-actions">
            <a href="https://www.tradingview.com/symbols/${coin.symbol.toUpperCase()}USD/" target="_blank" class="action-btn">${t.tradingView}</a>
            <a href="https://www.coingecko.com/en/coins/${coin.id}" target="_blank" class="action-btn">${t.details}</a>
          </div>
        </div>
      `;
    }).join('');
  } catch (e) {
    console.log('Ошибка рендеринга монет:', e);
    showErrorState();
  }
}

function showErrorState() {
  const coinGrid = document.getElementById('coinGrid');
  const t = TRANSLATIONS[CONFIG.currentLang];
  
  if (coinGrid) {
    coinGrid.innerHTML = `
      <div class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>${t.error}</h3>
        <button onclick="loadCoins()" class="action-btn">${t.retry}</button>
      </div>
    `;
  }
}

// ===== ПАГИНАЦИЯ =====
function updatePagination() {
  try {
    const pageInfo = document.getElementById('pageInfo');
    const prevBtn = document.getElementById('prevPage');
    
    if (pageInfo) {
      pageInfo.textContent = `${TRANSLATIONS[CONFIG.currentLang].page} ${CONFIG.currentPage}`;
    }
    
    if (prevBtn) {
      prevBtn.classList.toggle('disabled', CONFIG.currentPage === 1);
    }
  } catch (e) {
    console.log('Ошибка пагинации:', e);
  }
}

function changePage(direction) {
  if (direction === 'prev' && CONFIG.currentPage > 1) {
    CONFIG.currentPage--;
  } else if (direction === 'next') {
    CONFIG.currentPage++;
  }
  
  loadCoins();
}

// ===== FEAR & GREED INDEX =====
async function loadFearGreedIndex() {
  try {
    const value = 75;
    const classification = CONFIG.currentLang === 'ru' ? "Жадность" : "Greed";
    
    const indicator = document.getElementById('fearGreedIndicator');
    const valueDisplay = document.getElementById('fearGreedValue');
    const textDisplay = document.getElementById('fearGreedText');
    
    if (indicator) indicator.style.left = '75%';
    if (valueDisplay) valueDisplay.textContent = value;
    if (textDisplay) textDisplay.textContent = classification;
    
  } catch (error) {
    console.log('Ошибка Fear & Greed:', error);
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
      document.getElementById('coinsSection').scrollIntoView({
        behavior: 'smooth'
      });
    });
  }

  // Пагинация
  const prevBtn = document.getElementById('prevPage');
  const nextBtn = document.getElementById('nextPage');
  
  if (prevBtn) prevBtn.addEventListener('click', () => changePage('prev'));
  if (nextBtn) nextBtn.addEventListener('click', () => changePage('next'));
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
