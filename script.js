document.addEventListener("DOMContentLoaded", () => {
  const CONFIG = {
    coinsPerPage: 12,
    currentPage: 1,
    currentLang: localStorage.getItem("cryptoLang") || "ru",
    currentTheme: localStorage.getItem("cryptoTheme") || "light"
  };

  const TRANSLATIONS = {
    ru: {
      siteLogo: "CryptoDashboard",
      themeText: "Светлая",
      promoTitle: "Криптовалютный Дашборд",
      promoSubtitle: "Реальные данные. Простой интерфейс. Максимальная эффективность.",
      promoBtn: "Начать торговлю",
      coinsTitle: "Топ Криптовалют",
      searchPlaceholder: "Поиск криптовалют...",
      fearGreedTitle: "Индекс Страха и Жадности",
      footerText: "© 2024 CryptoDashboard. Все права защищены.",
      page: "Страница",
      tradingView: "TradingView",
      details: "Детали"
    },
    en: {
      siteLogo: "CryptoDashboard",
      themeText: "Light",
      promoTitle: "Cryptocurrency Dashboard",
      promoSubtitle: "Real data. Simple interface. Maximum efficiency.",
      promoBtn: "Start Trading",
      coinsTitle: "Top Cryptocurrencies",
      searchPlaceholder: "Search cryptocurrencies...",
      fearGreedTitle: "Fear & Greed Index",
      footerText: "© 2024 CryptoDashboard. All rights reserved.",
      page: "Page",
      tradingView: "TradingView",
      details: "Details"
    }
  };

  // ===== Тема =====
  function applyTheme() {
    document.body.setAttribute("data-theme", CONFIG.currentTheme);
    localStorage.setItem("cryptoTheme", CONFIG.currentTheme);
    document.getElementById("themeText").textContent = TRANSLATIONS[CONFIG.currentLang].themeText;
  }

  document.getElementById("themeToggle").addEventListener("change", e => {
    CONFIG.currentTheme = e.target.checked ? "dark" : "light";
    applyTheme();
  });

  // ===== Язык =====
  function updateTranslations() {
    const t = TRANSLATIONS[CONFIG.currentLang];
    document.getElementById("siteLogo").textContent = t.siteLogo;
    document.getElementById("themeText").textContent = t.themeText;
    document.getElementById("promoTitle").textContent = t.promoTitle;
    document.getElementById("promoSubtitle").textContent = t.promoSubtitle;
    document.getElementById("promoBtn").textContent = t.promoBtn;
    document.getElementById("coinsTitle").textContent = t.coinsTitle;
    document.getElementById("mainSearch").placeholder = t.searchPlaceholder;
    document.querySelector(".fear-greed-title").textContent = t.fearGreedTitle;
    document.getElementById("footerText").textContent = t.footerText;
    document.getElementById("pageInfo").textContent = `${t.page} ${CONFIG.currentPage}`;
  }

  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      CONFIG.currentLang = btn.dataset.lang;
      localStorage.setItem("cryptoLang", CONFIG.currentLang);
      document.querySelectorAll(".lang-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      updateTranslations();
      loadCoins();
    });
  });

  // ===== Fear & Greed =====
  function loadFearGreed() {
    fetch("https://api.alternative.me/fng/?limit=1")
      .then(r => r.json())
      .then(data => {
        const entry = data.data[0];
        const value = parseInt(entry.value);
        const classification = entry.value_classification;
        document.getElementById("fearGreedValue").textContent = value;
        document.getElementById("fearGreedText").textContent = classification;
        document.getElementById("lastUpdate").textContent = "Обновлено: " + new Date(entry.timestamp * 1000).toLocaleString();
        const bar = document.querySelector(".scale-bar");
        const indicator = document.getElementById("fearGreedIndicator");
        if (bar && indicator) indicator.style.left = (value / 100) * bar.offsetWidth + "px";
      });
  }

  // ===== Монеты =====
  function renderCoins(coins) {
    const grid = document.getElementById("coinGrid");
    const t = TRANSLATIONS[CONFIG.currentLang];
    grid.innerHTML = coins.map(coin => {
      const change = coin.price_change_percentage_24h || 0;
      const changeClass = change >= 0 ? "change-positive" : "change-negative";
      const changeSymbol = change >= 0 ? "+" : "";
      return `
        <div class="coin-card">
          <div class="coin-header">
            <img src="${coin.image}" alt="${coin.name}" class="coin-icon">
            <div>
              <div class="coin-name">${coin.name}</div>
              <div class="coin-symbol">${coin.symbol.toUpperCase()}</div>
            </div>
          </div>
          <div class="coin-price">$${coin.current_price.toLocaleString()}</div>
          <div class="coin-change ${changeClass}">${changeSymbol}${change.toFixed(2)}%</div>
          <div class="coin-actions">
            <a href="https://www.tradingview.com/symbols/${coin.symbol.toUpperCase()}USD/" target="_blank" class="action-btn">${t.tradingView}</a>
            <a href="https://www.coingecko.com/en/coins/${coin.id}" target="_blank" class="action-btn">${t.details}</a>
          </div>
        </div>`;
    }).join("");
  }

  async function loadCoins() {
    const grid = document.getElementById("coinGrid");
    grid.innerHTML = CONFIG.currentLang === "ru" ? "Загрузка..." : "Loading...";
    try {
      const res = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${CONFIG.coinsPerPage}&page=${CONFIG.currentPage}`);
      const coins = await res.json();
      renderCoins(coins);
      updatePagination(coins.length);
    } catch {
      grid.innerHTML = "Ошибка загрузки данных.";
    }
  }

  // ===== Пагинация =====
  function updatePagination(count) {
    const t = TRANSLATIONS[CONFIG.currentLang];
    document.getElementById("pageInfo").textContent = `${t.page} ${CONFIG.currentPage}`;
    document.getElementById("prevPage").classList.toggle("disabled", CONFIG.currentPage === 1);
    document.getElementById("nextPage").classList.toggle("disabled", count < CONFIG.coinsPerPage);
  }

  document.getElementById("prevPage").addEventListener("click", () => {
    if (CONFIG.currentPage > 1) {
      CONFIG.currentPage--;
      loadCoins();
    }
  });
  document.getElementById("nextPage").addEventListener("click", () => {
    CONFIG.currentPage++;
    loadCoins();
  });

  // ===== Поиск =====
  document.getElementById("mainSearch").addEventListener("input", e => {
    const query = e.target.value.toLowerCase();
    document.querySelectorAll(".coin-card").forEach(card => {
      const name = card.querySelector(".coin-name").textContent.toLowerCase();
      const symbol = card.querySelector(".coin-symbol").textContent.toLowerCase();
      card.style.display = name.includes(query) || symbol.includes(query) ? "" : "none";
    });
  });

  // ===== Запуск =====
  applyTheme();
  updateTranslations();
  loadCoins();
  loadFearGreed();
});
