/* CryptoWatch — ui.js */
(function () {
  const NS = (window.CryptoWatch = window.CryptoWatch || {});

  function qs(sel, root=document){ return root.querySelector(sel); }

  function hideLoader() {
    const el = qs("#loading-overlay");
    if (el) el.classList.add("hidden");
  }

  function showLoader() {
    const el = qs("#loading-overlay");
    if (el) el.classList.remove("hidden");
  }

  function toast(message) {
    const t = document.createElement("div");
    t.className = "toast";
    t.textContent = message;
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = "0"; t.style.transform = "translateY(6px)"; }, 2200);
    setTimeout(() => { t.remove(); }, 2600);
  }

  function fmtTime(ts) {
    try {
      const lang = (NS.state && NS.state.lang) || "en";
      const loc = NS.lang ? NS.lang.locale(lang) : "en-US";
      const d = new Date(ts);
      return new Intl.DateTimeFormat(loc, { hour: "2-digit", minute: "2-digit" }).format(d);
    } catch { return ""; }
  }

  function init() {
    const year = qs("#year");
    if (year) year.textContent = String(new Date().getFullYear());

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") hideLoader();
    });

    // accessibility: keep language & theme in sync across pages
    if (NS.bus) {
      NS.bus.on("langchange", () => {});
      NS.bus.on("themechange", () => {});
    }
  }


  function logoFallback(symbol, name) {
    const s = String(symbol || name || "?").trim();
    const letter = (s ? s[0] : "?").toUpperCase();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#0b1220"/>
          <stop offset="1" stop-color="#374151"/>
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" ry="16" fill="url(#g)"/>
      <text x="32" y="41" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="28" font-weight="800" fill="#e5e7eb">${letter}</text>
    </svg>`;
    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
  }

  NS.ui = { init, hideLoader, showLoader, toast, fmtTime, logoFallback };
})();
