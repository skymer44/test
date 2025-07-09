// Script de diagnostic pour identifier le problème de double téléchargement PDF

console.log('🔍 === DIAGNOSTIC PDF DÉMARRÉ ===');

// 1. Vérifier l'état des boutons PDF
setTimeout(() => {
    const buttons = document.querySelectorAll('.pdf-download-btn');
    console.log(`📊 Nombre de boutons PDF trouvés: ${buttons.length}`);
    
    buttons.forEach((button, index) => {
        console.log(`🔍 Bouton ${index + 1}:`, {
            'data-section': button.getAttribute('data-section'),
            'disabled': button.disabled,
            'hasHandler': !!button._pdfClickHandler,
            'data-pdf-processing': button.hasAttribute('data-pdf-processing'),
            'eventListeners': getEventListeners ? getEventListeners(button) : 'Non disponible'
        });
    });
}, 1000);

// 2. Intercepter tous les événements de clic sur les boutons PDF
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('pdf-download-btn') || e.target.closest('.pdf-download-btn')) {
        const button = e.target.classList.contains('pdf-download-btn') ? e.target : e.target.closest('.pdf-download-btn');
        const sectionId = button.getAttribute('data-section');
        
        console.log('🎯 === CLIC DÉTECTÉ SUR BOUTON PDF ===');
        console.log('📍 Section:', sectionId);
        console.log('⏰ Timestamp:', new Date().toISOString());
        console.log('🔧 État du bouton:', {
            'disabled': button.disabled,
            'hasHandler': !!button._pdfClickHandler,
            'data-pdf-processing': button.hasAttribute('data-pdf-processing')
        });
        
        // Tracer l'ordre d'exécution
        console.log('🏃 Phase actuelle: CAPTURE');
    }
}, true); // Phase de capture

document.addEventListener('click', function(e) {
    if (e.target.classList.contains('pdf-download-btn') || e.target.closest('.pdf-download-btn')) {
        const button = e.target.classList.contains('pdf-download-btn') ? e.target : e.target.closest('.pdf-download-btn');
        const sectionId = button.getAttribute('data-section');
        
        console.log('🏃 Phase actuelle: BUBBLE');
        console.log('📍 Section:', sectionId);
    }
}, false); // Phase de bubble

// 3. Wrapper pour intercepter les appels à generatePDF
if (window.generatePDF) {
    const originalGeneratePDF = window.generatePDF;
    let callCount = 0;
    
    window.generatePDF = function(sectionId) {
        callCount++;
        console.log(`🚨 APPEL #${callCount} à generatePDF pour section: ${sectionId}`);
        console.log('📍 Stack trace:', new Error().stack);
        
        return originalGeneratePDF.call(this, sectionId);
    };
}

console.log('✅ Diagnostic PDF prêt - cliquez sur un bouton PDF pour voir les logs');
