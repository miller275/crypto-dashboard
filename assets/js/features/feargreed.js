import { DataClient } from '../core/data-client.js';
import { $, setHtml } from '../core/dom.js';

export async function renderFearGreed(){
  const el = $('#fearGreedCard');
  if (!el) return;
  try{
    const fg = await DataClient.getFearGreed();
    setHtml(el, `
      <h2>Fear &amp; Greed</h2>
      <div style="font-size:34px;font-weight:900">${fg.value ?? '—'}</div>
      <div class="muted">${fg.classification ?? ''}</div>
    `);
  }catch{
    setHtml(el, `<h2>Fear &amp; Greed</h2><div class="muted">Failed to load.</div>`);
  }
}
