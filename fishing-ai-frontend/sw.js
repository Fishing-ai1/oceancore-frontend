const CACHE_NAME = "oceancore-app-v2026-05-21";
const APP_SHELL = [
  "/app/",
  "/app/index.html",
  "/app/offline.html",
  "/app/manifest.webmanifest",
  "/app/assets/native-config.js",
  "/app/assets/icons/favicon.svg",
  "/app/assets/icons/icon-192.png",
  "/app/assets/icons/icon-512.png",
  "/app/assets/icons/maskable-512.png",
  "/app/assets/icons/apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.pathname.startsWith("/auth/") || url.pathname.startsWith("/api/") || url.pathname.startsWith("/billing/") || url.pathname.startsWith("/catches") || url.pathname.startsWith("/community/")) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put("/app/", copy));
          return response;
        })
        .catch(() => caches.match("/app/").then((cached) => cached || caches.match("/app/offline.html")))
    );
    return;
  }

  if (url.origin === self.location.origin && url.pathname.startsWith("/app/")) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        });
      })
    );
  }
});
