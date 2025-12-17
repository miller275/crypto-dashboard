/* CryptoWatch — tiny event bus */
(function () {
  const NS = (window.CryptoWatch = window.CryptoWatch || {});
  const listeners = new Map();

  function on(event, fn) {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event).add(fn);
    return () => off(event, fn);
  }

  function off(event, fn) {
    const set = listeners.get(event);
    if (!set) return;
    set.delete(fn);
  }

  function emit(event, payload) {
    const set = listeners.get(event);
    if (!set) return;
    for (const fn of Array.from(set)) {
      try { fn(payload); } catch (e) { console.error("[bus]", event, e); }
    }
  }

  NS.bus = { on, off, emit };
})();
