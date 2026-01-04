export function qs(sel, root=document){ return root.querySelector(sel); }
export function qsa(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }

export function fmtNumber(n){
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1e12) return (n/1e12).toFixed(2) + "T";
  if (abs >= 1e9) return (n/1e9).toFixed(2) + "B";
  if (abs >= 1e6) return (n/1e6).toFixed(2) + "M";
  if (abs >= 1e3) return (n/1e3).toFixed(2) + "K";
  return n.toFixed(2);
}

export function fmtMoney(n, cur="USD"){
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  const options = { style:"currency", currency: cur, maximumFractionDigits: n >= 1 ? 2 : 6 };
  try { return new Intl.NumberFormat(undefined, options).format(n); }
  catch { return (cur==="USD"?"$":"") + n.toFixed(n>=1?2:6); }
}

export function fmtPct(n){
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  const sign = n > 0 ? "+" : "";
  return sign + n.toFixed(2) + "%";
}

export function pctClass(n){
  if (n === null || n === undefined || Number.isNaN(n)) return "";
  return n >= 0 ? "up" : "down";
}

export function debounce(fn, ms=250){
  let t;
  return (...args)=>{
    clearTimeout(t);
    t=setTimeout(()=>fn(...args), ms);
  };
}

export function byId(id){
  return id ? document.getElementById(id) : null;
}

export function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }

export function safeUrl(url){
  if (!url) return null;
  try{
    const u = new URL(url, location.href);
    return u.href;
  }catch{ return null; }
}

export function coinImage(url){
  return url || "./assets/img/coin-placeholder.svg";
}
