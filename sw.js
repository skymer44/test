
// Service Worker pour la gestion du cache - Version v20250707_4cbabf0e
// Généré automatiquement le 2025-07-07T16:48:45.730Z

const CACHE_NAME = 'programme-musical-v20250707_4cbabf0e';
const CACHE_VERSION = 'v20250707_4cbabf0e';

// Forcer la mise à jour immédiate
self.addEventListener('install', event => {
    console.log('[SW] Installation - Version:', CACHE_VERSION);
    self.skipWaiting(); // Forcer l'activation immédiate
});

self.addEventListener('activate', event => {
    console.log('[SW] Activation - Version:', CACHE_VERSION);
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
        }).then(() => {
            return self.clients.claim(); // Prendre le contrôle immédiatement
        })
    );
});

// Stratégie Network First pour tout
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Toujours retourner la réponse réseau fraîche
                return response;
            })
            .catch(() => {
                // En cas d'erreur réseau, essayer le cache
                return caches.match(event.request);
            })
    );
});

// Message pour notifier les clients de la mise à jour
self.addEventListener('message', event => {
    if (event.data.action === 'getVersion') {
        event.ports[0].postMessage({
            version: CACHE_VERSION,
            buildTime: 1751906925730
        });
    }
});
