# CryptoWatch v9 (rewritten from scratch)

This project is built for **GitHub Pages** and uses **GitHub Actions** to periodically fetch CryptoRank data
and commit JSON snapshots into `/data/`. The website only reads local JSON files (no API calls from the browser),
so it works without CORS issues.

## What you get
- Market table (Top 100 by market cap)
- Coin logos (with safe fallback placeholder)
- Sparklines (7d) from local history
- % change 1h / 24h / 7d computed from local history (even if API doesn't provide them)
- Watchlist (localStorage)
- Dark/Light theme + RU/EN language
- Coin details page with chart periods (24h / 7d / 30d / 90d / 1y) based on accumulated history
- Offline cache (service worker)

## Setup
1) Add GitHub secret: `CRYPTORANK_API_KEY`
2) Enable GitHub Pages for your repo (root)
3) Wait for Actions to generate history (hourly).  
   - 1h change appears after ~2 runs  
   - 24h change after 24 hours  
   - 7d sparkline after a day+ (keeps filling)

## Files
- `scripts/fetch-cryptorank.js` — fetch snapshot + update local history
- `.github/workflows/update-data.yml` — hourly cron
- `data/market_usd.json` + `data/history_usd.json` — generated files
