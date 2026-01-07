import React from 'react';
import { TrendingUp, TrendingDown, Activity, Coins } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getMarketStats } from '@/data/mockData';

const MarketStats: React.FC = () => {
  const { t } = useLanguage();
  const stats = getMarketStats();

  const formatNumber = (num: number, compact = false) => {
    if (compact) {
      if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
      if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
      if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    }
    return `$${num.toLocaleString()}`;
  };

  const statItems = [
    {
      icon: Activity,
      label: t('market.cap'),
      value: formatNumber(stats.totalMarketCap, true),
      change: stats.marketCapChange24h,
    },
    {
      icon: TrendingUp,
      label: t('market.volume'),
      value: formatNumber(stats.total24hVolume, true),
      change: null,
    },
    {
      icon: Coins,
      label: t('market.dominance'),
      value: `${stats.btcDominance}%`,
      change: null,
    },
    {
      icon: Activity,
      label: t('market.coins'),
      value: stats.totalCoins.toLocaleString(),
      change: null,
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
      {statItems.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <item.icon className="w-4 h-4 text-primary/70" />
          <span className="text-muted-foreground">{item.label}:</span>
          <span className="font-mono font-medium text-foreground">{item.value}</span>
          {item.change !== null && (
            <span className={`font-mono text-xs ${item.change >= 0 ? 'text-gain' : 'text-loss'}`}>
              {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default MarketStats;
