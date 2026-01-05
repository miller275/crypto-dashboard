# CryptoWatch (GitHub Pages • CoinMarketCap snapshots)

Это **статический** крипто-дашборд для GitHub Pages.  
Браузер **не делает запросов к публичным API** — сайт читает только файлы из `/data`, которые обновляются GitHub Actions.

## Что есть
- Таблица монет (по капитализации): поиск + пагинация
- Трендовые движения (24h)
- Fear & Greed Index
- Новости
- Страница монеты: Line + Candles, zoom/pan, интервалы 24h / 7d / 30d / 1y / Max
- Светлая/тёмная тема + EN/RU
- PWA + offline cache (Service Worker)

## Как работает обновление данных
Workflow: `.github/workflows/update-data.yml`  
Script: `scripts/update-data.js`

Он:
1) Берёт топ монет через **CoinMarketCap PRO API**
2) Сохраняет снапшоты в:
   - `data/markets.latest.json` (таблица + global metrics)
   - `data/coins/<id>.json` (детали монеты)
   - `data/ohlc/<id>-<range>.json` (candles)
   - `data/market_chart/<id>-<range>.json` (line prices)
3) (дополнительно) обновляет:
   - `data/fear-greed.latest.json` (alternative.me)
   - `data/news.latest.json` (CryptoCompare)
4) Скачивает логотипы в `assets/img/coins/`

> По умолчанию графики/спарклайны генерируются для топ `CHART_LIMIT` монет (см. env в workflow).

## Важно: добавить Secret с ключом
GitHub → **Settings → Secrets and variables → Actions → New repository secret**

- Name: `CMC_PRO_API_KEY`
- Value: твой ключ CoinMarketCap PRO

Без этого workflow не сможет обновлять данные.

## Деплой на GitHub Pages
1) GitHub → **Settings → Pages**  
2) Source: **Deploy from a branch**  
3) Branch: `main` / folder `/`  
4) Открой ссылку Pages

## Ссылки на монеты
Используется **CMC numeric id**, например:
- `coin.html?id=1` (Bitcoin)

## Настройка частоты/лимитов
В `.github/workflows/update-data.yml` можно поменять:
- `TOP_LIMIT` — сколько монет в таблице
- `CHART_LIMIT` — сколько монет с графиками/спарклайнами
- `LOGO_LIMIT` — сколько логотипов скачивать
- cron — частоту обновления
