import { Utils } from "./utils.js";
import { I18N } from "./i18n.js";

function clsDelta(n){
  if (n === null || n === undefined || Number.isNaN(n)) return "badge";
  return `badge ${n >= 0 ? "pos" : "neg"}`;
}

function renderSparkline(canvas, series, isUp=true){
  const c = canvas;
  const ctx = c.getContext("2d");
  const w = c.width = 140 * devicePixelRatio;
  const h = c.height = 38 * devicePixelRatio;
  c.style.width = "140px";
  c.style.height = "38px";

  ctx.clearRect(0,0,w,h);
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--c-color-surface-2").trim() || "#F8FAFD";
  ctx.beginPath();
  const r = 10 * devicePixelRatio;
  // rounded rect bg
  ctx.moveTo(r,0);
  ctx.arcTo(w,0,w,h,r);
  ctx.arcTo(w,h,0,h,r);
  ctx.arcTo(0,h,0,0,r);
  ctx.arcTo(0,0,w,0,r);
  ctx.closePath();
  ctx.fill();

  if (!Array.isArray(series) || series.length < 2) return;

  const min = Math.min(...series);
  const max = Math.max(...series);
  const pad = 6 * devicePixelRatio;

  const normY = (v) => {
    if (max === min) return h/2;
    return (h - pad) - ((v - min) / (max - min)) * (h - pad*2);
  };

  ctx.lineWidth = 2 * devicePixelRatio;
  ctx.strokeStyle = isUp
    ? (getComputedStyle(document.documentElement).getPropertyValue("--c-color-positive").trim() || "#16C784")
    : (getComputedStyle(document.documentElement).getPropertyValue("--c-color-negative").trim() || "#EA3943");

  ctx.beginPath();
  for (let i=0;i<series.length;i++){
    const x = pad + (i/(series.length-1))*(w - pad*2);
    const y = normY(series[i]);
    if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  }
  ctx.stroke();
}

