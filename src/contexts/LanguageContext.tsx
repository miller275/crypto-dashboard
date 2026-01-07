import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type Language = 'en' | 'ru';

interface Translations {
  [key: string]: {
    en: string;
    ru: string;
  };
}

const translations: Translations = {
  // Navigation
  'nav.home': { en: 'Home', ru: 'Главная' },
  'nav.coins': { en: 'Coins', ru: 'Монеты' },
  'nav.search': { en: 'Search coins...', ru: 'Поиск монет...' },
  
  // Market
  'market.cap': { en: 'Market Cap', ru: 'Капитализация' },
  'market.volume': { en: '24h Volume', ru: 'Объём 24ч' },
  'market.dominance': { en: 'BTC Dominance', ru: 'Доминация BTC' },
  'market.coins': { en: 'Coins', ru: 'Монеты' },
  
  // Fear & Greed
  'fear.title': { en: 'Fear & Greed Index', ru: 'Индекс страха и жадности' },
  'fear.extreme_fear': { en: 'Extreme Fear', ru: 'Крайний страх' },
  'fear.fear': { en: 'Fear', ru: 'Страх' },
  'fear.neutral': { en: 'Neutral', ru: 'Нейтрально' },
  'fear.greed': { en: 'Greed', ru: 'Жадность' },
  'fear.extreme_greed': { en: 'Extreme Greed', ru: 'Крайняя жадность' },
  
  // Movers
  'movers.title': { en: 'Market Movers', ru: 'Лидеры движения' },
  'movers.gainers': { en: 'Top Gainers', ru: 'Лидеры роста' },
  'movers.losers': { en: 'Top Losers', ru: 'Лидеры падения' },
  
  // Table
  'table.rank': { en: '#', ru: '#' },
  'table.name': { en: 'Name', ru: 'Название' },
  'table.price': { en: 'Price', ru: 'Цена' },
  'table.change_1h': { en: '1h %', ru: '1ч %' },
  'table.change_24h': { en: '24h %', ru: '24ч %' },
  'table.change_7d': { en: '7d %', ru: '7д %' },
  'table.market_cap': { en: 'Market Cap', ru: 'Капитализация' },
  'table.volume': { en: 'Volume (24h)', ru: 'Объём (24ч)' },
  'table.chart': { en: 'Last 7 Days', ru: 'Последние 7 дней' },
  
  // Coin Page
  'coin.overview': { en: 'Overview', ru: 'Обзор' },
  'coin.chart': { en: 'Chart', ru: 'График' },
  'coin.statistics': { en: 'Statistics', ru: 'Статистика' },
  'coin.supply': { en: 'Supply', ru: 'Эмиссия' },
  'coin.circulating': { en: 'Circulating Supply', ru: 'В обращении' },
  'coin.total': { en: 'Total Supply', ru: 'Общая эмиссия' },
  'coin.max': { en: 'Max Supply', ru: 'Макс. эмиссия' },
  'coin.ath': { en: 'All-Time High', ru: 'Исторический макс.' },
  'coin.atl': { en: 'All-Time Low', ru: 'Исторический мин.' },
  'coin.rank': { en: 'Rank', ru: 'Ранг' },
  
  // News
  'news.title': { en: 'Latest News', ru: 'Последние новости' },
  'news.more': { en: 'Read more', ru: 'Читать далее' },
  
  // Actions
  'action.load_more': { en: 'Load More', ru: 'Загрузить ещё' },
  'action.back': { en: 'Back', ru: 'Назад' },
  
  // Theme
  'theme.light': { en: 'Light', ru: 'Светлая' },
  'theme.dark': { en: 'Dark', ru: 'Тёмная' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  const handleSetLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  }, []);

  const t = useCallback((key: string): string => {
    const translation = translations[key];
    if (!translation) return key;
    return translation[language] || translation.en || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
