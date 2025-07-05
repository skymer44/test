/**
 * DÉTECTEUR DE CHANGEMENTS FINS
 * 
 * Outil spécialisé pour détecter les changements subtils 
 * comme les renommages de pièces dans "Ma région virtuose"
 */

function detectSubtleChanges() {
    console.log('🔬 DÉTECTION FINE DES CHANGEMENTS - MA RÉGION VIRTUOSE');
    console.log('=' .repeat(60));
    
    // Données de référence exactes
    const baselinePieces = [
        "Ammerland",
        "Music from How To Train Your Dragon", 
        "The Lion King",
        "Selections from The Nightmare Before Christmas",
        "Allegretto from Symphony No. 7"
    ];
    
    // Extraire les pièces actuelles de la section
    const section = document.getElementById('ma-region-virtuose');
    const currentPieces = [];
    
    if (section) {
        const pieceCards = section.querySelectorAll('.piece-card h3');
        pieceCards.forEach(h3 => {
            if (h3.textContent.trim()) {
                currentPieces.push(h3.textContent.trim());
            }
        });
    }
    
    console.log('📋 Pièces de référence:');
    baselinePieces.forEach((piece, i) => {
        console.log(`  ${i+1}. "${piece}"`);
    });
    
    console.log('\n🎵 Pièces actuelles:');
    currentPieces.forEach((piece, i) => {
        console.log(`  ${i+1}. "${piece}"`);
    });
    
    console.log('\n🔍 Comparaison détaillée:');
    
    // Comparaison position par position
    const maxLength = Math.max(baselinePieces.length, currentPieces.length);
    let changesFound = 0;
    
    for (let i = 0; i < maxLength; i++) {
        const baseline = baselinePieces[i] || '[MANQUANT]';
        const current = currentPieces[i] || '[MANQUANT]';
        
        if (baseline !== current) {
            console.log(`  🔄 Position ${i+1}: "${baseline}" → "${current}"`);
            changesFound++;
        } else {
            console.log(`  ✅ Position ${i+1}: "${baseline}" (identique)`);
        }
    }
    
    // Recherche de renommages (même pièce avec nom légèrement différent)
    console.log('\n🔍 Recherche de renommages:');
    
    baselinePieces.forEach(baselinePiece => {
        const exactMatch = currentPieces.find(cp => cp === baselinePiece);
        if (!exactMatch) {
            // Chercher une correspondance proche
            const similarPiece = currentPieces.find(cp => {
                const similarity = calculateSimilarity(baselinePiece.toLowerCase(), cp.toLowerCase());
                return similarity > 0.6 && similarity < 1.0;
            });
            
            if (similarPiece) {
                console.log(`  🔄 Renommage possible: "${baselinePiece}" → "${similarPiece}"`);
                console.log(`     Similarité: ${Math.round(calculateSimilarity(baselinePiece.toLowerCase(), similarPiece.toLowerCase()) * 100)}%`);
                changesFound++;
            } else {
                console.log(`  ❌ Pièce supprimée: "${baselinePiece}"`);
                changesFound++;
            }
        }
    });
    
    // Nouvelles pièces
    currentPieces.forEach(currentPiece => {
        const exactMatch = baselinePieces.find(bp => bp === currentPiece);
        if (!exactMatch) {
            const similarPiece = baselinePieces.find(bp => {
                const similarity = calculateSimilarity(bp.toLowerCase(), currentPiece.toLowerCase());
                return similarity > 0.6 && similarity < 1.0;
            });
            
            if (!similarPiece) {
                console.log(`  ➕ Nouvelle pièce: "${currentPiece}"`);
                changesFound++;
            }
        }
    });
    
    console.log(`\n🎯 RÉSULTAT: ${changesFound} changement(s) détecté(s)`);
    
    // Test spécifique mentionné par l'utilisateur
    console.log('\n🧪 TEST SPÉCIFIQUE MENTIONNÉ:');
    console.log('Recherche d\'un "exercice test"...');
    
    const testExercises = currentPieces.filter(piece => 
        piece.toLowerCase().includes('test') || 
        piece.toLowerCase().includes('exercice') ||
        piece.toLowerCase().includes('étude')
    );
    
    if (testExercises.length > 0) {
        console.log('  ✅ Exercice(s) test trouvé(s):');
        testExercises.forEach(exercise => {
            console.log(`    - "${exercise}"`);
        });
    } else {
        console.log('  ❌ Aucun exercice test trouvé dans les titres de pièces');
    }
    
    return {
        changesFound,
        baselinePieces,
        currentPieces,
        testExercises
    };
}

// Fonction de calcul de similarité (réutilisée)
function calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    const editDistance = getEditDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
}

function getEditDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    
    return matrix[str2.length][str1.length];
}

// Auto-exécution désactivée pour éviter les logs excessifs
// Peut être appelé manuellement avec detectSubtleChanges() dans la console

// if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', () => {
//         setTimeout(detectSubtleChanges, 2000);
//     });
// } else {
//     setTimeout(detectSubtleChanges, 2000);
// }

console.log('🔬 Détecteur de changements fins chargé (manuel)');
