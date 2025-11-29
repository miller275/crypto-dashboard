<!-- FOOTER НАЧАЛО -->
<footer class="site-footer">
 <div class="container">
 <p class="footer-text" id="footerText">© 2024 CryptoDashboard. Все права защищены.</p>
 </div>
</footer>

<!-- ОСНОВНОЙ JAVASCRIPT -->
<script>
// ===== КОНФИГУРАЦИЯ =====
const CONFIG = {
 coinsPerPage: 20,
 currentPage: 1,
 currentLang: 'ru',
 currentTheme: 'light'
};

// ===== ДАННЫЕ ДЛЯ ПОИСКА =====
let allCoinsCache = [];

// ===== УЛУЧШЕННЫЕ ПЕРЕВОДЫ =====
const TRANSLATIONS = {
 ru: {
 siteLogo: 'CryptoDashboard',
 themeText: 'Светлая',
 promoTitle: 'Криптовалютный Дашборд',
 promoSubtitle: 'Реальные данные. Простой интерфейс. Максимальная эффективность.',
 promoBtn: 'Начать торговлю',
 coinsTitle: 'Топ Криптовалют',
 searchPlaceholder: 'Поиск криптовалют...',
 fearGreedTitle: 'Индекс Страха и Жадности',
 footerText: '© 2024 CryptoDashboard. Все права защищены.',
 page: 'Страница',
 tradingView: 'TradingView',
 details: 'Детали'
 },
 en: {
 siteLogo: 'CryptoDashboard',
 themeText: 'Light',
 promoTitle: 'Cryptocurrency Dashboard',
 promoSubtitle: 'Real data. Simple interface. Maximum efficiency.',
 promoBtn: 'Start Trading',
 coinsTitle: 'Top Cryptocurrencies',
 searchPlaceholder: 'Search cryptocurrencies...',
 fearGreedTitle: 'Fear & Greed Index',
 footerText: '© 2024 CryptoDashboard. All rights reserved.',
 page: 'Page',
 tradingView: 'TradingView',
 details: 'Details'
 }
};

// ===== СИСТЕМА ТЕМ =====
function initTheme() {
 try {
 const savedTheme = localStorage.getItem('cryptoTheme') || 'light';
 CONFIG.currentTheme = savedTheme;
 
 document.documentElement.setAttribute('data-theme', savedTheme);
 
 const themeToggle = document.getElementById('themeToggle');
 const themeText = document.getElementById('themeText');
 
 if (themeToggle) themeToggle.checked = savedTheme === 'dark';
 if (themeText) themeText.textContent = TRANSLATIONS[CONFIG.currentLang].themeText;
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

// ===== УЛУЧШЕННАЯ СИСТЕМА ЯЗЫКА =====
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
 
 if (isActive) {
 btn.style.background = 'var(--accent-color)';
 btn.style.color = 'white';
 btn.style.border = 'none';
 } else {
 btn.style.background = 'transparent';
 btn.style.color = 'var(--text-secondary)';
 btn.style.border = 'none';
 }
 
 btn.classList.toggle('active', isActive);
 });
}

