import React, { useMemo } from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  positive?: boolean;
  strokeWidth?: number;
}

const Sparkline: React.FC<SparklineProps> = ({ 
  data, 
  width = 120, 
  height = 40, 
  positive,
  strokeWidth = 1.5 
}) => {
  const { path, isPositive } = useMemo(() => {
    if (!data || data.length === 0) return { path: '', isPositive: true };

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    const padding = 2;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    const points = data.map((value, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((value - min) / range) * chartHeight;
      return { x, y };
    });

    const pathString = points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ');

    const calculatedPositive = positive !== undefined ? positive : data[data.length - 1] >= data[0];
    
    return { path: pathString, isPositive: calculatedPositive };
  }, [data, width, height, positive]);

  const color = isPositive ? 'hsl(var(--gain))' : 'hsl(var(--loss))';
  const gradientId = useMemo(() => `sparkline-gradient-${Math.random().toString(36).substr(2, 9)}`, []);

  return (
    <svg 
      width={width} 
      height={height} 
      className="overflow-visible"
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      
      {/* Fill area */}
      {path && (
        <path
          d={`${path} L ${width - 2} ${height - 2} L 2 ${height - 2} Z`}
          fill={`url(#${gradientId})`}
        />
      )}
      
      {/* Line */}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Sparkline;
