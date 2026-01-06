export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null) continue;
    if (k === 'class') node.className = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else if (k === 'text') node.textContent = v;
    else if (k === 'html') node.innerHTML = v;
    else node.setAttribute(k, String(v));
  }
  for (const child of children) node.append(child);
  return node;
}

export function safeText(node, text) {
  node.textContent = text == null ? '' : String(text);
}

export function setHidden(node, hidden) {
  node.classList.toggle('is-hidden', !!hidden);
}

export function on(root, event, selector, handler) {
  root.addEventListener(event, (e) => {
    const target = e.target?.closest(selector);
    if (target && root.contains(target)) handler(e, target);
  });
}
