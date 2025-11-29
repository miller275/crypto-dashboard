const langData = {
  en: { title: "Crypto Dashboard", search: "Search coin..." },
  ru: { title: "Крипто Дашборд", search: "Поиск монеты..." },
  ro: { title: "Panou Crypto", search: "Căutare monedă..." }
};

document.getElementById("themeToggle").onclick = () =>
  document.body.classList.toggle("dark");

document.getElementById("langSelect").onchange = e => applyLang(e.target.value);

function applyLang(l) {
  document.getElementById("siteTitle").innerText = langData[l].title;
  document.getElementById("searchInput").placeholder = langData[l].search;
}

const coins = [
  { name: "Bitcoin", symbol: "BTC" },
  { name: "Ethereum", symbol: "ETH" },
  { name: "Solana", symbol: "SOL" }
];

function renderCoins(list) {
  document.getElementById("coinGrid").innerHTML = list
    .map(c => `<div class='coin-card'><h3>${c.name}</h3><p>${c.symbol}</p></div>`)
    .join("");
}

renderCoins(coins);

document.getElementById("searchInput").oninput = e => {
  const q = e.target.value.toLowerCase();
  renderCoins(coins.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.symbol.toLowerCase().includes(q)
  ));
};
