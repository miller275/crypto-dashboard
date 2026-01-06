import { CONFIG } from './config.js';

const mem = new Map();
let generated = null;

async function fetchJson(url, { bust = true } = {}) {
  const u = new URL(url, location.href);

  if (bust && generated?.version) {
    u.searchParams.set('v', String(generated.version));
  }

  const key = u.toString();
  if (mem.has(key)) return mem.get(key);

  const p = (async () => {
    const res = await fetch(key, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Fetch failed ${res.status}: ${url}`);
    return res.json();
  })();

  mem.set(key, p);
  return p;
}

export const dataClient = {
  async init() {
    generated = await fetchJson(`${CONFIG.PATHS.DATA}/generated.json`, { bust: false }).catch(() => null);
    return generated;
  },

  getGenerated() {
    return generated;
  },

  async get(path) {
    return fetchJson(path);
  },

  async getData(relPath) {
    return fetchJson(`${CONFIG.PATHS.DATA}/${relPath.replace(/^\//,'')}`);
  },

  clearMemoryCache() {
    mem.clear();
  },

  async purgeDataCaches({ hard = false } = {}) {
    // Ask SW to purge caches (if active). Also clears memory cache.
    this.clearMemoryCache();

    const v = generated?.version ?? 1;

    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'PURGE_DATA', version: v, hard });
      return;
    }
    // no SW controller - nothing else to do
  },

  async registerSW() {
    if (!CONFIG.SW.ENABLED) return null;
    if (!('serviceWorker' in navigator)) return null;

    try {
      const reg = await navigator.serviceWorker.register(CONFIG.SW.PATH, { scope: './' });
      // optional: update quickly
      reg.update?.();
      return reg;
    } catch {
      return null;
    }
  }
};
