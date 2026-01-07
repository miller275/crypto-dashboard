const nf0 = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });
const nf2 = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });
export function fmtNum(n){
  if(n === null || n === undefined || Number.isNaN(Number(n))) return "—";
  const x = Number(n);
  return Math.abs(x) >= 1e9 ? (x/1e9).toFixed(2)+"B"
    : Math.abs(x) >= 1e6 ? (x/1e6).toFixed(2)+"M"
    : Math.abs(x) >= 1e3 ? (x/1e3).toFixed(2)+"K"
    : nf2.format(x);
}
export function fmtInt(n){
  if(n === null || n === undefined || Number.isNaN(Number(n))) return "—";
  return nf0.format(Number(n));
}
export function fmtUsd(n){
  if(n === null || n === undefined || Number.isNaN(Number(n))) return "—";
  const x = Number(n);
  const digits = x >= 1 ? 2 : (x >= 0.01 ? 4 : 8);
  return x.toLocaleString(undefined, { style:"currency", currency:"USD", maximumFractionDigits:digits });
}
export function fmtPct(n){
  if(n === null || n === undefined || Number.isNaN(Number(n))) return "—";
  const x = Number(n);
  const sign = x > 0 ? "+" : "";
  return sign + x.toFixed(2) + "%";
}
export function clsPct(n){
  if(n === null || n === undefined || Number.isNaN(Number(n))) return "";
  const x = Number(n);
  return x >= 0 ? "good" : "bad";
}
export function fmtTime(iso){
  if(!iso) return "—";
  try{
    const d = new Date(iso);
    return d.toLocaleString(undefined, { year:"numeric", month:"short", day:"2-digit", hour:"2-digit", minute:"2-digit" });
  }catch(_){ return "—"; }
}