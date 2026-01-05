import { Utils } from "./utils.js";

const KEY = "cw_theme";

export const Theme = {
  get(){
    const stored = localStorage.getItem(KEY);
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  },
  set(theme){
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(KEY, theme);
    const icon = Utils.qs("#themeIcon");
    if (icon) icon.textContent = theme === "dark" ? "☀️" : "🌙";
  },
  toggle(){
    Theme.set(Theme.get() === "dark" ? "light" : "dark");
  }
};
