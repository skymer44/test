// Script de diagnostic pour analyser la fonction triggerTabAnimations
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 DIAGNOSTIC - Analyse de triggerTabAnimations');
    
    // Vérifier si la fonction existe
    if (typeof triggerTabAnimations === 'function') {
        console.log('✅ La fonction triggerTabAnimations existe');
        console.log('📝 Code de la fonction:');
        console.log(triggerTabAnimations.toString());
    } else {
        console.log('❌ La fonction triggerTabAnimations n\'existe pas');
    }
    
    // Vérifier la fonction setupProgrammeScrollAnimations
    if (typeof setupProgrammeScrollAnimations === 'function') {
        console.log('✅ La fonction setupProgrammeScrollAnimations existe');
    } else {
        console.log('❌ La fonction setupProgrammeScrollAnimations n\'existe pas');
    }
    
    // Vérifier la fonction setupEventScrollAnimations
    if (typeof setupEventScrollAnimations === 'function') {
        console.log('✅ La fonction setupEventScrollAnimations existe');
    } else {
        console.log('❌ La fonction setupEventScrollAnimations n\'existe pas');
    }
    
    // Test direct de la fonction pour Programme musical
    console.log('🧪 Test direct de triggerTabAnimations pour programmes');
    try {
        triggerTabAnimations('programmes');
        console.log('✅ Appel réussi de triggerTabAnimations(\'programmes\')');
    } catch (error) {
        console.error('❌ Erreur lors de l\'appel:', error);
    }
});
