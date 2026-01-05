import { qs } from "./utils.js";

export function renderTradingView({ baseSymbol, interval="60", theme="dark" }){
  const wrap = qs("#tvChart");
  if (!wrap) return;
  wrap.innerHTML = `<div id="tv_container" style="height:520px;"></div>`;
  const symbol = `BINANCE:${baseSymbol}USDT`;

  const script = document.createElement("script");
  script.type = "text/javascript";
  script.src = "https://s3.tradingview.com/tv.js";
  script.onload = () => {
    // TradingView is a global from the script above
    // eslint-disable-next-line no-undef
    new TradingView.widget({
      autosize: true,
      symbol,
      interval,
      timezone: "Etc/UTC",
      theme,
      style: "1",
      locale: "ru",
      toolbar_bg: "rgba(0,0,0,0)",
      enable_publishing: false,
      hide_side_toolbar: false,
      allow_symbol_change: true,
      container_id: "tv_container",
      withdateranges: true,
      hide_volume: false,
      details: true
    });
  };
  document.body.appendChild(script);

  const badge = qs("#tvSymbol");
  if (badge) badge.textContent = symbol;
}
