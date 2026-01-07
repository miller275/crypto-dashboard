# CryptoBoard (static, GitHub Pages)

## What this is
A **fully static** crypto dashboard:
- Frontend **never** calls public APIs.
- It loads snapshots from **/data/** only.
- **GitHub Actions** updates /data hourly and commits it to the repo.

## Quick start (local)
Just open `index.html` with a local web server (recommended):
- VS Code: Live Server
- Or: `python -m http.server 8080`

Then visit: http://localhost:8080

## GitHub Pages
1. Push this repo to GitHub
2. Settings → Pages → Deploy from branch → `main` / `/ (root)`
3. Actions will update `/data` hourly.

## Data update workflow
Workflow: `.github/workflows/update-data.yml`

It fetches:
- CoinGecko market pages (with 7d sparklines)
- Full coin list for search suggestions
- Fear & Greed index (alternative.me)
- News (RSS)

### Optional secrets
- `COINGECKO_API_KEY` (optional; CoinGecko works without it but you can add a key if you have one)
- `DETAILS_LIMIT` (optional; number of coins to snapshot “about/links”, default 300)

## Frontend pages
- `index.html` — Markets table + pagination + incremental search + Fear&Greed + compact news
- `coin.html?id=<coingecko_id>` — “PRO” coin page + TradingView chart (default BINANCE) + stats + sparkline

## Notes
- TradingView widget loads from TradingView servers (embed).
- If a coin/pair isn’t available on the chosen exchange, TradingView may show “No data”.
