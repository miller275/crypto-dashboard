/* CryptoWatch — watchlist.js */
(function () {
  const NS = (window.CryptoWatch = window.CryptoWatch || {});
  const KEY = "cw_watchlist";

  function read() {
    try {
      const raw = localStorage.getItem(KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr.filter(Boolean) : [];
    } catch { return []; }
  }

  function write(arr) {
    try { localStorage.setItem(KEY, JSON.stringify(arr)); } catch {}
    if (NS.bus) NS.bus.emit("watchlistchange", arr.slice());
  }

  function has(id) { return read().includes(id); }

  function toggle(id) {
    const arr = read();
    const idx = arr.indexOf(id);
    if (idx >= 0) {
      arr.splice(idx, 1);
      write(arr);
      if (NS.ui && NS.lang) NS.ui.toast(NS.lang.t("toast-removed"));
      return false;
    } else {
      arr.unshift(id);
      write(arr);
      if (NS.ui && NS.lang) NS.ui.toast(NS.lang.t("toast-added"));
      return true;
    }
  }

  function list() { return read(); }

  // Optional init hook for pages that want it
  function init() {
    // No-op by default; kept for backward compatibility
    return true;
  }

  NS.watchlist = { has, toggle, list, init };
})();