export const UI = {
  toast(msg){
    const t = Utils.qs("#toast");
    const tx = Utils.qs("#toastText");
    if (!t || !tx) return;
    tx.textContent = msg;
    t.classList.add("show");
    clearTimeout(UI._toastTimer);
    UI._toastTimer = setTimeout(() => t.classList.remove("show"), 1800);
  },

  renderHeader({source, updatedAt}){
    const u = Utils.qs("#updatedLine");
    const b = Utils.qs("#sourceBadge");
    if (u) u.textContent = `${I18N.get()==="ru" ? "Обновлено" : "Updated"}: ${new Date(updatedAt).toLocaleString()}`;
    if (b) b.textContent = source.toUpperCase();
  },

  renderMarketOverview(global){
    if (!global) return;
    const mcapValue = Utils.fmtCompact(global.marketCap, null);
    Utils.qs("#kpiMcap").textContent = (typeof global.marketCap === "number") ? `$${mcapValue}` : mcapValue;

    const mcDelta = (typeof global.marketCapChange24h === "number")
      ? Utils.fmtPercent(global.marketCapChange24h, 2)
      : "—";
    const mcDeltaEl = Utils.qs("#kpiMcapDelta");
    mcDeltaEl.textContent = mcDelta;
    mcDeltaEl.className = (typeof global.marketCapChange24h === "number")
      ? `delta ${(global.marketCapChange24h ?? 0) >=0 ? "pos" : "neg"}`
      : "delta";

    const volValue = Utils.fmtCompact(global.volume24h, null);
    Utils.qs("#kpiVol").textContent = (typeof global.volume24h === "number") ? `$${volValue}` : volValue;
    Utils.qs("#kpiVolDelta").textContent = I18N.get()==="ru" ? "за 24ч" : "last 24h";
    Utils.qs("#kpiVolDelta").className = "delta";

    const dom = `${Utils.fmtNumber(global.btcDominance,1)}% / ${Utils.fmtNumber(global.ethDominance,1)}%`;
    Utils.qs("#kpiDom").textContent = dom;
    Utils.qs("#kpiDomDelta").textContent = I18N.get()==="ru" ? "доля рынка" : "market share";
    Utils.qs("#kpiDomDelta").className = "delta";
  },

  renderFearGreed(fng){
    const item = (fng?.data && fng.data[0]) ? fng.data[0] : null;
    if (!item) return;
    Utils.qs("#fngScore").textContent = item.value ?? "—";
    Utils.qs("#fngLabel").textContent = item.value_classification ?? "—";
    const ts = item.timestamp ? new Date(parseInt(item.timestamp,10)*1000) : null;
    Utils.qs("#fngTime").textContent = ts ? ts.toLocaleString() : "—";
  },

  renderTrending(coins){
    const el = Utils.qs("#trendingList");
    if (!el) return;
    const top = [...coins]
      .filter(c => typeof c.change24h === "number")
      .sort((a,b) => Math.abs(b.change24h) - Math.abs(a.change24h))
      .slice(0, 6);

    el.innerHTML = top.map(c => {
      const cls = c.change24h >= 0 ? "pos" : "neg";
      const delta = Utils.fmtPercent(c.change24h, 2);
      return `
        <a href="coin.html?id=${encodeURIComponent(c.id)}">
          <div>
            <div class="title">${Utils.safeText(c.name)} <span class="muted">(${Utils.safeText(c.symbol)})</span></div>
            <div class="meta">${I18N.get()==="ru" ? "Цена" : "Price"}: ${Utils.fmtMoney(c.price)}</div>
          </div>
          <span class="badge ${cls}">${delta}</span>
        </a>
      `;
    }).join("");

    if (!top.length) el.innerHTML = `<div class="muted">${I18N.get()==="ru" ? "Нет данных" : "No data"}</div>`;
  },

  renderNews(news){
    const el = Utils.qs("#newsList");
    if (!el) return;
    // Keep this block compact (especially on laptop screens)
    const items = (news?.items || []).slice(0, 5);
    el.innerHTML = items.map(n => `
      <a href="${n.url}" target="_blank" rel="noopener">
        <div style="max-width: 72%">
          <div class="title">${Utils.safeText(n.title)}</div>
          <div class="meta">${Utils.safeText(n.source || "")} • ${n.publishedAt ? new Date(n.publishedAt).toLocaleString() : ""}</div>
        </div>
        <span class="badge">↗</span>
      </a>
    `).join("");

    if (!items.length) el.innerHTML = `<div class="muted">${I18N.get()==="ru" ? "Новости недоступны" : "News unavailable"}</div>`;
  },

  renderCoinsTable({coins, page, perPage, query}){
    const tbody = Utils.qs("#coinsTbody");
    if (!tbody) return;

    const q = (query||"").trim().toLowerCase();
    const filtered = q
      ? coins.filter(c => (c.name||"").toLowerCase().includes(q) || (c.symbol||"").toLowerCase().includes(q))
      : coins;

    const total = filtered.length;
    const pages = Math.max(1, Math.ceil(total / perPage));
    const p = Utils.clamp(page, 1, pages);
    const start = (p-1)*perPage;
    const view = filtered.slice(start, start+perPage);

    const hint = Utils.qs("#tableHint");
    if (hint){
      hint.textContent = (I18N.get()==="ru"
        ? `Показано ${start+1}-${Math.min(start+view.length,total)} из ${total}`
        : `Showing ${start+1}-${Math.min(start+view.length,total)} of ${total}`);
    }

    const meta = Utils.qs("#pageMeta");
    if (meta){
      meta.textContent = (I18N.get()==="ru" ? `Стр. ${p} / ${pages}` : `Page ${p} / ${pages}`);
    }

    tbody.innerHTML = view.map(c => {
      const d1 = clsDelta(c.change1h);
      const d24 = clsDelta(c.change24h);
      const d7 = clsDelta(c.change7d);

      const supply = (c.supply && c.totalSupply)
        ? `${Utils.fmtNumber(c.supply,0)} / ${Utils.fmtNumber(c.totalSupply,0)}`
        : Utils.fmtNumber(c.supply,0);

      return `
        <tr data-id="${encodeURIComponent(c.id)}" style="cursor:pointer">
          <td>
            <div class="coin">
              <img src="${c.image || "assets/img/coin.svg"}" alt="${Utils.safeText(c.symbol)}" loading="lazy" onerror="this.src='assets/img/coin.svg'" />
              <div class="name">
                <b>${Utils.safeText(c.name)}</b>
                <span>#${Utils.safeText(c.rank)} • ${Utils.safeText(c.symbol)}</span>
              </div>
            </div>
          </td>
          <td>${Utils.fmtMoney(c.price)}</td>
          <td><span class="${d1}">${Utils.fmtPercent(c.change1h,2)}</span></td>
          <td><span class="${d24}">${Utils.fmtPercent(c.change24h,2)}</span></td>
          <td><span class="${d7}">${Utils.fmtPercent(c.change7d,2)}</span></td>
          <td>${Utils.fmtCompact(c.marketCap, null).replace(/^/, "$")}</td>
          <td>${Utils.fmtCompact(c.volume24h, null).replace(/^/, "$")}</td>
          <td>${supply} <span class="muted">${Utils.safeText(c.symbol)}</span></td>
          <td><canvas class="spark" data-spark="${encodeURIComponent(c.id)}"></canvas></td>
        </tr>
      `;
    }).join("");

    // Click to coin page
    Utils.qsa("tr[data-id]", tbody).forEach(tr => {
      tr.addEventListener("click", () => {
        const id = decodeURIComponent(tr.getAttribute("data-id"));
        location.href = `coin.html?id=${encodeURIComponent(id)}`;
      });
    });

    // draw sparklines (lazy-ish)
    requestAnimationFrame(() => {
      Utils.qsa("canvas[data-spark]", tbody).forEach(canvas => {
        const id = decodeURIComponent(canvas.getAttribute("data-spark"));
        const coin = view.find(x => x.id === id);
        const s = coin?.sparkline7d;
        const isUp = (coin?.change7d ?? 0) >= 0;
        try{ renderSparkline(canvas, s, isUp); }catch(_){}
      });
    });

    return { page: p, pages, total, filteredCount: total };
  }
};
