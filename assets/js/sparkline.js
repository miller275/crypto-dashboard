export function drawSparkline(canvas, values){
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const w = canvas.width = canvas.clientWidth * devicePixelRatio;
  const h = canvas.height = canvas.clientHeight * devicePixelRatio;
  ctx.clearRect(0,0,w,h);

  if (!values || values.length < 2) {
    ctx.globalAlpha = 0.35;
    ctx.strokeStyle = "#7aa6ff";
    ctx.lineWidth = 2 * devicePixelRatio;
    ctx.beginPath();
    ctx.moveTo(0, h*0.6);
    ctx.lineTo(w, h*0.6);
    ctx.stroke();
    ctx.globalAlpha = 1;
    return;
  }

  let min = Infinity, max = -Infinity;
  for (const v of values){ if (v<min) min=v; if (v>max) max=v; }
  if (min === max){ min -= 1; max += 1; }

  const pad = 2 * devicePixelRatio;
  const sx = (w - pad*2) / (values.length-1);
  const sy = (h - pad*2) / (max-min);
  const up = values[values.length-1] >= values[0];

  ctx.lineWidth = 2 * devicePixelRatio;
  ctx.strokeStyle = up ? "#35d07f" : "#ff5a74";
  ctx.globalAlpha = 0.9;

  ctx.beginPath();
  values.forEach((v,i)=>{
    const x = pad + i*sx;
    const y = (h - pad) - (v - min)*sy;
    if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  });
  ctx.stroke();

  ctx.globalAlpha = 0.10;
  ctx.fillStyle = up ? "#35d07f" : "#ff5a74";
  ctx.lineTo(w-pad, h-pad);
  ctx.lineTo(pad, h-pad);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
}
