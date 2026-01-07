import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Globe, Twitter, MessageCircle, Star, TrendingUp, TrendingDown } from 'lucide-react';
import Header from '@/components/Header';
import TradingViewChart from '@/components/TradingViewChart';
import Sparkline from '@/components/Sparkline';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { mockCoins } from '@/data/mockData';

const CoinPage: React.FC = () => {
  const { coinId } = useParams<{ coinId: string }>();
  const { t } = useLanguage();
  const { theme } = useTheme();

  const coin = mockCoins.find(c => c.id === coinId);

  if (!coin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Coin not found</h1>
          <Link to="/" className="text-primary hover:underline">
            {t('action.back')}
          </Link>
        </div>
      </div>
    );
  }

  const formatNumber = (num: number | null, compact = false) => {
    if (num === null) return '∞';
    if (compact) {
      if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
      if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
      if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
      if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    }
    return num.toLocaleString();
  };

  const formatPrice = (price: number) => {
    if (price >= 1) {
      return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${price.toFixed(8)}`;
  };

  const StatCard = ({ label, value, subValue, className = '' }: { label: string; value: string; subValue?: string; className?: string }) => (
    <div className={`p-4 rounded-xl bg-secondary/30 ${className}`}>
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="font-mono font-semibold text-foreground">{value}</div>
      {subValue && (
        <div className="text-xs text-muted-foreground mt-1">{subValue}</div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('action.back')}
        </Link>

        {/* Coin Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8 animate-fade-in">
          <div className="flex items-center gap-4">
            <img
              src={coin.logo}
              alt={coin.name}
              className="w-16 h-16 rounded-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64';
              }}
            />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-foreground">{coin.name}</h1>
                <span className="px-2 py-1 rounded-lg bg-secondary text-sm text-muted-foreground">
                  {coin.symbol}
                </span>
                <span className="px-2 py-1 rounded-lg bg-primary/20 text-primary text-sm font-medium">
                  #{coin.rank}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Globe className="w-4 h-4" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-4xl font-bold font-mono text-foreground">
              {formatPrice(coin.price)}
            </div>
            <div className="flex items-center justify-end gap-2 mt-2">
              <div className={`flex items-center gap-1 px-3 py-1 rounded-lg ${coin.change24h >= 0 ? 'bg-gain/20 text-gain' : 'bg-loss/20 text-loss'}`}>
                {coin.change24h >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="font-mono font-medium">
                  {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                </span>
              </div>
              <span className="text-sm text-muted-foreground">24h</span>
            </div>
          </div>
        </div>

        {/* Price Changes */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-secondary/30 text-center">
            <div className="text-xs text-muted-foreground mb-1">{t('table.change_1h')}</div>
            <div className={`font-mono font-semibold ${coin.change1h >= 0 ? 'text-gain' : 'text-loss'}`}>
              {coin.change1h >= 0 ? '+' : ''}{coin.change1h.toFixed(2)}%
            </div>
          </div>
          <div className="p-4 rounded-xl bg-secondary/30 text-center">
            <div className="text-xs text-muted-foreground mb-1">{t('table.change_24h')}</div>
            <div className={`font-mono font-semibold ${coin.change24h >= 0 ? 'text-gain' : 'text-loss'}`}>
              {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
            </div>
          </div>
          <div className="p-4 rounded-xl bg-secondary/30 text-center">
            <div className="text-xs text-muted-foreground mb-1">{t('table.change_7d')}</div>
            <div className={`font-mono font-semibold ${coin.change7d >= 0 ? 'text-gain' : 'text-loss'}`}>
              {coin.change7d >= 0 ? '+' : ''}{coin.change7d.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* TradingView Chart */}
        <div className="mb-8 animate-slide-up">
          <h2 className="text-lg font-semibold text-foreground mb-4">{t('coin.chart')}</h2>
          <TradingViewChart symbol={coin.symbol} theme={theme} />
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <StatCard
            label={t('table.market_cap')}
            value={formatNumber(coin.marketCap, true)}
            subValue={`${t('coin.rank')} #${coin.rank}`}
          />
          <StatCard
            label={t('table.volume')}
            value={formatNumber(coin.volume24h, true)}
          />
          <StatCard
            label={t('coin.circulating')}
            value={formatNumber(coin.circulatingSupply)}
            subValue={coin.symbol}
          />
          <StatCard
            label={t('coin.max')}
            value={coin.maxSupply ? formatNumber(coin.maxSupply) : '∞'}
            subValue={coin.symbol}
          />
        </div>

        {/* Supply Info */}
        <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <h2 className="text-lg font-semibold text-foreground mb-4">{t('coin.supply')}</h2>
          <div className="p-6 rounded-xl bg-secondary/30">
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground">{t('coin.circulating')}</span>
              <span className="font-mono text-foreground">{formatNumber(coin.circulatingSupply)} {coin.symbol}</span>
            </div>
            {coin.totalSupply && (
              <div className="flex items-center justify-between mb-4">
                <span className="text-muted-foreground">{t('coin.total')}</span>
                <span className="font-mono text-foreground">{formatNumber(coin.totalSupply)} {coin.symbol}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t('coin.max')}</span>
              <span className="font-mono text-foreground">
                {coin.maxSupply ? `${formatNumber(coin.maxSupply)} ${coin.symbol}` : '∞'}
              </span>
            </div>

            {/* Supply Progress Bar */}
            {coin.maxSupply && (
              <div className="mt-6">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span>Circulating / Max Supply</span>
                  <span>{((coin.circulatingSupply / coin.maxSupply) * 100).toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all"
                    style={{ width: `${(coin.circulatingSupply / coin.maxSupply) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2025 CryptoTrack. Data provided by CoinMarketCap.</p>
          <p>Chart powered by TradingView</p>
        </div>
      </footer>
    </div>
  );
};

export default CoinPage;
