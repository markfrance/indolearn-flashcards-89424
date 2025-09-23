/* Basic service worker for Next.js export PWA
   Caches static assets generated during build and provides offline fallback. */

const CACHE_NAME = "indolearn-cache-v1";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll([
        "/",
        "/offline.html",
        "/manifest.webmanifest"
      ]);
      self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Cleanup old caches
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : Promise.resolve()))
      );
      self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET
  if (request.method !== "GET") return;

  // Network-first for HTML navigations
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const preloadResp = await event.preloadResponse;
          if (preloadResp) return preloadResp;

          const networkResp = await fetch(request);
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, networkResp.clone());
          return networkResp;
        } catch (err) {
          const cache = await caches.open(CACHE_NAME);
          const cachedResp = await cache.match(OFFLINE_URL);
          return cachedResp || new Response("Offline");
        }
      })()
    );
    return;
  }

  // Cache-first for static assets
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);
      if (cached) return cached;
      try {
        const networkResp = await fetch(request);
        if (networkResp && networkResp.status === 200) {
          cache.put(request, networkResp.clone());
        }
        return networkResp;
      } catch {
        return cached || Response.error();
      }
    })()
  );
});
