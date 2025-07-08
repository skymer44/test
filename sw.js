
// Service Worker PWA pour Programme Musical 2026 - Version v20250708_pwa
// Optimisé pour iOS et support hors-ligne

const CACHE_NAME = 'programme-musical-pwa-v20250708_pwa';
const CACHE_VERSION = 'v20250708_pwa';

// Ressources essentielles à mettre en cache pour le fonctionnement hors-ligne
const ESSENTIAL_RESOURCES = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/manifest.json',
    '/icons/icon-192x192.svg',
    '/icons/icon-512x512.svg'
];

// Ressources à mettre en cache dynamiquement
const DYNAMIC_CACHE_NAME = 'programme-musical-dynamic-v20250708_pwa';

// Installation du Service Worker
self.addEventListener('install', event => {
    console.log('[SW] Installation PWA - Version:', CACHE_VERSION);
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Mise en cache des ressources essentielles');
                return cache.addAll(ESSENTIAL_RESOURCES.map(url => {
                    return new Request(url, { cache: 'reload' });
                }));
            })
            .then(() => self.skipWaiting())
    );
});

// Activation du Service Worker
self.addEventListener('activate', event => {
    console.log('[SW] Activation PWA - Version:', CACHE_VERSION);
    
    event.waitUntil(
        Promise.all([
            // Nettoyer les anciens caches
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
                            console.log('[SW] Suppression ancien cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // Prendre le contrôle de toutes les pages
            self.clients.claim()
        ])
    );
});

// Stratégie de cache intelligente
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Ignorer les requêtes non-HTTP/HTTPS
    if (!url.protocol.startsWith('http')) {
        return;
    }
    
    // Stratégie différente selon le type de ressource
    if (isEssentialResource(request.url)) {
        // Cache First pour les ressources essentielles
        event.respondWith(cacheFirst(request));
    } else if (isAPIRequest(request.url)) {
        // Network First pour les données dynamiques (Notion, etc.)
        event.respondWith(networkFirst(request));
    } else if (isAsset(request.url)) {
        // Stale While Revalidate pour les assets
        event.respondWith(staleWhileRevalidate(request));
    } else {
        // Network First par défaut
        event.respondWith(networkFirst(request));
    }
});

// Stratégie Cache First
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log('[SW] Échec réseau pour:', request.url);
        return new Response('Contenu hors-ligne non disponible', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Stratégie Network First
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Fallback pour les pages
        if (request.mode === 'navigate') {
            const indexCache = await caches.match('/index.html');
            if (indexCache) {
                return indexCache;
            }
        }
        
        return new Response('Contenu hors-ligne non disponible', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Stratégie Stale While Revalidate
async function staleWhileRevalidate(request) {
    const cachedResponse = await caches.match(request);
    
    const fetchPromise = fetch(request).then(networkResponse => {
        if (networkResponse.ok) {
            const cache = caches.open(DYNAMIC_CACHE_NAME);
            cache.then(c => c.put(request, networkResponse.clone()));
        }
        return networkResponse;
    }).catch(() => {
        console.log('[SW] Échec réseau pour asset:', request.url);
    });
    
    return cachedResponse || fetchPromise;
}

// Fonctions utilitaires
function isEssentialResource(url) {
    return ESSENTIAL_RESOURCES.some(resource => url.endsWith(resource));
}

function isAPIRequest(url) {
    return url.includes('/data/') || url.includes('notion') || url.includes('api');
}

function isAsset(url) {
    return /\.(css|js|png|jpg|jpeg|svg|woff|woff2|ttf|eot)$/i.test(url);
}

// Messages pour la communication avec l'application
self.addEventListener('message', event => {
    if (event.data.action === 'getVersion') {
        event.ports[0].postMessage({
            version: CACHE_VERSION,
            buildTime: 1751966101496
        });
    }
});
