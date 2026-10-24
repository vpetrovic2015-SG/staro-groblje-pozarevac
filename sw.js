const CACHE_NAME = "staro-groblje-v3";
self.addEventListener("install", event => { self.skipWaiting(); });
self.addEventListener("activate", event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", event => { /* Network-first; avoid stale HTML/CSS/JS during updates. */ });
