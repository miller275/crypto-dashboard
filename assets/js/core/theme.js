// theme.js
import { store } from "./storage.js";

export function initTheme() {
  const saved = store.get("theme", "dark");
  applyTheme(saved);
  return saved;
}

export function toggleTheme() {
  const now = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(now);
  store.set("theme", now);
  return now;
}

export function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme === "light" ? "light" : "dark");
}
