// 🔍 DIAGNOSTIC ULTRA-SIMPLE - QU'EST-CE QUI ANIME VRAIMENT ?

console.log('🚨 DIAGNOSTIC SIMPLE DÉMARRÉ');

// 1. Surveiller TOUS les changements de style sur les éléments programmes
function monitorAllStyleChanges() {
    const targetNode = document.getElementById('programmes');
    if (!targetNode) {
        console.log('❌ Onglet programmes non trouvé, retry...');
        setTimeout(monitorAllStyleChanges, 1000);
        return;
    }
    
    console.log('👁️ Surveillance des changements de style sur #programmes');
    
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const element = mutation.target;
                const style = element.style;
                
                if (style.opacity !== undefined || style.transform !== undefined) {
                    console.log('🎬 ANIMATION DÉTECTÉE:', {
                        element: element.tagName + '.' + element.className,
                        opacity: style.opacity,
                        transform: style.transform,
                        stackTrace: new Error().stack.split('\n')[1]
                    });
                }
            }
        });
    });
    
    observer.observe(targetNode, {
        attributes: true,
        subtree: true,
        attributeFilter: ['style']
    });
    
    console.log('✅ Surveillance active sur #programmes');
}

// 2. Surveiller les clics sur l'onglet programmes
function monitorTabClicks() {
    const tabButton = document.querySelector('[data-tab="programmes"]');
    if (!tabButton) {
        console.log('❌ Bouton programmes non trouvé, retry...');
        setTimeout(monitorTabClicks, 1000);
        return;
    }
    
    tabButton.addEventListener('click', function() {
        console.log('🖱️ CLIC SUR ONGLET PROGRAMMES');
        console.log('📊 État visitedTabs:', Array.from(window.visitedTabs || []));
        
        setTimeout(() => {
            const elements = document.querySelectorAll('#programmes .concert-section, #programmes .piece-card');
            console.log(`🎭 ${elements.length} éléments trouvés dans programmes`);
            
            elements.forEach((el, i) => {
                if (i < 3) {
                    console.log(`Element ${i}:`, {
                        animationPrepared: el.dataset.animationPrepared,
                        opacity: getComputedStyle(el).opacity,
                        transform: getComputedStyle(el).transform,
                        display: getComputedStyle(el).display
                    });
                }
            });
        }, 500);
    });
    
    console.log('✅ Surveillance des clics activée');
}

// 3. Test manuel simple
window.testQuickAnimations = function() {
    console.log('🧪 TEST MANUEL RAPIDE:');
    
    const programmes = document.getElementById('programmes');
    if (!programmes) {
        console.log('❌ Onglet programmes non trouvé');
        return;
    }
    
    const elements = programmes.querySelectorAll('.concert-section, .piece-card');
    console.log(`📊 ${elements.length} éléments trouvés`);
    
    let animatedCount = 0;
    let nonAnimatedCount = 0;
    
    elements.forEach((el, i) => {
        const isAnimated = el.dataset.animationPrepared === 'true';
        if (isAnimated) animatedCount++;
        else nonAnimatedCount++;
        
        if (i < 5) {
            console.log(`Element ${i}:`, {
                tag: el.tagName,
                class: el.className.split(' ')[0],
                prepared: isAnimated,
                opacity: getComputedStyle(el).opacity,
                visible: getComputedStyle(el).display !== 'none'
            });
        }
    });
    
    console.log(`📈 RÉSUMÉ: ${animatedCount} préparés, ${nonAnimatedCount} non préparés`);
    console.log(`🎯 VisitedTabs:`, Array.from(window.visitedTabs || []));
};

// Démarrer
setTimeout(() => {
    monitorAllStyleChanges();
    monitorTabClicks();
    
    console.log('🎯 Diagnostic prêt! Tapez testQuickAnimations() pour un test rapide');
}, 2000);
