import { storage } from "./storage.js";

const KEY = "cb_theme";

export function getTheme(){
  return storage.get(KEY, null) || document.documentElement.dataset.theme || "dark";
}

export function setTheme(theme){
  const t = theme === "light" ? "light" : "dark";
  document.documentElement.dataset.theme = t;
  storage.set(KEY, t);
  return t;
}

export function toggleTheme(){
  const next = getTheme() === "dark" ? "light" : "dark";
  return setTheme(next);
}
