// AFS Virtual Tutor Hub — Service Worker
// Bumped version — forces old cache to be deleted on next visit
const CACHE_NAME = 'afs-tutor-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/pages/faculty.html',
  '/pages/courses.html',
  '/pages/faq.html',
  '/pages/about-ceo.html',
  '/pages/contact.html',
  '/css/style.css',
  '/css/animations.css',
  '/css/responsive.css'
];

// Install — cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean ALL old caches immediately
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — NETWORK FIRST, fallback to cache only if offline
// This means: live site always wins. Cache is only a backup for offline use.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  // Don't cache/intercept Firebase or external API calls
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Got fresh response from network — use it and update cache
        if (response && response.status === 200 && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => {
        // Network failed (offline) — fall back to cache
        return caches.match(event.request);
      })
  );
});
