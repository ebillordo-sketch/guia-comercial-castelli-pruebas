
const CACHE_NAME = "guia-castelli-v1";
const ARCHIVOS = [
  "./",
  "./index.html",
  "./manifest.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ARCHIVOS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  if (request.destination === "image") {
    event.respondWith(
      (async () => {
        const cache = await caches.open("guia-imagenes-v1");

        try {
          const response = await fetch(request);

          if (response.ok || response.type === "opaque") {
            await cache.put(request, response.clone());
          }

          return response;
        } catch (error) {
          const imagenGuardada = await cache.match(request);

          if (imagenGuardada) {
            return imagenGuardada;
          }

          throw error;
        }
      })()
    );

    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
