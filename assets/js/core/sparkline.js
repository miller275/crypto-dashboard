import { clsPct } from "./format.js";

// Simple, dependency-free canvas sparkline.
// series: array of numbers
export function drawSpark(canvas, series, pct7d){
  if(!canvas) return;
  const ctx = canvas.getContext("2d");
  const w = canvas.width = canvas.clientWidth * (window.devicePixelRatio||1);
  const h = canvas.height = canvas.clientHeight * (window.devicePixelRatio||1);
  ctx.clearRect(0,0,w,h);

  if(!Array.isArray(series) || series.length < 2){
    // placeholder faint line
    ctx.globalAlpha = 0.7;
    ctx.lineWidth = 2 * (window.devicePixelRatio||1);
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--line").trim() || "rgba(255,255,255,.12)";
    ctx.beginPath(); ctx.moveTo(0, h*0.55); ctx.lineTo(w, h*0.45); ctx.stroke();
    return;
  }

  let min = Infinity, max = -Infinity;
  for(const v of series){ if(v < min) min=v; if(v > max) max=v; }
  if(min === max){ min -= 1; max += 1; }

  const pad = 2 * (window.devicePixelRatio||1);
  const xStep = (w - pad*2) / (series.length - 1);
  const y = (v) => {
    const t = (v - min) / (max - min);
    return (h - pad) - t * (h - pad*2);
  };

  const theme = getComputedStyle(document.documentElement);
  const good = theme.getPropertyValue("--good").trim() || "#1fd28a";
  const bad = theme.getPropertyValue("--bad").trim() || "#ff5d7d";
  const faint = theme.getPropertyValue("--line").trim() || "rgba(255,255,255,.12)";
  const isGood = clsPct(pct7d) === "good";

  // glow-ish baseline
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = 2.2 * (window.devicePixelRatio||1);
  ctx.strokeStyle = faint;
  ctx.beginPath();
  ctx.moveTo(pad, y(series[0]));
  series.forEach((v,i)=> ctx.lineTo(pad + i*xStep, y(v)));
  ctx.stroke();

  // main line
  ctx.globalAlpha = 0.95;
  ctx.lineWidth = 2.2 * (window.devicePixelRatio||1);
  ctx.strokeStyle = isGood ? good : bad;
  ctx.beginPath();
  ctx.moveTo(pad, y(series[0]));
  series.forEach((v,i)=> ctx.lineTo(pad + i*xStep, y(v)));
  ctx.stroke();
}
