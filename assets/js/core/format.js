export function formatCurrencyUSD(value, { maxFrac = 2 } = {}) {
  if (!isFinite(value)) return '—';
  const abs = Math.abs(value);
  const frac = abs >= 1000 ? 0 : abs >= 1 ? maxFrac : 6;
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: frac,
  }).format(value);
}

export function formatCompactNumber(value) {
  if (!isFinite(value)) return '—';
  const abs = Math.abs(value);
  const fmt = new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: abs >= 1e9 ? 2 : 1 });
  return fmt.format(value);
}

export function formatNumber(value, { maxFrac = 2 } = {}) {
  if (!isFinite(value)) return '—';
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: maxFrac }).format(value);
}

export function formatPercent(value, { sign = true, maxFrac = 2 } = {}) {
  if (!isFinite(value)) return '—';
  const v = Number(value);
  const s = sign && v > 0 ? '+' : '';
  return `${s}${v.toFixed(maxFrac)}%`;
}

export function clsForPercent(value) {
  if (!isFinite(value)) return 'badge--muted';
  return value > 0 ? 'badge--pos' : value < 0 ? 'badge--neg' : 'badge--muted';
}

export function timeAgo(isoDate) {
  if (!isoDate) return '—';
  const t = new Date(isoDate).getTime();
  if (!isFinite(t)) return '—';
  const diff = Date.now() - t;
  const s = Math.max(0, Math.floor(diff / 1000));
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);

  if (d >= 7) return new Date(t).toLocaleDateString();
  if (d >= 1) return `${d}d ago`;
  if (h >= 1) return `${h}h ago`;
  if (m >= 1) return `${m}m ago`;
  return `just now`;
}

export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}
