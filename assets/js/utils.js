// Utility helpers (no dependencies)
export const Utils = {
  qs(sel, root=document){ return root.querySelector(sel); },
  qsa(sel, root=document){ return Array.from(root.querySelectorAll(sel)); },

  getParam(name){
    const u = new URL(location.href);
    return u.searchParams.get(name);
  },

  debounce(fn, wait=200){
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  },

  clamp(n, a, b){ return Math.min(b, Math.max(a, n)); },

  fmtCompact(n, currency){
    if (n === null || n === undefined || Number.isNaN(n)) return "—";
    const abs = Math.abs(n);
    const opts = currency
      ? { style:"currency", currency, maximumFractionDigits: abs < 1 ? 6 : (abs < 100 ? 4 : 2) }
      : { notation:"compact", maximumFractionDigits: 2 };
    return new Intl.NumberFormat(undefined, opts).format(n);
  },

  fmtMoney(n, currency="USD"){
    if (n === null || n === undefined || Number.isNaN(n)) return "—";
    const abs = Math.abs(n);
    const digits = abs < 1 ? 6 : (abs < 100 ? 4 : 2);
    return new Intl.NumberFormat(undefined, { style:"currency", currency, maximumFractionDigits: digits }).format(n);
  },

  fmtNumber(n, maxDigits=2){
    if (n === null || n === undefined || Number.isNaN(n)) return "—";
    return new Intl.NumberFormat(undefined, { maximumFractionDigits: maxDigits }).format(n);
  },

  fmtPercent(n, digits=2){
    if (n === null || n === undefined || Number.isNaN(n)) return "—";
    const sign = n > 0 ? "+" : "";
    return sign + new Intl.NumberFormat(undefined, { maximumFractionDigits: digits }).format(n) + "%";
  },

  timeAgo(iso){
    if (!iso) return "—";
    const t = new Date(iso).getTime();
    const diff = Math.max(0, Date.now() - t);
    const m = Math.floor(diff/60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m/60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h/24);
    return `${d}d ago`;
  },

  safeText(text){
    return (text ?? "").toString();
  },

  safeHTML(html){
    // very small sanitizer: strips scripts/iframes and on* handlers
    const tmp = document.createElement("div");
    tmp.innerHTML = html ?? "";
    tmp.querySelectorAll("script, iframe").forEach(n => n.remove());
    tmp.querySelectorAll("*").forEach(el => {
      [...el.attributes].forEach(a => {
        if (a.name.toLowerCase().startsWith("on")) el.removeAttribute(a.name);
      });
    });
    return tmp.innerHTML;
  }
};
