/**
 * ANALYSEUR MANUEL SIMPLE
 * 
 * Fonctions à appeler manuellement pour analyser les changements
 * sans pollution de la console
 */

// Fonction principale d'analyse manuelle
window.analyzeChangesManual = function() {
    console.log('🔍 ANALYSE MANUELLE DES CHANGEMENTS');
    console.log('=' .repeat(40));
    
    if (!window.BASELINE_DATA) {
        console.error('❌ Données de référence non disponibles');
        return;
    }
    
    // Analyser seulement "Ma région virtuose"
    const section = document.getElementById('ma-region-virtuose');
    if (!section) {
        console.error('❌ Section "Ma région virtuose" non trouvée');
        return;
    }
    
    // Pièces de référence
    const referencePieces = [
        "Ammerland",
        "Music from How To Train Your Dragon", 
        "The Lion King",
        "Selections from The Nightmare Before Christmas",
        "Allegretto from Symphony No. 7"
    ];
    
    // Pièces actuelles
    const currentPieces = [];
    const pieceCards = section.querySelectorAll('.piece-card h3');
    pieceCards.forEach(h3 => {
        const title = h3.textContent.trim();
        if (title) currentPieces.push(title);
    });
    
    console.log('📋 Référence vs Actuel:');
    
    const maxLength = Math.max(referencePieces.length, currentPieces.length);
    let differences = 0;
    
    for (let i = 0; i < maxLength; i++) {
        const ref = referencePieces[i] || '[MANQUANT]';
        const curr = currentPieces[i] || '[MANQUANT]';
        
        if (ref === curr) {
            console.log(`  ✅ ${i+1}. "${ref}"`);
        } else {
            console.log(`  🔄 ${i+1}. "${ref}" → "${curr}"`);
            differences++;
        }
    }
    
    console.log(`\n🎯 Résultat: ${differences} différence(s) trouvée(s)`);
    
    // Recherche spécifique d'exercices/tests
    const testPieces = currentPieces.filter(piece => 
        piece.toLowerCase().includes('test') || 
        piece.toLowerCase().includes('exercice') ||
        piece.toLowerCase().includes('étude')
    );
    
    if (testPieces.length > 0) {
        console.log('\n🧪 Exercices/Tests trouvés:');
        testPieces.forEach(piece => console.log(`  - "${piece}"`));
    } else {
        console.log('\n❌ Aucun exercice/test trouvé');
    }
    
    return {
        differences,
        referencePieces,
        currentPieces,
        testPieces
    };
};

// Fonction pour voir tous les titres actuels
window.showAllCurrentTitles = function() {
    console.log('📝 TOUS LES TITRES ACTUELS:');
    console.log('=' .repeat(30));
    
    const sections = document.querySelectorAll('.concert-section');
    
    sections.forEach(section => {
        const sectionTitle = section.querySelector('h2')?.textContent?.trim();
        console.log(`\n🎭 ${sectionTitle}:`);
        
        const pieces = section.querySelectorAll('.piece-card h3');
        pieces.forEach((piece, index) => {
            const title = piece.textContent.trim();
            if (title && !piece.closest('.piece-card').textContent.includes('Section en cours')) {
                console.log(`  ${index + 1}. "${title}"`);
            }
        });
    });
};

console.log('🔧 Analyseur manuel disponible:');
console.log('  - analyzeChangesManual() : Analyser "Ma région virtuose"');
console.log('  - showAllCurrentTitles() : Voir tous les titres actuels');
