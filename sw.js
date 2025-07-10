
// Service Worker pour PWA iOS - Version corrigée v20250709
const CACHE_NAME = 'programme-musical-v20250709';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/manifest.json'
];

// Installation - mise en cache des ressources critiques
self.addEventListener('install', event => {
    console.log('[SW] Installation avec cache');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Cache ouvert');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
    );
});

// Activation - nettoyage des anciens caches
self.addEventListener('activate', event => {
    console.log('[SW] Activation avec nettoyage');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Suppression ancien cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Stratégie Network First avec fallback cache
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Si la requête réussit, mettre en cache et retourner
                if (response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseClone);
                        });
                }
                return response;
            })
            .catch(() => {
                // En cas d'échec réseau, essayer le cache
                return caches.match(event.request)
                    .then(response => {
                        if (response) {
                            console.log('[SW] Servi depuis le cache:', event.request.url);
                            return response;
                        }
                        // Si pas en cache non plus, retourner une réponse basique
                        return new Response('Contenu indisponible hors ligne', {
                            status: 503,
                            headers: { 'Content-Type': 'text/plain' }
                        });
                    });
            })
    );
});
