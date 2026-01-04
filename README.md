# CryptoWatch (GitHub Pages)

Static crypto dashboard inspired by modern market trackers.

## Features
- ✅ Coins table with search + pagination
- ✅ 7d sparklines per coin (canvas, lightweight)
- ✅ Trending movers (24h)
- ✅ Fear & Greed Index
- ✅ News headlines
- ✅ Coin page: line chart + candlesticks, zoom & pan
- ✅ Light/Dark theme
- ✅ EN/RU language toggle
- ✅ Works on GitHub Pages (static) with optional snapshots in `/data`
- ✅ PWA + offline cache (basic Service Worker)

## Run locally
Just open `index.html` via a local server (recommended).
Example:
```bash
python -m http.server 8000
```

## GitHub Actions snapshots (recommended)
The workflow `.github/workflows/update-data.yml` updates:
- `data/markets.latest.json`
- `data/fear-greed.latest.json`
- `data/news.latest.json`

It runs every 30 minutes and commits changes to `main`.

## Deploy to GitHub Pages
1) Settings → Pages  
2) Source: **Deploy from a branch**  
3) Branch: `main` / folder `/`  

Open the URL GitHub shows.

## Coin links
Coin page uses CoinGecko ids: `coin.html?id=bitcoin`
