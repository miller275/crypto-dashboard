const KEY = "cryptowatch:v9";

function safeJsonParse(s, fallback){
  try{ return JSON.parse(s); }catch{ return fallback; }
}

const defaults = {
  theme: "dark",          // "dark" | "light"
  lang: "ru",             // "ru" | "en"
  currency: "USD",
  watchlist: [],          // coin ids
};

export const Store = {
  get(){
    const raw = localStorage.getItem(KEY);
    const v = safeJsonParse(raw, {});
    return { ...defaults, ...v };
  },
  set(patch){
    const cur = Store.get();
    const next = { ...cur, ...patch };
    localStorage.setItem(KEY, JSON.stringify(next));
    return next;
  },
  toggleWatch(id){
    const s = Store.get();
    const set = new Set(s.watchlist || []);
    if (set.has(id)) set.delete(id); else set.add(id);
    return Store.set({ watchlist: Array.from(set) });
  }
};
