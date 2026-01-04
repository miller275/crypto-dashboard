import { Store } from "./store.js";
import { t, applyI18n } from "./i18n.js";
import { fmtMoney, fmtNumber, fmtPct, pctClass, coinImage, safeUrl } from "./utils.js";
import { sparkline, bigLineChart } from "./charts.js";

function el(tag, attrs={}, children=[]){
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k,v])=>{
    if (k === "class") e.className = v;
    else if (k.startsWith("on") && typeof v === "function") e.addEventListener(k.slice(2), v);
    else if (v !== null && v !== undefined) e.setAttribute(k, String(v));
  });
  children.forEach(c=>{
    if (typeof c === "string") e.appendChild(document.createTextNode(c));
    else if (c) e.appendChild(c);
  });
  return e;
}

export function renderTable(tbody, items, opts){
  const { watchOnly=false, onOpenCoin, onQuickView } = opts || {};
  const s = Store.get();
  const watch = new Set(s.watchlist || []);
  tbody.innerHTML = "";

  const rows = watchOnly ? items.filter(c=>watch.has(c.id)) : items;

  for (const c of rows){
    const tr = document.createElement("tr");

    const img = el("img", { src: coinImage(c.image), alt: c.symbol, loading:"lazy" });
    img.onerror = () => { img.src = "./assets/img/coin-placeholder.svg"; };

    const coinCell = el("td", {}, [
      el("div", { class:"coin" }, [
        img,
        el("div", {}, [
          el("div", { class:"name" }, [c.name || "—"]),
          el("div", { class:"sym" }, [c.symbol || "—"]),
        ])
      ])
    ]);

    const pct = (v)=> el("span", { class: `pct ${pctClass(v)}` }, [fmtPct(v)]);
    const td = (cls, txt)=> el("td", { class: cls||"" }, [txt]);

    tr.appendChild(td("center", String(c.rank ?? "—")));
    tr.appendChild(coinCell);
    tr.appendChild(td("", fmtMoney(c.price, s.currency)));

    tr.appendChild(td("center", ""));
    tr.lastChild.appendChild(pct(c.change_1h));

    tr.appendChild(td("center", ""));
    tr.lastChild.appendChild(pct(c.change_24h));

    tr.appendChild(td("center", ""));
    tr.lastChild.appendChild(pct(c.change_7d));

    tr.appendChild(td("", fmtNumber(c.volume_24h)));
    tr.appendChild(td("", fmtNumber(c.market_cap)));

    const sparkTd = el("td", { class:"right" }, [
      el("div", { class:"spark" }, [
        el("canvas", { width:"140", height:"36", "data-coin": String(c.id) })
      ])
    ]);
    tr.appendChild(sparkTd);

    const actions = el("td", { class:"right" }, [
      el("div", { class:"actions" }, [
        el("button", {
          class: "icon-btn" + (watch.has(c.id) ? " active" : ""),
          title: t("watchlist"),
          onClick: ()=>{
            const next = Store.toggleWatch(c.id);
            // quick UI state flip
            if (watch.has(c.id)) watch.delete(c.id); else watch.add(c.id);
            actions.querySelector(".icon-btn").classList.toggle("active");
          }
        }, ["★"]),
        el("button", {
          class:"icon-btn",
          title: t("details"),
          onClick: ()=> onQuickView && onQuickView(c)
        }, ["↗"]),
      ])
    ]);
    tr.appendChild(actions);

    tbody.appendChild(tr);

    // sparkline
    const canvas = sparkTd.querySelector("canvas");
    sparkline(canvas, c.sparkline_7d || []);
  }

  applyI18n();
}

export function openModal(state){
  const backdrop = document.getElementById("modalBackdrop");
  const title = document.getElementById("modalTitle");
  const body = document.getElementById("modalBody");
  const btnOpen = document.getElementById("modalOpen");

  const s = Store.get();
  const c = state.coin;

  title.textContent = `${t("modal_title")} — ${c.name} (${c.symbol})`;
  body.innerHTML = "";

  const img = el("img", { src: coinImage(c.image), style:"width:44px;height:44px;border-radius:14px" });
  img.onerror = () => { img.src = "./assets/img/coin-placeholder.svg"; };

  const header = el("div", { class:"hstack", style:"justify-content:space-between" }, [
    el("div", { class:"hstack" }, [
      img,
      el("div", {}, [
        el("div", { style:"font-weight:900;font-size:18px" }, [c.name]),
        el("div", { style:"color:var(--muted);font-weight:700" }, [c.symbol])
      ]),
      el("span", { class:"badge" }, [`#${c.rank ?? "—"}`])
    ]),
    el("div", { style:"font-weight:900;font-size:20px" }, [fmtMoney(c.price, s.currency)])
  ]);

  const stats = el("div", { class:"grid cols-3", style:"margin-top:12px" }, [
    statCard(t("market_cap"), fmtNumber(c.market_cap)),
    statCard(t("volume_24h"), fmtNumber(c.volume_24h)),
    statCard(t("supply"), fmtNumber(c.circulating_supply)),
  ]);

  const chartWrap = el("div", { class:"stat", style:"margin-top:12px" }, [
    el("div", { class:"k" }, [t("chart")]),
    el("div", { style:"height:260px;margin-top:10px" }, [
      el("canvas", { id:"modalChart" })
    ])
  ]);

  body.appendChild(header);
  body.appendChild(stats);
  body.appendChild(chartWrap);

  // chart
  const series = (c.historySeries && c.historySeries.length) ? c.historySeries : (c.sparklineSeries || []);
  bigLineChart(document.getElementById("modalChart"), series);

  btnOpen.onclick = ()=>{
    location.href = `coin.html?id=${encodeURIComponent(c.id)}`;
  };

  backdrop.style.display = "flex";
}

function statCard(k, v){
  const d = document.createElement("div");
  d.className = "stat";
  d.innerHTML = `<div class="k"></div><div class="v"></div>`;
  d.querySelector(".k").textContent = k;
  d.querySelector(".v").textContent = v;
  return d;
}

export function closeModal(){
  const backdrop = document.getElementById("modalBackdrop");
  backdrop.style.display = "none";
}
