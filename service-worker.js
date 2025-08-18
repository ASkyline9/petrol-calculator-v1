const CACHE_NAME = 'petrol-calc-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/main.js',
    '/style.css',
    '/manifest.json',
    // You should also cache your logo images
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            console.log('Opened cache');
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
        .then(response => {
            if (response) {
                return response;
            }
            return fetch(event.request);
        })
    );
});