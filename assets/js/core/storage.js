export const storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  del(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }
};
