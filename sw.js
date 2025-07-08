
// Service Worker simple pour PWA iOS - Version v20250708_simple
// Juste pour permettre l'installation sans la barre Safari

const CACHE_NAME = 'programme-musical-simple-v20250708';

// Installation simple
self.addEventListener('install', event => {
    console.log('[SW] Installation simple');
    self.skipWaiting();
});

// Activation simple
self.addEventListener('activate', event => {
    console.log('[SW] Activation simple');
    event.waitUntil(self.clients.claim());
});

// Pas de cache complexe - juste laisser passer les requêtes normalement
self.addEventListener('fetch', event => {
    // Ne rien faire de spécial, laisser le navigateur gérer
    return;
});
