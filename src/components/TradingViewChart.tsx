import React, { useEffect, useRef } from 'react';

interface TradingViewChartProps {
  symbol: string;
  theme?: 'dark' | 'light';
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({ symbol, theme = 'dark' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget
    containerRef.current.innerHTML = '';

    // Create widget container
    const widgetContainer = document.createElement('div');
    widgetContainer.id = 'tradingview_widget';
    widgetContainer.style.height = '100%';
    widgetContainer.style.width = '100%';
    containerRef.current.appendChild(widgetContainer);

    // Load TradingView script
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (typeof (window as any).TradingView !== 'undefined') {
        new (window as any).TradingView.widget({
          autosize: true,
          symbol: `BINANCE:${symbol}USDT`,
          interval: 'D',
          timezone: 'Etc/UTC',
          theme: theme,
          style: '1',
          locale: 'en',
          toolbar_bg: '#f1f3f6',
          enable_publishing: false,
          allow_symbol_change: true,
          container_id: 'tradingview_widget',
          hide_side_toolbar: false,
          studies: ['RSI@tv-basicstudies', 'MASimple@tv-basicstudies'],
          withdateranges: true,
          save_image: false,
          hide_volume: false,
        });
      }
    };

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [symbol, theme]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-[500px] rounded-xl overflow-hidden"
    />
  );
};

export default TradingViewChart;
