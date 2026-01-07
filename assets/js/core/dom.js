export const $ = (sel, root=document) => root.querySelector(sel);
export const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

export function setText(el, text){ if (el) el.textContent = text; }
export function setHtml(el, html){ if (el) el.innerHTML = html; }
