# CryptoBoard (Static GitHub Pages)

✅ **Static site**: frontend reads **only** local snapshots from `./data` (no public API calls in the browser).  
✅ **Hourly updates**: GitHub Actions fetches data from **pro-api.coinmarketcap.com** using a secret key and commits updates into the repo.

## Quick start (GitHub)

1) Push this project to a GitHub repo (recommended: `main` branch).

2) Add repository secret:
- **Settings → Secrets and variables → Actions → New repository secret**
- Name: `CMC_PRO_API_KEY`
- Value: your CoinMarketCap Pro key

3) Enable GitHub Pages:
- **Settings → Pages**
- Source: **Deploy from a branch**
- Branch: `main` / Folder: `/ (root)`

4) Run the workflow once:
- **Actions → Update market data → Run workflow**
- After that it will run **every hour** (cron `7 * * * *` in UTC).

## Data layout

- `data/meta.json` — totals and update timestamp
- `data/pages/listings-<n>.json` — paginated listings (lazy loaded by the site)
- `data/search-index.json` — incremental search suggestions
- `data/coins/<id>.json` — coin details used by `coin.html`
- `data/fng.json` — fear & greed (snapshotted)
- `data/news.json` — compact news list (RSS, snapshotted)
- `data/sparklines/<id>.json` — real OHLCV-based sparkline cache (updated in rotating batches)

> Sparkline policy:  
> - If real OHLCV sparkline isn't available yet for a coin, the updater writes a **deterministic synthetic sparkline** so **every row has a sparkline**.
> - Each hour, Actions updates a rotating batch of ~200 real sparklines, so coverage grows over time.

## TradingView on coin page

`coin.html` embeds TradingView widget, default symbol format:
`BINANCE:<SYMBOL>USDT`

## Notes / limits

- CoinMarketCap plan limits vary. The updater uses safe chunking for listings (`1000` per call) and rotates sparklines to avoid huge API usage.
- Scheduled workflows run in UTC and can be delayed around the top of the hour during high load. That's why cron uses minute `07`.

Generated: 2026-01-07T22:20:04Z
