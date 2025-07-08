// 📹 DIAGNOSTIC DÉTECTION SCROLL ET ANIMATIONS

console.log('📹 DIAGNOSTIC SCROLL & ANIMATIONS DÉMARRÉ');

// 1. Surveiller TOUS les scrolls
let scrollDetected = false;
function monitorScrolls() {
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', function() {
        const currentScrollY = window.scrollY;
        const scrollDiff = currentScrollY - lastScrollY;
        
        console.log('📊 SCROLL DÉTECTÉ:', {
            from: lastScrollY,
            to: currentScrollY,
            diff: scrollDiff,
            direction: scrollDiff > 0 ? 'DOWN' : 'UP',
            stackTrace: new Error().stack.split('\n')[1]
        });
        
        scrollDetected = true;
        lastScrollY = currentScrollY;
    });
}

// 2. Surveiller les changements de transform sur body/html
function monitorBodyTransforms() {
    const bodyObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const element = mutation.target;
                if (element.tagName === 'BODY' || element.tagName === 'HTML') {
                    console.log('🎬 BODY/HTML TRANSFORM:', {
                        element: element.tagName,
                        style: element.style.cssText,
                        transform: element.style.transform,
                        stackTrace: new Error().stack.split('\n')[1]
                    });
                }
            }
        });
    });
    
    bodyObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ['style']
    });
    
    bodyObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['style']
    });
}

// 3. Surveillance des clics avec reset
function monitorClicksWithReset() {
    const tabButton = document.querySelector('[data-tab="programmes"]');
    if (!tabButton) {
        setTimeout(monitorClicksWithReset, 100);
        return;
    }
    
    tabButton.addEventListener('click', function() {
        console.log('🎯 CLIC PROGRAMMES - DÉBUT SURVEILLANCE INTENSIVE');
        scrollDetected = false;
        
        // Monitoring pendant 2 secondes
        setTimeout(() => {
            if (scrollDetected) {
                console.log('✅ SCROLL DÉTECTÉ après clic programmes');
            } else {
                console.log('❌ AUCUN SCROLL détecté - l\'animation vient d\'ailleurs');
            }
        }, 2000);
    });
}

// 4. Test manuel pour forcer l'animation
window.testScrollAnimation = function() {
    console.log('🧪 TEST MANUEL SCROLL');
    
    // Reset état
    if (window.visitedTabs) {
        window.visitedTabs.delete('programmes');
        console.log('✅ programmes retiré de visitedTabs');
    }
    
    // Simuler clic
    const tabButton = document.querySelector('[data-tab="programmes"]');
    if (tabButton) {
        scrollDetected = false;
        console.log('🖱️ Simulation clic programmes...');
        tabButton.click();
        
        setTimeout(() => {
            console.log(`📊 Résultat après 1s: Scroll détecté = ${scrollDetected}`);
        }, 1000);
    }
};

// Démarrer tout
setTimeout(() => {
    monitorScrolls();
    monitorBodyTransforms();
    monitorClicksWithReset();
    
    console.log('📹 Surveillance active! Tapez testScrollAnimation() pour tester');
}, 1000);
