// Mock data for development - in production, this will be replaced by /data/*.json files

export interface Coin {
  id: string;
  rank: number;
  name: string;
  symbol: string;
  logo: string;
  price: number;
  change1h: number;
  change24h: number;
  change7d: number;
  marketCap: number;
  volume24h: number;
  circulatingSupply: number;
  totalSupply: number | null;
  maxSupply: number | null;
  sparkline: number[];
}

export interface FearGreedData {
  value: number;
  classification: string;
  timestamp: string;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
}

// Generate sparkline data
const generateSparkline = (trend: 'up' | 'down' | 'neutral', volatility: number = 0.05): number[] => {
  const points = 24;
  const data: number[] = [];
  let value = 100;
  
  for (let i = 0; i < points; i++) {
    const trendFactor = trend === 'up' ? 0.02 : trend === 'down' ? -0.02 : 0;
    const change = (Math.random() - 0.5) * volatility + trendFactor;
    value = value * (1 + change);
    data.push(value);
  }
  
  return data;
};

export const mockCoins: Coin[] = [
  {
    id: 'bitcoin',
    rank: 1,
    name: 'Bitcoin',
    symbol: 'BTC',
    logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png',
    price: 98542.31,
    change1h: 0.12,
    change24h: 2.45,
    change7d: 5.67,
    marketCap: 1945000000000,
    volume24h: 42500000000,
    circulatingSupply: 19800000,
    totalSupply: 21000000,
    maxSupply: 21000000,
    sparkline: generateSparkline('up', 0.03),
  },
  {
    id: 'ethereum',
    rank: 2,
    name: 'Ethereum',
    symbol: 'ETH',
    logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
    price: 3456.78,
    change1h: -0.23,
    change24h: 1.89,
    change7d: -2.34,
    marketCap: 415000000000,
    volume24h: 18500000000,
    circulatingSupply: 120000000,
    totalSupply: null,
    maxSupply: null,
    sparkline: generateSparkline('neutral', 0.04),
  },
  {
    id: 'tether',
    rank: 3,
    name: 'Tether',
    symbol: 'USDT',
    logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png',
    price: 1.00,
    change1h: 0.01,
    change24h: 0.02,
    change7d: -0.01,
    marketCap: 95000000000,
    volume24h: 85000000000,
    circulatingSupply: 95000000000,
    totalSupply: 95000000000,
    maxSupply: null,
    sparkline: generateSparkline('neutral', 0.001),
  },
  {
    id: 'bnb',
    rank: 4,
    name: 'BNB',
    symbol: 'BNB',
    logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png',
    price: 678.45,
    change1h: 0.45,
    change24h: 3.21,
    change7d: 8.92,
    marketCap: 98000000000,
    volume24h: 2100000000,
    circulatingSupply: 145000000,
    totalSupply: 145000000,
    maxSupply: 200000000,
    sparkline: generateSparkline('up', 0.05),
  },
  {
    id: 'solana',
    rank: 5,
    name: 'Solana',
    symbol: 'SOL',
    logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png',
    price: 189.32,
    change1h: 1.23,
    change24h: 5.67,
    change7d: 12.45,
    marketCap: 82000000000,
    volume24h: 4500000000,
    circulatingSupply: 433000000,
    totalSupply: 575000000,
    maxSupply: null,
    sparkline: generateSparkline('up', 0.06),
  },
  {
    id: 'xrp',
    rank: 6,
    name: 'XRP',
    symbol: 'XRP',
    logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/52.png',
    price: 2.34,
    change1h: -0.56,
    change24h: -1.23,
    change7d: 15.67,
    marketCap: 134000000000,
    volume24h: 8900000000,
    circulatingSupply: 57000000000,
    totalSupply: 100000000000,
    maxSupply: 100000000000,
    sparkline: generateSparkline('up', 0.07),
  },
  {
    id: 'cardano',
    rank: 7,
    name: 'Cardano',
    symbol: 'ADA',
    logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2010.png',
    price: 0.89,
    change1h: 0.78,
    change24h: 4.56,
    change7d: -3.21,
    marketCap: 31000000000,
    volume24h: 890000000,
    circulatingSupply: 35000000000,
    totalSupply: 45000000000,
    maxSupply: 45000000000,
    sparkline: generateSparkline('neutral', 0.05),
  },
  {
    id: 'dogecoin',
    rank: 8,
    name: 'Dogecoin',
    symbol: 'DOGE',
    logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/74.png',
    price: 0.32,
    change1h: 2.34,
    change24h: 8.91,
    change7d: 25.43,
    marketCap: 47000000000,
    volume24h: 3200000000,
    circulatingSupply: 147000000000,
    totalSupply: null,
    maxSupply: null,
    sparkline: generateSparkline('up', 0.08),
  },
  {
    id: 'avalanche',
    rank: 9,
    name: 'Avalanche',
    symbol: 'AVAX',
    logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png',
    price: 42.56,
    change1h: -1.12,
    change24h: -3.45,
    change7d: -8.76,
    marketCap: 17000000000,
    volume24h: 780000000,
    circulatingSupply: 400000000,
    totalSupply: 720000000,
    maxSupply: 720000000,
    sparkline: generateSparkline('down', 0.06),
  },
  {
    id: 'chainlink',
    rank: 10,
    name: 'Chainlink',
    symbol: 'LINK',
    logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1975.png',
    price: 23.45,
    change1h: 0.34,
    change24h: 2.78,
    change7d: 6.54,
    marketCap: 14000000000,
    volume24h: 920000000,
    circulatingSupply: 600000000,
    totalSupply: 1000000000,
    maxSupply: 1000000000,
    sparkline: generateSparkline('up', 0.05),
  },
];

