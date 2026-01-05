export function fmtUSD(v){
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  const abs = Math.abs(v);
  const sign = v < 0 ? "-" : "";
  const n = abs;
  if (n >= 1e12) return `${sign}$${(n/1e12).toFixed(2)} трлн`;
  if (n >= 1e9)  return `${sign}$${(n/1e9).toFixed(2)} млрд`;
  if (n >= 1e6)  return `${sign}$${(n/1e6).toFixed(2)} млн`;
  if (n >= 1e3)  return `${sign}$${(n/1e3).toFixed(2)} тыс`;
  return `${sign}$${n.toFixed(2)}`;
}
export function fmtNum(v, digits=2){
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return Number(v).toLocaleString("ru-RU", { maximumFractionDigits: digits, minimumFractionDigits: digits });
}
export function fmtPct(v){
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  const n = Number(v);
  return (n >= 0 ? "+" : "") + n.toFixed(2) + "%";
}
export function clsPct(v){
  if (v === null || v === undefined || Number.isNaN(v)) return "";
  return Number(v) >= 0 ? "up" : "down";
}
export function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }
export function getParam(name){ return new URL(location.href).searchParams.get(name); }
export function setParam(name, value){
  const u = new URL(location.href);
  if (value === null || value === undefined) u.searchParams.delete(name);
  else u.searchParams.set(name, String(value));
  history.replaceState({}, "", u.toString());
}
export function clamp(n, a, b){ return Math.min(b, Math.max(a, n)); }
export function isDashboard(){ return !!document.querySelector("#coinsTbody"); }
export function isCoinPage(){ return !!document.querySelector("#tvChart"); }
export function qs(sel, root=document){ return root.querySelector(sel); }
