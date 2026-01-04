/* CryptoWatch — charts.js (sparklines + TradingView) */
(function () {
  const NS = (window.CryptoWatch = window.CryptoWatch || {});
  const sparkCharts = new Map();

  function destroySparklines() {
    for (const ch of sparkCharts.values()) {
      try { ch.destroy(); } catch {}
    }
    sparkCharts.clear();
  }

  function renderSparklines(coins) {
    destroySparklines();
    const theme = (NS.state && NS.state.theme) || "light";
    const isDark = theme === "dark";

    // create for each canvas with data-spark
    document.querySelectorAll("canvas[data-spark]").forEach((canvas) => {
      const id = canvas.getAttribute("data-spark");
      const coin = coins.find(c => c.id === id);
      const prices = coin && coin.sparkline_in_7d && coin.sparkline_in_7d.price;
      if (!prices || prices.length < 1) return;
      const series = prices.length === 1 ? [prices[0], prices[0]] : prices;

      const up = (coin.price_change_percentage_7d_in_currency ?? 0) >= 0;
      const lineColor = up ? (isDark ? "#34d399" : "#16a34a") : (isDark ? "#fb7185" : "#dc2626");

      const ch = new Chart(canvas.getContext("2d"), {
        type: "line",
        data: {
          labels: series.map((_, i) => i),
          datasets: [{
            data: series,
            borderColor: lineColor,
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.25,
            fill: false
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
          scales: { x: { display: false }, y: { display: false } },
          elements: { line: { capBezierPoints: true } }
        }
      });

      sparkCharts.set(id, ch);
    });
  }

  function mountTradingView() {
    const el = document.getElementById("tv-chart");
    if (!el || !window.TradingView) return;

    const theme = (NS.state && NS.state.theme) || "light";
    const lang = (NS.state && NS.state.lang) || "en";
    const tvLocale = lang === "ru" ? "ru" : "en";

    el.innerHTML = "";

    // Advanced chart widget (timeframe controls live in toolbars; we hide them)
    new TradingView.widget({
      container_id: "tv-chart",
      autosize: true,
      symbol: "BINANCE:BTCUSDT",
      interval: "60",
      timezone: "Etc/UTC",
      theme: theme === "dark" ? "dark" : "light",
      style: "1",
      locale: tvLocale,
      enable_publishing: false,
      allow_symbol_change: false,
      hide_top_toolbar: true,
      hide_side_toolbar: true,
      withdateranges: false,
      details: false,
      hotlist: false,
      calendar: false
    });
  }

  function init() {
    // (re)mount TradingView on theme/lang changes
    if (NS.bus) {
      NS.bus.on("themechange", () => mountTradingView());
      NS.bus.on("langchange", () => mountTradingView());
    }
  }

  NS.charts = { init, renderSparklines, mountTradingView, destroySparklines };
})();
