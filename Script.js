document.addEventListener("DOMContentLoaded", () => {
  // Theme toggle
  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    const root = document.body;
    const applyTheme = isLight => root.setAttribute("data-theme", isLight ? "light" : "dark");
    applyTheme(themeToggle.checked);
    themeToggle.addEventListener("change", e => applyTheme(e.target.checked));
  }

  // Smooth scroll
  const promoBtn = document.getElementById("promoBtn");
  if (promoBtn) {
    promoBtn.addEventListener("click", e => {
      e.preventDefault();
      const target = document.getElementById("coinsSection");
      if (!target) return;
      const offset = target.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: offset, behavior: "smooth" });
    });
  }

  // Fear & Greed
  function updateFearGreed() {
    fetch("https://api.alternative.me/fng/?limit=1")
      .then(r => r.json())
      .then(data => {
        const entry = data.data[0];
        const value = parseInt(entry.value);
        const classification = entry.value_classification;
        const updateTime = new Date(parseInt(entry.timestamp) * 1000);

        document.getElementById("fearGreedValue").textContent = value;
        document.getElementById("fearGreedText").textContent = classification;
        document.getElementById("lastUpdate").textContent = "Обновлено: " + updateTime.toLocaleString();

        const bar = document.querySelector(".scale-bar");
        const fgIndicator = document.getElementById("fearGreedIndicator");
        const pos = (value / 100) * bar.offsetWidth;
        fgIndicator.style.left = pos + "px";
      });
  }
  updateFearGreed();
  setInterval(updateFearGreed, 60000);

  // Coins + pagination
  let currentPage = 1;
  const perPage = 12;
  const coinGrid = document.getElementById("coinGrid");
  const pageInfo = document.getElementById("pageInfo");

  function loadCoins(page=1) {
    fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}`)
      .then(r => r.json())
      .then(data => {
        coinGrid.innerHTML = data.map(coin => `
          <div class="coin-card">
            <div class="coin-name">${coin.name}</div>
            <div class="coin-symbol">${coin.symbol.toUpperCase()}</div>
            <div class="coin-price">$${coin.current_price.toLocaleString()}</div>
            <div class="coin-change ${coin.price_change_percentage_24h >= 0 ? 'change-positive':'change-negative'}">
              ${coin.price_change_percentage_24h.toFixed(2)}%
            </div>
          </div>
