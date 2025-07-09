// 🧪 TEST DE LA CORRECTION DE NAVIGATION INTER-ONGLETS
console.log('🧪 Test de navigation inter-onglets');

document.addEventListener('DOMContentLoaded', function() {
    // Attendre que tout soit chargé
    setTimeout(() => {
        console.log('🎯 Test de la fonction navigateToPieceInPrograms...');
        
        // Test de navigation vers une pièce (simulation)
        window.testNavigationToPiece = function() {
            console.log('🔄 Test: Navigation vers une pièce...');
            
            // Avant : vérifier l'onglet actuel
            const currentActiveTab = document.querySelector('.tab-button.active');
            console.log('Onglet actif AVANT:', currentActiveTab?.getAttribute('data-tab'));
            
            // Simuler la navigation vers une pièce connue
            if (typeof navigateToPieceInPrograms === 'function') {
                navigateToPieceInPrograms('Ammerland');
                
                // Après : vérifier l'onglet actuel
                setTimeout(() => {
                    const newActiveTab = document.querySelector('.tab-button.active');
                    console.log('Onglet actif APRÈS:', newActiveTab?.getAttribute('data-tab'));
                    
                    if (newActiveTab?.getAttribute('data-tab') === 'programmes') {
                        console.log('✅ Navigation réussie - Onglet correctement mis à jour');
                    } else {
                        console.log('❌ Problème - Onglet pas mis à jour');
                    }
                }, 500);
            } else {
                console.log('❌ Fonction navigateToPieceInPrograms non trouvée');
            }
        };
        
        console.log('🎮 Test prêt! Utilisez testNavigationToPiece() pour tester');
    }, 2000);
});
