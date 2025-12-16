// sw.js — FORCE UPDATE + CLEAR OLD CACHES (best for debugging on GitHub Pages)

const VERSION = "v2025-12-15-01"; // <-- change this every time you deploy
const CACHE_ALLOWLIST = new Set([`flipcity-${VERSION}`]);

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Let the browser/network handle JS/CSS/images so they don't get an HTML fallback
  if (req.destination === "script" || req.destination === "style" || req.destination === "image") {
    return;
  }

  // Only handle page navigations (index/offline page)
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("./offline.html"))
    );
  }
});

// IMPORTANT: do NOT cache HTML or JS while you're debugging.
// Let the network always win for navigations + scripts.
self.addEventListener("fetch", (event) => {
  const req = event.request;

  const isNav = req.mode === "navigate";
  const isScript = req.destination === "script";

  if (isNav || isScript) return; // network by default

  event.respondWith(fetch(req));
});
