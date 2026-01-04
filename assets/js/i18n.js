import { Utils } from "./utils.js";

const KEY = "cw_lang";

const DICT = {
  en: {
    tagline: "Market dashboard",
    theme: "Theme",
    refresh: "Refresh",
    heroTitle: "Today's Cryptocurrency Prices",
    marketOverview: "Market overview",
    marketOverviewHint: "Global metrics + dominance",
    globalMcap: "Global market cap",
    globalVol: "24h volume",
    dominance: "BTC / ETH dominance",
    fearGreed: "Fear & Greed Index",
    trending: "Trending",
    trendingHint: "Top movers (24h)",
    news: "News",
    newsHint: "Latest headlines",
    coinsByMcap: "Coins by market cap",
    thCoin: "Coin",
    thPrice: "Price",
    th1h: "1h",
    th24h: "24h",
    th7d: "7d",
    thMcap: "Market cap",
    thVol: "Volume (24h)",
    thSupply: "Circulating supply",
    thSpark: "Last 7 days",
    prev: "Prev",
    next: "Next",
    perPage: "Per page",
    dataNotice: "Data from public APIs or your /data snapshots.",
    home: "Home",
    back: "Back",
    chart: "Chart",
    chartHint: "Line or candlesticks • zoom & pan",
    range1d: "24h",
    range7d: "7d",
    range30d: "30d",
    range1y: "1y",
    rangeMax: "Max",
    line: "Line",
    candles: "Candles",
    resetZoom: "Reset zoom",
    stats: "Stats",
    statsHint: "Key metrics",
    marketCap: "Market cap",
    volume24h: "Volume (24h)",
    supply: "Supply",
    athAtl: "ATH / ATL",
    about: "About",
  },
  ru: {
    tagline: "Крипто-дашборд",
    theme: "Тема",
    refresh: "Обновить",
    heroTitle: "Цены криптовалют сегодня",
    marketOverview: "Обзор рынка",
    marketOverviewHint: "Глобальные метрики + доминация",
    globalMcap: "Капитализация рынка",
    globalVol: "Объём за 24ч",
    dominance: "Доминация BTC / ETH",
    fearGreed: "Индекс страха и жадности",
    trending: "В тренде",
    trendingHint: "Лидеры движения (24ч)",
    news: "Новости",
    newsHint: "Свежие заголовки",
    coinsByMcap: "Монеты по капитализации",
    thCoin: "Монета",
    thPrice: "Цена",
    th1h: "1ч",
    th24h: "24ч",
    th7d: "7д",
    thMcap: "Капитализация",
    thVol: "Объём (24ч)",
    thSupply: "В обращении",
    thSpark: "Последние 7 дней",
    prev: "Назад",
    next: "Вперёд",
    perPage: "На странице",
    dataNotice: "Данные из публичных API или ваших /data снапшотов.",
    home: "Главная",
    back: "Назад",
    chart: "График",
    chartHint: "Линия или свечи • зум и перемещение",
    range1d: "24ч",
    range7d: "7д",
    range30d: "30д",
    range1y: "1г",
    rangeMax: "Макс",
    line: "Линия",
    candles: "Свечи",
    resetZoom: "Сброс зума",
    stats: "Статистика",
    statsHint: "Ключевые метрики",
    marketCap: "Капитализация",
    volume24h: "Объём (24ч)",
    supply: "Предложение",
    athAtl: "ATH / ATL",
    about: "Описание",
  }
};

export const I18N = {
  get(){
    const stored = localStorage.getItem(KEY);
    return stored && DICT[stored] ? stored : "en";
  },
  set(lang){
    if (!DICT[lang]) lang = "en";
    localStorage.setItem(KEY, lang);
    document.documentElement.lang = lang;
    I18N.apply();
  },
  t(key){
    const lang = I18N.get();
    return (DICT[lang] && DICT[lang][key]) || (DICT.en[key] ?? key);
  },
  apply(){
    const lang = I18N.get();
    Utils.qsa("[data-i18n]").forEach(el => {
      const k = el.getAttribute("data-i18n");
      const v = (DICT[lang] && DICT[lang][k]) || (DICT.en[k] ?? k);
      el.textContent = v;
    });

    const search = Utils.qs("#searchInput");
    if (search){
      search.placeholder = lang === "ru" ? "Поиск монет…" : "Search coins…";
    }
  }
};
