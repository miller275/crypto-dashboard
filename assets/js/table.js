/* CryptoWatch — table.js (coins table + pagination + filters) */
(function () {
  const NS = (window.CryptoWatch = window.CryptoWatch || {});
  NS.state = NS.state || {};
  NS.state.table = NS.state.table || {
    page: 1,
    perPage: 25,
    search: "",
    order: "market_cap_desc",
    vs: (localStorage.getItem("cw_vs") || "usd"),
    watchlistOnly: false
  };

  function locale() {
    const lang = (NS.state && NS.state.lang) || "en";
    return NS.lang ? NS.lang.locale(lang) : (lang === "ru" ? "ru-RU" : "en-US");
  }

  function fmtCompact(n) {
    if (n === null || n === undefined || Number.isNaN(Number(n))) return "—";
    try {
      return new Intl.NumberFormat(locale(), { notation: "compact", maximumFractionDigits: 2 }).format(Number(n));
    } catch { return String(n); }
  }

  function fmtCurrency(n) {
    if (n === null || n === undefined || Number.isNaN(Number(n))) return "—";
    const vs = (NS.state.table && NS.state.table.vs) || "usd";
    const cur = vs.toUpperCase();
    try {
      return new Intl.NumberFormat(locale(), { style: "currency", currency: cur, maximumFractionDigits: n < 1 ? 6 : 2 }).format(Number(n));
    } catch {
      return `${cur} ${Number(n).toFixed(2)}`;
    }
  }

  function fmtPct(n) {
    if (n === null || n === undefined || Number.isNaN(Number(n))) return "—";
    const val = Number(n);
    const sign = val > 0 ? "+" : "";
    return `${sign}${val.toFixed(2)}%`;
  }

  function badgeClass(n) {
    if (n === null || n === undefined || Number.isNaN(Number(n))) return "";
    return Number(n) >= 0 ? "up" : "down";
  }

  function filterCoins(all) {
    const st = NS.state.table;
    let arr = Array.isArray(all) ? all.slice() : [];

    const q = (st.search || "").trim().toLowerCase();
    if (q) {
      arr = arr.filter(c => (c.name || "").toLowerCase().includes(q) || (c.symbol || "").toLowerCase().includes(q));
    }

    if (st.watchlistOnly && NS.watchlist) {
      const wl = new Set(NS.watchlist.list());
      arr = arr.filter(c => wl.has(c.id));
    }

    return arr;
  }

  function paginate(arr) {
    const st = NS.state.table;
    const total = arr.length;
    const per = Number(st.perPage) || 25;
    const pages = Math.max(1, Math.ceil(total / per));
    if (st.page > pages) st.page = pages;
    if (st.page < 1) st.page = 1;
    const start = (st.page - 1) * per;
    return { page: st.page, pages, per, total, items: arr.slice(start, start + per) };
  }

  function renderRows(items) {
    const tbody = document.getElementById("coins-table-body");
    const mobile = document.getElementById("coins-mobile");
    if (!tbody || !mobile) return;

    tbody.innerHTML = "";
    mobile.innerHTML = "";

    const wl = NS.watchlist ? new Set(NS.watchlist.list()) : new Set();

    // desktop table
    const frag = document.createDocumentFragment();
    for (const c of items) {
      const tr = document.createElement("tr");
      tr.setAttribute("data-coin-id", c.id);

      const change1h = c.price_change_percentage_1h_in_currency;
      const change24h = c.price_change_percentage_24h_in_currency;
      const change7d = c.price_change_percentage_7d_in_currency;

      tr.innerHTML = `
        <td class="rank">${c.market_cap_rank ?? "—"}</td>
        <td>
          <div class="coin-cell">
            <img class="coin-logo" src="${c.image || ""}" alt="${c.symbol || ""}" />
            <div>
              <div style="font-weight:900">${c.name || ""}</div>
              <div class="muted" style="font-size:12px; font-weight:800">${(c.symbol || "").toUpperCase()}</div>
            </div>
          </div>
        </td>
        <td style="font-weight:900; font-variant-numeric:tabular-nums">${fmtCurrency(c.current_price)}</td>
        <td><span class="badge ${badgeClass(change1h)}">${fmtPct(change1h)}</span></td>
        <td><span class="badge ${badgeClass(change24h)}">${fmtPct(change24h)}</span></td>
        <td><span class="badge ${badgeClass(change7d)}">${fmtPct(change7d)}</span></td>
        <td class="muted" style="font-weight:900">${fmtCompact(c.total_volume)}</td>
        <td class="muted" style="font-weight:900">${fmtCompact(c.market_cap)}</td>
        <td>
          <div class="spark">
            <canvas data-spark="${c.id}" style="width:120px;height:34px"></canvas>
          </div>
        </td>
        <td>
          <button class="btn icon-btn star ${wl.has(c.id) ? "active" : ""}" data-action="star" title="Watchlist">
            <i class="fa-solid fa-star"></i>
          </button>
          <a class="btn icon-btn" href="coin.html?id=${encodeURIComponent(c.id)}" title="Open">
            <i class="fa-solid fa-up-right-from-square"></i>
          </a>
        </td>
      `;
      frag.appendChild(tr);

      // mobile card
      const card = document.createElement("div");
      card.className = "surface mobile-card";
      card.setAttribute("data-coin-id", c.id);
      card.innerHTML = `
        <img class="coin-logo" src="${c.image || ""}" alt="${c.symbol || ""}" />
        <div>
          <div class="name">${c.name || ""}</div>
          <div class="sym">${(c.symbol || "").toUpperCase()} • #${c.market_cap_rank ?? "—"}</div>
          <div style="margin-top:8px; display:flex; gap:8px; flex-wrap:wrap">
            <span class="badge ${badgeClass(change24h)}">24h ${fmtPct(change24h)}</span>
            <span class="badge ${badgeClass(change7d)}">7d ${fmtPct(change7d)}</span>
          </div>
        </div>
        <div class="right">
          <div class="price">${fmtCurrency(c.current_price)}</div>
          <div class="muted" style="font-size:12px; font-weight:900; margin-top:6px">${fmtCompact(c.market_cap)}</div>
          <div style="margin-top:10px; display:flex; justify-content:flex-end; gap:8px">
            <button class="btn icon-btn star ${wl.has(c.id) ? "active" : ""}" data-action="star" title="Watchlist"><i class="fa-solid fa-star"></i></button>
            <a class="btn icon-btn" href="coin.html?id=${encodeURIComponent(c.id)}" title="Open"><i class="fa-solid fa-up-right-from-square"></i></a>
          </div>
        </div>
      `;
      mobile.appendChild(card);
    }
    tbody.appendChild(frag);

    if (NS.charts) NS.charts.renderSparklines(items);
  }

  function renderPager(meta) {
    const pager = document.getElementById("pager");
    const info = document.getElementById("pager-info");
    if (!pager || !info) return;

    const { page, pages, per, total } = meta;
    const start = total === 0 ? 0 : (page - 1) * per + 1;
    const end = Math.min(total, page * per);

    info.textContent = `${start}–${end} / ${total}`;

    const btn = (label, p, disabled=false) => {
      const b = document.createElement("button");
      b.className = "btn";
      b.textContent = label;
      b.disabled = disabled;
      b.addEventListener("click", () => {
        NS.state.table.page = p;
        if (NS.table) NS.table.render();
      });
      return b;
    };

    pager.innerHTML = "";
    pager.appendChild(btn("‹", page - 1, page <= 1));

    // page window
    const win = 5;
    let from = Math.max(1, page - Math.floor(win / 2));
    let to = Math.min(pages, from + win - 1);
    from = Math.max(1, to - win + 1);

    for (let p = from; p <= to; p++) {
      const b = btn(String(p), p, false);
      if (p === page) b.classList.add("primary");
      pager.appendChild(b);
    }

    pager.appendChild(btn("›", page + 1, page >= pages));
  }

  function wireActions() {
    const tbody = document.getElementById("coins-table-body");
    const mobile = document.getElementById("coins-mobile");

    const onClick = (e) => {
      const target = e.target;
      const actionEl = target.closest("[data-action]");
      const row = target.closest("[data-coin-id]");
      if (!row) return;
      const id = row.getAttribute("data-coin-id");
      if (!id) return;

      if (actionEl && actionEl.getAttribute("data-action") === "star") {
        e.preventDefault();
        e.stopPropagation();
        if (NS.watchlist) NS.watchlist.toggle(id);
        if (NS.table) NS.table.render();
        return;
      }

      // click row/card to open coin details
      if (row.tagName.toLowerCase() !== "tr" || !actionEl) {
        // if click not on buttons/links
        if (!target.closest("a") && !target.closest("button")) {
          window.location.href = `coin.html?id=${encodeURIComponent(id)}`;
        }
      }
    };

    if (tbody) tbody.addEventListener("click", onClick);
    if (mobile) mobile.addEventListener("click", onClick);
  }

  function render() {
    const all = NS.state.marketCoins || [];
    const filtered = filterCoins(all);
    const meta = paginate(filtered);

    const count = document.getElementById("coins-count");
    if (count) count.textContent = String(filtered.length);

    renderRows(meta.items);
    renderPager(meta);
  }

  function initControls() {
    const search = document.getElementById("coin-search");
    const sort = document.getElementById("coin-sort");
    const vs = document.getElementById("vs-currency");
    const rows = document.getElementById("rows-per-page");
    const wlBtn = document.getElementById("watchlist-only");
    const refresh = document.getElementById("refresh-data");

    if (search) {
      search.addEventListener("input", () => {
        NS.state.table.search = search.value;
        NS.state.table.page = 1;
        render();
      });
    }

    if (rows) {
      rows.value = String(NS.state.table.perPage);
      rows.addEventListener("change", () => {
        NS.state.table.perPage = Number(rows.value) || 25;
        NS.state.table.page = 1;
        render();
      });
    }

    if (wlBtn) {
      wlBtn.addEventListener("click", () => {
        NS.state.table.watchlistOnly = !NS.state.table.watchlistOnly;
        wlBtn.setAttribute("aria-pressed", String(NS.state.table.watchlistOnly));
        wlBtn.classList.toggle("primary", NS.state.table.watchlistOnly);
        NS.state.table.page = 1;
        render();
      });
    }

    if (sort) {
      sort.value = NS.state.table.order;
      sort.addEventListener("change", async () => {
        NS.state.table.order = sort.value;
        NS.state.table.page = 1;
        if (NS.app && NS.app.loadMarket) await NS.app.loadMarket({ force: true });
        else render();
      });
    }

    if (vs) {
      vs.value = NS.state.table.vs;
      vs.addEventListener("change", async () => {
        NS.state.table.vs = vs.value;
        try { localStorage.setItem("cw_vs", vs.value); } catch {}
        NS.state.table.page = 1;
        if (NS.app && NS.app.loadMarket) await NS.app.loadMarket({ force: true });
        else render();
      });
    }

    if (refresh) {
      refresh.addEventListener("click", async () => {
        if (NS.api) NS.api.clearCaches();
        if (NS.app && NS.app.loadAll) await NS.app.loadAll({ force: true });
      });
    }

    if (NS.bus) {
      NS.bus.on("langchange", () => render());
      NS.bus.on("themechange", () => render());
    }
  }

  NS.table = { render, wireActions, initControls };
})();
