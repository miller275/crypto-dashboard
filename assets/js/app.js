/* CryptoWatch — app.js (bootstrap) */
(function () {
  const NS = (window.CryptoWatch = window.CryptoWatch || {});
  NS.state = NS.state || {};

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function setHTML(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }

  function toggleSetupBanner(show) {
    const el = document.getElementById("setup-banner");
    if (!el) return;
    if (show) el.classList.remove("hidden");
    else el.classList.add("hidden");
  }


  function fmtCompact(n) {
    if (n === null || n === undefined || Number.isNaN(Number(n))) return "—";
    try {
      const loc = NS.lang ? NS.lang.locale((NS.state && NS.state.lang) || "en") : "en-US";
      return new Intl.NumberFormat(loc, { notation: "compact", maximumFractionDigits: 2 }).format(Number(n));
    } catch { return String(n); }
  }

  function fmtCurrency(n, vs) {
    if (n === null || n === undefined || Number.isNaN(Number(n))) return "—";
    const cur = (vs || "usd").toUpperCase();
    try {
      const loc = NS.lang ? NS.lang.locale((NS.state && NS.state.lang) || "en") : "en-US";
      return new Intl.NumberFormat(loc, { style: "currency", currency: cur, maximumFractionDigits: 2 }).format(Number(n));
    } catch { return `${cur} ${Number(n).toFixed(2)}`; }
  }

  function fmtPct(n) {
    if (n === null || n === undefined || Number.isNaN(Number(n))) return "—";
    const val = Number(n);
    const sign = val > 0 ? "+" : "";
    return `${sign}${val.toFixed(2)}%`;
  }

  function renderGlobal(globalData) {
    const vs = (NS.state.table && NS.state.table.vs) || "usd";
    const d = globalData && globalData.data;
    if (!d) return;

    const marketCap = d.total_market_cap && d.total_market_cap[vs];
    const volume = d.total_volume && d.total_volume[vs];
    const btcDom = d.market_cap_percentage && d.market_cap_percentage.btc;
    const active = d.active_cryptocurrencies;
    const markets = d.markets;
    const mcapChange = d.market_cap_change_percentage_24h_usd;

    setText("stat-marketcap", fmtCurrency(marketCap, vs));
    setText("stat-volume", fmtCurrency(volume, vs));
    setText("stat-btcdom", btcDom ? `${btcDom.toFixed(2)}%` : "—");
    setText("stat-active", active ? fmtCompact(active) : "—");
    setText("stat-markets", markets ? fmtCompact(markets) : "—");
    setText("stat-marketcap-change", fmtPct(mcapChange));

    // top gainer/loser from loaded coins
    const coins = NS.state.marketCoins || [];
    if (coins.length) {
      const sorted = coins.slice().filter(c => typeof c.price_change_percentage_24h_in_currency === "number");
      sorted.sort((a,b) => b.price_change_percentage_24h_in_currency - a.price_change_percentage_24h_in_currency);
      const top = sorted[0];
      const bottom = sorted[sorted.length - 1];
      setText("stat-top-gainer", top ? `${top.name} (${fmtPct(top.price_change_percentage_24h_in_currency)})` : "—");
      setText("stat-top-loser", bottom ? `${bottom.name} (${fmtPct(bottom.price_change_percentage_24h_in_currency)})` : "—");
    }

    // updated time
    if (NS.ui) setText("updated-at", NS.ui.fmtTime(Date.now()));
  }

  function renderTrending(trendingData) {
    const wrap = document.getElementById("trending-list");
    if (!wrap) return;
    wrap.innerHTML = "";

    const items = (trendingData && trendingData.coins) ? trendingData.coins.slice(0, 9) : [];
    for (const x of items) {
      const c = x.item;
      const el = document.createElement("a");
      el.className = "surface flat";
      el.href = `coin.html?id=${encodeURIComponent(c.id)}`;
      el.style.padding = "12px";
      el.innerHTML = `
        <div class="flex items-center gap-3">
          <img class="coin-logo" src="${c.small || ""}" alt="${c.symbol || ""}" />
          <div style="flex:1">
            <div style="font-weight:1000">${c.name}</div>
            <div class="muted" style="font-weight:800; font-size:12px">${(c.symbol || "").toUpperCase()} • #${c.market_cap_rank ?? "—"}</div>
          </div>
          <span class="pill">🔥</span>
        </div>
      `;
      wrap.appendChild(el);
    }
  }

  function fngLabelKey(classif) {
    const s = (classif || "").toLowerCase();
    if (s.includes("extreme fear")) return "fng-extreme-fear";
    if (s.includes("fear")) return "fng-fear-label";
    if (s.includes("neutral")) return "fng-neutral-label";
    if (s.includes("extreme greed")) return "fng-extreme-greed";
    if (s.includes("greed")) return "fng-greed-label";
    return "fng-neutral-label";
  }

  function renderFng(fngData) {
    const valueEl = document.getElementById("fng-value");
    const labelEl = document.getElementById("fng-label");
    const bar = document.getElementById("fng-bar");
    const upd = document.getElementById("fng-updated-at");
    if (!valueEl || !labelEl || !bar || !upd) return;

    const item = fngData && fngData.data && fngData.data[0];
    if (!item) return;

    const v = Number(item.value);
    valueEl.textContent = Number.isFinite(v) ? String(v) : "—";

    const key = fngLabelKey(item.value_classification);
    const txt = NS.lang ? NS.lang.t(key) : (item.value_classification || "—");
    labelEl.textContent = txt;

    // style label
    labelEl.classList.remove("up","down");
    if (Number.isFinite(v)) {
      if (v >= 60) labelEl.classList.add("up");
      else if (v <= 40) labelEl.classList.add("down");
    }

    bar.style.width = `${Math.max(0, Math.min(100, Number.isFinite(v) ? v : 50))}%`;

    const ts = Number(item.timestamp) * 1000;
    upd.textContent = Number.isFinite(ts) ? (NS.ui ? NS.ui.fmtTime(ts) : "") : "—";
  }

  function renderNews() {
    const wrap = document.getElementById("news-container");
    if (!wrap) return;

    const items = [
      { cat: "Bitcoin", time: "2h", title: "Bitcoin volatility rises as traders watch key levels", img: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=1200&q=80" },
      { cat: "Altcoins", time: "5h", title: "Top altcoins: volume spikes across the market", img: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=1200&q=80" },
      { cat: "Regulation", time: "1d", title: "Regulatory headlines: what changed this week", img: "https://images.unsplash.com/photo-1526378722484-bd91ca387e72?auto=format&fit=crop&w=1200&q=80" }
    ];

    wrap.innerHTML = "";
    for (const n of items) {
      const card = document.createElement("div");
      card.className = "surface flat";
      card.style.overflow = "hidden";
      card.innerHTML = `
        <img src="${n.img}" alt="" style="height:140px; width:100%; object-fit:cover" />
        <div style="padding:12px">
          <div class="flex items-center justify-between gap-2" style="margin-bottom:8px">
            <span class="pill">${n.cat}</span>
            <span class="muted" style="font-size:12px; font-weight:800">${n.time}</span>
          </div>
          <div style="font-weight:1000; line-height:1.25">${n.title}</div>
        </div>
      `;
      wrap.appendChild(card);
    }
  }

  async function loadMarket({ force=false } = {}) {
    const st = NS.state.table || {};
    const vs = st.vs || "usd";
    const order = st.order || "market_cap_desc";

    try {
      const coins = await NS.api.getMarketCoins(vs, 250, 1, order);
      NS.state.marketCoins = Array.isArray(coins) ? coins : [];
      if (NS.table) NS.table.render();
      if (NS.api) {
        // precompute top coins stats etc
      }
    } catch (e) {
      console.error(e);
      if (NS.ui && NS.lang) NS.ui.toast(NS.lang.t("error-api"));
    }
  }

  async function loadAll({ force=false } = {}) {
    if (!NS.api) return;

    await loadMarket({ force });

    try {
      const st = NS.api.getStatus ? NS.api.getStatus() : null;
      toggleSetupBanner(st ? !st.snapshotsReady : false);
      if (st && !st.snapshotsReady && NS.ui && NS.lang) {
        NS.ui.toast(NS.lang.t("setup-title"));
      }
    } catch (e) {}

    try {
      const globalData = await NS.api.getGlobal();
      renderGlobal(globalData);
    } catch (e) { console.error(e); }

    try {
      const trending = await NS.api.getTrending();
      renderTrending(trending);
    } catch (e) { console.error(e); }

    try {
      const fng = await NS.api.getFearGreed();
      renderFng(fng);
    } catch (e) { console.error(e); }

    renderNews();

    if (NS.charts) NS.charts.mountTradingView();
  }

  function init() {
    if (NS.ui) NS.ui.init();
    if (NS.theme) NS.theme.init();
    if (NS.lang) NS.lang.init();
    if (NS.charts) NS.charts.init();
    if (NS.table) {
      NS.table.initControls();
      NS.table.wireActions();
    }

    // reload dynamic cards on language change
    if (NS.bus) {
      NS.bus.on("langchange", async () => {
        // re-render global & fng labels in the new language (using already loaded data)
        try {
          const globalData = await NS.api.getGlobal();
          renderGlobal(globalData);
        } catch {}
        try {
          const fng = await NS.api.getFearGreed();
          renderFng(fng);
        } catch {}
      });
    }

    // load
    (async () => {
      try {
        await loadAll({ force:false });
      } finally {
        if (NS.ui) NS.ui.hideLoader();
      }
    })();
  }

  NS.app = { init, loadAll, loadMarket };
  document.addEventListener("DOMContentLoaded", init);
})();
