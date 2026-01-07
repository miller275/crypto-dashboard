// format.js
export const fmt = {
  num(n, digits = 2) {
    if (n === null || n === undefined || Number.isNaN(n)) return "—";
    const abs = Math.abs(n);
    const d = abs >= 100 ? 2 : digits;
    return new Intl.NumberFormat(undefined, { maximumFractionDigits: d }).format(n);
  },
  money(n, currency = "USD") {
    if (n === null || n === undefined || Number.isNaN(n)) return "—";
    return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 2 }).format(n);
  },
  compactMoney(n, currency = "USD") {
    if (n === null || n === undefined || Number.isNaN(n)) return "—";
    return new Intl.NumberFormat(undefined, { style: "currency", currency, notation: "compact", maximumFractionDigits: 2 }).format(n);
  },
  percent(n) {
    if (n === null || n === undefined || Number.isNaN(n)) return "—";
    const sign = n > 0 ? "+" : "";
    return `${sign}${n.toFixed(2)}%`;
  },
  dateTime(ts) {
    if (!ts) return "—";
    const d = new Date(ts);
    return d.toLocaleString();
  },
  date(ts) {
    if (!ts) return "—";
    const d = new Date(ts);
    return d.toLocaleDateString();
  }
};

export function clsForChange(n){
  if (n === null || n === undefined || Number.isNaN(n)) return "";
  return n >= 0 ? "positive" : "negative";
}