function changeLanguage(lang) {
 console.log('Смена языка на:', lang);
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
 
 console.log('Обновление переводов для языка:', CONFIG.currentLang);
 
 // 1. Шапка сайта
 updateElementText('#siteLogo', t.siteLogo);
 updateElementText('#themeText', t.themeText);
 
 // 2. PROMO блок
 updateElementText('#promoTitle', t.promoTitle);
 updateElementText('#promoSubtitle', t.promoSubtitle);
 updateElementText('#promoBtn', t.promoBtn);
 
 // 3. Блок монет
 updateElementText('#coinsTitle', t.coinsTitle);
 updateElementText('#mainSearch', t.searchPlaceholder, 'placeholder');
 
 // 4. Fear & Greed
 updateElementText('.fear-greed-title', t.fearGreedTitle);
 
 // 5. Пагинация
 updateElementText('#prevPage', '← ' + (CONFIG.currentLang === 'ru' ? 'Назад' : 'Previous'));
 updateElementText('#nextPage', (CONFIG.currentLang === 'ru' ? 'Вперёд' : 'Next') + ' →');
 updateElementText('#pageInfo', `${t.page} ${CONFIG.currentPage}`);
 
 // 6. Обновляем кнопки в карточках монет
 updateCoinCardsLanguage(t);
 
 // 7. Подвал
 updateElementText('#footerText', t.footerText);
 
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

function updateCoinCardsLanguage(t) {
 const actionButtons = document.querySelectorAll('.action-btn');
 actionButtons.forEach((btn, index) => {
 if (index % 2 === 0) {
 btn.textContent = t.tradingView;
 } else {
 btn.textContent = t.details;
 }
 });
}

// ===== ПРОСТОЙ И ЭФФЕКТИВНЫЙ ПОИСК =====
function initSimpleSearch() {
 const searchInput = document.getElementById('mainSearch');
 
 if (!searchInput) {
 console.log('Поле поиска не найдено');
 return;
 }
 
 // Поиск с задержкой
 let searchTimeout;
 searchInput.addEventListener('input', function(e) {
 clearTimeout(searchTimeout);
 searchTimeout = setTimeout(() => {
 performSearch(this.value.trim());
 }, 300);
 });
 
 // Очистка поиска при нажатии Escape
 searchInput.addEventListener('keydown', function(e) {
 if (e.key === 'Escape') {
 this.value = '';
 performSearch('');
 }
 });
}

function performSearch(query) {
 if (!allCoinsCache.length) return;
 
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
 
 if (coins.length === 0) {
 coinGrid.innerHTML = `
 <div class="search-no-results">
 <div class="no-results-icon">🔍</div>
 <h3>Ничего не найдено</h3>
 <p>Попробуйте изменить запрос "${query}"</p>
 </div>
 `;
 return;
 }
 
 const t = TRANSLATIONS[CONFIG.currentLang];
 
 coinGrid.innerHTML = coins.map(coin => {
 const change = coin.price_change_percentage_24h || 0;
 const changeClass = change >= 0 ? 'change-positive' : 'change-negative';
 const changeSymbol = change >= 0 ? '+' : '';
 
 // Подсветка текста поиска
 const highlightedName = highlightText(coin.name, query);
 const highlightedSymbol = highlightText(coin.symbol.toUpperCase(), query);
 
 return `
 <div class="coin-card" data-coin-id="${coin.id}">
 <div class="coin-header">
 <img src="${coin.image}" alt="${coin.name}" class="coin-icon" onerror="this.src='https://via.placeholder.com/40/2962ff/ffffff?text=?'">
 <div>
 <div class="coin-name">${highlightedName}</div>
 <div class="coin-symbol">${highlightedSymbol}</div>
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
}

function highlightText(text, query) {
 if (!query) return text;
 
 const regex = new RegExp(`(${query})`, 'gi');
 return text.replace(regex, '<mark class="search-highlight">$1</mark>');
}

// ===== ЗАГРУЗКА МОНЕТ =====
async function loadCoins() {
 const coinGrid = document.getElementById('coinGrid');
 if (!coinGrid) return;
 
 try {
 coinGrid.innerHTML = '<div class="coin-card loading">' + (CONFIG.currentLang === 'ru' ? 'Загрузка монет...' : 'Loading coins...') + '</div>';
 
 // Демо-данные
 const demoCoins = [
 {
 id: "bitcoin",
 name: "Bitcoin",
 symbol: "btc",
 image: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
 current_price: 58728.42,
 price_change_percentage_24h: 0.40
 },
 {
 id: "ethereum",
 name: "Ethereum", 
 symbol: "eth",
 image: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
 current_price: 2935.51,
 price_change_percentage_24h: 0.40
 },
 {
 id: "tether",
 name: "Tether",
 symbol: "usdt",
 image: "https://assets.coingecko.com/coins/images/325/small/Tether.png",
 current_price: 1.00,
 price_change_percentage_24h: 0.00
 },
 {
 id: "ripple",
 name: "XRP",
 symbol: "xrp",
 image: "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png", 
 current_price: 0.52,
 price_change_percentage_24h: 0.39
 }
 ];
 
 // Пробуем API
 try {
 const response = await fetch(
 `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${CONFIG.coinsPerPage}&page=${CONFIG.currentPage}`
 );
 
 if (response.ok) {
 const coins = await response.json();
 allCoinsCache = coins;
 renderCoins(coins);
 } else {
 throw new Error('API недоступен');
 }
 } catch (apiError) {
 console.log('Используем демо-данные');
 allCoinsCache = demoCoins;
 renderCoins(demoCoins);
 }
 
 updatePagination();
 
 } catch (error) {
 console.error('Ошибка загрузки монет:', error);
 coinGrid.innerHTML = `
 <div class="coin-card error">
 <div class="coin-name">${CONFIG.currentLang === 'ru' ? 'Ошибка загрузки' : 'Load error'}</div>
 <button onclick="loadCoins()" class="action-btn">${CONFIG.currentLang === 'ru' ? 'Повторить' : 'Retry'}</button>
 </div>
 `;
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
 }
}

// ===== ПАГИНАЦИЯ =====
function updatePagination() {
 try {
 const pageInfo = document.getElementById('pageInfo');
 const prevBtn = document.getElementById('prevPage');
 const nextBtn = document.getElementById('nextPage');
 
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

// ===== СЛАЙДЕР =====
function initSlider() {
 try {
 let currentSlide = 0;
 const track = document.getElementById('sliderTrack');
 const dots = document.querySelectorAll('.slider-dot');
 
 if (!track) return;
 
 function goToSlide(slideIndex) {
 currentSlide = slideIndex;
 track.style.transform = `translateX(-${currentSlide * 100}%)`;
 
 dots.forEach((dot, index) => {
 dot.classList.toggle('active', index === currentSlide);
 });
 }
 
 dots.forEach((dot, index) => {
 dot.addEventListener('click', () => goToSlide(index));
 });
 
 setInterval(() => {
 currentSlide = (currentSlide + 1) % dots.length;
 goToSlide(currentSlide);
 }, 5000);
 } catch (e) {
 console.log('Ошибка слайдера:', e);
 }
}

// ===== FAQ =====
function initFAQ() {
 try {
 const faqItems = document.querySelectorAll('.faq-item');
 
 faqItems.forEach(item => {
 const question = item.querySelector('.faq-question');
 
 question.addEventListener('click', () => {
 item.classList.toggle('active');
 });
 });
 } catch (e) {
 console.log('Ошибка FAQ:', e);
 }
}

// ===== СКРОЛЛ =====
function initSmoothScroll() {
 try {
 const scrollBtn = document.getElementById('promoBtn');
 
 if (scrollBtn) {
 scrollBtn.addEventListener('click', function(e) {
 e.preventDefault();
 const targetSection = document.getElementById('coinsSection');
 
 if (targetSection) {
 targetSection.scrollIntoView({
 behavior: 'smooth',
 block: 'start'
 });
 }
 });
 }
 } catch (e) {
 console.log('Ошибка скролла:', e);
 }
}

// ===== УДАЛЕНИЕ СИСТЕМНЫХ БЛОКОВ =====
function removeUcozBlocks() {
 try {
 const elementsToHide = [
 '#searchBlock',
 '#welcomeBlock',
 '#searchResults'
 ];
 
 elementsToHide.forEach(selector => {
 const elements = document.querySelectorAll(selector);
 elements.forEach(element => {
 element.style.display = 'none';
 });
 });
 } catch (e) {
 console.log('Ошибка удаления блоков:', e);
 }
}

// ===== СЧЁТЧИК ПОСЕТИТЕЛЕЙ =====
function initVisitorCounter() {
 let visitCount = localStorage.getItem('siteVisitCount');
 
 if (!visitCount) {
 visitCount = 1;
 } else {
 visitCount = parseInt(visitCount) + 1;
 }
 
 localStorage.setItem('siteVisitCount', visitCount);
 
 const counterElement = document.getElementById('visitorCounter');
 if (counterElement) {
 counterElement.innerHTML = `
 <div class="visitor-counter">
 <div class="counter-icon">👥</div>
 <div class="counter-info">
 <div class="counter-number">${visitCount.toLocaleString()}</div>
 <div class="counter-label">посетителей</div>
 </div>
 </div>
 `;
 }
 
 console.log(`🎯 Посетителей на сайте: ${visitCount}`);
}

// ===== БЕЗОПАСНАЯ ИНИЦИАЛИЗАЦИЯ =====
function safeInit() {
 console.log('🔧 Безопасная инициализация...');
 
 try {
 removeUcozBlocks();
 initTheme();
 initLanguage();
 initSimpleSearch(); // Простой поиск
 initSlider();
 initFAQ();
 initSmoothScroll();
 initVisitorCounter(); // Счётчик посетителей
 
 loadCoins();
 loadFearGreedIndex();
 
 const themeToggle = document.getElementById('themeToggle');
 if (themeToggle) {
 themeToggle.addEventListener('change', toggleTheme);
 }
 
 const langButtons = document.querySelectorAll('.lang-btn');
 langButtons.forEach(btn => {
 btn.addEventListener('click', function() {
 changeLanguage(this.dataset.lang);
 });
 });
 
 const prevBtn = document.getElementById('prevPage');
 const nextBtn = document.getElementById('nextPage');
 
 if (prevBtn) prevBtn.addEventListener('click', () => changePage('prev'));
 if (nextBtn) nextBtn.addEventListener('click', () => changePage('next'));
 
 console.log('✅ Инициализация завершена успешно! Язык:', CONFIG.currentLang);
 
 } catch (error) {
 console.error('❌ Критическая ошибка инициализации:', error);
 }
}

// ===== ЗАПУСК =====
if (document.readyState === 'loading') {
 document.addEventListener('DOMContentLoaded', safeInit);
} else {
 safeInit();
}

window.addEventListener('load', safeInit);
</script>
<!-- FOOTER КОНЕЦ -->
