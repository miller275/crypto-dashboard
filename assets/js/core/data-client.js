// data-client.js
import { CONFIG } from "./config.js";

const bust = () => `v=${Date.now()}`;

export async function fetchJson(path, {timeoutMs = 12000} = {}) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const url = path.includes("?") ? `${path}&${bust()}` : `${path}?${bust()}`;
    const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${path}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

export async function loadMeta() {
  return fetchJson(`${CONFIG.DATA_BASE}/meta.json`);
}

export async function loadMarketPage(page) {
  return fetchJson(`${CONFIG.MARKETS_DIR}/page-${page}.json`);
}

export async function loadCoinCache() {
  return fetchJson(CONFIG.COIN_CACHE);
}

export async function loadCoinsList() {
  return fetchJson(CONFIG.COINS_LIST, { timeoutMs: 20000 });
}

export async function loadFearGreed() {
  return fetchJson(CONFIG.FNG);
}

export async function loadNews() {
  return fetchJson(CONFIG.NEWS);
}

export async function loadCoinDetails(id) {
  return fetchJson(`${CONFIG.COIN_DETAILS_DIR}/${encodeURIComponent(id)}.json`);
}
