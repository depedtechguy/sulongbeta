/* Project SULONG 2.9 - offline cache. CHANGE the number in CACHE_NAME every time you upload a new version. */
const CACHE_NAME = 'project-sulong-2-9-v1';
const CORE_ASSETS = [
  './', './index.html', './manifest.webmanifest',
  './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const req = event.request, u = new URL(req.url);
  if (req.method !== 'GET' || u.origin !== self.location.origin) return;
  event.respondWith(caches.match(req).then(cached => cached || fetch(req).then(response => {
    if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(req, response.clone()));
    return response;
  }).catch(() => req.mode === 'navigate' ? caches.match('./index.html') : Promise.reject())));
});
