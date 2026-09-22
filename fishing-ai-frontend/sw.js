const CACHE_NAME = "oceancore-app-v2026-09-22-platform-audit-v16";
const NATIVE_APP_OFFLINE_PATH = "/app/offline.html";
const NATIVE_APP_CONFIG_PATH = "/app/assets/native-config.js";
const SCOPE_PATH = new URL(self.registration.scope).pathname.replace(/\/$/, "");
const appPath = (path = "") => `${SCOPE_PATH}/${path}`.replace(/\/+/g, "/");
const APP_SHELL = [
  appPath(),
  appPath("index.html"),
  appPath("offline.html"),
  appPath("manifest.webmanifest"),
  appPath("assets/native-config.js"),
  `${appPath("assets/ocean-current.css")}?v=20260922a`,
  `${appPath("assets/ocean-current.js")}?v=20260922a`,
  appPath("assets/ocean-current/sunshine-coast-mackerel.png"),
  appPath("assets/ocean-current/coastal-camp-sunset.png"),
  appPath("assets/ocean-current/sunshine-coast-expedition.png"),
  appPath("assets/icons/favicon.svg"),
  appPath("assets/icons/icon-192.png"),
  appPath("assets/icons/icon-512.png"),
  appPath("assets/icons/maskable-512.png"),
  appPath("assets/icons/apple-touch-icon.png")
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => Promise.allSettled(APP_SHELL.map((url) => cache.add(url))))
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
  // Authenticated responses, administrative data and private AI history must never enter a shared device cache.
  if (request.headers.has("Authorization")) return;

  const url = new URL(request.url);
  if (/^\/(media|storage|auth|api|admin|ai|saved-areas|social|feedback|rewards|billing|catches|community)(\/|$)/.test(url.pathname)) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok && [appPath(),appPath("index.html")].includes(url.pathname)) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(appPath(), copy));
          }
          return response;
        })
        .catch(() => caches.match(appPath()).then((cached) => cached || caches.match(appPath("offline.html"))))
    );
    return;
  }

  if (url.origin === self.location.origin && (!SCOPE_PATH || url.pathname.startsWith(`${SCOPE_PATH}/`))) {
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
