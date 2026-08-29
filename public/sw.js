const VERSION = 'page-pointer-v1.1.1';
const SHELL = `${VERSION}-shell`;
const RUNTIME = `${VERSION}-runtime`;
const PRECACHE = ['/', '/index.html', '/demo', '/privacy', '/terms', '/offline.html', '/manifest.webmanifest', '/robots.txt', '/assets/mark.svg', '/assets/icon-192.png', '/assets/icon-512.png', '/assets/page-pointer-hero-768.avif', '/assets/page-pointer-hero-1024.avif', '/assets/page-pointer-hero-768.webp', '/assets/page-pointer-hero-1024.webp', '/assets/page-pointer-hero-1536.webp', '/assets/page-pointer-hero-1024.jpg', /* BUILD_ASSETS */];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL).then((cache) => cache.addAll(PRECACHE)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => ![SHELL, RUNTIME].includes(key)).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then((response) => {
      const copy = response.clone();
      caches.open(RUNTIME).then((cache) => cache.put(event.request, copy));
      return response;
    }).catch(async () => (await caches.match(event.request)) || (await caches.match('/index.html')) || caches.match('/offline.html')));
    return;
  }
  // Static hosts may add `Vary: Origin` to fonts. These requests are already
  // restricted to this origin, so ignore that response header when matching
  // immutable precached assets; otherwise CSS font loads miss while offline.
  event.respondWith(caches.match(event.request, { ignoreVary: true }).then((cached) => cached || fetch(event.request).then((response) => {
    if (response.ok) caches.open(RUNTIME).then((cache) => cache.put(event.request, response.clone()));
    return response;
  })));
});
