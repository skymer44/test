/**
 * SCRIPT D'ANALYSE DES CHANGEMENTS
 * 
 * Compare le contenu actuel du site avec les données de référence
 * pour détecter automatiquement les modifications.
 */

// Extraire les données actuelles du DOM
function extractCurrentSiteData() {
    const currentData = {
        concerts: []
    };
    
    // Parcourir toutes les sections de concerts
    const sections = document.querySelectorAll('.concert-section');
    
    sections.forEach(section => {
        const titleElement = section.querySelector('h2');
        if (!titleElement) return;
        
        const fullTitle = titleElement.textContent.trim();
        const titleMatch = fullTitle.match(/^(.*?)(?:\s*\(([^)]+)\))?$/);
        
        const concert = {
            id: section.id,
            title: titleMatch ? titleMatch[1].trim() : fullTitle,
            duration: titleMatch && titleMatch[2] ? titleMatch[2] : '',
            pieces: []
        };
        
        // Ignorer les sections vides ou en développement
        if (section.classList.contains('empty-section') || 
            section.textContent.includes('Section en cours de développement')) {
            return currentData;
        }
        
        // Extraire les pièces
        const pieces = section.querySelectorAll('.piece-card');
        pieces.forEach(piece => {
            const title = piece.querySelector('h3')?.textContent.trim();
            if (!title || piece.textContent.includes('Section en cours')) return;
            
            const composerElement = Array.from(piece.querySelectorAll('p')).find(p => 
                p.textContent.includes('Compositeur:')
            );
            const composer = composerElement ? 
                composerElement.textContent.replace('Compositeur:', '').trim() : '';
            
            const durationElement = Array.from(piece.querySelectorAll('p')).find(p => 
                p.textContent.includes('Durée:')
            );
            const duration = durationElement ? 
                durationElement.textContent.replace('Durée:', '').trim() : '';
            
            const infoElement = Array.from(piece.querySelectorAll('p')).find(p => 
                p.textContent.includes('Info:')
            );
            const info = infoElement ? 
                infoElement.textContent.replace('Info:', '').trim() : '';
            
            // Extraire les liens
            const links = {};
            const linkElements = piece.querySelectorAll('a');
            linkElements.forEach(link => {
                if (link.textContent.includes('🎵')) {
                    links.audio = link.href;
                } else if (link.textContent.includes('🎬')) {
                    links.original = link.href;
                } else if (link.textContent.includes('🛒')) {
                    links.purchase = link.href;
                }
            });
            
            // Ne pas ajouter les pièces avec des valeurs vides/undefined
            if (title && title.length > 0) {
                concert.pieces.push({
                    title,
                    composer: composer || '',
                    duration: duration || '',
                    info: info || '',
                    links
                });
            }
        });
        
        currentData.concerts.push(concert);
    });
    
    return currentData;
}

// Comparer avec les données de référence
function compareWithBaseline() {
    const currentData = extractCurrentSiteData();
    
    if (!window.BASELINE_DATA) {
        console.error('❌ Données de référence non disponibles');
        return null;
    }
    
    // Logs réduits pour éviter le spam
    // console.log('📊 Données actuelles extraites:', currentData);
    // console.log('📊 Données de référence:', window.BASELINE_DATA);
    
    // Utiliser l'analyseur existant
    const changes = window.DocumentAnalyzer.compareData(window.BASELINE_DATA, currentData);
    
    // console.log('🔍 Changements détectés:', changes);
    
    // Générer un rapport détaillé seulement si demandé
    const report = generateDetailedReport(changes, currentData);
    // console.log('📝 Rapport détaillé:');
    // console.log(report);
    
    return { changes, report, currentData };
}

// Générer un rapport détaillé des changements
function generateDetailedReport(changes, currentData) {
    const report = [];
    
    report.push("🔍 **ANALYSE DÉTAILLÉE DES CHANGEMENTS**");
    report.push("=" .repeat(50));
    report.push("");
    
    // Analyser chaque concert individuellement avec comparaison fine
    currentData.concerts.forEach(currentConcert => {
        const baselineConcert = window.BASELINE_DATA.concerts.find(c => c.id === currentConcert.id);
        
        if (!baselineConcert) {
            report.push(`➕ **NOUVEAU CONCERT**: ${currentConcert.title}`);
            return;
        }
        
        report.push(`🎭 **CONCERT**: ${currentConcert.title}`);
        
        // Comparer les titres avec détection fine
        if (currentConcert.title !== baselineConcert.title) {
            report.push(`  📝 Titre modifié: "${baselineConcert.title}" → "${currentConcert.title}"`);
        }
        
        // Comparer les durées seulement si elles sont définies
        if (currentConcert.duration && baselineConcert.duration && 
            currentConcert.duration !== baselineConcert.duration) {
            report.push(`  ⏱️ Durée modifiée: "${baselineConcert.duration}" → "${currentConcert.duration}"`);
        }
        
        // Comparer les pièces avec détection avancée
        if (baselineConcert.pieces && currentConcert.pieces) {
            // Détecter les changements subtils dans les noms de pièces
            const pieceComparisons = comparePiecesAdvanced(baselineConcert.pieces, currentConcert.pieces);
            
            pieceComparisons.forEach(comparison => {
                if (comparison.type === 'renamed') {
                    report.push(`    🔄 Pièce renommée: "${comparison.oldTitle}" → "${comparison.newTitle}"`);
                } else if (comparison.type === 'added') {
                    report.push(`    ➕ Nouvelle pièce: "${comparison.title}"`);
                } else if (comparison.type === 'removed') {
                    report.push(`    ➖ Pièce supprimée: "${comparison.title}"`);
                } else if (comparison.type === 'modified') {
                    report.push(`    📝 "${comparison.title}" modifiée:`);
                    comparison.changes.forEach(change => {
                        report.push(`      - ${change}`);
                    });
                }
            });
        }
        
        report.push("");
    });
    
    // Résumé final plus précis
    const realChanges = calculateRealChanges(changes, currentData);
    
    if (realChanges === 0) {
        report.push("✅ **RÉSULTAT**: Aucun changement significatif détecté");
    } else {
        report.push(`🎯 **RÉSUMÉ**: ${realChanges} changement(s) significatif(s) détecté(s)`);
    }
    
    return report.join("\n");
}

