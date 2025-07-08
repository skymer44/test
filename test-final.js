// 🔬 TEST FINAL - VÉRIFICATION RÉELLE DE L'ANIMATION

console.log('🔬 TEST FINAL DÉMARRÉ');

// Attendre que la page soit prête
setTimeout(() => {
    const tabButton = document.querySelector('[data-tab="programmes"]');
    if (!tabButton) {
        console.log('❌ Bouton programmes non trouvé');
        return;
    }
    
    console.log('✅ Bouton programmes trouvé, surveillance activée');
    
    // Surveiller chaque clic
    tabButton.addEventListener('click', function() {
        console.log('🖱️ CLIC sur onglet programmes');
        console.log('📊 VisitedTabs avant:', Array.from(window.visitedTabs || []));
        
        // Vérifier après le clic
        setTimeout(() => {
            console.log('📊 VisitedTabs après:', Array.from(window.visitedTabs || []));
            
            const isProgrammesVisited = window.visitedTabs && window.visitedTabs.has('programmes');
            console.log(`🎯 Programmes visité: ${isProgrammesVisited}`);
            
            if (isProgrammesVisited) {
                console.log('✅ ATTENDU: Pas d\'animation car déjà visité');
            } else {
                console.log('🎬 ATTENDU: Animation car première visite');
            }
        }, 100);
    });
    
}, 1000);

// Test pour désactiver temporairement l'animation d'indicateur
window.testSansIndicateur = function() {
    console.log('🧪 TEST SANS ANIMATION INDICATEUR');
    
    // Désactiver temporairement animateTabIndicator
    const originalAnimate = window.animateTabIndicator;
    window.animateTabIndicator = function() {
        console.log('🚫 Animation indicateur désactivée pour test');
    };
    
    console.log('✅ Cliquez sur programmes maintenant...');
    
    // Restaurer après 10 secondes
    setTimeout(() => {
        window.animateTabIndicator = originalAnimate;
        console.log('🔄 Animation indicateur restaurée');
    }, 10000);
};
