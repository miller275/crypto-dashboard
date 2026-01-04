 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/scripts/fetch-cryptorank.js b/scripts/fetch-cryptorank.js
index b998cc7b746c2e3269ca063596d966cf8c629af8..5128d7be92ed80bafe2efbdd8690d69b21ad60bb 100644
--- a/scripts/fetch-cryptorank.js
+++ b/scripts/fetch-cryptorank.js
@@ -16,50 +16,61 @@
  * and fallback to:
  *   GET https://api.cryptorank.io/v2/currencies?limit=100
  */
 
 const fs = require("fs");
 const path = require("path");
 
 const API_KEY = process.env.CRYPTORANK_API_KEY;
 if (!API_KEY) {
   console.error("Missing env CRYPTORANK_API_KEY (set it in GitHub repo secrets).");
   process.exit(1);
 }
 
 const BASE = "https://api.cryptorank.io/v2";
 const OUT_DIR = path.join(__dirname, "..", "data");
 
 function ensureDir(p) {
   fs.mkdirSync(p, { recursive: true });
 }
 
 function safeNum(x) {
   const n = Number(x);
   return Number.isFinite(n) ? n : null;
 }
 
+function pickNumber(obj, keys) {
+  if (!obj || typeof obj !== "object") return null;
+  for (const key of keys) {
+    if (Object.prototype.hasOwnProperty.call(obj, key)) {
+      const v = safeNum(obj[key]);
+      if (v !== null) return v;
+    }
+  }
+  return null;
+}
+
 async function cr(pathname, params = {}) {
   const url = new URL(BASE + pathname);
 
   // Only set params that are explicitly passed.
   for (const [k, v] of Object.entries(params)) {
     if (v === undefined || v === null || v === "") continue;
     url.searchParams.set(k, String(v));
   }
 
   const res = await fetch(url.toString(), {
     headers: {
       Accept: "application/json",
       "X-Api-Key": API_KEY,
     },
   });
 
   const text = await res.text();
   let data = null;
   try {
     data = text ? JSON.parse(text) : null;
   } catch {
     data = null;
   }
 
   if (!res.ok) {
@@ -139,67 +150,72 @@ function pickLinks(cur) {
 
   return { homepage, explorer };
 }
 
 function mapToCoinGeckoLike(cur) {
   const usd = getUsdValues(cur) || {};
 
   const price =
     safeNum(usd.price) ??
     safeNum(usd.priceUsd) ??
     safeNum(cur.price) ??
     safeNum(cur.priceUsd);
 
   const marketCap =
     safeNum(usd.marketCap) ??
     safeNum(usd.marketCapUsd) ??
     safeNum(cur.marketCap) ??
     safeNum(cur.marketCapUsd);
 
   const vol24h =
     safeNum(usd.volume24h) ??
     safeNum(usd.volume24hUsd) ??
     safeNum(cur.volume24h) ??
     safeNum(cur.volume24hUsd);
 
+  // Some responses expose change data with slightly different casings/names.
+  const changeFields1h = [
+    "percentChange1h", "percent_change_1h", "percentChange1H", "change1h", "change1hPercent", "change1h_percent",
+  ];
+  const changeFields24h = [
+    "percentChange24h", "percent_change_24h", "percentChange24H", "change24h", "change24hPercent", "change24h_percent",
+  ];
+  const changeFields7d = [
+    "percentChange7d", "percent_change_7d", "percentChange7D", "change7d", "change7dPercent", "change7d_percent",
+  ];
+
   const ch1h =
-    safeNum(usd.percentChange1h) ??
-    safeNum(usd.change1h) ??
-    safeNum(cur.percentChange1h) ??
-    safeNum(cur.change1h);
+    pickNumber(usd, changeFields1h) ??
+    pickNumber(cur, changeFields1h);
 
   const ch24h =
-    safeNum(usd.percentChange24h) ??
-    safeNum(usd.change24h) ??
-    safeNum(cur.percentChange24h) ??
-    safeNum(cur.change24h);
+    pickNumber(usd, changeFields24h) ??
+    pickNumber(cur, changeFields24h);
 
   const ch7d =
-    safeNum(usd.percentChange7d) ??
-    safeNum(usd.change7d) ??
-    safeNum(cur.percentChange7d) ??
-    safeNum(cur.change7d);
+    pickNumber(usd, changeFields7d) ??
+    pickNumber(cur, changeFields7d);
 
   const rank = safeNum(cur.rank) ?? safeNum(cur.marketCapRank) ?? safeNum(cur.market_cap_rank);
 
   const image = pickImage(cur);
   const { homepage, explorer } = pickLinks(cur);
 
   return {
     id: String(cur.id ?? cur.slug ?? cur.symbol ?? cur.name ?? ""),
     symbol: (cur.symbol || "").toLowerCase(),
     name: cur.name || cur.fullName || cur.slug || cur.symbol || "Unknown",
     market_cap_rank: rank,
     image: image,
     current_price: price,
     market_cap: marketCap,
     total_volume: vol24h,
     price_change_percentage_1h_in_currency: ch1h,
     price_change_percentage_24h_in_currency: ch24h,
     price_change_percentage_7d_in_currency: ch7d,
     circulating_supply: safeNum(cur.circulatingSupply) ?? safeNum(cur.circulating_supply),
     max_supply: safeNum(cur.maxSupply) ?? safeNum(cur.max_supply),
     description: cur.description || null,
     homepage: homepage,
     explorer: explorer,
     // Optional sparkline — leave absent (UI will just skip it).
   };
@@ -248,93 +264,109 @@ function buildGlobalFromCoins(coins, usdEur) {
     ? (Number(btc.market_cap) / totalMarketCapUsd) * 100
     : null;
 
   return {
     data: {
       active_cryptocurrencies: coins.length,
       markets: null,
       total_market_cap: {
         usd: totalMarketCapUsd,
         eur: totalMarketCapUsd * usdEur,
       },
       total_volume: {
         usd: totalVolumeUsd,
         eur: totalVolumeUsd * usdEur,
       },
       market_cap_percentage: {
         btc: btcDominance,
       },
       market_cap_change_percentage_24h_usd: null,
       updated_at: Math.floor(Date.now() / 1000),
     },
   };
 }
 
 function buildTrendingFromCoins(coins) {
-  const list = [...coins]
-    .filter((c) => Number.isFinite(Number(c.price_change_percentage_24h_in_currency)))
-    .sort((a, b) => Number(b.price_change_percentage_24h_in_currency) - Number(a.price_change_percentage_24h_in_currency))
+  const withChange = coins.filter((c) => Number.isFinite(Number(c.price_change_percentage_24h_in_currency)));
+  const fallback = coins.slice(0, 9);
+  const pickFrom = withChange.length ? withChange : fallback;
+
+  const list = pickFrom
+    .slice()
+    .sort((a, b) => Number(b.price_change_percentage_24h_in_currency || 0) - Number(a.price_change_percentage_24h_in_currency || 0))
     .slice(0, 9)
-    .map((c) => ({
+    .map((c, idx) => ({
       item: {
         id: c.id,
         name: c.name,
         symbol: c.symbol,
-        market_cap_rank: c.market_cap_rank,
+        market_cap_rank: Number.isFinite(Number(c.market_cap_rank)) ? c.market_cap_rank : idx + 1,
         small: c.image,
       },
     }));
   return { coins: list };
 }
 
 function convertCoinsToEur(coins, usdEur) {
   return coins.map((c) => {
     const out = { ...c };
     if (Number.isFinite(Number(out.current_price))) out.current_price = Number(out.current_price) * usdEur;
     if (Number.isFinite(Number(out.market_cap))) out.market_cap = Number(out.market_cap) * usdEur;
     if (Number.isFinite(Number(out.total_volume))) out.total_volume = Number(out.total_volume) * usdEur;
     return out;
   });
 }
 
 async function fetchCurrenciesTop100() {
   const LIMIT = 100; // MUST be 100/500/1000
   try {
     const resp = await cr("/currencies", { limit: LIMIT, sortBy: "marketCap", sortDirection: "DESC" });
     return extractList(resp);
   } catch (e) {
     console.warn("⚠️ /currencies sorted request failed; retrying with only limit:", e.message);
     const resp = await cr("/currencies", { limit: LIMIT });
     return extractList(resp);
   }
 }
 
 async function main() {
   ensureDir(OUT_DIR);
 
   const raw = await fetchCurrenciesTop100();
-  const coinsUsd = raw.map(mapToCoinGeckoLike).filter((c) => c && c.id && c.symbol);
+  // Map to our CoinGecko-like shape, keep coins with core metrics, and patch missing ranks.
+  const coinsUsd = raw
+    .map(mapToCoinGeckoLike)
+    .filter((c) =>
+      c && c.id && c.symbol &&
+      Number.isFinite(Number(c.current_price)) &&
+      Number.isFinite(Number(c.market_cap)) &&
+      Number.isFinite(Number(c.total_volume))
+    )
+    .map((c, idx) => {
+      if (!Number.isFinite(Number(c.market_cap_rank))) c.market_cap_rank = idx + 1;
+      return c;
+    });
 
   const usdEur = await getUsdEurRate();
 
   const global = buildGlobalFromCoins(coinsUsd, usdEur);
   const trending = buildTrendingFromCoins(coinsUsd);
 
   const snapshotUsd = {
     updated_at: new Date().toISOString(),
     convert: "USD",
     global,
     trending,
     coins: coinsUsd,
   };
 
   const coinsEur = convertCoinsToEur(coinsUsd, usdEur);
   const snapshotEur = {
     updated_at: new Date().toISOString(),
     convert: "EUR",
     global,
     trending,
     coins: coinsEur,
   };
 
   fs.writeFileSync(path.join(OUT_DIR, "market_usd.json"), JSON.stringify(snapshotUsd, null, 2), "utf-8");
   fs.writeFileSync(path.join(OUT_DIR, "market_eur.json"), JSON.stringify(snapshotEur, null, 2), "utf-8");
 
EOF
)
