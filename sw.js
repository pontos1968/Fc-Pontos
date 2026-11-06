// FC Pontos PWA: network-first for pages; only core shell cached.
// Gallery and youth photos are deliberately NOT cached.
const CACHE = 'fc-pontos-shell-v1';
const CORE = ['/', '/index.html', '/manifest.webmanifest', '/pwa-icon-192.png', '/pwa-icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).then(response => {
      if (response.ok && (new URL(req.url).pathname === '/' || new URL(req.url).pathname === '/index.html')) {
        const copy = response.clone(); caches.open(CACHE).then(cache => cache.put('/index.html', copy));
      }
      return response;
    }).catch(() => caches.match('/index.html')));
    return;
  }
  // Do not cache any image beyond the dedicated PWA app icons.
  const pathname = new URL(req.url).pathname;
  if (pathname === '/manifest.webmanifest' || /^\/pwa-icon-(192|512)\.png$/.test(pathname)) {
    event.respondWith(fetch(req).catch(() => caches.match(req)));
  }
});
