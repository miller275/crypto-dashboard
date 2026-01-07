// service-worker.js (frontend helper)
export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  try {
    await navigator.serviceWorker.register("./service-worker.js", { scope: "./" });
  } catch (e) {
    console.warn("SW register failed:", e);
  }
}
