import { fmtUSD, fmtNum, fmtPct, clsPct } from "./utils.js";
import { drawSparkline } from "./sparkline.js";

export const UI = {
  renderKPIs(global){
    const mcap = global?.data?.quote?.USD?.total_market_cap ?? global?.total_market_cap;
    const vol = global?.data?.quote?.USD?.total_volume_24h ?? global?.total_volume_24h;
    const btcDom = global?.data?.btc_dominance ?? global?.btc_dominance;
    const ethDom = global?.data?.eth_dominance ?? global?.eth_dominance;

    const set = (id, val) => { const el = document.querySelector(id); if (el) el.textContent = val; };
    set("#kpiMcap", fmtUSD(mcap));
    set("#kpiVol", fmtUSD(vol));
    set("#kpiDom", `${(btcDom ?? 0).toFixed(1)}% / ${(ethDom ?? 0).toFixed(1)}%`);
  },

  renderFearGreed(fng){
    const v = Number(fng?.value ?? 0);
    const label = fng?.value_classification ?? "—";
    const ts = fng?.timestamp ? new Date(Number(fng.timestamp)*1000) : (fng?.updated_at ? new Date(fng.updated_at) : null);

    const ring = document.querySelector("#fngRing");
    if (ring){
      const deg = Math.max(0, Math.min(360, (v/100)*360));
      ring.style.setProperty("--deg", `${deg}deg`);
      const b = ring.querySelector("b"); if (b) b.textContent = String(v || "—");
    }
    const l = document.querySelector("#fngLabel"); if (l) l.textContent = label;
    const t = document.querySelector("#fngTime"); if (t) t.textContent = ts ? ts.toLocaleString("ru-RU") : "—";
  },

  renderTrending(list){
    const root = document.querySelector("#trendingList");
    if (!root) return;
    root.innerHTML = "";
    (list?.items ?? []).slice(0, 8).forEach(it=>{
      const el = document.createElement("a");
      el.className = "trend-item";
      el.href = `coin.html?id=${encodeURIComponent(it.id)}&p=${encodeURIComponent(it.page ?? 1)}`;
      el.innerHTML = `
        <div>
          <div class="name">${it.name} (${it.symbol})</div>
          <span class="sub">Цена: ${fmtNum(it.price, 6)} $</span>
        </div>
        <span class="badge ${clsPct(it.change24h)}">${fmtPct(it.change24h)}</span>
      `;
      root.appendChild(el);
    });
  },

  renderNews(news){
    const root = document.querySelector("#newsList");
    if (!root) return;
    root.innerHTML = "";
    (news?.items ?? []).slice(0, 6).forEach(n=>{
      const item = document.createElement("a");
      item.className = "item";
      item.href = n.url || "#";
      item.target = "_blank";
      item.rel = "noopener";
      const dt = n.published_at ? new Date(n.published_at) : null;
      item.innerHTML = `
        <div>
          <div class="t">${n.title || "—"}</div>
          <div class="m">${n.source || "News"} • ${dt ? dt.toLocaleString("ru-RU") : ""}</div>
        </div>
        <div class="iconbtn">↗</div>
      `;
      root.appendChild(item);
    });
  },

  renderTable(pageData){
    const tbody = document.querySelector("#coinsTbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    (pageData?.items ?? []).forEach(coin=>{
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>
          <div class="coin">
            <img src="${coin.image || 'assets/img/coin.svg'}" alt="">
            <div>
              <div class="nm">${coin.name}</div>
              <span class="sy">#${coin.rank} • ${coin.symbol}</span>
            </div>
          </div>
        </td>
        <td class="num">${fmtNum(coin.price, coin.price < 1 ? 6 : 2)} $</td>
        <td><span class="${clsPct(coin.change1h)}">${fmtPct(coin.change1h)}</span></td>
        <td><span class="${clsPct(coin.change24h)}">${fmtPct(coin.change24h)}</span></td>
        <td><span class="${clsPct(coin.change7d)}">${fmtPct(coin.change7d)}</span></td>
        <td class="num">${fmtUSD(coin.marketCap)}</td>
        <td class="num">${fmtUSD(coin.volume24h)}</td>
        <td class="num">${coin.circulatingSupply ? fmtNum(coin.circulatingSupply, 0) : "—"} ${coin.symbol}</td>
        <td><canvas class="spark"></canvas></td>
      `;
      tr.addEventListener("click", ()=>{
        const p = pageData.page ?? 1;
        location.href = `coin.html?id=${encodeURIComponent(coin.id)}&p=${encodeURIComponent(p)}`;
      });
      tbody.appendChild(tr);
      const canvas = tr.querySelector("canvas.spark");
      drawSparkline(canvas, coin.sparkline7d);
    });
  },

  renderPager(meta, page){
    const info = document.querySelector("#pagerInfo");
    const btnPrev = document.querySelector("#btnPrev");
    const btnNext = document.querySelector("#btnNext");
    if (info) info.textContent = `Стр. ${page} / ${meta?.pages ?? "—"} • Всего: ${meta?.total ?? "—"}`;
    if (btnPrev) btnPrev.disabled = page <= 1;
    if (btnNext) btnNext.disabled = meta?.pages ? page >= meta.pages : false;
  },

  renderCoinHeader(coin){
    const img = document.querySelector("#coinImg");
    const nm = document.querySelector("#coinName");
    const sub = document.querySelector("#coinSub");
    const price = document.querySelector("#coinPrice");
    const priceSub = document.querySelector("#coinPriceSub");

    if (img) img.src = coin.image || "assets/img/coin.svg";
    if (nm) nm.textContent = coin.name || "—";
    if (sub) sub.textContent = `#${coin.rank ?? "—"} • ${coin.symbol ?? ""}`;
    if (price) price.textContent = `${fmtNum(coin.price, coin.price < 1 ? 6 : 2)} $`;
    if (priceSub) priceSub.innerHTML = `<span class="${clsPct(coin.change24h)}">${fmtPct(coin.change24h)}</span> • 24ч`;
  },

  renderCoinStats(coin){
    const set = (id, v) => { const el = document.querySelector(id); if (el) el.textContent = v; };
    set("#statMcap", fmtUSD(coin.marketCap));
    set("#statVol", fmtUSD(coin.volume24h));
    set("#statSupply", coin.circulatingSupply ? `${fmtNum(coin.circulatingSupply,0)} ${coin.symbol}` : "—");
    set("#statTotal", coin.totalSupply ? `${fmtNum(coin.totalSupply,0)} ${coin.symbol}` : "—");
    set("#statMax", coin.maxSupply ? `${fmtNum(coin.maxSupply,0)} ${coin.symbol}` : "—");
    set("#statChg1h", fmtPct(coin.change1h));
    set("#statChg24h", fmtPct(coin.change24h));
    set("#statChg7d", fmtPct(coin.change7d));
    set("#statChg30d", fmtPct(coin.change30d));
  },

  renderDescription(details){
    const el = document.querySelector("#coinDesc");
    if (!el) return;
    const txt = details?.description || "";
    el.textContent = (txt && txt.trim().length>0) ? txt.trim() : "Описание пока недоступно.";
  }
};
