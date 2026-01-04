import { Store } from "./store.js";

export function applyTheme(){
  const s = Store.get();
  const theme = s.theme === "light" ? "light" : "dark";
  document.documentElement.dataset.theme = theme;
}

export function toggleTheme(){
  const s = Store.get();
  const next = s.theme === "light" ? "dark" : "light";
  Store.set({ theme: next });
  applyTheme();
  return next;
}