// Generate more coins for pagination demo
for (let i = 11; i <= 100; i++) {
  const names = ['Polkadot', 'Polygon', 'Litecoin', 'Shiba Inu', 'Uniswap', 'Cosmos', 'Stellar', 'Monero', 'Toncoin', 'Dai'];
  const symbols = ['DOT', 'MATIC', 'LTC', 'SHIB', 'UNI', 'ATOM', 'XLM', 'XMR', 'TON', 'DAI'];
  const idx = (i - 11) % 10;
  const trend = Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'neutral';
  
  mockCoins.push({
    id: `coin-${i}`,
    rank: i,
    name: `${names[idx]} ${Math.floor(i / 10)}`,
    symbol: `${symbols[idx]}${Math.floor(i / 10)}`,
    logo: `https://s2.coinmarketcap.com/static/img/coins/64x64/${1000 + i}.png`,
    price: Math.random() * 1000,
    change1h: (Math.random() - 0.5) * 10,
    change24h: (Math.random() - 0.5) * 20,
    change7d: (Math.random() - 0.5) * 30,
    marketCap: Math.random() * 10000000000,
    volume24h: Math.random() * 1000000000,
    circulatingSupply: Math.random() * 1000000000,
    totalSupply: Math.random() * 2000000000,
    maxSupply: Math.random() > 0.5 ? Math.random() * 3000000000 : null,
    sparkline: generateSparkline(trend as 'up' | 'down' | 'neutral', 0.05),
  });
}

export const mockFearGreed: FearGreedData = {
  value: 72,
  classification: 'Greed',
  timestamp: new Date().toISOString(),
};

export const mockNews: NewsItem[] = [
  {
    id: '1',
    title: 'Bitcoin Surges Past $98,000 as Institutional Adoption Grows',
    source: 'CoinDesk',
    url: '#',
    publishedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: '2',
    title: 'Ethereum Layer 2 Solutions See Record Transaction Volume',
    source: 'The Block',
    url: '#',
    publishedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: '3',
    title: 'Solana DEX Volume Exceeds $2 Billion in 24 Hours',
    source: 'Decrypt',
    url: '#',
    publishedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
  },
  {
    id: '4',
    title: 'Major Bank Announces Crypto Custody Services for Clients',
    source: 'Bloomberg',
    url: '#',
    publishedAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
  },
];

export const getMarketStats = () => ({
  totalMarketCap: 3250000000000,
  total24hVolume: 142000000000,
  btcDominance: 52.4,
  totalCoins: 23456,
  marketCapChange24h: 2.34,
});
