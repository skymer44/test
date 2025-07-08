// 🚨 TEST EN TEMPS RÉEL - QUAND LES ÉLÉMENTS DEVIENNENT VISIBLES

console.log('🚨 TEST TEMPS RÉEL DÉMARRÉ');

// Surveiller l'état initial des éléments
function checkInitialState() {
    const programmes = document.getElementById('programmes');
    if (!programmes) {
        setTimeout(checkInitialState, 100);
        return;
    }
    
    const elements = programmes.querySelectorAll('.concert-section, .piece-card');
    console.log('🔍 ÉTAT INITIAL:', {
        count: elements.length,
        firstOpacity: elements[0] ? getComputedStyle(elements[0]).opacity : 'N/A',
        firstTransform: elements[0] ? getComputedStyle(elements[0]).transform : 'N/A'
    });
}

// Surveiller les clics sur l'onglet avec timing précis
function monitorPreciseClicks() {
    const tabButton = document.querySelector('[data-tab="programmes"]');
    if (!tabButton) {
        setTimeout(monitorPreciseClicks, 100);
        return;
    }
    
    tabButton.addEventListener('click', function() {
        console.log('🖱️ CLIC DÉTECTÉ - DÉBUT MONITORING');
        
        // Clear visitedTabs pour simuler première visite
        if (window.visitedTabs) {
            console.log('🧹 Nettoyage visitedTabs pour test');
            window.visitedTabs.delete('programmes');
        }
        
        // Monitoring toutes les 50ms pendant 3 secondes
        let checkCount = 0;
        const maxChecks = 60; // 3 secondes
        
        const monitor = setInterval(() => {
            checkCount++;
            const elements = document.querySelectorAll('#programmes .concert-section, #programmes .piece-card');
            
            if (elements.length > 0) {
                const firstEl = elements[0];
                const secondEl = elements[1];
                
                console.log(`📊 Check ${checkCount}:`, {
                    time: checkCount * 50 + 'ms',
                    count: elements.length,
                    el0_opacity: getComputedStyle(firstEl).opacity,
                    el0_transform: getComputedStyle(firstEl).transform,
                    el1_opacity: secondEl ? getComputedStyle(secondEl).opacity : 'N/A',
                    visitedTabs: Array.from(window.visitedTabs || [])
                });
            }
            
            if (checkCount >= maxChecks) {
                clearInterval(monitor);
                console.log('⏹️ Monitoring terminé');
            }
        }, 50);
    });
}

// Test manuel pour forcer première visite
window.testFirstVisit = function() {
    console.log('🧪 TEST PREMIÈRE VISITE FORCÉE');
    
    // Nettoyer visitedTabs
    if (window.visitedTabs) {
        window.visitedTabs.delete('programmes');
        console.log('✅ programmes retiré de visitedTabs');
    }
    
    // Vérifier l'état
    setTimeout(() => {
        const elements = document.querySelectorAll('#programmes .concert-section, #programmes .piece-card');
        console.log('État après nettoyage:', {
            visitedTabs: Array.from(window.visitedTabs || []),
            elements: elements.length,
            firstOpacity: elements[0] ? getComputedStyle(elements[0]).opacity : 'N/A'
        });
    }, 100);
};

// Démarrer
setTimeout(() => {
    checkInitialState();
    monitorPreciseClicks();
    console.log('⚡ Tests prêts! Tapez testFirstVisit() pour simuler première visite');
}, 1000);
