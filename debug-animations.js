// 🔍 SCRIPT DE DIAGNOSTIC ANIMATIONS EN TEMPS RÉEL

console.log('🔍 DÉBUT DIAGNOSTIC ANIMATIONS');

// Fonction pour surveiller les changements d'onglets
function monitorTabChanges() {
    const originalShowTab = window.showTab;
    if (typeof originalShowTab !== 'function') {
        console.log('❌ showTab non trouvée, attendre le chargement...');
        setTimeout(monitorTabChanges, 1000);
        return;
    }
    
    // Intercepter showTab
    window.showTab = function(targetId) {
        console.log(`🎯 CHANGEMENT ONGLET: "${targetId}"`);
        console.log(`📊 État visitedTabs AVANT:`, Array.from(window.visitedTabs || []));
        
        const result = originalShowTab.call(this, targetId);
        
        console.log(`📊 État visitedTabs APRÈS:`, Array.from(window.visitedTabs || []));
        
        // Vérifier les éléments programmes
        if (targetId === 'programmes') {
            setTimeout(() => {
                const programmeElements = document.querySelectorAll('#programmes .concert-section, #programmes .piece-card');
                console.log(`🎭 Éléments programmes trouvés: ${programmeElements.length}`);
                
                let withAnimationPrepared = 0;
                let withoutAnimationPrepared = 0;
                let withOpacity0 = 0;
                let withTransform = 0;
                
                programmeElements.forEach((el, index) => {
                    const hasAnimationPrepared = el.dataset.animationPrepared === 'true';
                    const opacity = getComputedStyle(el).opacity;
                    const transform = getComputedStyle(el).transform;
                    
                    if (hasAnimationPrepared) withAnimationPrepared++;
                    else withoutAnimationPrepared++;
                    
                    if (opacity === '0') withOpacity0++;
                    if (transform && transform !== 'none') withTransform++;
                    
                    if (index < 5) { // Log des 5 premiers
                        console.log(`  Element ${index}:`, {
                            tagName: el.tagName,
                            className: el.className,
                            animationPrepared: hasAnimationPrepared,
                            opacity: opacity,
                            transform: transform
                        });
                    }
                });
                
                console.log(`📈 STATISTIQUES:
                  - Avec animationPrepared: ${withAnimationPrepared}
                  - Sans animationPrepared: ${withoutAnimationPrepared}
                  - Avec opacity=0: ${withOpacity0}
                  - Avec transform: ${withTransform}`);
            }, 200);
        }
        
        return result;
    };
    
    console.log('✅ Monitoring des changements d\'onglets activé');
}

// Surveiller les observers
function monitorObservers() {
    const originalIntersectionObserver = window.IntersectionObserver;
    let observerCount = 0;
    
    window.IntersectionObserver = function(callback, options) {
        observerCount++;
        const observerId = observerCount;
        console.log(`🔍 NOUVEAU OBSERVER #${observerId}:`, options);
        
        const originalCallback = callback;
        const wrappedCallback = function(entries, observer) {
            console.log(`👁️ OBSERVER #${observerId} DÉCLENCHÉ:`, entries.length, 'entrées');
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    console.log(`  ✨ Animation entrée ${index}:`, {
                        target: entry.target.tagName + '.' + entry.target.className,
                        animationPrepared: entry.target.dataset.animationPrepared
                    });
                }
            });
            return originalCallback.call(this, entries, observer);
        };
        
        return new originalIntersectionObserver(wrappedCallback, options);
    };
    
    console.log('✅ Monitoring des observers activé');
}

// Démarrer le monitoring
window.addEventListener('load', () => {
    setTimeout(() => {
        monitorTabChanges();
        monitorObservers();
        
        // Test manuel
        window.testAnimations = function() {
            console.log('🧪 TEST MANUEL:');
            console.log('État visitedTabs:', Array.from(window.visitedTabs || []));
            
            const programmeElements = document.querySelectorAll('#programmes .concert-section, #programmes .piece-card');
            console.log(`Éléments programmes: ${programmeElements.length}`);
            
            programmeElements.forEach((el, i) => {
                if (i < 3) {
                    console.log(`Element ${i}:`, {
                        animationPrepared: el.dataset.animationPrepared,
                        opacity: getComputedStyle(el).opacity,
                        display: getComputedStyle(el).display
                    });
                }
            });
        };
        
        console.log('🎯 Diagnostic prêt! Utilisez testAnimations() pour tester manuellement');
    }, 2000);
});
