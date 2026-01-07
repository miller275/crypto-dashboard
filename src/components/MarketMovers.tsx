import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { mockCoins } from '@/data/mockData';
import Sparkline from './Sparkline';

const MarketMovers: React.FC = () => {
  const { t } = useLanguage();

  const gainers = [...mockCoins]
    .sort((a, b) => b.change24h - a.change24h)
    .slice(0, 3);

  const losers = [...mockCoins]
    .sort((a, b) => a.change24h - b.change24h)
    .slice(0, 3);

  const CoinCard = ({ coin, type }: { coin: typeof mockCoins[0]; type: 'gainer' | 'loser' }) => (
    <Link
      to={`/coin/${coin.id}`}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/30 transition-all group"
    >
      <img src={coin.logo} alt={coin.name} className="w-8 h-8 rounded-full" />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
          {coin.symbol}
        </div>
        <div className="text-xs text-muted-foreground truncate">{coin.name}</div>
      </div>
      <div className="w-16 h-8">
        <Sparkline 
          data={coin.sparkline} 
          width={64} 
          height={32} 
          positive={type === 'gainer'}
        />
      </div>
      <div className={`text-right ${type === 'gainer' ? 'text-gain' : 'text-loss'}`}>
        <div className="text-sm font-mono font-medium">
          {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
        </div>
      </div>
    </Link>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Gainers */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-gain" />
          <h3 className="text-sm font-medium text-muted-foreground">{t('movers.gainers')}</h3>
        </div>
        <div className="space-y-1">
          {gainers.map(coin => (
            <CoinCard key={coin.id} coin={coin} type="gainer" />
          ))}
        </div>
      </div>

      {/* Losers */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="w-4 h-4 text-loss" />
          <h3 className="text-sm font-medium text-muted-foreground">{t('movers.losers')}</h3>
        </div>
        <div className="space-y-1">
          {losers.map(coin => (
            <CoinCard key={coin.id} coin={coin} type="loser" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketMovers;
