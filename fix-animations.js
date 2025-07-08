// � FONCTION POUR DÉCLENCHER LES ANIMATIONS SPÉCIFIQUES À CHAQUE ONGLET - VERSION CORRIGÉE
function triggerTabAnimations(tabId) {
    console.log(`🎬 Déclenchement des animations pour l'onglet: ${tabId}`);
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animation d'apparition
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                // Ne plus observer après animation
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    if (tabId === 'programmes') {
        // NOUVELLES ANIMATIONS DE SCROLL pour l'onglet Programme musical (comme Prochains événements)
        console.log('🎭 Activation des animations de scroll pour Programme musical (fix-animations.js)');
        
        // Appeler la nouvelle fonction d'animations de scroll définie dans script.js
        if (typeof setupProgrammeScrollAnimations === 'function') {
            setupProgrammeScrollAnimations();
        } else {
            console.warn('⚠️ Fonction setupProgrammeScrollAnimations non trouvée');
        }
        
    } else if (tabId === 'partitions') {
        // ANIMATIONS DÉSACTIVÉES pour l'onglet Partitions pour uniformité avec les autres onglets
        console.log('🎭 Animations désactivées pour l\'onglet Partitions');
    }
}
