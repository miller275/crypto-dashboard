/* CryptoWatch — language.js (simple i18n) */
(function () {
  const NS = (window.CryptoWatch = window.CryptoWatch || {});
  const KEY = "cw_lang";

  const dict = {
    en: {
      "doc-title": "CryptoWatch — Crypto Market Dashboard",
      "coin-doc-title": "Coin — CryptoWatch",

      "loading-title": "Loading market data…",
      "loading-sub": "Fetching prices, trending coins and charts",
      "tagline": "Live crypto prices • Watchlist • Charts",

      "nav-market": "Market",
      "nav-chart": "Chart",
      "nav-trending": "Trending",
      "nav-fear-greed": "Fear & Greed",
      "nav-news": "News",

      "cta-market": "Open market",

      "overview-pill": "Market snapshot",
      "overview-title": "Today’s crypto market",
      "overview-sub": "Fast overview: total market cap, volume and BTC dominance",
      "updated-just-now": "just now",

      "stat-marketcap": "Total Market Cap",
      "stat-change-24h": "24h change",
      "stat-volume": "24h Volume",
      "stat-active": "Active cryptocurrencies",
      "stat-btc-dom": "BTC Dominance",
      "stat-markets": "Markets",
      "stat-top-gainers": "Top 24h gainer",
      "stat-top-losers": "Top 24h loser",

      "market-title": "Coins (by Market Cap)",
      "market-count": "coins",
      "search-placeholder": "Search coins…",

      "sort-mcap-desc": "Market cap (high → low)",
      "sort-mcap-asc": "Market cap (low → high)",
      "sort-price-desc": "Price (high → low)",
      "sort-price-asc": "Price (low → high)",
      "sort-change-desc": "24h change (high → low)",
      "sort-change-asc": "24h change (low → high)",
      "sort-vol-desc": "Volume (high → low)",

      "watchlist-only": "Watchlist",
      "refresh": "Refresh",

      "table-coin": "Coin",
      "table-price": "Price",
      "table-1h-change": "1h %",
      "table-24h-change": "24h %",
      "table-7d-change": "7d %",
      "table-24h-volume": "Vol 24h",
      "table-market-cap": "Market Cap",
      "table-last-7-days": "Last 7d",
      "table-action": "Action",

      "chart-title": "BTC/USDT Chart",
      "chart-pill": "TradingView (toolbar hidden)",
      "chart-note": "Tip: click a coin in the table to open a detailed page.",

      "trending-title": "Trending",
      "trending-pill": "Top searches",

      "fng-title": "Fear & Greed Index",
      "fng-pill": "Sentiment",
      "fng-now": "Current",
      "fng-updated": "Updated",
      "fng-scale": "Scale",
      "fng-fear": "Fear",
      "fng-neutral": "Neutral",
      "fng-greed": "Greed",

      "news-title": "News",
      "news-pill": "Sample feed (mock)",

      "footer-note": "Educational dashboard. Data from public APIs.",

      "back-to-market": "Back",
      "coin-price": "Price",
      "coin-mcap": "Market Cap",
      "coin-mcap-note": "Current valuation",
      "coin-vol": "24h Volume",
      "coin-vol-note": "Trading activity",
      "coin-supply": "Circulating Supply",
      "coin-ath": "All-Time High",
      "coin-chart": "Price (7 days)",
      "coin-chart-pill": "Chart.js",
      "coin-about": "About",
      "coin-website": "Website",
      "coin-explorer": "Explorer",
      "coin-watch": "Watchlist",

      "fng-extreme-fear": "Extreme Fear",
      "fng-fear-label": "Fear",
      "fng-neutral-label": "Neutral",
      "fng-greed-label": "Greed",
      "fng-extreme-greed": "Extreme Greed",

      "toast-added": "Added to watchlist",
      "toast-removed": "Removed from watchlist",
      "toast-copied": "Copied",
      "error-api": "Could not load data. Try Refresh."
    },

    ru: {
      "doc-title": "CryptoWatch — Крипто Дашборд",
      "coin-doc-title": "Монета — CryptoWatch",

      "loading-title": "Загрузка данных рынка…",
      "loading-sub": "Получаем цены, тренды и графики",
      "tagline": "Цены • Список • Графики",

      "nav-market": "Рынок",
      "nav-chart": "График",
      "nav-trending": "Тренды",
      "nav-fear-greed": "Страх и жадность",
      "nav-news": "Новости",

      "cta-market": "Открыть рынок",

      "overview-pill": "Сводка рынка",
      "overview-title": "Крипторынок сегодня",
      "overview-sub": "Быстро: капитализация, объём и доминация BTC",
      "updated-just-now": "только что",

      "stat-marketcap": "Общая капитализация",
      "stat-change-24h": "изменение за 24ч",
      "stat-volume": "Объём за 24ч",
      "stat-active": "Активных криптовалют",
      "stat-btc-dom": "Доминация BTC",
      "stat-markets": "Рынков",
      "stat-top-gainers": "Лидер роста 24ч",
      "stat-top-losers": "Лидер падения 24ч",

      "market-title": "Монеты (по капитализации)",
      "market-count": "монет",
      "search-placeholder": "Поиск монет…",

      "sort-mcap-desc": "Капитализация (убыв.)",
      "sort-mcap-asc": "Капитализация (возр.)",
      "sort-price-desc": "Цена (убыв.)",
      "sort-price-asc": "Цена (возр.)",
      "sort-change-desc": "Изм. 24ч (убыв.)",
      "sort-change-asc": "Изм. 24ч (возр.)",
      "sort-vol-desc": "Объём (убыв.)",

      "watchlist-only": "Избранное",
      "refresh": "Обновить",

      "table-coin": "Монета",
      "table-price": "Цена",
      "table-1h-change": "1ч %",
      "table-24h-change": "24ч %",
      "table-7d-change": "7д %",
      "table-24h-volume": "Объём 24ч",
      "table-market-cap": "Капитализация",
      "table-last-7-days": "7 дней",
      "table-action": "Действия",

      "chart-title": "График BTC/USDT",
      "chart-pill": "TradingView (панель скрыта)",
      "chart-note": "Подсказка: кликни монету в таблице — откроется страница деталей.",

      "trending-title": "Тренды",
      "trending-pill": "Популярные запросы",

      "fng-title": "Индекс страха и жадности",
      "fng-pill": "Настроение",
      "fng-now": "Сейчас",
      "fng-updated": "Обновлено",
      "fng-scale": "Шкала",
      "fng-fear": "Страх",
      "fng-neutral": "Нейтрально",
      "fng-greed": "Жадность",

      "news-title": "Новости",
      "news-pill": "Пример ленты (mock)",

      "footer-note": "Учебный дашборд. Данные из публичных API.",

      "back-to-market": "Назад",
      "coin-price": "Цена",
      "coin-mcap": "Капитализация",
      "coin-mcap-note": "Текущая оценка",
      "coin-vol": "Объём 24ч",
      "coin-vol-note": "Активность торгов",
      "coin-supply": "В обращении",
      "coin-ath": "Исторический максимум",
      "coin-chart": "Цена (7 дней)",
      "coin-chart-pill": "Chart.js",
      "coin-about": "Описание",
      "coin-website": "Сайт",
      "coin-explorer": "Эксплорер",
      "coin-watch": "Избранное",

      "fng-extreme-fear": "Экстр. страх",
      "fng-fear-label": "Страх",
      "fng-neutral-label": "Нейтрально",
      "fng-greed-label": "Жадность",
      "fng-extreme-greed": "Экстр. жадность",

      "toast-added": "Добавлено в избранное",
      "toast-removed": "Удалено из избранного",
      "toast-copied": "Скопировано",
      "error-api": "Не удалось загрузить данные. Нажми «Обновить»."
    }
  };

  function get() {
    const saved = localStorage.getItem(KEY);
    if (saved && dict[saved]) return saved;
    return "en";
  }

  function locale(lang) {
    return lang === "ru" ? "ru-RU" : "en-US";
  }

  function t(key) {
    const lang = (NS.state && NS.state.lang) || get();
    return (dict[lang] && dict[lang][key]) || (dict.en && dict.en[key]) || key;
  }

  function apply(lang) {
    NS.state = NS.state || {};
    NS.state.lang = lang;

    document.documentElement.lang = lang;
    document.title = location.pathname.endsWith("coin.html") ? t("coin-doc-title") : t("doc-title");

    // plain text
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const k = el.getAttribute("data-i18n");
      if (!k) return;
      el.textContent = t(k);
    });

    // placeholders
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
      const k = el.getAttribute("data-i18n-placeholder");
      if (!k) return;
      el.setAttribute("placeholder", t(k));
    });

    const sel = document.getElementById("lang-select");
    if (sel && sel.value !== lang) sel.value = lang;

    if (NS.bus) NS.bus.emit("langchange", lang);
  }

  function set(lang) {
    if (!dict[lang]) lang = "en";
    try { localStorage.setItem(KEY, lang); } catch {}
    apply(lang);
  }

  function init() {
    const lang = get();
    apply(lang);

    const sel = document.getElementById("lang-select");
    if (sel) {
      sel.value = lang;
      sel.addEventListener("change", () => set(sel.value));
    }
  }

  NS.lang = { init, set, get, t, locale };
})();
