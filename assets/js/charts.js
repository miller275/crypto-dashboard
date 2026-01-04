import { coinImage } from "./utils.js";

/**
 * Sparkline: minimal line chart inside a canvas.
 * Uses Chart.js (global Chart).
 */
export function sparkline(canvas, prices){
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const data = (Array.isArray(prices) ? prices : []).filter(x => typeof x === "number");
  const labels = data.map((_,i)=>i);

  // destroy old instance
  if (canvas._chart) {
    try{ canvas._chart.destroy(); }catch{}
    canvas._chart = null;
  }

  if (data.length < 2){
    // draw a simple baseline
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height/2);
    ctx.lineTo(canvas.width, canvas.height/2);
    ctx.stroke();
    return;
  }

  canvas._chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        data,
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.35,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: { legend: { display:false }, tooltip: { enabled:false } },
      scales: { x: { display:false }, y: { display:false } },
      elements: { line: { fill: false } }
    }
  });
}

export function bigLineChart(canvas, series){
  const ctx = canvas.getContext("2d");
  const points = Array.isArray(series) ? series : [];
  if (canvas._chart) { try{ canvas._chart.destroy(); }catch{} canvas._chart=null; }

  const labels = points.map(p => new Date(p[0]).toLocaleString());
  const data = points.map(p => p[1]);

  if (data.length < 2){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height/2);
    ctx.lineTo(canvas.width, canvas.height/2);
    ctx.stroke();
    return null;
  }

  canvas._chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        data,
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.25,
      }]
    },
    options: {
      responsive:true,
      maintainAspectRatio:false,
      animation:false,
      interaction:{ mode:"index", intersect:false },
      plugins:{ legend:{display:false} },
      scales:{
        x:{ ticks:{ maxTicksLimit: 6 } },
        y:{ ticks:{ callback: (v)=> v } }
      }
    }
  });
  return canvas._chart;
}
