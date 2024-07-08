const CACHE_NAME = 'interview-mentor-cache-v1';
const urlsToCache = [
  '/',
  '/static/css/styles.css',
  '/static/css/home.css',
  '/static/css/aptitude.css',
  '/static/css/coding.css',
  '/static/css/details.css',
  '/static/css/resume.css',
  '/static/css/rounds.css',
  '/static/js/script.js',
  '/static/js/aptitude.js',
  '/static/js/coding.js',
  '/static/icons/icon-192x192.png',
  '/static/icons/icon-512x512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
