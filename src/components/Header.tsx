import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Moon, Sun, Globe, TrendingUp, X } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { mockCoins, Coin } from '@/data/mockData';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Coin[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery.length > 0) {
      const filtered = mockCoins
        .filter(coin => 
          coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 8);
      setSearchResults(filtered);
      setIsSearchOpen(true);
    } else {
      setSearchResults([]);
      setIsSearchOpen(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCoinClick = (coinId: string) => {
    setSearchQuery('');
    setIsSearchOpen(false);
    navigate(`/coin/${coinId}`);
  };

  return (
    <header className="sticky top-0 z-50 glass-subtle">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center glow transition-transform group-hover:scale-105">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold gradient-text hidden sm:block">CryptoTrack</span>
          </Link>

          {/* Search */}
          <div ref={searchRef} className="relative flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('nav.search')}
                className="w-full pl-10 pr-10 py-2.5 bg-secondary/50 border-0 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {isSearchOpen && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 glass rounded-xl shadow-lg overflow-hidden animate-slide-up">
                {searchResults.map((coin) => (
                  <button
                    key={coin.id}
                    onClick={() => handleCoinClick(coin.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors text-left"
                  >
                    <img src={coin.logo} alt={coin.name} className="w-6 h-6 rounded-full" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground truncate">{coin.name}</div>
                      <div className="text-xs text-muted-foreground">{coin.symbol}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono text-foreground">
                        ${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className={`text-xs font-mono ${coin.change24h >= 0 ? 'text-gain' : 'text-loss'}`}>
                        {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ru' : 'en')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors text-sm font-medium"
            >
              <Globe className="w-4 h-4" />
              <span className="uppercase">{language}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
