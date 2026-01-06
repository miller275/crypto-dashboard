const BASE = 'https://pro-api.coinmarketcap.com';

function qs(params = {}) {
  const u = new URL('http://x');
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    u.searchParams.set(k, String(v));
  }
  return u.searchParams.toString();
}

export function createCmcClient(apiKey) {
  if (!apiKey) throw new Error('Missing CMC_PRO_API_KEY');

  async function request(path, params) {
    const url = `${BASE}${path}${params ? `?${qs(params)}` : ''}`;
    const res = await fetch(url, {
      headers: {
        'X-CMC_PRO_API_KEY': apiKey,
        'Accept': 'application/json'
      }
    });
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch { /* noop */ }

    if (!res.ok) {
      const msg = json?.status?.error_message || text || `HTTP ${res.status}`;
      throw new Error(`CMC ${path} failed: ${msg}`);
    }
    return json;
  }

  return {
    listingsLatest: (params) => request('/v1/cryptocurrency/listings/latest', params),
    info: (params) => request('/v2/cryptocurrency/info', params),
    globalMetrics: (params) => request('/v1/global-metrics/quotes/latest', params),
    ohlcvHistorical: (params) => request('/v1/cryptocurrency/ohlcv/historical', params),
  };
}
