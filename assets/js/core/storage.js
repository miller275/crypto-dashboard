// storage.js
const KEY = "cryptoboard.v1";

function readRoot(){
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); }
  catch { return {}; }
}
function writeRoot(obj){ localStorage.setItem(KEY, JSON.stringify(obj)); }

export const store = {
  get(k, fallback=null){
    const root = readRoot();
    return (k in root) ? root[k] : fallback;
  },
  set(k, v){
    const root = readRoot();
    root[k] = v;
    writeRoot(root);
  }
};
