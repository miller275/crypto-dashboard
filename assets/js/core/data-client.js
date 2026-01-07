const mem = new Map();

export async function fetchJSON(path, { bust=false } = {}){
  const key = path;
  if(!bust && mem.has(key)) return mem.get(key);
  const url = bust ? path + (path.includes("?") ? "&" : "?") + "t=" + Date.now() : path;
  const res = await fetch(url, { cache: "no-store" });
  if(!res.ok) throw new Error("Fetch failed: " + res.status + " " + path);
  const json = await res.json();
  mem.set(key, json);
  return json;
}