# CryptoWatch (CMC snapshots)

Static crypto dashboard for GitHub Pages:
- Loads **paged markets** from `/data/markets/page-N.json` (lazy pagination)
- Uses **CoinMarketCap PRO** in GitHub Actions to generate snapshots
- Coin page uses **TradingView widget** (default: BINANCE:SYMBOLUSDT)
- Browser reads ONLY `/data` (no direct CMC calls from client)

## Setup
1) Add secret `CMC_PRO_API_KEY` (Settings → Secrets and variables → Actions)
2) Actions will run hourly and commit updates to `/data`.
