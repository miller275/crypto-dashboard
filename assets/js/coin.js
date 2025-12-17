/* CryptoWatch — coin.js (coin details page, CryptoRank snapshot + TradingView) */
(function () {
  const NS = (window.CryptoWatch = window.CryptoWatch || {});
  NS.state = NS.state || {};

  function locale() {
    const lang = (NS.state && NS.state.lang) || "en";
    return NS.lang ? NS.lang.locale(lang) : (lang === "ru" ? "ru-RU" : "en-US");
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function setHref(id, url) {
    const el = document.getElementById(id);
    if (!el) return;
    if (!url) {
      el.classList.add("muted");
      el.removeAttribute("href");
      return;
    }
    el.classList.remove("muted");
    el.setAttribute("href", url);
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener");
  }

  function fmtCompact(n) {
    if (n === null || n === undefined || Number.isNaN(Number(n))) return "—";
    const x = Number(n);
    const abs = Math.abs(x);
    if (abs >= 1e12) return (x / 1e12).toFixed(2) + "T";
    if (abs >= 1e9) return (x / 1e9).toFixed(2) + "B";
    if (abs >= 1e6) return (x / 1e6).toFixed(2) + "M";
    if (abs >= 1e3) return (x / 1e3).toFixed(2) + "K";
    return String(Math.round(x));
  }

  function fmtCurrency(n, vs="usd") {
    if (n === null || n === undefined || Number.isNaN(Number(n))) return "—";
    const cur = (vs || "usd").toUpperCase();
    try {
      return new Intl.NumberFormat(locale(), {
        style: "currency",
        currency: cur,
        maximumFractionDigits: Number(n) < 1 ? 6 : 2
      }).format(Number(n));
    } catch {
      return `${cur} ${Number(n).toFixed(2)}`;
    }
  }

  function fmtPct(n) {
    if (n === null || n === undefined || Number.isNaN(Number(n))) return "—";
    const x = Number(n);
    return (x >= 0 ? "+" : "") + x.toFixed(2) + "%";
  }

  function stripHTML(html) {
    try {
      const div = document.createElement("div");
      div.innerHTML = html || "";
      return div.textContent || div.innerText || "";
    } catch { return String(html || ""); }
  }

  function badge(el, value) {
    if (!el) return;
    el.textContent = fmtPct(value);
    el.classList.remove("up","down");
    if (typeof value === "number") el.classList.add(value >= 0 ? "up" : "down");
  }

  function tvLocale() {
    const lang = (NS.state && NS.state.lang) || "en";
    return lang === "ru" ? "ru" : "en";
  }

  function guessTradingViewSymbol(sym) {
    const s = String(sym || "").toUpperCase();
    // Most coins exist on BINANCE as *USDT
    return `BINANCE:${s}USDT`;
  }

  function mountTradingView(symbol) {
    const el = document.getElementById("coin-tv-chart");
    if (!el || !window.TradingView) return;

    const theme = (NS.state && NS.state.theme) || "light";
    el.innerHTML = "";

    try {
      new TradingView.widget({
        container_id: "coin-tv-chart",
        autosize: true,
        symbol: symbol,
        interval: "60",
        timezone: "Etc/UTC",
        theme: theme === "dark" ? "dark" : "light",
        style: "1",
        locale: tvLocale(),
        enable_publishing: false,
        allow_symbol_change: false,
        hide_top_toolbar: true,
        hide_side_toolbar: true,
        hide_legend: true,
        save_image: false,
        calendar: false
      });
    } catch (e) {
      // If widget fails, leave empty
      console.warn("TradingView widget error:", e);
    }
  }

  async function load() {
    const id = new URLSearchParams(location.search).get("id");
    if (!id) {
      if (NS.ui) NS.ui.toast("Missing coin id");
      location.href = "index.html#market";
      return;
    }

    const vs = (localStorage.getItem("cw_vs") || "usd").toLowerCase();

    try {
      // api.getCoin returns CoinGecko-like object built from CryptoRank snapshots
      const coin = await NS.api.getCoin(id, vs);
      const md = coin.market_data || {};

      const title = document.querySelector("title");
      if (title) title.textContent = `${coin.name} (${String(coin.symbol||"").toUpperCase()}) — CryptoWatch`;

      const img = document.getElementById("coin-logo");
      if (img) {
        img.src = (coin.image && coin.image.large) ? coin.image.large : "";
        img.alt = coin.symbol || "";
      }

      setText("coin-name", coin.name || "—");
      setText("coin-symbol", (coin.symbol || "").toUpperCase());
      setText("coin-rank", coin.market_cap_rank ? `#${coin.market_cap_rank}` : "—");

      const price = md.current_price && md.current_price[vs];
      setText("coin-price", fmtCurrency(price, vs));

      const changeEl = document.getElementById("coin-change");
      // We store %24h in snapshots as `price_change_percentage_24h_in_currency` on coin list,
      // but in this CoinGecko-like wrapper we don't have it. So try to read from snapshot directly if possible.
      let change24 = null;
      try {
        const snap = await NS.api.getSnapshot(vs);
        const c = (snap.coins || []).find(x => String(x.id) === String(id));
        if (c && typeof c.price_change_percentage_24h_in_currency === "number") change24 = c.price_change_percentage_24h_in_currency;
      } catch {}
      badge(changeEl, change24);

      setText("coin-mcap", fmtCurrency(md.market_cap && md.market_cap[vs], vs));
      setText("coin-vol", fmtCurrency(md.total_volume && md.total_volume[vs], vs));
      setText("coin-supply", fmtCompact(md.circulating_supply));
      setText("coin-supply-sub", md.max_supply ? `Max: ${fmtCompact(md.max_supply)}` : " ");

      // ATH is not provided in snapshots by default
      setText("coin-ath", "—");
      setText("coin-ath-date", " ");

      const about = stripHTML((coin.description && coin.description.en) || "");
      const aboutEl = document.getElementById("coin-about");
      if (aboutEl) aboutEl.textContent = about ? about.slice(0, 700) + (about.length > 700 ? "…" : "") : "—";

      setHref("coin-website", coin.links && coin.links.homepage && coin.links.homepage[0]);
      setHref("coin-explorer", coin.links && coin.links.blockchain_site && coin.links.blockchain_site.find(Boolean));

      // watchlist
      const btn = document.getElementById("coin-watch");
      if (btn && NS.watchlist) {
        const setState = () => {
          const active = NS.watchlist.has(String(id));
          btn.classList.toggle("primary", active);
          const star = btn.querySelector("i");
          if (star) star.style.color = active ? "#f59e0b" : "";
        };
        setState();
        btn.onclick = () => { NS.watchlist.toggle(String(id)); setState(); };
      }

      // TradingView chart
      mountTradingView(guessTradingViewSymbol(coin.symbol));

    } catch (e) {
      console.error(e);
      if (NS.ui) NS.ui.toast(e.message || "Failed to load coin");
      setText("coin-name", "—");
    }
  }

  function init() {
    // theme/lang init
    if (NS.theme) NS.theme.init();
    if (NS.lang) NS.lang.init();
    if (NS.watchlist) NS.watchlist.init();

    // re-mount chart on theme/lang changes
    if (NS.bus) {
      NS.bus.on("themechange", () => load());
      NS.bus.on("langchange", () => load());
    }

    const year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());

    load();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
