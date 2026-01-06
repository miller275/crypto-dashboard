// Minimal RSS/Atom parser (no deps). Good enough for headlines.
function pick(tag, s) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const m = s.match(re);
  return m ? m[1].trim() : '';
}

function stripCdata(s) {
  return s.replace(/^<!\\[CDATA\\[/, '').replace(/\\]\\]>$/, '').trim();
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g,'&')
    .replace(/&lt;/g,'<')
    .replace(/&gt;/g,'>')
    .replace(/&quot;/g,'"')
    .replace(/&#39;/g,"'");
}

export async function fetchRssHeadlines(url, { sourceName, limit = 30 } = {}) {
  const res = await fetch(url, { headers: { 'Accept': 'application/xml,text/xml,*/*' } });
  if (!res.ok) throw new Error(`RSS fetch failed ${res.status}`);
  const xml = await res.text();

  // Try RSS <item>, else Atom <entry>
  const items = [];
  const itemRe = /<item\\b[\\s\\S]*?<\\/item>/gi;
  const entryRe = /<entry\\b[\\s\\S]*?<\\/entry>/gi;

  const blocks = xml.match(itemRe) || xml.match(entryRe) || [];
  for (const b of blocks.slice(0, limit)) {
    const title = decodeEntities(stripCdata(pick('title', b)));
    let link = pick('link', b);
    if (link.includes('href=')) {
      const m = link.match(/href="([^"]+)"/i);
      link = m ? m[1] : link;
    }
    link = decodeEntities(stripCdata(link));
    const pub = pick('pubDate', b) || pick('updated', b) || pick('published', b);
    const published_at = pub ? new Date(stripCdata(pub)).toISOString() : null;

    if (title && link) {
      items.push({ title, url: link, source: sourceName || 'RSS', published_at });
    }
  }

  return items;
}
