import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { mockCoins, Coin } from '@/data/mockData';
import Sparkline from './Sparkline';

const ITEMS_PER_PAGE = 20;

const CoinTable: React.FC = () => {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<keyof Coin>('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const sortedCoins = useMemo(() => {
    return [...mockCoins].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return 0;
    });
  }, [sortBy, sortOrder]);

  const displayedCoins = sortedCoins.slice(0, currentPage * ITEMS_PER_PAGE);
  const hasMore = displayedCoins.length < mockCoins.length;

  const handleSort = (column: keyof Coin) => {
    if (sortBy === column) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const loadMore = async () => {
    setIsLoading(true);
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 500));
    setCurrentPage(prev => prev + 1);
    setIsLoading(false);
  };

  const formatNumber = (num: number, compact = false) => {
    if (compact) {
      if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
      if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
      if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
      if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    }
    return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPrice = (price: number) => {
    if (price >= 1) {
      return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${price.toFixed(6)}`;
  };

  const SortIcon = ({ column }: { column: keyof Coin }) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-3 h-3" />
    ) : (
      <ChevronDown className="w-3 h-3" />
    );
  };

  const HeaderCell = ({ 
    column, 
    label, 
    className = '' 
  }: { 
    column: keyof Coin; 
    label: string; 
    className?: string;
  }) => (
    <th
      className={`px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors ${className}`}
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center gap-1">
        {label}
        <SortIcon column={column} />
      </div>
    </th>
  );

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              <HeaderCell column="rank" label={t('table.rank')} className="w-12" />
              <HeaderCell column="name" label={t('table.name')} className="min-w-[180px]" />
              <HeaderCell column="price" label={t('table.price')} />
              <HeaderCell column="change1h" label={t('table.change_1h')} className="hidden md:table-cell" />
              <HeaderCell column="change24h" label={t('table.change_24h')} />
              <HeaderCell column="change7d" label={t('table.change_7d')} className="hidden lg:table-cell" />
              <HeaderCell column="marketCap" label={t('table.market_cap')} className="hidden sm:table-cell" />
              <HeaderCell column="volume24h" label={t('table.volume')} className="hidden xl:table-cell" />
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                {t('table.chart')}
              </th>
            </tr>
          </thead>
          <tbody>
            {displayedCoins.map((coin, index) => (
              <tr
                key={coin.id}
                className="coin-row border-b border-border/30 animate-fade-in"
                style={{ animationDelay: `${(index % ITEMS_PER_PAGE) * 20}ms` }}
              >
                <td className="px-4 py-4 text-sm font-mono text-muted-foreground">
                  {coin.rank}
                </td>
                <td className="px-4 py-4">
                  <Link
                    to={`/coin/${coin.id}`}
                    className="flex items-center gap-3 group"
                  >
                    <img
                      src={coin.logo}
                      alt={coin.name}
                      className="w-8 h-8 rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/32';
                      }}
                    />
                    <div>
                      <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {coin.name}
                      </div>
                      <div className="text-xs text-muted-foreground">{coin.symbol}</div>
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-4 font-mono text-sm text-foreground">
                  {formatPrice(coin.price)}
                </td>
                <td className="px-4 py-4 hidden md:table-cell">
                  <span className={`font-mono text-sm ${coin.change1h >= 0 ? 'text-gain' : 'text-loss'}`}>
                    {coin.change1h >= 0 ? '+' : ''}{coin.change1h.toFixed(2)}%
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className={`font-mono text-sm ${coin.change24h >= 0 ? 'text-gain' : 'text-loss'}`}>
                    {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                  </span>
                </td>
                <td className="px-4 py-4 hidden lg:table-cell">
                  <span className={`font-mono text-sm ${coin.change7d >= 0 ? 'text-gain' : 'text-loss'}`}>
                    {coin.change7d >= 0 ? '+' : ''}{coin.change7d.toFixed(2)}%
                  </span>
                </td>
                <td className="px-4 py-4 font-mono text-sm text-foreground hidden sm:table-cell">
                  {formatNumber(coin.marketCap, true)}
                </td>
                <td className="px-4 py-4 font-mono text-sm text-muted-foreground hidden xl:table-cell">
                  {formatNumber(coin.volume24h, true)}
                </td>
                <td className="px-4 py-4 hidden lg:table-cell">
                  <Sparkline
                    data={coin.sparkline}
                    width={120}
                    height={40}
                    positive={coin.change7d >= 0}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-secondary hover:bg-secondary/80 text-foreground rounded-xl font-medium transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : (
              t('action.load_more')
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default CoinTable;
