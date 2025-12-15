/* CryptoWatch — theme.js */
(function () {
  const NS = (window.CryptoWatch = window.CryptoWatch || {});
  const KEY = "cw_theme";

  function getInitialTheme() {
    const saved = localStorage.getItem(KEY);
    if (saved === "dark" || saved === "light") return saved;
    try {
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } catch {
      return "light";
    }
  }

  function setButtonIcon(theme) {
    const btn = document.getElementById("theme-toggle");
    if (!btn) return;
    const i = btn.querySelector("i");
    if (!i) return;
    i.className = theme === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
    btn.title = theme === "dark" ? "Light" : "Dark";
  }

  function apply(theme) {
    const html = document.documentElement;
    if (theme === "dark") html.classList.add("dark");
    else html.classList.remove("dark");
    try { localStorage.setItem(KEY, theme); } catch {}
    NS.state = NS.state || {};
    NS.state.theme = theme;
    setButtonIcon(theme);
    if (NS.bus) NS.bus.emit("themechange", theme);
  }

  function toggle() {
    const cur = (NS.state && NS.state.theme) || getInitialTheme();
    apply(cur === "dark" ? "light" : "dark");
  }

  function init() {
    NS.state = NS.state || {};
    apply(getInitialTheme());

    const btn = document.getElementById("theme-toggle");
    if (btn) btn.addEventListener("click", toggle);
  }

  NS.theme = { init, apply, toggle };
})();