// Comparaison avancée des pièces pour détecter les renommages subtils
function comparePiecesAdvanced(baselinePieces, currentPieces) {
    const comparisons = [];
    const usedBaseline = new Set();
    const usedCurrent = new Set();
    
    // Recherche de correspondances exactes
    currentPieces.forEach((currentPiece, currentIndex) => {
        const exactMatch = baselinePieces.findIndex(bp => 
            bp.title === currentPiece.title && !usedBaseline.has(bp.title)
        );
        
        if (exactMatch !== -1) {
            usedBaseline.add(baselinePieces[exactMatch].title);
            usedCurrent.add(currentPiece.title);
            
            // Vérifier les modifications de cette pièce
            const baselinePiece = baselinePieces[exactMatch];
            const changes = [];
            
            if (currentPiece.composer !== baselinePiece.composer) {
                changes.push(`compositeur: "${baselinePiece.composer}" → "${currentPiece.composer}"`);
            }
            if (currentPiece.duration !== baselinePiece.duration) {
                changes.push(`durée: "${baselinePiece.duration}" → "${currentPiece.duration}"`);
            }
            if (currentPiece.info !== baselinePiece.info) {
                changes.push(`info: "${baselinePiece.info}" → "${currentPiece.info}"`);
            }
            
            if (changes.length > 0) {
                comparisons.push({
                    type: 'modified',
                    title: currentPiece.title,
                    changes
                });
            }
        }
    });
    
    // Recherche de renommages potentiels (comparaison par compositeur et durée)
    currentPieces.forEach((currentPiece) => {
        if (usedCurrent.has(currentPiece.title)) return;
        
        const potentialMatch = baselinePieces.find(bp => 
            !usedBaseline.has(bp.title) &&
            bp.composer === currentPiece.composer &&
            bp.duration === currentPiece.duration &&
            calculateSimilarity(bp.title, currentPiece.title) > 0.7
        );
        
        if (potentialMatch) {
            comparisons.push({
                type: 'renamed',
                oldTitle: potentialMatch.title,
                newTitle: currentPiece.title
            });
            usedBaseline.add(potentialMatch.title);
            usedCurrent.add(currentPiece.title);
        }
    });
    
    // Pièces ajoutées
    currentPieces.forEach((currentPiece) => {
        if (!usedCurrent.has(currentPiece.title)) {
            comparisons.push({
                type: 'added',
                title: currentPiece.title
            });
        }
    });
    
    // Pièces supprimées
    baselinePieces.forEach((baselinePiece) => {
        if (!usedBaseline.has(baselinePiece.title)) {
            comparisons.push({
                type: 'removed',
                title: baselinePiece.title
            });
        }
    });
    
    return comparisons;
}

// Calculer la similarité entre deux chaînes
function calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    const editDistance = getEditDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
}

// Calculer la distance d'édition (Levenshtein)
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

// Calculer le nombre réel de changements (en excluant les faux positifs)
function calculateRealChanges(changes, currentData) {
    let realChanges = 0;
    
    // Compter seulement les vrais changements
    realChanges += changes.concerts.added.length;
    realChanges += changes.concerts.removed.length;
    realChanges += changes.pieces.added.length;
    realChanges += changes.pieces.removed.length;
    
    // Pour les modifications, vérifier qu'elles ne sont pas dues à des undefined
    changes.concerts.modified.forEach(concert => {
        if (concert.changes && concert.changes.titleChanged) realChanges++;
        if (concert.changes && concert.changes.durationChanged && 
            !concert.changes.durationChanged.includes('undefined')) realChanges++;
    });
    
    changes.pieces.modified.forEach(piece => {
        if (piece.changes) {
            if (piece.changes.composerChanged && 
                !piece.changes.composerChanged.includes('undefined')) realChanges++;
            if (piece.changes.durationChanged && 
                !piece.changes.durationChanged.includes('undefined')) realChanges++;
            if (piece.changes.infoChanged && 
                !piece.changes.infoChanged.includes('undefined')) realChanges++;
        }
    });
    
    return realChanges;
}

// Exécuter l'analyse si on est dans le navigateur - DÉSACTIVÉ
// if (typeof window !== 'undefined') {
//     // Attendre que les données soient chargées
//     if (window.BASELINE_DATA && window.DocumentAnalyzer) {
//         console.log('🚀 Démarrage de l\'analyse automatique...');
//         const result = compareWithBaseline();
//         
//         // Pas de popup - seulement les logs dans la console
//         if (result && result.changes) {
//             const totalChanges = result.changes.concerts.added.length + 
//                                result.changes.pieces.added.length + 
//                                result.changes.concerts.removed.length + 
//                                result.changes.pieces.removed.length + 
//                                result.changes.concerts.modified.length + 
//                                result.changes.pieces.modified.length;
//             
//             console.log(`📊 Analyse terminée: ${totalChanges} changement(s) détecté(s)`);
//         }
//     } else {
//         console.log('⏳ En attente des données de référence...');
//         setTimeout(() => compareWithBaseline(), 2000);
//     }
// }

console.log('🔍 Script d\'analyse des changements chargé (inactif)');
