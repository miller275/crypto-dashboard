import React from 'react';
import Header from '@/components/Header';
import MarketStats from '@/components/MarketStats';
import FearGreedWidget from '@/components/FearGreedWidget';
import MarketMovers from '@/components/MarketMovers';
import CoinTable from '@/components/CoinTable';
import NewsTicker from '@/components/NewsTicker';
import { useLanguage } from '@/contexts/LanguageContext';

const Index: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Market Stats Bar */}
        <div className="mb-8 animate-fade-in">
          <MarketStats />
        </div>

        {/* Top Section: Fear & Greed + Movers + News */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Fear & Greed Widget */}
          <div className="lg:col-span-3 flex justify-center lg:justify-start animate-slide-up" style={{ animationDelay: '100ms' }}>
            <FearGreedWidget />
          </div>

          {/* Market Movers */}
          <div className="lg:col-span-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <MarketMovers />
          </div>

          {/* News Ticker */}
          <div className="lg:col-span-3 animate-slide-up" style={{ animationDelay: '300ms' }}>
            <NewsTicker />
          </div>
        </div>

        {/* Coin Table */}
        <div className="animate-slide-up" style={{ animationDelay: '400ms' }}>
          <CoinTable />
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2025 CryptoTrack. Data provided by CoinMarketCap.</p>
          <p>Updated every hour via GitHub Actions</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
