// Enregistrement du service worker. Séparé de main.js pour rester facile
// à couper si besoin (il suffit de ne plus l'importer).
export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      // Non-bloquant : l'app doit fonctionner même si l'enregistrement
      // échoue (navigateur non compatible, réseau, etc.).
      console.warn("Service worker non enregistré :", err.message);
    });
  });
}
