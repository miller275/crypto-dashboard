// sparkline.js
import { el } from "../core/dom.js";

export function sparklineSvg(values, {w=130,h=26,pad=2}={}) {
  if (!Array.isArray(values) || values.length < 2) return el("span", { class:"muted" }, [document.createTextNode("—")]);

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = (max - min) || 1;

  const scaleX = (i) => pad + (i * (w - pad*2) / (values.length - 1));
  const scaleY = (v) => pad + (h - pad*2) - ((v - min) * (h - pad*2) / range);

  let d = "";
  values.forEach((v,i)=>{
    const x = scaleX(i), y = scaleY(v);
    d += (i===0 ? "M" : "L") + x.toFixed(2) + " " + y.toFixed(2) + " ";
  });

  const svg = el("svg", { class:"spark", viewBox:`0 0 ${w} ${h}`, "aria-hidden":"true" });
  svg.append(el("path", { d, class:"main" }));
  return svg;
}

export function sparklineBigSvg(values, {w=900,h=120,pad=8}={}) {
  if (!Array.isArray(values) || values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = (max - min) || 1;

  const scaleX = (i) => pad + (i * (w - pad*2) / (values.length - 1));
  const scaleY = (v) => pad + (h - pad*2) - ((v - min) * (h - pad*2) / range);

  let d = "";
  values.forEach((v,i)=>{
    const x = scaleX(i), y = scaleY(v);
    d += (i===0 ? "M" : "L") + x.toFixed(2) + " " + y.toFixed(2) + " ";
  });

  const svg = el("svg", { viewBox:`0 0 ${w} ${h}`, preserveAspectRatio:"none" });
  svg.append(el("path", { d }));
  return svg;
}
