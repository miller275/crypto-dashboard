# CryptoWatch (GitHub Pages + CoinMarketCap Pro)

Крипто‑дашборд на **HTML/CSS/JS** (без фреймворков):
- Таблица монет + поиск/сортировка/пагинация
- Watchlist (LocalStorage)
- BTC/USDT график (TradingView) без панели таймфреймов
- Fear & Greed (alternative.me)
- EN/RU + Light/Dark (на весь сайт)

## Важно про CoinMarketCap Pro API
CoinMarketCap Pro **нельзя дергать напрямую из браузера**: будет CORS‑ошибка и ключ утечёт.
Поэтому здесь используется безопасный способ для GitHub Pages:

✅ **GitHub Actions** (с секретом `CMC_PRO_API_KEY`) периодически качает данные с CoinMarketCap Pro  
✅ сохраняет JSON‑снапшоты в папку `data/`  
✅ сайт читает `data/market_usd.json` / `data/market_eur.json` как обычные статические файлы

## Как запустить на GitHub Pages
1) Залей этот проект в репозиторий (в корень, чтобы `index.html` был в корне).
2) В репозитории: **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `CMC_PRO_API_KEY`
   - Value: твой ключ CoinMarketCap Pro
3) Открой вкладку **Actions → Update market data → Run workflow** (запустить вручную первый раз).
4) Включи Pages: **Settings → Pages → Deploy from a branch → Branch: main / root**
5) Подожди обновление: после первого workflow в `data/` появятся реальные данные.

## Локальный запуск
Открывать лучше через локальный сервер:

```bash
python -m http.server 8000
```

Открой: `http://localhost:8000/`

## Структура
- `index.html` — главная (таблица + виджеты)
- `coin.html` — детали монеты (данные из снапшота + TradingView)
- `assets/js/api.js` — читает `data/market_*.json`
- `scripts/fetch-cmc.js` — скрипт для GitHub Actions (качает CMC и пишет `data/`)
- `.github/workflows/update-data.yml` — расписание обновления (каждые 30 минут)

## Быстрые советы
- **Не вставляй API‑ключ в JS/HTML** — он станет публичным.
- Если ключ уже где-то «светанулся» — сгенерируй новый в кабинете CoinMarketCap.
