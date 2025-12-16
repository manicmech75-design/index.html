// Flip City Service Worker (GitHub Pages friendly)
const CACHE = "flipcity-cache-v7";
const OFFLINE_URL = "./offline.html";

// Core files to precache (must match your real filenames)
const CORE = [
  "./",
  "./index.html",
  "./game.js",
  "./manifest.webmanifest",
  "./offline.html",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(keys.map((k) => (k === CACHE ? null : caches.delete(k))))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle same-origin requests
  if (url.origin !== location.origin) return;

  const accept = req.headers.get("accept") || "";

  const isHTML = req.mode === "navigate" || accept.includes("text/html");

  // IMPORTANT: treat game.js as "update-critical"
  const isGameJS = url.pathname.endsWith("game.js") || url.pathname.endsWith("/game.js");

  // Network-first for HTML and game.js (prevents “stuck old version”)
  if (isHTML || isGameJS) {
    event.respondWith(
      fetch(req)
        .then((resp) => {
          const copy = resp.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
          return resp;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          return cached || caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // Cache-first for everything else (icons, images, etc.)
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req)
        .then((resp) => {
          // Cache successful responses
          if (resp && resp.status === 200) {
            const copy = resp.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy));
          }
          return resp;
        })
        .catch(async () => {
          // Only serve offline page for navigations; otherwise fail normally
          if (accept.includes("text/html")) return caches.match(OFFLINE_URL);
          return Response.error();
        });
    })
  );
});
