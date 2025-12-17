# CryptoWatch (GitHub Pages + CryptoRank API)

Этот проект **не вызывает CryptoRank API из браузера** (CORS + утечка ключа).  
Вместо этого GitHub Actions регулярно скачивает данные **сервер‑сайд** и сохраняет снапшоты в `/data/*.json`, а сайт на GitHub Pages читает эти JSON.

## Быстрый запуск

1) Загрузите проект в свой репозиторий GitHub и включите **GitHub Pages** (ветка `main` → `/ (root)`).

2) Добавьте секрет с ключом CryptoRank:

- Repo → **Settings → Secrets and variables → Actions → New repository secret**
- Name: `CRYPTORANK_API_KEY`
- Value: ваш ключ CryptoRank

⚠️ Вы уже публиковали ключ в чате. Лучше **сгенерировать новый ключ** в CryptoRank Dashboard и использовать его как секрет.

3) Запустите обновление данных:

- Repo → **Actions → “Update market data” → Run workflow**
- Подождите завершения, затем обновите страницу сайта.

После этого таблица рынка, тренды и глобальные метрики будут заполняться реальными данными.

## Где лежат снапшоты

- `data/market_usd.json`
- `data/market_eur.json` (если ваш тариф поддерживает конвертацию в EUR)

## Как часто обновляется

Workflow запускается:
- вручную (workflow_dispatch)
- автоматически каждые 30 минут (cron)

## Что делать если данных нет

Откройте вкладку **Actions** и проверьте последний запуск “Update market data”.
