// Service worker minimal : cache uniquement les ressources statiques de
// l'app (HTML/JS/CSS/icônes), jamais les appels à Supabase. C'est
// volontaire — l'app repose sur des données réelles à jour (XP, clients,
// missions) : les mettre en cache créerait exactement le genre de "fausse
// certitude" que ce projet essaie d'éviter partout ailleurs.
const CACHE_NAME = "csm-academy-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Seulement les GET same-origin (fichiers de l'app). Tout le reste —
  // en particulier les requêtes vers *.supabase.co — n'est jamais
  // intercepté et part directement au réseau.
  if (request.method !== "GET" || !request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached);

      // Stale-while-revalidate : sert le cache tout de suite si dispo
      // (ouverture rapide, marche même hors-ligne), rafraîchit en tâche de
      // fond pour la prochaine visite.
      return cached || networkFetch;
    })
  );
});
