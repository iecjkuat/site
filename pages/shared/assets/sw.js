// JKUAT Innovation Club Service Worker (SAFE)
const CACHE_NAME = 'jkuat-static-v2';

const STATIC_ASSETS = [
  '/assets/logo.png',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png'
];

// Install
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
});

// Activate (clean old caches)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME)
            .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch
self.addEventListener('fetch', event => {
  const req = event.request;

  // ❌ NEVER cache HTML
  if (req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(fetch(req));
    return;
  }

  // ❌ NEVER cache APIs or payments
  if (req.url.includes('/api') || req.url.includes('/payments')) {
    event.respondWith(fetch(req));
    return;
  }

  // ✅ Network-first for CSS & JS
  if (req.url.endsWith('.css') || req.url.endsWith('.js')) {
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // ✅ Cache-first ONLY for images/fonts
  event.respondWith(
    caches.match(req).then(res => res || fetch(req))
  );
});
