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

  NS.ui = { init, hideLoader, showLoader, toast, fmtTime };
})();
