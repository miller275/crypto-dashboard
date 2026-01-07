import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { mockFearGreed } from '@/data/mockData';

const FearGreedWidget: React.FC = () => {
  const { t } = useLanguage();
  const { value, classification } = mockFearGreed;

  const getColor = (val: number) => {
    if (val <= 25) return 'hsl(var(--loss))';
    if (val <= 45) return 'hsl(var(--warning))';
    if (val <= 55) return 'hsl(var(--muted-foreground))';
    if (val <= 75) return 'hsl(142 76% 45%)';
    return 'hsl(var(--gain))';
  };

  const getLabel = (val: number) => {
    if (val <= 25) return t('fear.extreme_fear');
    if (val <= 45) return t('fear.fear');
    if (val <= 55) return t('fear.neutral');
    if (val <= 75) return t('fear.greed');
    return t('fear.extreme_greed');
  };

  const color = getColor(value);
  const label = getLabel(value);
  const rotation = (value / 100) * 180 - 90;

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">{t('fear.title')}</h3>
      
      <div className="relative w-40 h-20 overflow-hidden">
        {/* Background arc */}
        <svg viewBox="0 0 100 50" className="w-full h-full">
          <defs>
            <linearGradient id="fear-greed-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--loss))" />
              <stop offset="25%" stopColor="hsl(var(--warning))" />
              <stop offset="50%" stopColor="hsl(var(--muted-foreground))" />
              <stop offset="75%" stopColor="hsl(142 76% 45%)" />
              <stop offset="100%" stopColor="hsl(var(--gain))" />
            </linearGradient>
          </defs>
          
          {/* Background arc */}
          <path
            d="M 5 50 A 45 45 0 0 1 95 50"
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth="8"
            strokeLinecap="round"
          />
          
          {/* Colored arc */}
          <path
            d="M 5 50 A 45 45 0 0 1 95 50"
            fill="none"
            stroke="url(#fear-greed-gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            opacity="0.9"
          />
          
          {/* Needle */}
          <g transform={`rotate(${rotation}, 50, 50)`}>
            <line
              x1="50"
              y1="50"
              x2="50"
              y2="12"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="50" cy="50" r="4" fill={color} />
          </g>
        </svg>
      </div>
      
      {/* Value and label */}
      <div className="text-center mt-2">
        <div className="text-3xl font-bold font-mono" style={{ color }}>
          {value}
        </div>
        <div className="text-sm font-medium" style={{ color }}>
          {label}
        </div>
      </div>
    </div>
  );
};

export default FearGreedWidget;
