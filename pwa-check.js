// 🔍 Script de vérification PWA
// À exécuter dans la console du navigateur pour vérifier la configuration PWA

console.log('🔍 === VÉRIFICATION PWA - Programme Musical 2026 ===');

// 1. Vérifier le Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
        if (registrations.length > 0) {
            console.log('✅ Service Worker enregistré:', registrations[0].scope);
            console.log('📊 État:', registrations[0].active?.state || 'en cours');
        } else {
            console.log('❌ Aucun Service Worker trouvé');
        }
    });
} else {
    console.log('❌ Service Worker non supporté');
}

// 2. Vérifier le Manifest
fetch('/manifest.json')
    .then(response => response.json())
    .then(manifest => {
        console.log('✅ Manifest chargé:', manifest.name);
        console.log('📱 Icônes:', manifest.icons.length);
        console.log('🎨 Thème:', manifest.theme_color);
        console.log('📺 Mode d\'affichage:', manifest.display);
    })
    .catch(error => {
        console.log('❌ Erreur Manifest:', error);
    });

// 3. Vérifier les capacités PWA
console.log('📱 Mode standalone:', window.matchMedia('(display-mode: standalone)').matches);
console.log('🍎 iOS standalone:', window.navigator.standalone);
console.log('📱 Appareil mobile:', /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

// 4. Vérifier les icônes
const iconSizes = ['72x72', '96x96', '128x128', '144x144', '152x152', '192x192', '384x384', '512x512'];
iconSizes.forEach(size => {
    const img = new Image();
    img.onload = () => console.log(`✅ Icône ${size} chargée`);
    img.onerror = () => console.log(`❌ Icône ${size} manquante`);
    img.src = `/icons/icon-${size}.svg`;
});

// 5. Tester le cache
if ('caches' in window) {
    caches.keys().then(cacheNames => {
        console.log('💾 Caches disponibles:', cacheNames);
        cacheNames.forEach(cacheName => {
            caches.open(cacheName).then(cache => {
                cache.keys().then(requests => {
                    console.log(`📦 Cache ${cacheName}:`, requests.length, 'ressources');
                });
            });
        });
    });
} else {
    console.log('❌ Cache API non supporté');
}

// 6. Simuler mode hors-ligne
window.testOfflineMode = function() {
    console.log('🔌 Test du mode hors-ligne...');
    // Désactiver temporairement le réseau (simulation)
    const originalFetch = window.fetch;
    window.fetch = () => Promise.reject(new Error('Mode hors-ligne simulé'));
    
    setTimeout(() => {
        window.fetch = originalFetch;
        console.log('🔌 Mode en ligne restauré');
    }, 5000);
    
    console.log('ℹ️ Essayez de naviguer pendant les 5 prochaines secondes');
};

console.log('💡 Tapez testOfflineMode() pour tester le mode hors-ligne');
console.log('🔍 === FIN VÉRIFICATION PWA ===');
