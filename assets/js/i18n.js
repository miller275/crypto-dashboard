import { Store } from "./store.js";

const dict = {
  ru: {
    nav_market: "Рынок",
    nav_trends: "Тренды",
    nav_fng: "Страх и жадность",
    nav_news: "Новости",
    title_market: "Монеты (по капитализации)",
    search_placeholder: "Поиск монет…",
    sort_mcap_desc: "Капитализация (убыв.)",
    sort_mcap_asc: "Капитализация (возр.)",
    sort_name: "Имя (A→Z)",
    per_page: "На странице",
    watchlist: "Избранное",
    refresh: "Обновить",
    rank: "#",
    coin: "Монета",
    price: "Цена",
    chg1h: "1ч %",
    chg24h: "24ч %",
    chg7d: "7д %",
    vol24h: "Объём 24ч",
    mcap: "Капитализация",
    spark7d: "7 дней",
    actions: "Действия",
    details: "Детали",
    close: "Закрыть",
    open: "Открыть",
    updated: "Обновлено",
    no_data: "Данные не загружены",
    modal_title: "Быстрый просмотр",
    coin_page: "Страница монеты",
    back: "Назад",
    chart: "График",
    period_24h: "24ч",
    period_7d: "7д",
    period_30d: "30д",
    period_90d: "90д",
    period_1y: "1г",
    stats: "Статистика",
    market_cap: "Капитализация",
    volume_24h: "Объём 24ч",
    supply: "В обращении",
    total_supply: "Всего",
    max_supply: "Макс.",
    not_enough_history: "Недостаточно истории — график появится после накопления данных GitHub Actions.",
  },
  en: {
    nav_market: "Market",
    nav_trends: "Trends",
    nav_fng: "Fear & Greed",
    nav_news: "News",
    title_market: "Coins (by market cap)",
    search_placeholder: "Search coins…",
    sort_mcap_desc: "Market cap (desc.)",
    sort_mcap_asc: "Market cap (asc.)",
    sort_name: "Name (A→Z)",
    per_page: "Per page",
    watchlist: "Watchlist",
    refresh: "Refresh",
    rank: "#",
    coin: "Coin",
    price: "Price",
    chg1h: "1h %",
    chg24h: "24h %",
    chg7d: "7d %",
    vol24h: "Volume 24h",
    mcap: "Market cap",
    spark7d: "7 days",
    actions: "Actions",
    details: "Details",
    close: "Close",
    open: "Open",
    updated: "Updated",
    no_data: "No data loaded",
    modal_title: "Quick view",
    coin_page: "Coin page",
    back: "Back",
    chart: "Chart",
    period_24h: "24h",
    period_7d: "7d",
    period_30d: "30d",
    period_90d: "90d",
    period_1y: "1y",
    stats: "Stats",
    market_cap: "Market cap",
    volume_24h: "Volume 24h",
    supply: "Circulating",
    total_supply: "Total",
    max_supply: "Max",
    not_enough_history: "Not enough history yet — chart will appear after GitHub Actions accumulates data.",
  }
};

export function t(key){
  const { lang } = Store.get();
  return (dict[lang] && dict[lang][key]) || dict.en[key] || key;
}

export function applyI18n(root=document){
  root.querySelectorAll("[data-i18n]").forEach(el=>{
    const k = el.getAttribute("data-i18n");
    el.textContent = t(k);
  });
  root.querySelectorAll("[data-i18n-placeholder]").forEach(el=>{
    const k = el.getAttribute("data-i18n-placeholder");
    el.setAttribute("placeholder", t(k));
  });
}
